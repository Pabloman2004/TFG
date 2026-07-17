import { DRUG_CATEGORIES, resolveMedicationLabel } from './medications-taxonomy';
import { MEDICATIONS } from './medications';
import { extractReferences } from './system-relevance';
import { ALL_CRITERIA } from '../services/criteria-test-helpers';

describe('DRUG_CATEGORIES — cobertura del catálogo', () => {
  const groupedDrugs = new Set(
    DRUG_CATEGORIES.flatMap(cat => cat.groups.flatMap(g => g.drugs)),
  );

  it('el tab antibioticos se rotula Antiinfecciosos', () => {
    const tab = DRUG_CATEGORIES.find(cat => cat.id === 'antibioticos');
    expect(tab?.label).toBe('Antiinfecciosos');
  });

  it('ningún grupo declara additionalCategories', () => {
    const withExtra = DRUG_CATEGORIES.flatMap(cat =>
      cat.groups.filter(group => 'additionalCategories' in group),
    );
    expect(withExtra).toEqual([]);
  });

  it('Lidocaína parche es seleccionable en algún grupo (STOPP-L4 la requiere)', () => {
    expect(groupedDrugs.has('Lidocaína parche')).toBe(true);
  });

  it('todos los productos nootrópicos reportados son seleccionables para STOPP-D20', () => {
    const expected = [
      'Ginkgo biloba',
      'Piracetam',
      'Pramiracetam',
      'Fenilpiracetam',
      'Aniracetam',
      'Fosfatidilserina',
      'Modafinilo',
      'L-teanina',
      'Ácidos grasos omega-3',
      'Panax ginseng',
      'Rodiola',
      'Creatina',
    ];

    expect(
      expected.filter(id => !MEDICATIONS.some(medication => medication.id === id)),
    ).toEqual([]);
    expect(expected.filter(id => !groupedDrugs.has(id))).toEqual([]);
  });

  it('Acetato de megestrol es seleccionable para STOPP-F8', () => {
    expect(groupedDrugs.has('Acetato de megestrol')).toBe(true);
  });

  it('los análogos de vasopresina son seleccionables para STOPP-J10', () => {
    expect(groupedDrugs.has('Desmopresina')).toBe(true);
    expect(groupedDrugs.has('Vasopresina')).toBe(true);
  });

  it('todos los medicamentos de clases referenciadas son seleccionables', () => {
    const relevantClasses = new Set(
      ALL_CRITERIA.flatMap(criterion => [
        ...extractReferences(criterion.logic).classes,
        ...(criterion.relevance?.medicationClasses ?? []),
      ]),
    );
    const relevantMedicationIds = MEDICATIONS
      .filter(medication =>
        medication.drugClasses.some(drugClass => relevantClasses.has(drugClass))
      )
      .map(medication => medication.id);

    expect(
      relevantMedicationIds.filter(medicationId => !groupedDrugs.has(medicationId)),
    ).toEqual([]);
  });
});

describe('resolveMedicationLabel', () => {
  it('devuelve el id tal cual para un medicamento normal del catálogo', () => {
    expect(resolveMedicationLabel('Alendronato')).toBe('Alendronato');
  });

  it('devuelve el id tal cual para un medicamento custom añadido por texto', () => {
    expect(resolveMedicationLabel('Metformina')).toBe('Metformina');
  });

  it('resuelve otro__gabap al label legible del grupo', () => {
    expect(resolveMedicationLabel('otro__gabap')).toBe('Otro (Gabapentinoides)');
  });

  it('resuelve otro__bifosf al label legible del grupo', () => {
    expect(resolveMedicationLabel('otro__bifosf')).toBe('Otro (Bifosfonatos)');
  });

  it('resuelve otro__isrs al label legible del grupo', () => {
    expect(resolveMedicationLabel('otro__isrs')).toBe('Otro (ISRS)');
  });

  it('devuelve "Otro (sin especificar)" para un group ID desconocido', () => {
    expect(resolveMedicationLabel('otro__grupo_inexistente')).toBe('Otro (sin especificar)');
  });
});
