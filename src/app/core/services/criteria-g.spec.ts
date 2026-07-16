import { CriteriaEngineService } from './criteria-engine.service';
import {
  benzo,
  crit,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección G (Sistema respiratorio)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  it('G1 dispara con teofilina y EPOC', () => {
    const patient = makeCase({
      diagnoses: ['epoc'],
      medications: [makeMed('Teofilina', ['METILXANTINA'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-G1-TEOFILINA-EPOC')]).length).toBe(1);
  });

  it('G2 mantiene EPOC genérica como condición aceptada', () => {
    const patient = makeCase({
      diagnoses: ['epoc'],
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-G2-CORTICOIDE-SISTEMICO-EPOC')]).length).toBe(1);
  });

  it('G3 dispara con LAMA y cualquiera de sus dos contraindicaciones', () => {
    const c = crit('STOPP-G3-LAMA-GLAUCOMA-OBSTRUCCION-URINARIA');
    const lama = makeMed('Tiotropio', ['LAMA']);

    expect(engine.evaluate(makeCase({
      diagnoses: ['glaucoma_angulo_estrecho'],
      medications: [lama],
    }), [c]).length).toBe(1);
    expect(engine.evaluate(makeCase({
      diagnoses: ['obstruccion_tracto_urinario_inferior'],
      medications: [lama],
    }), [c]).length).toBe(1);
  });

  it('G4 dispara con benzodiacepina e insuficiencia respiratoria', () => {
    const patient = makeCase({
      diagnoses: ['insuficiencia_respiratoria'],
      medications: [benzo()],
    });
    expect(engine.evaluate(patient, [crit('STOPP-G4-BENZODIACEPINA-INSUFICIENCIA-RESPIRATORIA')]).length).toBe(1);
  });
});
