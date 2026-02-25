import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-formulario-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-usuario.component.html',
  styleUrl: './formulario-usuario.component.css'
})
export class FormularioUsuarioComponent {
  nombre: string = '';
  usuario: string = '';
  mensajeExito = '';
  mensajeError = '';
  shakeTrigger = false;

  @Output() usuarioCreado = new EventEmitter<void>();

  constructor(private firebaseService: FirebaseService) { }

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
    if (!this.nombre || !this.usuario) {
      this.mostrarError('Por favor, complete todos los campos.');
      return;
    }

    await this.firebaseService.crearUsuario({
      nombre: this.nombre.trim(),
      usuario: this.usuario.trim(),
      puntos: 0
    });

    this.usuarioCreado.emit();
    this.mostrarExito('Usuario creado con éxito.');

    this.nombre = '';
    this.usuario = '';

  }
}
