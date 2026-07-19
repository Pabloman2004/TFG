import { TestBed } from '@angular/core/testing';
import pdfMake from 'pdfmake/build/pdfmake';

import { ReportService } from './report.service';
import { Crit } from './types';

const makeCrit = (id: string, type: 'STOPP' | 'START', system: string, summary: string): Crit =>
  ({ id, type, system, summary });

describe('ReportService — exportCase()', () => {
  let service: ReportService;
  let download: jasmine.Spy;
  let createPdf: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReportService] });
    service = TestBed.inject(ReportService);
    download = jasmine.createSpy('download');
    createPdf = spyOn(pdfMake, 'createPdf').and.returnValue({ download } as never);
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 404 }));
  });

  it('genera el docDefinition completo y descarga el PDF', async () => {
    const stopp = makeCrit('A1', 'STOPP', 'Cardiovascular', 'Descripción STOPP');
    const start = makeCrit('B1', 'START', 'Cardiovascular', 'Descripción START');

    await service.exportCase({
      patient: { name: 'Ana Pérez', age: 80, sex: 'F' },
      diagnoses: ['hta'],
      meds: [{ id: 'Ibuprofeno', drugClasses: ['AINE'] }],
      results: [stopp, start],
      fileName: 'informe-test.pdf',
    });

    expect(createPdf).toHaveBeenCalledTimes(1);
    const docDefinition = createPdf.calls.mostRecent().args[0] as Record<string, unknown>;

    expect(docDefinition['defaultStyle']).toEqual(
      jasmine.objectContaining({ fontFeatures: { liga: false } }),
    );
    expect(docDefinition['styles']).toEqual(
      jasmine.objectContaining({
        reportTitle: jasmine.objectContaining({ fontSize: 20 }),
        sectionTitle: jasmine.anything(),
      }),
    );
    expect(typeof docDefinition['footer']).toBe('function');

    const content = docDefinition['content'] as unknown[];
    expect(content.length).toBeGreaterThan(5);
    const title = content.find(
      (node): node is { text: string } =>
        typeof node === 'object' && node !== null && 'text' in node
        && (node as { text: unknown }).text === 'Informe STOPP/START',
    );
    expect(title).toBeTruthy();

    const serialized = JSON.stringify(docDefinition);
    expect(serialized).toContain('STOPP');
    expect(serialized).toContain('START');
    expect(serialized).toContain('Descripción STOPP');
    expect(serialized).toContain('Descripción START');
    expect(serialized).toContain('A1');
    expect(serialized).toContain('B1');

    expect(download).toHaveBeenCalledWith('informe-test.pdf');
  });

  it('usa nombre de fichero por defecto derivado del paciente', async () => {
    await service.exportCase({
      patient: { name: 'Juan López', age: null, sex: null },
      diagnoses: [],
      meds: [],
      results: [],
    });

    expect(download).toHaveBeenCalledWith('stopp-start_juan_lópez.pdf');
  });

  it('sin criterios incluye filas vacías de STOPP y START', async () => {
    await service.exportCase({
      patient: null,
      diagnoses: [],
      meds: [],
      results: [],
    });

    const docDefinition = createPdf.calls.mostRecent().args[0] as Record<string, unknown>;
    const serialized = JSON.stringify(docDefinition);
    expect(serialized).toContain('Ningún criterio aplicable');
  });
});
