import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as pdfFontsVfs } from 'pdfmake/build/vfs_fonts';
import { Med, PatientInfo, Crit } from './types';

(pdfMake as any).vfs = pdfFontsVfs;

@Injectable({ providedIn: 'root' })
export class ReportService {
  exportCase(options: {
    patient: PatientInfo | null;
    diagnoses: string[];
    meds: Med[];
    results?: Crit[];
    fileName?: string;
  }) {
    const { patient, diagnoses, meds, results = [], fileName = this.defaultFileName(patient) } = options;
    const today = new Date().toLocaleString();

    const docDefinition: any = {
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Informe STOPP/START', style: 'h1' },
        { text: `Fecha: ${today}`, style: 'meta', margin: [0, 0, 0, 10] },

        { text: 'Paciente', style: 'h2' },
        this.patientBlock(patient),

        { text: 'Diagnósticos / Factores', style: 'h2', margin: [0, 12, 0, 6] },
        this.bulletOrEmpty(diagnoses, 'Sin datos'),

        { text: 'Medicaciones', style: 'h2', margin: [0, 12, 0, 6] },
        this.bulletOrEmpty(meds.map(m => m.id), 'Sin datos'), // el map recorre cada posicion de meds y devuelve el id (nombre del medicamnento)

        ...(results.length ? [
          { text: 'Criterios aplicables', style: 'h2', margin: [0, 12, 0, 6] },
          this.resultsTable(results)
        ] : [
          { text: 'Criterios aplicables', style: 'h2', margin: [0, 12, 0, 2] },
          { text: '— (pendiente de evaluación)', style: 'muted' }
        ])
      ],
      styles: {
        h1: { fontSize: 18, bold: true },
        h2: { fontSize: 14, bold: true },
        meta: { fontSize: 9, color: '#666' },
        muted: { color: '#666' },
        tableHeader: { bold: true, fillColor: '#f0f0f0' },
        stopp: { color: '#b71c1c' },
        start: { color: '#2e7d32' },
      }
    };

    (pdfMake as any).createPdf(docDefinition).download(fileName);
  }

  private defaultFileName(p: PatientInfo | null) {
    const name = p?.name?.trim() || 'paciente';
    return `stopp-start_${name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
  }

  private patientBlock(p: PatientInfo | null) {
    if (!p) return { text: '— (sin datos de paciente)', style: 'muted', margin: [0, 0, 0, 6] };
    const rows = [
      ['Nombre', p.name ?? '—'],
      ['Edad', p.age != null ? String(p.age) : '—'],
      ['Sexo', p.sex ?? '—'],
      ['N.º Historia', p.mrn || '—'],
      ['Peso (kg)', p.weightKg != null ? String(p.weightKg) : '—'],
      ['Altura (cm)', p.heightCm != null ? String(p.heightCm) : '—'],
    ];
    const notes = p.notes?.trim();
    return [
      {
        table: { widths: ['auto', '*'], body: [
          [{ text: 'Campo', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
          ...rows
        ]},
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, notes ? 6 : 0]
      },
      ...(notes ? [{ text: `Observaciones: ${notes}`, margin: [0, 0, 0, 6] }] : [])
    ];
  }

  private bulletOrEmpty(items: string[], emptyText: string) {
    return items?.length ? { ul: items } : { text: `— ${emptyText}`, style: 'muted' };
  }

  private resultsTable(results: Crit[]) {
    const header = [
      { text: 'ID', style: 'tableHeader' },
      { text: 'Tipo', style: 'tableHeader' },
      { text: 'Sistema', style: 'tableHeader' },
      { text: 'Resumen', style: 'tableHeader' }
    ];
    const body = results.map(r => ([
      r.id,
      { text: r.type, style: r.type === 'STOPP' ? 'stopp' : 'start' },
      r.system,
      r.summary
    ]));
    return {
      table: { headerRows: 1, widths: [80, 50, 80, '*'], body: [header, ...body] },
      layout: 'lightHorizontalLines'
    };
  }
}
