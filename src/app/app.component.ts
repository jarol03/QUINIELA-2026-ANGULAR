import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ListaPartidosComponent } from "./components/admin/lista-partidos/lista-partidos.component";
import { FormularioPartidoComponent } from "./components/admin/formulario-partido/formulario-partido.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, AdminComponent, ListaPartidosComponent, FormularioPartidoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'quiniela-2026';
}
