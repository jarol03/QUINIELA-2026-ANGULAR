import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

type Pronostico = {
      usuarioId: string;
      golesLocal: number;
      golesVisitante: number;
    };

@Injectable({
  providedIn: 'root',
})

export class FirebaseService {
  private firestore = inject(Firestore);

  /*--------------------------------------------------
  |                USUARIOS                          |
  --------------------------------------------------*/
  async crearUsuario(usuario: {
    nombre: string;
    usuario: string;
    puntos?: number;
  }) {
    const id = usuario.usuario.trim();
    const ref = doc(this.firestore, 'usuarios', id);

    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      throw new Error('El usuario ya existe');
    }

    await setDoc(ref, usuario);
  }

  async eliminarUsuario(usuarioId: string) {
    const ref = doc(this.firestore, 'usuarios', usuarioId);
    await deleteDoc(ref);
  }

  async existeUsuario(nombreUsuario: string): Promise<boolean> {
    const ref = collection(this.firestore, 'usuarios');
    const q = query(ref, where('usuario', '==', nombreUsuario));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async obtenerUsuarios() {
    const ref = collection(this.firestore, 'usuarios');
    const snap = await getDocs(ref);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerUsuario(usuarioId: string): Promise<any | null> {
    const ref = doc(this.firestore, 'usuarios', usuarioId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  /*--------------------------------------------------
  |                PARTIDOS                          |
  --------------------------------------------------*/
  async crearPartido(partido: {
    local: string;
    visitante: string;
    fechaLimite: string;
    estado?: string;
  }) {
    const id = `${partido.local.trim().toLowerCase()}-${partido.visitante
      .trim()
      .toLowerCase()}`;
    const ref = doc(this.firestore, 'partidos', id);

    const fecha = new Date(partido.fechaLimite);

    const partidoData = {
      local: partido.local.trim(),
      visitante: partido.visitante.trim(),
      fechaLimite: fecha,
      estado: 'abierto',
    };

    await setDoc(ref, partidoData);
  }

  async actualizarPartido(id: string, datos: any) {
    const ref = doc(this.firestore, 'partidos', id);
    await updateDoc(ref, datos);
  }

  async obtenerPartidos() {
    const ref = collection(this.firestore, 'partidos');
    const snap = await getDocs(ref);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerPartido(partidoId: string): Promise<any | null> {
    const ref = doc(this.firestore, 'partidos', partidoId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async obtenerPartidosAbiertos() {
    const ref = collection(this.firestore, 'partidos');
    const q = query(ref, where('estado', '==', 'abierto'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /*--------------------------------------------------
  |                PRONOSTICOS                        |
  --------------------------------------------------*/
  async obtenerPronosticos(usuarioId: string) {
    const ref = collection(this.firestore, 'pronosticos');
    const q = query(ref, where('usuarioId', '==', usuarioId));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerPronosticosPorPartido(partidoId: string): Promise<Pronostico[]> {
    const pronosticosRef = collection(this.firestore, 'pronosticos');
    const q = query(pronosticosRef, where('partidoId', '==', partidoId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as Pronostico); // ✅ casteo controlado por doc
  }

  async guardarPronostico(pronostico: {
    usuarioId: string;
    nombreUsuario: string;
    partidoId: string;
    golesLocal: number;
    golesVisitante: number;
    fechaHora: string;
  }) {
    const ref = doc(
      this.firestore,
      'pronosticos',
      `${pronostico.usuarioId}-${pronostico.partidoId}`
    );
    await setDoc(ref, pronostico);
  }

  async existePronostico(usuarioId: string, partidoId: string) {
    const ref = collection(this.firestore, 'pronosticos');
    const q = query(
      ref,
      where('usuarioId', '==', usuarioId),
      where('partidoId', '==', partidoId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async asignarPuntosAPronosticos(
    partidoId: string,
    golesLocal: number,
    golesVisitante: number
  ) {

    const pronosticos = (await this.obtenerPronosticosPorPartido(
      partidoId
    )) as Pronostico[];

    const resultadoReal =
      golesLocal > golesVisitante
        ? 'local'
        : golesLocal < golesVisitante
        ? 'visitante'
        : 'empate';

    for (const pronostico of pronosticos) {
      let puntos = 0;

      const resultadoPronostico =
        pronostico.golesLocal > pronostico.golesVisitante
          ? 'local'
          : pronostico.golesLocal < pronostico.golesVisitante
          ? 'visitante'
          : 'empate';

      const aciertaMarcador =
        pronostico.golesLocal === golesLocal &&
        pronostico.golesVisitante === golesVisitante;

      if (aciertaMarcador) {
        puntos = 3;
      } else if (resultadoPronostico === resultadoReal) {
        puntos = 1;
      }

      // Actualizar puntos del usuario
      const usuarioRef = doc(this.firestore, 'usuarios', pronostico.usuarioId);
      const snap = await getDoc(usuarioRef);

      if (snap.exists()) {
        const data = snap.data() as { puntos?: number };
        const puntosActuales = data['puntos'] || 0;
        await updateDoc(usuarioRef, { puntos: puntosActuales + puntos });
      }
    }
  }
}
