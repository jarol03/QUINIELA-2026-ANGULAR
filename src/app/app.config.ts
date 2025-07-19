import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Importa Firebase y Firestore
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Importa tu configuración de Firebase (crea este archivo con tu config)
import { firebaseConfig } from './firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Inicializa Firebase con tu configuración
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // Provee Firestore
    provideFirestore(() => getFirestore()),
  ],
};
