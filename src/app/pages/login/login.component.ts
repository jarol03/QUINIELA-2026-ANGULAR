import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario: string = "";
  error: string = "";

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  async login(){
    const usuarioValido = this.usuario.trim().toLowerCase();

    if(usuarioValido === "luis") {
      sessionStorage.setItem('usuario', usuarioValido);
      this.router.navigate(['/admin']);
    }

    else{
      const existe = await this.firebaseService.existeUsuario(usuarioValido);

      if(existe) {
        sessionStorage.setItem('usuario', usuarioValido);
        this.router.navigate(['/pronostico']);
      } else {
        this.error = "Usuario no encontrado";
      }
    }
  }
}
