import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { Crit } from './types';

// Access private methods via type cast
type AnyReport = Record<string, (...args: unknown[]) => unknown>;

const makeCrit = (id: string, type: 'STOPP' | 'START', system: string, summary: string): Crit =>
  ({ id, type, system, summary });

describe('ReportService — buildHeader', () => {
  let service: ReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReportService] });
    service = TestBed.inject(ReportService);
  });

  it('sin logo devuelve un objeto con stack (sin columns)', () => {
    const result = (service as unknown as AnyReport)['buildHeader'](null) as Record<string, unknown>;
    expect(result['stack']).toBeDefined();
    expect(result['columns']).toBeUndefined();
  });

  it('con logo devuelve un objeto con columns (image + stack)', () => {
    const result = (service as unknown as AnyReport)['buildHeader']('data:image/png;base64,ABC') as Record<string, unknown>;
    expect(result['columns']).toBeDefined();
    const cols = result['columns'] as unknown[];
    expect(cols.length).toBe(2);
    expect((cols[0] as Record<string, unknown>)['image']).toBe('data:image/png;base64,ABC');
  });
});

describe('ReportService — buildTwoColumnSection', () => {
  let service: ReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReportService] });
    service = TestBed.inject(ReportService);
  });

  it('con diagnósticos y medicaciones devuelve listas ul', () => {
    const result = (service as unknown as AnyReport)['buildTwoColumnSection'](
      ['Hipertensión arterial'], ['Ibuprofeno']
    ) as Record<string, unknown>;

    const cols = result['columns'] as Array<Record<string, unknown>>;
    expect(cols.length).toBe(2);

    const diagStack = cols[0]['stack'] as Array<Record<string, unknown>>;
    const medStack  = cols[1]['stack'] as Array<Record<string, unknown>>;

    expect(diagStack[1]['ul']).toEqual(['Hipertensión arterial']);
    expect(medStack[1]['ul']).toEqual(['Ibuprofeno']);
  });

  it('con listas vacías devuelve texto "Sin datos"', () => {
    const result = (service as unknown as AnyReport)['buildTwoColumnSection']([], []) as Record<string, unknown>;
    const cols = result['columns'] as Array<Record<string, unknown>>;
    const diagContent = (cols[0]['stack'] as Array<Record<string, unknown>>)[1];
    const medContent  = (cols[1]['stack'] as Array<Record<string, unknown>>)[1];

    expect((diagContent['text'] as string)).toContain('Sin datos');
    expect((medContent['text'] as string)).toContain('Sin datos');
  });
});

describe('ReportService — buildCriteriaContent', () => {
  let service: ReportService;

  const stoppCrit = makeCrit('A1', 'STOPP', 'Cardiovascular', 'Descripción STOPP');
  const startCrit = makeCrit('B1', 'START', 'Cardiovascular', 'Descripción START');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReportService] });
    service = TestBed.inject(ReportService);
  });

  it('devuelve un array de 3 elementos (bloque STOPP, separador, bloque START)', () => {
    const result = (service as unknown as AnyReport)['buildCriteriaContent'](
      [stoppCrit], [startCrit]
    ) as unknown[];
    expect(result.length).toBe(3);
  });

  it('el header del bloque STOPP incluye el recuento correcto', () => {
    const result = (service as unknown as AnyReport)['buildCriteriaContent'](
      [stoppCrit, stoppCrit], []
    ) as Array<Record<string, unknown>>;

    const stoppBlock = result[0] as Record<string, unknown>;
    const table = stoppBlock['table'] as Record<string, unknown>;
    const body = table['body'] as Array<Array<Record<string, unknown>>>;
    const headerText: string = body[0][0]['text'] as string;

    expect(headerText).toContain('STOPP');
    expect(headerText).toContain('2');
  });

  it('sin criterios START muestra fila "Ningún criterio"', () => {
    const result = (service as unknown as AnyReport)['buildCriteriaContent'](
      [], []
    ) as Array<Record<string, unknown>>;

    const startBlock = result[2] as Record<string, unknown>;
    const table = startBlock['table'] as Record<string, unknown>;
    const body = table['body'] as Array<Array<Record<string, unknown>>>;
    const dataRow = body[2];
    expect((dataRow[0]['text'] as string)).toContain('Ningún criterio');
  });

  it('con un caso clínico real: datos de criterios aparecen en las filas', () => {
    const result = (service as unknown as AnyReport)['buildCriteriaContent'](
      [stoppCrit], [startCrit]
    ) as Array<Record<string, unknown>>;

    const stoppBlock = result[0] as Record<string, unknown>;
    const stoppTable = stoppBlock['table'] as Record<string, unknown>;
    const stoppBody = stoppTable['body'] as Array<Array<Record<string, unknown>>>;
    const stoppDataRow = stoppBody[2]; // [0]=subheader, [1]=colHeaders, [2]=data
    expect(stoppDataRow[0]['text']).toBe('A1');
    expect(stoppDataRow[2]['text']).toBe('Descripción STOPP');

    const startBlock = result[2] as Record<string, unknown>;
    const startTable = startBlock['table'] as Record<string, unknown>;
    const startBody = startTable['body'] as Array<Array<Record<string, unknown>>>;
    const startDataRow = startBody[2];
    expect(startDataRow[0]['text']).toBe('B1');
    expect(startDataRow[2]['text']).toBe('Descripción START');
  });
});
