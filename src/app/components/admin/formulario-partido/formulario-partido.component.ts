import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-formulario-partido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-partido.component.html',
  styleUrl: './formulario-partido.component.css',
})
export class FormularioPartidoComponent {
  local = '';
  visitante = '';
  fechaLimite = '';
  mensajeExito = '';
  mensajeError = '';
  shakeTrigger = false;
  cargando = false;

  golesLocal = 0;
  golesVisitante: number = 0;

  @Input() partidoId: string | null = null;
  @Input() modoResultado = false;

  @Output() partidoCreado = new EventEmitter<void>();

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    if (this.partidoId) {
      await this.cargarPartido(this.partidoId);
    }
  }



  async cargarPartido(id: string) {
    const partido = await this.firebaseService.obtenerPartido(id);

    if (!partido) {
      this.mostrarError('No se pudo cargar el partido');
      return;
    }

    this.local = partido.local;
    this.visitante = partido.visitante;

    const fecha = new Date(
      partido.fechaLimite?.seconds * 1000 || partido.fechaLimite
    );
    this.fechaLimite = fecha.toISOString().slice(0, 16);

    if (this.modoResultado) {
      this.golesLocal = partido.golesLocal ?? null;
      this.golesVisitante = partido.golesVisitante ?? null;
    }
  }

  // Función única para mostrar errores
  mostrarError(texto: string) {
    this.mensajeExito = ''; // Limpiamos éxito
    this.mensajeError = texto;
    this.shakeTrigger = true;

    // Reiniciamos el trigger para que la sacudida funcione la próxima vez
    setTimeout(() => this.shakeTrigger = false, 300);
  }

  // Función única para mostrar éxito
  mostrarExito(texto: string) {
    this.mensajeError = ''; // Limpiamos error
    this.mensajeExito = texto;
  }

  async onSubmit() {
    this.cargando = true;

    try {
      if (this.modoResultado) {
        if (this.golesLocal === null || this.golesVisitante === null) {
          this.mostrarError("Ambos campos de goles son obligatorios");
          return;
        }

        if (this.golesLocal < 0 || this.golesVisitante < 0) {
          this.mostrarError("Los goles no pueden ser negativos");
          return;
        }

        const partidoActual = await this.firebaseService.obtenerPartido(this.partidoId!);

        if (partidoActual?.estado === "Jugado") {
          this.mostrarError("El resultado ya ha sido registrado previamente");
          return;
        }

        await this.firebaseService.actualizarPartido(this.partidoId!, {
          golesLocal: this.golesLocal,
          golesVisitante: this.golesVisitante,
          estado: 'Jugado',
        });

        await this.firebaseService.asignarPuntosAPronosticos(
          this.partidoId!,
          this.golesLocal,
          this.golesVisitante
        );

        this.mostrarExito("Resultado registrado correctamente");

        this.partidoCreado.emit();
        return;
      }

      if (!this.local || !this.visitante || !this.fechaLimite) {
        this.mostrarError('Todos los campos son obligatorios');
        return;
      }

      await this.firebaseService.crearPartido({
        local: this.local.trim(),
        visitante: this.visitante.trim(),
        fechaLimite: this.fechaLimite.trim(),
      });

      this.partidoCreado.emit();
      this.mostrarExito('Partido creado correctamente');

      this.resetFormulario();
    }
    finally {
      this.cargando = false;
    }
  }

  private resetFormulario() {
    this.local = '';
    this.visitante = '';
    this.fechaLimite = '';
    this.golesLocal = 0;
    this.golesVisitante = 0;
  }
}
