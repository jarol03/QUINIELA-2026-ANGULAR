import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { FormsModule } from '@angular/forms';
import { TablaPronosticosComponent } from '../tabla-pronosticos/tabla-pronosticos.component';
import { FormularioPartidoComponent } from '../formulario-partido/formulario-partido.component';
import { TablaGanadoresComponent } from '../tabla-ganadores/tabla-ganadores.component';

@Component({
  selector: 'app-lista-partidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TablaPronosticosComponent,
    FormularioPartidoComponent,
    TablaGanadoresComponent
  ],
  templateUrl: './lista-partidos.component.html',
  styleUrl: './lista-partidos.component.css',
})
export class ListaPartidosComponent implements OnInit {
  partidos: any[] = [];
  partidoSeleccionadoId: string | null = null;
  busqueda: string = '';

  // Variables de control para filtros y orden
  modoVista: 'lista' | 'editar' | 'pronosticos' | 'ganadores' = 'lista';
  soloPendientes: boolean = false;
  ordenFechaAsc: boolean = false; // False = Recientes primero (desc)

  @Output() seleccionar = new EventEmitter<any>();

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    await this.cargarPartidos();
  }

  async cargarPartidos() {
    this.partidos = await this.firebaseService.obtenerPartidos();
    // Aplicar orden por defecto: más recientes primero
    this.ordenarPorFecha(this.ordenFechaAsc ? 'asc' : 'desc');
  }

  /**
   * Procesa la lista de partidos aplicando búsqueda y filtro de pendientes
   */
  get partidosFiltrados() {
    let filtrados = this.partidos.filter((p) =>
      `${p.local} vs ${p.visitante}`
        .toLowerCase()
        .includes(this.busqueda.toLowerCase())
    );

    // Si está activo, filtramos los que no tengan estado 'Jugado'
    if (this.soloPendientes) {
      filtrados = filtrados.filter(p => p.estado !== 'Jugado');
    }

    return filtrados;
  }

  // --- MÉTODOS DE FILTRADO Y ORDEN ---

  alternarSoloPendientes() {
    this.soloPendientes = !this.soloPendientes;
  }

  toggleOrdenFecha() {
    this.ordenFechaAsc = !this.ordenFechaAsc;
    this.ordenarPorFecha(this.ordenFechaAsc ? 'asc' : 'desc');
  }

  ordenarPorFecha(direccion: 'asc' | 'desc') {
    this.partidos.sort((a, b) => {
      const fechaA = a.fechaLimite?.seconds || 0;
      const fechaB = b.fechaLimite?.seconds || 0;
      return direccion === 'asc' ? fechaA - fechaB : fechaB - fechaA;
    });
  }

  ordenarPorEstado() {
    // Orden jerárquico: Pendientes primero, luego Jugados
    const prioridad: Record<string, number> = {
      'Pendiente': 1,
      'Abierto': 1, // Por si manejas este término
      'Jugado': 2
    };

    this.partidos.sort((a, b) => {
      const posA = prioridad[a.estado] || 3;
      const posB = prioridad[b.estado] || 3;

      if (posA === posB) {
        // Si el estado es el mismo, ordenar por fecha reciente
        return (b.fechaLimite?.seconds || 0) - (a.fechaLimite?.seconds || 0);
      }
      return posA - posB;
    });
  }

  // --- NAVEGACIÓN Y VISTAS ---

  editarPartido(partidoId: string) {
    this.partidoSeleccionadoId = partidoId;
    this.modoVista = 'editar';
  }

  verPronosticosPartido(partidoId: string) {
    this.partidoSeleccionadoId = partidoId;
    this.modoVista = 'pronosticos';
  }

  verGanadores(partido: any) {
    this.partidoSeleccionadoId = partido.id;
    this.modoVista = 'ganadores';
  }

  async volverALista() {
    this.partidoSeleccionadoId = null;
    this.modoVista = 'lista';
    await this.cargarPartidos();
  }
}
