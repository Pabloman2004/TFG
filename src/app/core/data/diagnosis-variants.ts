// @linked docs/propuesta-p15.md
// P15 — Familias de diagnósticos con variantes mutuamente excluyentes (radio-behavior).
// Regla de oro (D15.6): NO se renombran códigos internos; esto es metadato declarativo
// que se apoya sobre el modelo plano existente (DIAGNOSIS_MAP). El motor no cambia.

import { DIAGNOSIS_MAP, normalizeDiagnosis } from './diagnoses';

export interface DiagnosisVariantFamily {
  /** Identificador estable de la familia (no es un código de diagnóstico). */
  id: string;
  /** Label de la raíz, encabezado del árbol. */
  rootLabel: string;
  /** ¿La raíz genérica ("sin especificar") es a su vez seleccionable como una opción del radio? */
  rootSelectable: boolean;
  /** Labels hijos, en orden de presentación clínica (no alfabético). */
  variants: string[];
}

// Solo la familia HTA en esta iteración (D15.1/D15.2): raíz seleccionable como
// "HTA (sin especificar)". El resto de candidatas de §2.1 de la propuesta quedan
// documentadas abajo PENDIENTES DE VALIDACIÓN CLÍNICA (Raquel) — no activar sin confirmar.
export const DIAGNOSIS_VARIANT_FAMILIES: DiagnosisVariantFamily[] = [
  {
    id: 'hta',
    rootLabel: 'HTA',
    rootSelectable: true,
    variants: ['HTA no complicada', 'HTA moderada', 'HTA grave'],
  },

  // ── Familias §2.1 PENDIENTES VALIDACIÓN CLÍNICA (Raquel) — no descomentar sin confirmar ──
  // EPOC (Respiratorio): rootLabel 'EPOC', rootSelectable?, variants ['EPOC GOLD 1-2','EPOC GOLD 3-4','EPOC grave']
  //   ⚠️ 'EPOC grave' solapa con 'EPOC GOLD 3-4' (ver §2.3): validar eje único antes de activar.
  // Dolor (Sintomático): sin raíz genérica, variants ['Dolor leve','Dolor leve-moderado','Dolor moderado-grave']
  //   ⚠️ 'Dolor neuropático' es OTRO tipo, NO entra en la escala de intensidad.
  // Bloqueo AV (Cardiovascular): sin raíz genérica, variants ['Bloqueo AV de segundo grado','Bloqueo AV completo']
  //   ⚠️ 'Bradicardia' comparte subgrupo pero es un dx distinto, NO entra.
  // Osteopenia/Osteoporosis (Reumatológico): variants ['Osteopenia','Osteoporosis'] (continuo de densidad ósea)
  //   ⚠️ 'Fractura por fragilidad' es un EVENTO, NO una variante de gravedad.
];

/** Miembros del grupo radio de una familia: la raíz (si es seleccionable) seguida de las variantes. */
export const familyMemberLabels = (family: DiagnosisVariantFamily): string[] =>
  family.rootSelectable ? [family.rootLabel, ...family.variants] : [...family.variants];

// Índice derivado, consulta O(1) en la UI: código interno de un miembro → códigos
// hermanos (mismo family) que hay que desmarcar al elegirlo. Indexado por CÓDIGO
// (lo que guarda el store), no por label, para que la exclusividad opere en el
// mismo espacio que persiste y exporta el caso.
export const MUTEX_SIBLINGS: Record<string, string[]> = Object.fromEntries(
  DIAGNOSIS_VARIANT_FAMILIES.flatMap(family => {
    const members = familyMemberLabels(family);
    return members.map(label => {
      const code = normalizeDiagnosis(label);
      const siblings = members
        .filter(other => other !== label)
        .map(other => normalizeDiagnosis(other));
      return [code, siblings] as const;
    });
  }),
);

// Guard de integridad en tiempo de carga: todo label declarado debe existir en el
// catálogo plano, o la familia está mal escrita (typo) y la exclusividad sería inerte.
for (const family of DIAGNOSIS_VARIANT_FAMILIES) {
  for (const label of familyMemberLabels(family)) {
    if (DIAGNOSIS_MAP[label] === undefined) {
      throw new Error(
        `DIAGNOSIS_VARIANT_FAMILIES: label "${label}" (familia "${family.id}") no existe en DIAGNOSIS_MAP`,
      );
    }
  }
}
