import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const usuario = sessionStorage.getItem('usuario');

  if (usuario === 'luis') {
    return true;
  }

  window.alert("Acceso Denegado");
  window.location.href = "/login";
  return false;
};
