// @linked docs/flujo-pasos.md
// Si cambias LAB_SPECS o labCaptureFields, actualiza el doc enlazado.
// El panel de analítica es FIJO: ofrece siempre todos los campos que algún
// criterio puede leer, sin condicionarlos a la selección. Vive en la pestaña
// «Otros» del paso de diagnósticos. Este fichero solo aporta la presentación
// (etiqueta, paso, mínimo) y el valor actual de cada lab.

import { Labs } from './types';

export type LabKey = keyof Labs;

export type LabCaptureField = {
  readonly key: LabKey;
  readonly label: string;
  readonly value: number | null;
  readonly min: number;
  readonly step: number;
};

type LabSpec = {
  readonly label: string;
  readonly step: number;
};

export const LAB_SPECS: Readonly<Partial<Record<LabKey, LabSpec>>> = {
  egfr_ml_min_173: { label: 'TFGe (ml/min/1,73 m²)', step: 0.1 },
  pas_mmhg: { label: 'Presión arterial sistólica (mmHg)', step: 1 },
  pad_mmhg: { label: 'Presión arterial diastólica (mmHg)', step: 1 },
  fc_lpm: { label: 'Frecuencia cardíaca (lpm)', step: 1 },
  qtc_ms: { label: 'Intervalo QTc (ms)', step: 1 },
  potasio_mmol_l: { label: 'Potasio (mmol/l)', step: 0.1 },
  sodio_mmol_l: { label: 'Sodio (mmol/l)', step: 1 },
  calcio_corregido_mmol_l: { label: 'Calcio corregido (mmol/l)', step: 0.01 },
  tsh_uUl: { label: 'TSH (µU/ml)', step: 0.1 },
};

const LAB_ORDER: readonly LabKey[] = Object.keys(LAB_SPECS) as readonly LabKey[];

export function labCaptureFields(labs: Labs | null): readonly LabCaptureField[] {
  return LAB_ORDER.map(key => {
    const spec = LAB_SPECS[key]!;
    return {
      key,
      label: spec.label,
      value: labs?.[key] ?? null,
      min: 0,
      step: spec.step,
    };
  });
}
