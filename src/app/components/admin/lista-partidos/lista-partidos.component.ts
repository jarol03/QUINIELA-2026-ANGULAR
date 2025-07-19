import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { FormsModule } from '@angular/forms';
import { TablaPronosticosComponent } from '../tabla-pronosticos/tabla-pronosticos.component';
import { FormularioPartidoComponent } from '../formulario-partido/formulario-partido.component';

@Component({
  selector: 'app-lista-partidos',
  imports: [
    CommonModule,
    FormsModule,
    TablaPronosticosComponent,
    FormularioPartidoComponent,
  ],
  templateUrl: './lista-partidos.component.html',
  styleUrl: './lista-partidos.component.css',
})
export class ListaPartidosComponent {
  partidos: any[] = [];
  partidoSeleccionadoId: string | null = null;
  busqueda: string = '';

  modoVista: 'lista' | 'editar' | 'pronosticos' = 'lista';

  @Output() seleccionar = new EventEmitter<any>();

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    await this.cargarPartidos();
  }

  async cargarPartidos() {
    this.partidos = await this.firebaseService.obtenerPartidos();
  }

  get partidosFiltrados() {
    return this.partidos.filter((p) =>
      `${p.local} vs ${p.visitante}`
        .toLowerCase()
        .includes(this.busqueda.toLowerCase())
    );
  }

  editarPartido(partidoId: string) {
    this.partidoSeleccionadoId = partidoId;
    this.modoVista = 'editar';
  }

  verPronosticosPartido(partidoId: string) {
    this.partidoSeleccionadoId = partidoId;
    this.modoVista = 'pronosticos';
  }

  volverALista() {
    this.partidoSeleccionadoId = null;
    this.modoVista = 'lista';
  }

  ordenarPorEstado() {
    // Ejemplo: ordena primero los partidos con estado 'Abierto', luego 'Jugado', luego otros
    const ordenEstados = ['Abierto', 'Jugado'];

    this.partidos.sort((a, b) => {
      const indexA = ordenEstados.indexOf(a.estado);
      const indexB = ordenEstados.indexOf(b.estado);

      // Si el estado no está en la lista, poner al final
      const posA = indexA === -1 ? ordenEstados.length : indexA;
      const posB = indexB === -1 ? ordenEstados.length : indexB;

      return posA - posB;
    });
  }

  ordenarPorFecha(direccion: 'asc' | 'desc') {
    this.partidos.sort((a, b) => {
      const fechaA = a.fechaLimite?.seconds || 0;
      const fechaB = b.fechaLimite?.seconds || 0;

      if (direccion === 'asc') {
        return fechaA - fechaB;
      } else {
        return fechaB - fechaA;
      }
    });
  }
}
