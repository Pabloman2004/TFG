// @linked docs/informes-y-exportacion.md
// Si cambias el formato CaseExport, la validación o la versión, actualiza el doc enlazado.
import { Injectable } from '@angular/core';

import { CaseStoreService } from './case-store.service';
import { CaseExport, PatientCase } from './types';

const EXPORT_VERSION = '1.0';

function isMed(m: unknown): boolean {
  if (!m || typeof m !== 'object') return false;
  const obj = m as Record<string, unknown>;
  return typeof obj['id'] === 'string' && Array.isArray(obj['drugClasses']);
}

function isLabsValue(v: unknown): boolean {
  return v === null || typeof v === 'number';
}

function isLabs(labs: unknown): boolean {
  if (!labs || typeof labs !== 'object') return false;
  return Object.values(labs as Record<string, unknown>).every(isLabsValue);
}

function isPatientCase(data: unknown): data is PatientCase {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d['diagnoses']) || !Array.isArray(d['medications'])) return false;
  if (!(d['medications'] as unknown[]).every(isMed)) return false;
  if (d['labs'] !== null && d['labs'] !== undefined && !isLabs(d['labs'])) return false;
  return true;
}

function isCaseExport(data: unknown): data is CaseExport {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d['version'] === 'string' && isPatientCase(d['patientCase']);
}

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
    URL.revokeObjectURL(url);
  }

  async importFile(file: File): Promise<void> {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Formato no válido: el archivo no contiene JSON válido.');
    }
    if (!isCaseExport(parsed)) {
      throw new Error('Formato no válido: el archivo no tiene la estructura esperada.');
    }
    this.store.loadCase(parsed.patientCase);
  }

  private buildFileName(): string {
    const name = this.store.patient()?.name?.trim() || 'caso';
    const date = new Date().toISOString().slice(0, 10);
    return `stopp-start_${name.replace(/\s+/g, '_').toLowerCase()}_${date}.json`;
  }
}
