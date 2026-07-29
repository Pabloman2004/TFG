// @linked docs/caso-clinico.md
// Si cambias tipos de dominio (PatientInfo, Med, Labs, Crit, PatientCase, CaseExport), actualiza el doc enlazado.

export type Sex = 'F' | 'M';

export type JsonLogicRule = Record<string, unknown>;

export interface PatientInfo {
  name: string | null;
  age: number | null;
  sex: Sex | null;
  mrn?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  notes?: string | null;
}

/** Medicación normalizada */
export interface Med {
  id: string;            // "Ibuprofeno"
  drugClasses: string[]; // ["AINE"]
  doseMcgDay?: number;   // Dosis diaria en microgramos (ej: 125 para Digoxina)
  doseMgDay?: number;    // Dosis diaria en miligramos
  durationDays?: number; // Duración del tratamiento en días (ej: 90+)
}

export interface Crit {
  id: string;
  type: 'STOPP' | 'START';
  system: string;
  summary: string;
  logic?: JsonLogicRule; // opcional (para pruebas o mocks)
  relevance?: {
    medicationClasses?: string[];
  };
  excludes?: {           // 🆕 Qué medicaciones descartar cuando se cumple este criterio
    medications?: string[];   // Medicaciones específicas: ["Digoxina"]
    drugClasses?: string[];   // O clases enteras: ["DIGOXINA"]
  };
}

// Solo los valores que algún criterio lee. Glucosa, colesterol total,
// triglicéridos, HDL, LDL, creatinina e INR se retiraron: no alimentaban ningún
// criterio ni se pedían en el panel de analítica. Los casos antiguos que los
// llevan siguen importándose (el schema descarta las claves sobrantes).
export interface Labs {
  egfr_ml_min_173: number | null;
  tsh_uUl: number | null;
  fc_lpm: number | null;         // Frecuencia cardíaca (latidos por minuto)
  qtc_ms: number | null;          // Intervalo QTc corregido (milisegundos)

  // Electrolitos (para STOPP-B9 diuréticos tiazídicos)
  potasio_mmol_l: number | null;  // Potasio sérico (mmol/L)
  sodio_mmol_l: number | null;    // Sodio sérico (mmol/L)
  calcio_corregido_mmol_l: number | null;  // Calcio sérico corregido (mmol/L)

  // Presión arterial (para STOPP-B14 PDE5 inhibitors y START-B1)
  pas_mmhg: number | null;        // Presión Arterial Sistólica (mmHg)
  pad_mmhg: number | null;        // Presión Arterial Diastólica (mmHg)
}

/** Objeto completo evaluable por el motor */
export interface PatientCase {
  info: PatientInfo | null;
  diagnoses: string[];
  medications: Med[];
  labs: Labs | null;
  reviewedMedTabs?: string[];
  reviewedDxTabs?: string[];
}

export type CaseExport = {
  version: string;
  exportedAt: string;
  patientCase: PatientCase;
};
