import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-tabla-pronosticos',
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-pronosticos.component.html',
  styleUrl: './tabla-pronosticos.component.css',
})
export class TablaPronosticosComponent {
  // Atributos
  @Input() partidoId: string = '';
  pronosticos: any[] = [];
  busqueda: string = '';
  cargando: boolean = false;
  nombreLocal: string = '';
  nombreVisitante: string = '';

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    if (this.partidoId) {
      const partido = await this.firebaseService.obtenerPartido(this.partidoId);
      if (partido) {
        this.nombreLocal = partido.local;
        this.nombreVisitante = partido.visitante;
      }
      await this.cargarPronosticos();
    }
  }

  async cargarPronosticos() {
    this.cargando = true;
    this.pronosticos = await this.firebaseService.obtenerPronosticosPorPartido(
      this.partidoId
    );
    console.log('pronosticos:', this.pronosticos);
    this.cargando = false;
  }

  get pronosticosFiltrados() {
    return this.pronosticos.filter((p) =>
      (p.nombreUsuario || p.usuarioId || '')
        .toLowerCase()
        .includes(this.busqueda.toLowerCase())
    );
  }

  async generarPDF() {
    const element = document.getElementById('reporte-tabla');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`pronosticos_${this.partidoId}.pdf`);
  }

  descargarParaExcel() {
    if (this.pronosticosFiltrados.length === 0) {
      alert('No hay pronósticos para exportar');
      return;
    }

    const filas = [
      [
        '#',
        'Nombre',
        this.nombreLocal || 'Local',
        this.nombreVisitante || 'Visitante',
        'Fecha',
      ],
    ];

    this.pronosticosFiltrados.forEach((p, i) => {
      filas.push([
        (i + 1).toString(),
        p.nombreUsuario || p.usuarioId || '',
        p.golesLocal.toString(),
        p.golesVisitante.toString(),
        new Date(p.fechaHora).toLocaleString(),
      ]);
    });

    // Convertimos a texto separado por TAB (Excel lo reconoce bien también)
    const texto = filas.map((f) => f.join('\t')).join('\n');

    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `pronosticos_${this.partidoId}.txt`; // Puedes usar .csv si prefieres
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async descargarImagen() {
    const element = document.getElementById('reporte-tabla');
    if (!element) return;

    const canvas = await html2canvas(element);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `pronosticos_${this.partidoId}.png`;
    link.click();
  }
}
