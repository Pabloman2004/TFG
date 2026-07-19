// @linked docs/informes-y-exportacion.md
// Si cambias el schema CaseExport o las versiones soportadas, actualiza el doc enlazado.
import { z } from 'zod';

export const EXPORT_VERSION = '1.0' as const;

const nullableNumber = z.number().nullable();

const patientInfoSchema = z.object({
  name: z.string().nullable(),
  age: z.number().nullable(),
  sex: z.enum(['F', 'M']).nullable(),
  mrn: z.string().nullable().optional(),
  weightKg: z.number().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const medSchema = z.object({
  id: z.string(),
  drugClasses: z.array(z.string()),
  doseMcgDay: z.number().optional(),
  doseMgDay: z.number().optional(),
  durationDays: z.number().optional(),
});

const labsSchema = z.object({
  glucosa_mg_dl: nullableNumber,
  colesterol_total_mg_dl: nullableNumber,
  trigliceridos_mg_dl: nullableNumber,
  hdl_mg_dl: nullableNumber,
  ldl_mg_dl: nullableNumber,
  creatinina_mg_dl: nullableNumber,
  egfr_ml_min_173: nullableNumber,
  inr: nullableNumber,
  tsh_uUl: nullableNumber,
  fc_lpm: nullableNumber,
  qtc_ms: nullableNumber,
  potasio_mmol_l: nullableNumber,
  sodio_mmol_l: nullableNumber,
  calcio_corregido_mmol_l: nullableNumber,
  pas_mmhg: nullableNumber,
  pad_mmhg: nullableNumber,
});

const patientCaseSchema = z.object({
  info: patientInfoSchema.nullable(),
  diagnoses: z.array(z.string()),
  medications: z.array(medSchema),
  labs: labsSchema.nullable(),
  reviewedMedTabs: z.array(z.string()).optional(),
  reviewedDxTabs: z.array(z.string()).optional(),
});

export const caseExportSchema = z.object({
  version: z.literal(EXPORT_VERSION),
  exportedAt: z.string().optional(),
  patientCase: patientCaseSchema,
});

export type CaseExportParsed = z.infer<typeof caseExportSchema>;
