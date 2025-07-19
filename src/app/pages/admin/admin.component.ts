import { CommonModule } from '@angular/common';
import { Component, ViewChild, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../..//services/firebase.service';
import { FormsModule } from '@angular/forms';
import { FormularioUsuarioComponent } from '../../components/admin/formulario-usuario/formulario-usuario.component';
import { TablaUsuariosComponent } from '../../components/admin/tabla-usuarios/tabla-usuarios.component';
import { FormularioPartidoComponent } from '../../components/admin/formulario-partido/formulario-partido.component';
import { ListaPartidosComponent } from '../../components/admin/lista-partidos/lista-partidos.component';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    FormsModule,
    FormularioUsuarioComponent,
    FormularioPartidoComponent,
    TablaUsuariosComponent,
    ListaPartidosComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  usuario: string = sessionStorage.getItem('usuario') || '';
  nuevoNombre: string = '';
  nuevoUsuario: string = '';
  mensaje: string = '';

  mostrarFormularioUsuario = false;
  mostrarFormularioPartido = false;
  pestanaActiva: string = 'usuarios';

  usuarios: any[] = [];
  busquedaUsuarios: string = '';

  partidos: any[] = [];
  busquedaPartidos: string = '';

  @ViewChild(TablaUsuariosComponent) tablaUsuarios!: TablaUsuariosComponent;
  @ViewChild(ListaPartidosComponent) listaPartidos!: ListaPartidosComponent;

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  //FUNCIONES VISUALES
  toggleFormularioUsuario() {
    this.mostrarFormularioUsuario = !this.mostrarFormularioUsuario;
  }

  toggleFormularioPartido() {
    this.mostrarFormularioPartido = !this.mostrarFormularioPartido;
  }

  get usuariosFiltrados() {
    return this.usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(this.busquedaUsuarios.toLowerCase()) ||
        u.usuario.toLowerCase().includes(this.busquedaUsuarios.toLowerCase())
    );
  }

  async cargarUsuarios() {
    this.usuarios = await this.firebaseService.obtenerUsuarios();
  }

  refrescarUsuarios() {
    this.tablaUsuarios.cargarUsuarios();
  }

  refrescarPartidos() {
    this.listaPartidos.cargarPartidos();
  }

  cerrarSesion() {
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
