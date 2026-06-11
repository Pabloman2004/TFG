// @linked docs/informes-y-exportacion.md
// Si cambias la estructura del PDF o los métodos de construcción, actualiza el doc enlazado.
import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as pdfFontsVfs } from 'pdfmake/build/vfs_fonts';
import { Med, PatientInfo, Crit } from './types';
import { resolveDiagnosisLabel } from './data/diagnoses';
import { resolveMedicationLabel } from './data/medications-taxonomy';

pdfMake.vfs = pdfFontsVfs;

const COLORS = {
  brandBlue:   '#1e3a5f',
  accentBlue:  '#2563eb',
  colHeader:   '#1e40af',
  textDark:    '#374151',
  textMuted:   '#6b7280',
  textFaint:   '#9ca3af',
  dividerLight:'#e5e7eb',
  stoppText:   '#7f1d1d',
  stoppBg:     '#fef2f2',
  startText:   '#14532d',
  startBg:     '#f0fdf4',
  tableRowBg:  '#f9fafb',
} as const;

@Injectable({ providedIn: 'root' })
export class ReportService {
  async exportCase(options: {
    patient: PatientInfo | null;
    diagnoses: string[];
    meds: Med[];
    results?: Crit[];
    fileName?: string;
  }): Promise<void> {
    const { patient, diagnoses, meds, results = [], fileName = this.defaultFileName(patient) } = options;

    const [logoDataUrl] = await Promise.all([this.loadLogoBase64()]);
    const dateString = this.formatDate(new Date());

    const stoppCriteria = results.filter(r => r.type === 'STOPP');
    const startCriteria = results.filter(r => r.type === 'START');

    const diagLabels = diagnoses.map(resolveDiagnosisLabel);
    const medLabels  = meds.map(m => resolveMedicationLabel(m.id));

    const docDefinition: PdfDocDefinition = {
      // liga:false desactiva las ligaduras OpenType fi/fl de Roboto, que los
      // visores PDF renderizan como erratas ("signifcativa"). Se hereda en
      // todo el documento (tablas, listas y footer incluidos) vía defaultStyle.
      defaultStyle: { fontSize: 10, fontFeatures: { liga: false } },
      pageMargins: [40, 55, 40, 55],
      footer: (page: number, total: number) => this.buildFooter(page, total),
      content: [
        this.buildHeader(logoDataUrl),
        this.buildDivider(COLORS.accentBlue, 1.5),
        { text: 'Informe STOPP/START', style: 'reportTitle', margin: [0, 14, 0, 3] },
        { text: `Fecha: ${dateString}`, style: 'dateText', margin: [0, 0, 0, 14] },
        this.buildDivider(COLORS.dividerLight, 0.5),
        this.buildTwoColumnSection(diagLabels, medLabels),
        this.buildDivider(COLORS.dividerLight, 0.5),
        { text: 'Criterios aplicables', style: 'sectionTitle', margin: [0, 12, 0, 8] },
        ...this.buildCriteriaContent(stoppCriteria, startCriteria),
      ],
      styles: {
        reportTitle: { fontSize: 20, bold: true, color: COLORS.brandBlue },
        dateText:    { fontSize: 10, color: COLORS.textMuted },
        sectionTitle:{ fontSize: 13, bold: true, color: COLORS.brandBlue },
        colHeader:   { fontSize: 11, bold: true, color: COLORS.colHeader },
        tableHeader: { bold: true, fontSize: 9, fillColor: '#f3f4f6' },
        muted:       { color: COLORS.textFaint, italics: true },
      },
    };

    try {
      pdfMake.createPdf(docDefinition).download(fileName);
    } catch (err) {
      console.error('[ReportService] Error al generar el PDF:', err);
      throw err;
    }
  }

  // ── Header ─────────────────────────────────────────────────────────────

  private buildHeader(logoDataUrl: string | null): unknown {
    const brandStack = {
      stack: [
        { text: 'STOPP/START', bold: true, fontSize: 15, color: COLORS.brandBlue },
        { text: 'Optimización terapéutica', fontSize: 9, color: COLORS.textMuted, margin: [0, 2, 0, 0] },
      ],
    };

    if (logoDataUrl) {
      return {
        columns: [
          { image: logoDataUrl, width: 44, height: 44 },
          { ...brandStack, margin: [8, 5, 0, 0] },
        ],
        columnGap: 0,
        margin: [0, 0, 0, 6],
      };
    }
    return { ...brandStack, margin: [0, 0, 0, 6] };
  }

