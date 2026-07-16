import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CriteriaEngineService } from './criteria-engine.service';
import { crit, makeCase, makeLabs, makeMed, setupEngine } from './criteria-test-helpers';

describe('CriteriaEngineService — Motor genérico', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('evaluate()', () => {
    it('devuelve array vacío cuando ningún criterio se cumple', () => {
      expect(engine.evaluate(makeCase(), [
        { id: 'X', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { in: ['hta', { var: 'diagnoses' }] } },
      ])).toEqual([]);
    });

    it('devuelve el criterio cuando se cumple la condición de diagnóstico', () => {
      const result = engine.evaluate(
        makeCase({ diagnoses: ['hta'] }),
        [{ id: 'X', type: 'STOPP', system: 'Test', summary: 'Test',
           logic: { in: ['hta', { var: 'diagnoses' }] } }],
      );
      expect(result.length).toBe(1);
    });

    it('compara diagnósticos sin distinguir mayúsculas', () => {
      const result = engine.evaluate(
        makeCase({ diagnoses: ['HTA'] }),
        [{ id: 'X', type: 'STOPP', system: 'Test', summary: 'Test',
           logic: { in: ['hta', { var: 'diagnoses' }] } }],
      );
      expect(result.length).toBe(1);
    });

    it('devuelve solo los criterios que coinciden', () => {
      const result = engine.evaluate(makeCase({ diagnoses: ['hta'] }), [
        { id: 'MATCH',    type: 'STOPP', system: 'Test', summary: 'Test', logic: { in: ['hta', { var: 'diagnoses' }] } },
        { id: 'NO_MATCH', type: 'STOPP', system: 'Test', summary: 'Test', logic: { in: ['dm2', { var: 'diagnoses' }] } },
      ]);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('MATCH');
    });

    it('evalúa condiciones de analíticas', () => {
      const patient = makeCase({ labs: makeLabs({ egfr_ml_min_173: 25 }) });
      const result = engine.evaluate(patient, [
        { id: 'E1', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { '<': [{ var: 'labs.egfr_ml_min_173' }, 30] } },
      ]);
      expect(result.length).toBe(1);
    });

    it('no dispara cuando la analítica no cumple la condición', () => {
      const patient = makeCase({ labs: makeLabs({ egfr_ml_min_173: 50 }) });
      expect(engine.evaluate(patient, [
        { id: 'E1', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { '<': [{ var: 'labs.egfr_ml_min_173' }, 30] } },
      ])).toEqual([]);
    });

    it('ignora criterios sin lógica', () => {
      expect(engine.evaluate(makeCase(), [
        { id: 'X', type: 'STOPP', system: 'Test', summary: 'Test' },
      ])).toEqual([]);
    });

    it('no lanza excepción con lógica inválida', () => {
      expect(engine.evaluate(makeCase(), [
        { id: 'BAD', type: 'STOPP', system: 'Test', summary: 'Test', logic: { __invalid__: [] } },
      ])).toEqual([]);
    });
  });

  describe('operador inDrugClass', () => {
    const criterion = { id: 'X', type: 'STOPP' as const, system: 'Test', summary: 'Test',
      logic: { inDrugClass: ['aine', { var: 'medications' }] } };

    it('activa el criterio con un medicamento de esa clase', () => {
      const p = makeCase({ medications: [makeMed('Ibuprofeno', ['AINE'])] });
      expect(engine.evaluate(p, [criterion]).length).toBe(1);
    });

    it('no activa el criterio sin medicamentos de esa clase', () => {
      const p = makeCase({ medications: [makeMed('Enalapril', ['IECA'])] });
      expect(engine.evaluate(p, [criterion])).toEqual([]);
    });

    it('compara clases sin distinguir mayúsculas', () => {
      const p = makeCase({ medications: [makeMed('Ibuprofeno', ['aine'])] });
      expect(engine.evaluate(p, [criterion]).length).toBe(1);
    });

    it('no activa el criterio sin medicamentos', () => {
      expect(engine.evaluate(makeCase(), [criterion])).toEqual([]);
    });
  });

  describe('operador digoxinaDosisAlta', () => {
    const criterion = { id: 'B1', type: 'STOPP' as const, system: 'Test', summary: 'Test',
      logic: { digoxinaDosisAlta: [{ var: 'medications' }] } };

    it('activa el criterio con dosis ≥125 mcg y duración >90 días', () => {
      const p = makeCase({ medications: [makeMed('Digoxina', ['digoxina'], { doseMcgDay: 125, durationDays: 91 })] });
      expect(engine.evaluate(p, [criterion]).length).toBe(1);
    });

    it('no activa con dosis por debajo del umbral', () => {
      const p = makeCase({ medications: [makeMed('Digoxina', ['digoxina'], { doseMcgDay: 124, durationDays: 91 })] });
      expect(engine.evaluate(p, [criterion])).toEqual([]);
    });

    it('no activa con duración ≤90 días', () => {
      const p = makeCase({ medications: [makeMed('Digoxina', ['digoxina'], { doseMcgDay: 125, durationDays: 90 })] });
      expect(engine.evaluate(p, [criterion])).toEqual([]);
    });
  });

  describe('operador multipleNSAIDs', () => {
    const criterion = { id: 'A3', type: 'STOPP' as const, system: 'Test', summary: 'Test',
      logic: { multipleNSAIDs: [{ var: 'medications' }] } };

    it('activa con 2 AINEs', () => {
      const p = makeCase({ medications: [makeMed('Ibuprofeno', ['aine']), makeMed('Naproxeno', ['aine'])] });
      expect(engine.evaluate(p, [criterion]).length).toBe(1);
    });

    it('no activa con 1 AINE', () => {
      const p = makeCase({ medications: [makeMed('Ibuprofeno', ['aine'])] });
      expect(engine.evaluate(p, [criterion])).toEqual([]);
    });
  });

  describe('getExcludedMedications()', () => {
    it('devuelve mapa vacío cuando ningún criterio está activo', () => {
      const result = engine.getExcludedMedications(makeCase(), [
        { id: 'A1', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { in: ['hta', { var: 'diagnoses' }] } },
      ]);
      expect(result.size).toBe(0);
    });

    it('excluye medicamentos específicos cuando el criterio está activo', () => {
      const patient = makeCase({ diagnoses: ['hta'] });
      const result = engine.getExcludedMedications(patient, [
        { id: 'A1', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { in: ['hta', { var: 'diagnoses' }] },
          excludes: { medications: ['Digoxina'] } },
      ]);
      expect(result.has('digoxina')).toBeTrue();
    });

    it('no excluye cuando el criterio no está activo', () => {
      const patient = makeCase({ diagnoses: ['hta'] });
      const result = engine.getExcludedMedications(patient, [
        { id: 'A1', type: 'STOPP', system: 'Test', summary: 'Test',
          logic: { in: ['dm2', { var: 'diagnoses' }] },
          excludes: { medications: ['Digoxina'] } },
      ]);
      expect(result.size).toBe(0);
    });

    it('STOPP-I8 excluye preventivamente todos los antibióticos', () => {
      const patient = makeCase({ diagnoses: ['bacteriuria_asintomatica'] });

      const result = engine.getExcludedMedications(
        patient,
        [crit('STOPP-I8-ANTIBIOTICO-BACTERIURIA-ASINTOMATICA')],
      );

      expect(result.has('amoxicilina')).toBeTrue();
      expect(result.has('ciprofloxacino')).toBeTrue();
      expect(result.has('nitrofurantoína')).toBeTrue();
    });
  });

  describe('signal relevance', () => {
    it('arranca vacío antes de cargar criterios', () => {
      expect(engine.relevance()).toBeNull();
      expect(Object.keys(engine.dxDependencies()).length).toBe(0);
    });

    it('se rellena tras loadCriteria() con un índice de tabs derivado', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const loaded = engine.loadCriteria();

      const req = httpMock.expectOne(r => r.url.startsWith('assets/data/criteria.json'));
      req.flush({
        criteria: [
          { id: 'X', type: 'STOPP', system: 'Sistema cardiovascular', summary: '',
            logic: { inDrugClass: ['BETABLOQUEANTE', { var: 'medications' }] } },
        ],
      });

      await loaded;

      const rel = engine.relevance();
      expect(rel).not.toBeNull();
      expect(rel!.classesByTab.get('cardiovascular')?.has('BETABLOQUEANTE')).toBeTrue();
      expect(engine.dxDependencies()['HTA grave']?.classes).toContain('DIURETICO_ASA');

      httpMock.verify();
    });
  });

});

describe('CriteriaEngineService — loadCriteria() caché', () => {
  let engine: CriteriaEngineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    engine = setupEngine();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('rechaza la promesa cuando el servidor devuelve error', async () => {
    const p = engine.loadCriteria();
    const req = httpMock.expectOne(r => r.url.includes('criteria.json'));
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

    await expectAsync(p).toBeRejected();
  });

  it('reintenta la carga en la segunda llamada tras un fallo', async () => {
    const firstCall = engine.loadCriteria();
    const req1 = httpMock.expectOne(r => r.url.includes('criteria.json'));
    req1.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(firstCall).toBeRejected();

    const mockCriteria = [
      { id: 'T1', type: 'STOPP' as const, system: 'Test', summary: 'Test',
        logic: { in: ['hta', { var: 'diagnoses' }] } },
    ];
    const secondCall = engine.loadCriteria();
    const req2 = httpMock.expectOne(r => r.url.includes('criteria.json'));
    req2.flush({ criteria: mockCriteria });

    const result = await secondCall;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('T1');
  });
});
