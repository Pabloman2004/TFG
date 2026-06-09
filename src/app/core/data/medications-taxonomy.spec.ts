import { resolveMedicationLabel } from './medications-taxonomy';

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
