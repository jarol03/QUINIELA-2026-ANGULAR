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
  mensaje: string = '';

  @Output() usuarioCreado = new EventEmitter<void>();

  constructor(private firebaseService: FirebaseService) {}


  async onSubmit(){
    if(!this.nombre || !this.usuario) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }
    
    await this.firebaseService.crearUsuario({
      nombre: this.nombre.trim(),
      usuario: this.usuario.trim(),
      puntos: 0
    });

    this.usuarioCreado.emit();
    this.mensaje = 'Usuario creado correctamente';

    this.nombre = '';
    this.usuario = '';

  }
}
