import {
  foreignDrugCriterionIds,
  relatedOwnGroupIds,
  resolveForeignHighlight,
  resolveForeignDxHighlight,
  relatedOwnDxLabels,
  foreignLinksByOwnGroup,
  missingRequirements,
  relatedSelectionLinks,
} from './foreign-provenance';
import { buildRelevance } from './data/system-relevance';
import { DRUG_CATEGORIES } from './data/medications-taxonomy';
import { MEDICATIONS } from './data/medications';
import { ALL_CRITERIA } from './services/criteria-test-helpers';
import { computeMedGroupBuckets } from './group-visibility';
import { DIAGNOSIS_MAP } from './data/diagnoses';

const ALL_TAB_IDS = DRUG_CATEGORIES.map(c => c.id);
const relevance = buildRelevance(ALL_CRITERIA, ALL_TAB_IDS);

const criteriaById = new Map(ALL_CRITERIA.map(c => [c.id, c]));
const dxLabelsByCode = new Map(
  Object.entries(DIAGNOSIS_MAP).map(([label, code]) => [code, label]),
);

const ownGroupsOf = (tabId: string) =>
  computeMedGroupBuckets(tabId, DRUG_CATEGORIES, relevance, 'otros', MEDICATIONS).ownAll;

describe('foreignDrugCriterionIds', () => {
  it('une ids de criterios de todas las clases relevantes del fármaco sin duplicados', () => {
    const ids = foreignDrugCriterionIds({
      drugId: 'Amilorida',
      tabId: 'cardiovascular',
      relevance,
      medications: MEDICATIONS,
    });
    expect(ids.some(id => id.includes('B13'))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('devuelve [] si el fármaco no tiene relevancia específica en el tab', () => {
    expect(foreignDrugCriterionIds({
      drugId: 'Clorfeniramina',
      tabId: 'cardiovascular',
      relevance,
      medications: MEDICATIONS,
    })).toEqual([]);
  });
});

describe('relatedOwnGroupIds', () => {
  it('marcar prednisona en cardiovascular apunta a diuréticos de asa (B19)', () => {
    const ids = relatedOwnGroupIds({
      drugId: 'Prednisona',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
    });
    const groups = ownGroupsOf('cardiovascular').filter(g => ids.includes(g.id));
    expect(groups.some(g => g.drugClass === 'DIURETICO_ASA')).toBe(true);
  });

  it('marcar sildenafilo apunta a nitratos (B14)', () => {
    const ids = relatedOwnGroupIds({
      drugId: 'Sildenafilo',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
    });
    const groups = ownGroupsOf('cardiovascular').filter(g => ids.includes(g.id));
    expect(groups.some(g => g.drugClass === 'NITRATO')).toBe(true);
  });

  it('marcar amilorida apunta a IECA / ARA-II / antagonistas de aldosterona (B13)', () => {
    const ids = relatedOwnGroupIds({
      drugId: 'Amilorida',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
    });
    const classes = ownGroupsOf('cardiovascular')
      .filter(g => ids.includes(g.id))
      .map(g => g.drugClass);
    expect(classes).toContain('IECA');
    expect(classes).toContain('ARA2');
    expect(classes).toContain('ANTAGONISTA_ALDOSTERONA');
  });
});

describe('resolveForeignHighlight cascada', () => {
  it('nivel 1: prednisona resalta grupos y no produce snack', () => {
    const result = resolveForeignHighlight({
      drugId: 'Prednisona',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set(),
      selectedDiagnoses: [],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.groupIds.length).toBeGreaterThan(0);
    expect(result.criterionIds).toEqual([]);
  });

  it('nivel 2: ondansetrón con B15 aplicable resalta la tarjeta', () => {
    const result = resolveForeignHighlight({
      drugId: 'Ondansetrón',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set(['STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO']),
      selectedDiagnoses: ['Intervalo QTc prolongado'],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.groupIds).toEqual([]);
    expect(result.criterionIds).toContain('STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO');
  });

  it('nivel 3: ondansetrón sin diagnóstico produce snack nombrando B15', () => {
    const result = resolveForeignHighlight({
      drugId: 'Ondansetrón',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set(),
      selectedDiagnoses: [],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.groupIds).toEqual([]);
    expect(result.criterionIds).toEqual([]);
    expect(result.snackMessage).toMatch(/B15/);
    expect(result.snackMessage).toMatch(/QTc|qtc|prolongado/i);
  });
});

describe('invariante: todo foreignRelevant tiene procedencia', () => {
  it('para todo fármaco foráneo de todo tab, foreignDrugCriterionIds no es vacío y la cascada produce resultado', () => {
    for (const cat of DRUG_CATEGORIES) {
      const buckets = computeMedGroupBuckets(
        cat.id,
        DRUG_CATEGORIES,
        relevance,
        'otros',
        MEDICATIONS,
      );
      for (const group of buckets.foreignRelevant) {
        for (const drugId of group.drugs) {
          const ids = foreignDrugCriterionIds({
            drugId,
            tabId: cat.id,
            relevance,
            medications: MEDICATIONS,
          });
          expect(ids.length)
            .withContext(`${drugId} en ${cat.id} sin criterio`)
            .toBeGreaterThan(0);

          const highlight = resolveForeignHighlight({
            drugId,
            tabId: cat.id,
            relevance,
            categories: DRUG_CATEGORIES,
            medications: MEDICATIONS,
            ownGroups: buckets.ownAll,
            applicableCriterionIds: new Set<string>(),
            selectedDiagnoses: [],
            selectedMedications: [],
            criteriaById,
            dxLabelsByCode,
          });
          const hasResult =
            highlight.groupIds.length > 0 ||
            highlight.criterionIds.length > 0 ||
            highlight.snackMessage !== null;
          expect(hasResult)
            .withContext(`${drugId} en ${cat.id} sin resaltado`)
            .toBe(true);
        }
      }
    }
  });
});

describe('alternativas de un `or` no son co-requisitos', () => {
  // START-H5 exige déficit de vitamina D Y (caídas | osteopenia | no sale de
  // casa). Osteopenia es ALTERNATIVA de «No sale de casa», no co-requisito:
  // marcarla no acerca el criterio a dispararse, así que no debe resaltarse.
  it('marcar «No sale de casa» no resalta «Osteopenia» (misma rama or)', () => {
    const labels = relatedOwnDxLabels({
      dxLabel: 'No sale de casa',
      tabId: 'reumatologico',
      relevance,
      ownGroups: [{ diagnoses: ['Osteopenia', 'Osteoporosis'] }],
    });
    expect(labels).not.toContain('Osteopenia');
  });

  it('marcar «No sale de casa» sí apunta al co-requisito real de START-H5', () => {
    const labels = relatedOwnDxLabels({
      dxLabel: 'No sale de casa',
      tabId: 'reumatologico',
      relevance,
      ownGroups: [{ diagnoses: ['Osteopenia', 'Déficit de vitamina D confirmado'] }],
    });
    expect(labels).toEqual(['Déficit de vitamina D confirmado']);
  });

  it('el aviso de «No sale de casa» nombra START-H5 y el déficit de vitamina D', () => {
    const result = resolveForeignDxHighlight({
      dxLabel: 'No sale de casa',
      tabId: 'reumatologico',
      relevance,
      ownGroups: [{ diagnoses: ['Osteopenia', 'Osteoporosis'] }],
      applicableCriterionIds: new Set<string>(),
      selectedMedications: [],
      selectedDiagnoses: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.dxLabels).toEqual([]);
    expect(result.snackMessage).toMatch(/H5/);
    expect(result.snackMessage).toMatch(/vitamina D/i);
    expect(result.snackMessage).not.toMatch(/Osteopenia/);
  });

  it('marcar amilorida no resalta el grupo de otro ahorrador de potasio alternativo', () => {
    const ids = relatedOwnGroupIds({
      drugId: 'Amilorida',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
    });
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).not.toContain('ahorradores_potasio');
  });
});

describe('cascada aditiva: resalta Y explica lo que falta', () => {
  it('prednisona sin diagnósticos resalta grupos Y avisa de lo que falta', () => {
    const result = resolveForeignHighlight({
      drugId: 'Prednisona',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set<string>(),
      selectedDiagnoses: [],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.groupIds.length).toBeGreaterThan(0);
    expect(result.snackMessage).not.toBeNull();
    expect(result.snackMessage).toMatch(/B19/);
  });

  it('si el criterio ya está disparado no muestra aviso', () => {
    const result = resolveForeignHighlight({
      drugId: 'Prednisona',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set(['STOPP-B19-CORTICOIDE-SISTEMICO-IC']),
      selectedDiagnoses: [],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.snackMessage).toBeNull();
    expect(result.criterionIds).toContain('STOPP-B19-CORTICOIDE-SISTEMICO-IC');
  });

  it('nombra las clases con etiqueta legible, no el código en mayúsculas', () => {
    const missing = missingRequirements({
      criterionId: 'STOPP-B19-CORTICOIDE-SISTEMICO-IC',
      relevance,
      selectedDiagnoses: [],
      selectedMedications: [],
      dxLabelsByCode,
      currentStep: 1,
      currentTabId: 'cardiovascular',
    });
    expect(missing).toContain('Diurét. de asa');
    expect(missing.join(' ')).not.toMatch(/[A-Z]{4,}_[A-Z]/);
  });

  it('colapsa las alternativas de un mismo or en una sola entrada', () => {
    const missing = missingRequirements({
      criterionId: 'STOPP-B19-CORTICOIDE-SISTEMICO-IC',
      relevance,
      selectedDiagnoses: [],
      selectedMedications: [],
      dxLabelsByCode,
    });
    // Las 5 variantes de insuficiencia cardíaca son alternativas entre sí.
    const icEntries = missing.filter(m => /insuficiencia card/i.test(m));
    expect(icEntries.length).toBe(1);
    expect(icEntries[0]).toMatch(/variantes/);
  });
});

describe('foreignLinksByOwnGroup', () => {
  it('agrupa los fármacos foráneos seleccionados que apuntan al mismo grupo propio', () => {
    const buckets = computeMedGroupBuckets(
      'cardiovascular', DRUG_CATEGORIES, relevance, 'otros', MEDICATIONS,
    );
    const links = foreignLinksByOwnGroup({
      selectedDrugIds: ['Prednisona', 'Ibuprofeno'],
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: buckets.ownAll,
      foreignGroups: buckets.foreignRelevant,
    });
    const loop = [...links.entries()].find(([, drugs]) => drugs.length === 2);
    expect(loop).toBeDefined();
    expect(loop?.[1]).toEqual(['Ibuprofeno', 'Prednisona']);
  });

  it('ignora fármacos seleccionados que no son foráneos en el tab', () => {
    const buckets = computeMedGroupBuckets(
      'cardiovascular', DRUG_CATEGORIES, relevance, 'otros', MEDICATIONS,
    );
    const links = foreignLinksByOwnGroup({
      selectedDrugIds: ['Furosemida'],
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: buckets.ownAll,
      foreignGroups: buckets.foreignRelevant,
    });
    expect(links.size).toBe(0);
  });
});

describe('aviso con varios criterios y ubicación del requisito', () => {
  it('lista todos los criterios implicados, uno por línea', () => {
    const result = resolveForeignDxHighlight({
      dxLabel: 'Prostatismo',
      tabId: 'neurologico',
      relevance,
      ownGroups: [],
      applicableCriterionIds: new Set<string>(),
      selectedMedications: [],
      selectedDiagnoses: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.snackMessage).toMatch(/STOPP D1/);
    expect(result.snackMessage).toMatch(/STOPP D4/);
    expect(result.snackMessage?.split('\n').length).toBeGreaterThan(2);
  });

  it('anota en qué paso y pestaña está el requisito que falta', () => {
    const result = resolveForeignDxHighlight({
      dxLabel: 'Hipercalcemia',
      tabId: 'cardiovascular',
      relevance,
      ownGroups: [],
      applicableCriterionIds: new Set<string>(),
      selectedMedications: [],
      selectedDiagnoses: [],
      criteriaById,
      dxLabelsByCode,
    });
    expect(result.snackMessage).toMatch(/paso 1 · Cardiovascular/);
  });

  it('no anota ubicación cuando el requisito está en el paso y pestaña actuales', () => {
    const result = resolveForeignHighlight({
      drugId: 'Prednisona',
      tabId: 'cardiovascular',
      relevance,
      categories: DRUG_CATEGORIES,
      medications: MEDICATIONS,
      ownGroups: ownGroupsOf('cardiovascular'),
      applicableCriterionIds: new Set<string>(),
      selectedDiagnoses: [],
      selectedMedications: [],
      criteriaById,
      dxLabelsByCode,
    });
    // «Diurét. de asa» vive en el propio tab cardiovascular del paso 1.
    expect(result.snackMessage).toMatch(/Diurét\. de asa(?! \()/);
    // La insuficiencia cardíaca es del paso 2, sí debe anotarse.
    expect(result.snackMessage).toMatch(/paso 2 ·/);
  });
});

describe('relatedSelectionLinks — enlaces que cruzan paso y pestaña', () => {
  it('un diagnóstico sin marcar muestra los medicamentos ya marcados que lo esperan', () => {
    const links = relatedSelectionLinks({
      relevance,
      selectedMedications: [
        { id: 'Ondansetrón', drugClasses: ['ANTIEMETICO', 'PROLONGADOR_QTC'] },
        { id: 'Litio', drugClasses: ['ESTABILIZADOR_ANIMO', 'PROLONGADOR_QTC'] },
      ],
      selectedDiagnoses: [],
      targets: [{ key: 'Intervalo QTc prolongado', dxCodes: ['intervalo_qtc_prolongado'] }],
    });
    expect(links.get('Intervalo QTc prolongado')).toEqual(['Litio', 'Ondansetrón']);
  });

  it('un grupo de medicación sin marcar muestra los diagnósticos ya marcados que lo esperan', () => {
    const links = relatedSelectionLinks({
      relevance,
      selectedMedications: [],
      selectedDiagnoses: ['Intervalo QTc prolongado'],
      targets: [{ key: 'prolongadores_qtc', drugClasses: ['PROLONGADOR_QTC'] }],
    });
    expect(links.get('prolongadores_qtc')).toEqual(['Intervalo QTc prolongado']);
  });

  it('no enlaza con una alternativa del mismo or', () => {
    // START-H5: osteopenia y «no sale de casa» son alternativas entre sí.
    const links = relatedSelectionLinks({
      relevance,
      selectedMedications: [],
      selectedDiagnoses: ['No sale de casa'],
      targets: [{ key: 'Osteopenia', dxCodes: ['osteopenia'] }],
    });
    expect(links.get('Osteopenia')).toBeUndefined();
  });

  it('no enlaza un elemento consigo mismo', () => {
    const links = relatedSelectionLinks({
      relevance,
      selectedMedications: [],
      selectedDiagnoses: ['Intervalo QTc prolongado'],
      targets: [{ key: 'Intervalo QTc prolongado', dxCodes: ['intervalo_qtc_prolongado'] }],
    });
    expect(links.get('Intervalo QTc prolongado')).toBeUndefined();
  });
});
