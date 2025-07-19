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
  mensaje = '';

  golesLocal: number | null = null;
  golesVisitante: number | null = null;

  @Input() partidoId: string | null = null;
  @Input() modoResultado = false;

  @Output() partidoCreado = new EventEmitter<void>();

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    if (this.partidoId) {
      await this.cargarPartido(this.partidoId);
    }
  }

  

  async cargarPartido(id: string) {
    const partido = await this.firebaseService.obtenerPartido(id);

    if (!partido) {
      this.mensaje = 'Partido no encontrado';
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

  async onSubmit() {
    if (this.modoResultado) {
      if (this.golesLocal === null || this.golesVisitante === null) {
        this.mensaje = 'Debes ingresar ambos resultados';
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

      this.mensaje = 'Resultado guardado correctamente';
      return;
    }

    if (!this.local || !this.visitante || !this.fechaLimite) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    await this.firebaseService.crearPartido({
      local: this.local.trim(),
      visitante: this.visitante.trim(),
      fechaLimite: this.fechaLimite.trim(),
    });

    this.partidoCreado.emit();
    this.mensaje = 'Partido creado correctamente';

    this.resetFormulario();
  }

  private resetFormulario() {
    this.local = '';
    this.visitante = '';
    this.fechaLimite = '';
    this.golesLocal = null;
    this.golesVisitante = null;
  }
}
