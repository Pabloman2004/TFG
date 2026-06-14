// PENDIENTE confirmación clínica (Raquel) — no es criterio derivable.
// Diagnósticos-ancla: comorbilidades o antecedentes que el médico debe poder
// marcar siempre, con o sin medicación en el caso (no son flags “solo si hay fármaco STOPP”).

export type DxAnchorCandidate = {
  readonly label: string;
  readonly rationale: string;
  readonly doubtful?: true;
};

export const DX_ANCHOR_LABELS_CANDIDATE: readonly DxAnchorCandidate[] = [
  // ── Cardiovascular (piloto START / historia vascular) ──
  { label: 'HTA', rationale: 'Comorbilidad crónica; dispara START y debe documentarse antes de medicación.' },
  { label: 'Insuficiencia cardíaca', rationale: 'Diagnóstico crónico genérico; dispara START-B8 y convive con variantes.' },
  { label: 'FA', rationale: 'Comorbilidad arritmica crónica; dispara START y anticoagulación.' },
  {
    label: 'Enfermedad vascular coronaria',
    rationale: 'Antecedente vascular establecido; dispara START-B2/C2.',
  },
  {
    label: 'Enfermedad vascular cerebral',
    rationale: 'Antecedente vascular establecido; dispara START-B2/C2.',
  },
  {
    label: 'Enfermedad vascular periférica',
    rationale: 'Antecedente vascular establecido; dispara START-B2/C2.',
  },

  // ── Neurológico / psiquiátrico ──
  { label: 'Ictus previo', rationale: 'Evento vascular cerebral previo; antecedente permanente del caso.' },
  { label: 'Demencia', rationale: 'Síndrome neurodegenerativo crónico; condición basal del paciente.' },
  {
    label: 'Demencia por cuerpos de Lewy',
    rationale: 'Subtipo de demencia crónica; antecedente clínico estable.',
    doubtful: true,
  },
  { label: 'Deterioro cognitivo', rationale: 'Condición cognitiva crónica, frecuentemente pre-demencia.' },
  {
    label: 'Delirio',
    rationale: 'Episodio agudo; puede ser transitorio — dudoso como ancla permanente.',
    doubtful: true,
  },
  { label: 'Epilepsia', rationale: 'Enfermedad crónica del SNC; no depende de fármaco concreto para existir.' },
  { label: 'Parkinsonismo', rationale: 'Síndrome clínico persistente (Parkinson u otro origen).' },
  {
    label: 'Parkinsonismo inducido por fármacos',
    rationale: 'Puede ser transitorio tras retirada del fármaco causal.',
    doubtful: true,
  },
  {
    label: 'Síntomas conductuales de la demencia',
    rationale: 'Manifestación clínica de demencia ya presente; no requiere medicación previa.',
    doubtful: true,
  },
  {
    label: 'Temblor esencial benigno',
    rationale: 'Trastorno crónico del movimiento; antecedente clínico estable.',
  },
  { label: 'Episodio depresivo', rationale: 'Diagnóstico psiquiátrico del episodio actual/historia reciente.' },
  {
    label: 'Insomnio',
    rationale: 'Síntoma crónico frecuente; el médico puede querer marcarlo sin meds previas.',
    doubtful: true,
  },
  { label: 'Psicosis', rationale: 'Diagnóstico psiquiátrico basal del caso.' },

  // ── Geriátrico ──
  { label: 'Fragilidad', rationale: 'Síndrome geriátrico crónico; condición del paciente anciano.' },
  {
    label: 'Caídas de repetición',
    rationale: 'Antecedente de riesgo funcional; historia clínica, no flag farmacológico.',
  },

  // ── Hematológico / trombosis ──
  {
    label: 'TVP primer episodio sin factores persistentes',
    rationale: 'Antecedente trombótico; historia clínica relevante para anticoagulación.',
  },
  {
    label: 'TEP primer episodio sin factores persistentes',
    rationale: 'Antecedente trombótico; historia clínica relevante para anticoagulación.',
  },
  {
    label: 'Antecedentes de sangrado grave',
    rationale: 'Historia hemorrágica que condiciona decisiones terapéuticas.',
  },
  {
    label: 'Diátesis hemorrágica',
    rationale: 'Trastorno hemorrágico de base; comorbilidad permanente.',
  },
  {
    label: 'Riesgo significativo de sangrado',
    rationale: 'Perfil de riesgo clínico global; puede documentarse sin medicación previa.',
    doubtful: true,
  },
  {
    label: 'Antecedentes de tromboembolismo venoso',
    rationale: 'Antecedente trombótico remoto; historia clínica.',
  },

  // ── Reumatológico / metabólico ──
  {
    label: 'Antecedentes de gota',
    rationale: 'Antecedente metabólico-articular; historia, no brote agudo.',
  },
  {
    label: 'Gota recurrente',
    rationale: 'Patrón crónico de brotes; comorbilidad de fondo.',
  },
  {
    label: 'Artritis reumatoide',
    rationale: 'Enfermedad inflamatoria crónica.',
  },
  {
    label: 'Artritis reumatoide activa incapacitante',
    rationale: 'Variante de actividad de AR; condición del paciente.',
    doubtful: true,
  },
  { label: 'Artrosis', rationale: 'Enfermedad degenerativa crónica.' },
  {
    label: 'Gota activa',
    rationale: 'Brote agudo; puede ser episodio autolimitado.',
    doubtful: true,
  },

  // ── Gastrointestinal / urológico / otros ──
  {
    label: 'Antecedentes de úlcera péptica',
    rationale: 'Antecedente digestivo permanente para riesgo AINE/antiagregación.',
  },
  {
    label: 'Antecedentes de hemorragia HC',
    rationale: 'Antecedente hemorrágico digestivo previo.',
  },
  {
    label: 'Antecedentes de EVAG',
    rationale: 'Antecedente de sangrado digestivo alto.',
  },
  { label: 'Estreñimiento crónico', rationale: 'Condición crónica gastrointestinal.' },
  { label: 'Disfagia', rationale: 'Síntoma crónico con implicaciones terapéuticas.' },
  {
    label: 'Incontinencia urinaria',
    rationale: 'Condición crónica urológica; puede documentarse sin diurético previo.',
    doubtful: true,
  },
  { label: 'Prostatismo', rationale: 'Síndrome prostático crónico.' },
  { label: 'Retención urinaria', rationale: 'Condición urológica clínica.' },
  {
    label: 'Hiperplasia benigna de próstata',
    rationale: 'Diagnóstico urológico crónico estructural.',
  },
  {
    label: 'Bacteriuria asintomática',
    rationale: 'Hallazgo microbiológico; dudoso si debe ser ancla clínica sin contexto.',
    doubtful: true,
  },

  // ── Respiratorio ──
  { label: 'EPOC', rationale: 'Enfermedad respiratoria crónica de base.' },
  {
    label: 'EPOC grave',
    rationale: 'Gravedad de EPOC; variante clínica del mismo eje (validar vs GOLD).',
    doubtful: true,
  },
  {
    label: 'Insuficiencia respiratoria',
    rationale: 'Condición respiratoria crónica/grave del paciente.',
  },

  // ── Metabólico-endocrino (analítica como dx) ──
  {
    label: 'Hiperpotasemia',
    rationale: 'Alteración analítica; puede ser aguda — dudoso como ancla permanente.',
    doubtful: true,
  },
  {
    label: 'Hiponatremia',
    rationale: 'Alteración hidroelectrolítica; a menudo episódica.',
    doubtful: true,
  },
  {
    label: 'Hiponatremia significativa (Na+ < 130 mmol/L)',
    rationale: 'Criterio analítico agudo; dudoso como ancla de historia.',
    doubtful: true,
  },
  {
    label: 'Hipopotasemia',
    rationale: 'Alteración analítica potencialmente aguda.',
    doubtful: true,
  },
  {
    label: 'Hipercalcemia',
    rationale: 'Alteración analítica; puede ser aguda o crónica.',
    doubtful: true,
  },
  {
    label: 'Malnutrición',
    rationale: 'Estado nutricional crónico del paciente.',
  },
  {
    label: 'Diabetes con episodios frecuentes de hipoglucemia',
    rationale: 'Comorbilidad diabética con patrón clínico.',
  },
  {
    label: 'Hipotiroidismo subclínico',
    rationale: 'Condición endocrina crónica de laboratorio.',
    doubtful: true,
  },

  // ── Otros ──
  { label: 'Osteoporosis', rationale: 'Enfermedad ósea crónica (si aparece gateada en deps).' },
  { label: 'Prurito', rationale: 'Síntoma dermatológico persistente.', doubtful: true },
  { label: 'Alergia', rationale: 'Antecedente alérgico del paciente.' },
  {
    label: 'Antecedentes de cáncer de mama o útero',
    rationale: 'Antecedente oncológico/hormonal permanente.',
  },
  {
    label: 'Hepatopatía crónica',
    rationale: 'Enfermedad hepática de base.',
  },
  {
    label: 'Edemas maleolares',
    rationale: 'Signo clínico; puede ser agudo — dudoso como ancla.',
    doubtful: true,
  },
  {
    label: 'Riesgo de caídas de repetición',
    rationale: 'Perfil de riesgo geriátrico; solapa con caídas de repetición.',
    doubtful: true,
  },
  {
    label: 'Dolor leve',
    rationale: 'Síntoma actual; el médico puede querer marcarlo antes de analgesia.',
    doubtful: true,
  },
  {
    label: 'Dolor leve-moderado',
    rationale: 'Síntoma actual escalado; dudoso como ancla permanente.',
    doubtful: true,
  },
  {
    label: 'Dolor moderado-grave',
    rationale: 'Síntoma actual escalado; dudoso como ancla permanente.',
    doubtful: true,
  },
];

export const ANCHOR_LABELS_APPLIED_FOR_GATING: ReadonlySet<string> = new Set(
  DX_ANCHOR_LABELS_CANDIDATE.filter(entry => !entry.doubtful).map(entry => entry.label),
);

/** @deprecated Usar ANCHOR_LABELS_APPLIED_FOR_GATING; alias del piloto CV. */
export const ALWAYS_ENABLED_LABELS: ReadonlySet<string> = ANCHOR_LABELS_APPLIED_FOR_GATING;
