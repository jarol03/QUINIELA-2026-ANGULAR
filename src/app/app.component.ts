import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ListaPartidosComponent } from "./components/admin/lista-partidos/lista-partidos.component";
import { FormularioPartidoComponent } from "./components/admin/formulario-partido/formulario-partido.component";
import { TablaGanadoresComponent } from './components/admin/tabla-ganadores/tabla-ganadores.component';
import { FormularioUsuarioComponent } from './components/admin/formulario-usuario/formulario-usuario.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, AdminComponent, ListaPartidosComponent, FormularioPartidoComponent, TablaGanadoresComponent, FormularioUsuarioComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'quiniela-2026';
}
