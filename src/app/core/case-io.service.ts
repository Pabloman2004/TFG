// @linked docs/informes-y-exportacion.md
// Si cambias el formato CaseExport, la validación o la versión, actualiza el doc enlazado.
import { Injectable } from '@angular/core';

import { CaseStoreService } from './case-store.service';
import { CaseExport } from './types';
import { caseExportSchema, EXPORT_VERSION } from './case-export.schema';

const INVALID_CASE_MESSAGE = 'El fichero no es un caso válido. Comprueba que sea una exportación STOPP/START en versión 1.0.';

@Injectable({ providedIn: 'root' })
export class CaseIoService {
  constructor(private store: CaseStoreService) {}

  exportCase(): void {
    const payload: CaseExport = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      patientCase: this.store.patientCase,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.buildFileName();
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async importFile(file: File): Promise<void> {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Formato no válido: el archivo no contiene JSON válido.');
    }
    const result = caseExportSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(INVALID_CASE_MESSAGE);
    }
    this.store.loadCase(result.data.patientCase);
  }

  private buildFileName(): string {
    const name = this.store.patient()?.name?.trim() || 'caso';
    const date = new Date().toISOString().slice(0, 10);
    return `stopp-start_${name.replace(/\s+/g, '_').toLowerCase()}_${date}.json`;
  }
}