  // ── Divider ─────────────────────────────────────────────────────────────

  private buildDivider(color: string, lineWidth = 0.5): unknown {
    return {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth, lineColor: color },
      ],
      margin: [0, 3, 0, 3],
    };
  }

  // ── Two-column section ───────────────────────────────────────────────────

  private buildTwoColumnSection(diagnoses: string[], medications: string[]): unknown {
    const diagContent = diagnoses.length
      ? { ul: diagnoses, fontSize: 9 }
      : { text: '— Sin datos', style: 'muted', fontSize: 9 };

    const medContent = medications.length
      ? { ul: medications, fontSize: 9 }
      : { text: '— Sin datos', style: 'muted', fontSize: 9 };

    return {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Diagnósticos / Factores', style: 'colHeader', margin: [0, 0, 0, 5] },
            diagContent,
          ],
        },
        {
          width: '50%',
          stack: [
            { text: 'Medicaciones', style: 'colHeader', margin: [0, 0, 0, 5] },
            medContent,
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 8, 0, 8],
    };
  }

  // ── Criteria section ─────────────────────────────────────────────────────

  private buildCriteriaContent(stopp: Crit[], start: Crit[]): unknown[] {
    return [
      this.buildCriteriaBlock(
        `STOPP — Prescripciones potencialmente inapropiadas (${stopp.length})`,
        COLORS.stoppText,
        COLORS.stoppBg,
        stopp,
      ),
      { text: '', margin: [0, 0, 0, 10] },
      this.buildCriteriaBlock(
        `START — Prescripciones recomendadas (${start.length})`,
        COLORS.startText,
        COLORS.startBg,
        start,
      ),
    ];
  }

  private buildCriteriaBlock(
    headerText: string,
    headerColor: string,
    headerBg: string,
    criteria: Crit[],
  ): unknown {
    const subsectionHeader = [
      {
        text: headerText,
        fillColor: headerBg,
        color: headerColor,
        bold: true,
        fontSize: 10,
        colSpan: 3,
        margin: [6, 5, 6, 5],
      },
      { text: '' },
      { text: '' },
    ];

    const columnHeaders = [
      { text: 'ID',          style: 'tableHeader', margin: [4, 3, 4, 3] },
      { text: 'Sistema',     style: 'tableHeader', margin: [4, 3, 4, 3] },
      { text: 'Descripción', style: 'tableHeader', margin: [4, 3, 4, 3] },
    ];

    const dataRows = criteria.length
      ? criteria.map((r, i) => [
          { text: r.id,      fontSize: 8, margin: [4, 3, 4, 3], fillColor: i % 2 === 0 ? '#ffffff' : COLORS.tableRowBg },
          { text: r.system,  fontSize: 8, margin: [4, 3, 4, 3], fillColor: i % 2 === 0 ? '#ffffff' : COLORS.tableRowBg },
          { text: r.summary, fontSize: 8, margin: [4, 3, 4, 3], fillColor: i % 2 === 0 ? '#ffffff' : COLORS.tableRowBg },
        ])
      : [[
          { text: '— Ningún criterio aplicable de este tipo', colSpan: 3, color: COLORS.textMuted, italics: true, fontSize: 8, margin: [4, 5, 4, 5] },
          { text: '' },
          { text: '' },
        ]];

    return {
      table: {
        headerRows: 2,
        widths: [72, 90, '*'],
        body: [subsectionHeader, columnHeaders, ...dataRows],
      },
      layout: 'lightHorizontalLines',
    };
  }

  // ── Footer ───────────────────────────────────────────────────────────────

  private buildFooter(currentPage: number, pageCount: number): unknown {
    return {
      columns: [
        {
          stack: [
            {
              text: 'Herramienta de apoyo a la decisión clínica. La revisión y criterio clínico del profesional sanitario son imprescindibles.',
              fontSize: 7,
              color: COLORS.textMuted,
            },
            {
              text: 'Generado por: Sistema STOPP/START',
              fontSize: 7,
              color: COLORS.textFaint,
              margin: [0, 1, 0, 0],
            },
          ],
          width: '*',
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          fontSize: 7,
          color: COLORS.textMuted,
          alignment: 'right',
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
      ],
      margin: [40, 6, 40, 0],
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private formatDate(d: Date): string {
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('assets/logoTFG.png');
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private defaultFileName(p: PatientInfo | null): string {
    const name = p?.name?.trim() || 'paciente';
    return `stopp-start_${name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
  }
}
