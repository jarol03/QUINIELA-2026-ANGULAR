import { Component } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pronostico',
  imports: [CommonModule, FormsModule],
  templateUrl: './pronostico.component.html',
  styleUrl: './pronostico.component.css',
})
export class PronosticoComponent {
  usuarioId: string | null = null;
  nombreUsuario: string = '';
  puntos: number = 0;

  partidos: any[] = [];
  partidoId: string = '';
  golesLocal: number = 0;
  golesVisitante: number = 0;

  pronosticos: any[] = [];
  mensaje: string = '';

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.usuarioId = sessionStorage.getItem('usuario');

    if (!this.usuarioId) {
      this.mensaje = 'No has iniciado sesión';
      return;
    }

    this.partidos = await this.firebaseService.obtenerPartidosAbiertos();
    this.pronosticos = await this.firebaseService.obtenerPronosticos(
      this.usuarioId
    );

    const usuario = await this.firebaseService.obtenerUsuario(this.usuarioId);

    if (usuario) {
      this.nombreUsuario = usuario.nombre || 'Usuario';
      this.puntos = usuario.puntos || 0;
    }
  }

  get partidoSeleccionado() {
    return this.partidos.find((p) => p.id === this.partidoId);
  }

  async enviarPronostico() {
    console.log('Usuario ID:', this.usuarioId);
    console.log('Partido ID:', this.partidoId);
    if (!this.usuarioId || !this.partidoId) return;

    const partido = this.partidos.find((p) => p.id === this.partidoId);

    if (!partido) {
      this.mensaje = 'Partido no encontrado';
      return;
    }

    const ahora = new Date();
    const fechaLimite = new Date(partido.fechaLimite.seconds * 1000);
    if (ahora > fechaLimite) {
      this.mensaje = 'La fecha límite para pronosticar ha pasado';
      return;
    }

    const existe = await this.firebaseService.existePronostico(
      this.usuarioId,
      this.partidoId
    );
    if (existe) {
      this.mensaje = 'Ya has pronosticado este partido';
      return;
    }

    await this.firebaseService.guardarPronostico({
      usuarioId: this.usuarioId,
      nombreUsuario: this.nombreUsuario,
      partidoId: this.partidoId,
      golesLocal: this.golesLocal,
      golesVisitante: this.golesVisitante,
      fechaHora: new Date().toISOString(),
    });

    this.mensaje = 'Pronóstico enviado correctamente';

    this.partidoId = '';
    this.golesLocal = 0;
    this.golesVisitante = 0;

    // Actualizar los pronósticos después de enviar uno nuevo
    this.pronosticos = await this.firebaseService.obtenerPronosticos(
      this.usuarioId
    );
  }
}
