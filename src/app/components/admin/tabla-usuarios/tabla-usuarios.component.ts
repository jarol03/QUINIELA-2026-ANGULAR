import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tabla-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-usuarios.component.html',
  styleUrl: './tabla-usuarios.component.css',
})
export class TablaUsuariosComponent {
  usuarios: any[] = [];
  busqueda: string = '';

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarios = await this.firebaseService.obtenerUsuarios();
  }

  get usuariosFiltrados() {
    return this.usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        u.usuario.toLowerCase().includes(this.busqueda.toLowerCase())
    ).sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
  }

  async eliminarUsuario(usuarioId: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await this.firebaseService.eliminarUsuario(usuarioId);
      await this.cargarUsuarios();
    }
  }
}
