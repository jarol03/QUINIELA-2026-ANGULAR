import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-tabla-ganadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-ganadores.component.html',
  styleUrl: './tabla-ganadores.component.css',
})
export class TablaGanadoresComponent implements OnInit {
  @Input() partidoId: string = '';

  resultados: any[] = [];
  busqueda: string = '';
  cargando: boolean = false;
  nombreLocal: string = '';
  nombreVisitante: string = '';

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    if (this.partidoId) {
      await this.cargarDatosYGanadores();
    }
  }

  // tabla-ganadores.component.ts
  async cargarDatosYGanadores() {
    this.cargando = true;
    const partido = await this.firebaseService.obtenerPartido(this.partidoId);

    if (partido && partido.estado === 'Jugado') {
      this.nombreLocal = partido.local;
      this.nombreVisitante = partido.visitante;

      // Llamamos a la función de "solo cálculo"
      this.resultados = await this.firebaseService.calcularResultadosPuntos(
        this.partidoId,
        partido.golesLocal,
        partido.golesVisitante
      );
    }
    this.cargando = false;
  }

  get resultadosFiltrados() {
    return this.resultados.filter((r) =>
      (r.nombre || '').toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  async generarPDF() {
    const element = document.getElementById('reporte-ganadores');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ganadores_${this.partidoId}.pdf`);
  }

  descargarParaExcel() {
    const filas = [['#', 'Nombre', this.nombreLocal, this.nombreVisitante, 'Puntos']];
    this.resultadosFiltrados.forEach((r, i) => {
      filas.push([
        (i + 1).toString(),
        r.nombre || 'Anónimo',
        r.golesLocal.toString(), // Celda individual Local
        r.golesVisitante.toString(), // Celda individual Visitante
        r.puntosGanados.toString(),
      ]);
    });
    const texto = filas.map((f) => f.join('\t')).join('\n');
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `puntos_${this.partidoId}.txt`;
    link.click();
  }

  async descargarImagen() {
    const element = document.getElementById('reporte-ganadores');
    if (!element) return;
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ganadores_${this.partidoId}.png`;
    link.click();
  }
}
