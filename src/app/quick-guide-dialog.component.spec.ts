import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import {
  QuickGuideDialogComponent,
  STOPP_START_CRITERIA_PDF_URL,
} from './quick-guide-dialog.component';

describe('QuickGuideDialogComponent', () => {
  let fixture: ComponentFixture<QuickGuideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickGuideDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickGuideDialogComponent);
    fixture.detectChanges();
  });

  const text = (): string =>
    (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('describe el flujo actual en dos pasos: Medicamentos y Diagnósticos', () => {
    expect(text()).toContain('Medicamentos');
    expect(text()).toContain('Diagnósticos');
    expect(text()).not.toContain('Paciente:');
    expect(text()).not.toContain('Resultados:');
  });

  it('explica STOPP y START', () => {
    expect(text()).toMatch(/STOPP/i);
    expect(text()).toMatch(/START/i);
    expect(text()).toMatch(/inapropiad/i);
    expect(text()).toMatch(/omitid/i);
  });

  it('incluye un enlace al PDF oficial de criterios STOPP/START v3', () => {
    const link = (fixture.nativeElement as HTMLElement).querySelector(
      `a[href="${STOPP_START_CRITERIA_PDF_URL}"]`,
    ) as HTMLAnchorElement | null;

    expect(link).toBeTruthy();
    expect(link!.target).toBe('_blank');
    expect(link!.rel.split(/\s+/)).toContain('noopener');
    expect(link!.textContent?.trim().length).toBeGreaterThan(0);
  });
});
