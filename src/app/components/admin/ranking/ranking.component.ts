import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

interface UsuarioRanking {
  id?: string;
  nombre: string;
  usuario: string;
  puntos: number;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent implements OnInit {
  // Recibe la lista de usuarios desde el AdminComponent
  @Input() ranking: UsuarioRanking[] = [];

  // Estados de la interfaz
  mostrarModal = false;
  capturando = false;
  fotoUrl: string | null = null;
  canShare = false;

  // Propiedad para evitar el error de "new Date()" en el HTML
  fechaActual: Date = new Date();

  constructor() { }

  ngOnInit(): void {
    // Validar si el navegador soporta la API de compartir (Móviles)
    // Usamos 'in' para evitar errores de compilación en TS
    this.canShare = 'share' in navigator;
  }

  // --- LÓGICA DE APERTURA ---
  abrirRanking(): void {
    // Ordenar de mayor a menor puntos antes de mostrar
    this.ranking.sort((a, b) => b.puntos - a.puntos);

    this.fechaActual = new Date();
    this.mostrarModal = true;
    this.fotoUrl = null;
    document.body.style.overflow = 'hidden';
  }

  cerrarRanking(): void {
    this.mostrarModal = false;
    this.fotoUrl = null;
    // IMPORTANTE: Devolver el scroll al body
    document.body.style.overflow = 'auto';
  }

  // --- LÓGICA DE CLASIFICACIÓN ---
  obtenerClaseZona(posicion: number, total: number): string {
    if (posicion <= 3) return 'zona-dinero';
    if (posicion > 3 && posicion <= 10) return 'zona-posibilidades';
    if (total > 15 && posicion > total - 3) return 'zona-descenso';
    return 'zona-normal';
  }

  // --- CAPTURA DE PANTALLA ---
  async tomarFotoRanking(): Promise<void> {
    if (this.ranking.length === 0) return;

    this.capturando = true;

    // Esperamos un instante para que Angular asegure que el DOM está listo
    await new Promise(resolve => setTimeout(resolve, 150));

    const areaCaptura = document.getElementById('rankingCaptureArea');

    if (!areaCaptura) {
      this.capturando = false;
      console.error('No se encontró el área de captura');
      return;
    }

    try {
      const canvas = await html2canvas(areaCaptura, {
        backgroundColor: '#1a1a1a', // Color de fondo sólido para la imagen
        scale: 2, // Mejora la nitidez en WhatsApp
        logging: false,
        useCORS: true,
        // Forzamos el tamaño real del scroll para no cortar columnas
        width: areaCaptura.scrollWidth,
        height: areaCaptura.scrollHeight,
        windowWidth: areaCaptura.scrollWidth,
        windowHeight: areaCaptura.scrollHeight
      });

      this.fotoUrl = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al generar captura:', error);
      alert('Error al generar la imagen. Inténtalo de nuevo.');
    } finally {
      this.capturando = false;
    }
  }

  // --- COMPARTIR ---
  async compartirRanking(): Promise<void> {
    if (!this.fotoUrl) return;

    try {
      const response = await fetch(this.fotoUrl);
      const blob = await response.blob();
      const file = new File([blob], this.nombreArchivo, { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'Ranking Quiniela 2026',
          text: `📊 ¡Mira el ranking actualizado! Hay ${this.ranking.length} participantes.`,
          files: [file]
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  }

  // Helper para el nombre del archivo de descarga
  get nombreArchivo(): string {
    const d = new Date();
    const fecha = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    return `Ranking-Quiniela-${fecha}.png`;
  }
}
