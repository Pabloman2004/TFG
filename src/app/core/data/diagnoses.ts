// src/app/core/data/diagnoses.ts

// 🔹 Grupo de cada diagnóstico
export const DIAGNOSIS_GROUPS: Record<string, string> = {

  // --- criterio B1 ---
  "Insuficiencia cardíaca con función sistólica conservada": "Cardiovascular",

  // --- criterio B2 ---
  "Insuficiencia cardíaca NYHA III-IV": "Cardiovascular",

  // --- criterio B4 ---
  "Bradicardia": "Cardiovascular",
  "Bloqueo AV de segundo grado": "Cardiovascular",
  "Bloqueo AV completo": "Cardiovascular",

  // --- criterio B5 ---
  "Angina de pecho": "Cardiovascular",
  "Aneurisma aórtico": "Cardiovascular",
  "HTA": "Cardiovascular",

  // --- criterio B10 ---
  "Incontinencia urinaria": "Urológico",

  // --- criterio B16 ---
  "Fragilidad": "Geriátrico",
  "Enfermedad cardiovascular establecida": "Cardiovascular",

  // --- criterio B20 / I5 ---
  "Estenosis aórtica grave sintomática": "Cardiovascular",
  "Hipotensión ortostática": "Cardiovascular",
  "Síncopes recurrentes": "Cardiovascular",

  // --- criterio B21 ---
  "Fibrilación auricular": "Cardiovascular",

  // --- criterio C3 ---
  "Ictus previo": "Neurológico",

  // --- criterio C8 / C9 ---
  "TVP primer episodio sin factores persistentes": "Hematológico",
  "TEP primer episodio sin factores persistentes": "Hematológico",

  // --- criterio C11 ---
  "Prótesis valvular metálica": "Cardiovascular",
  "Estenosis mitral moderada-grave": "Cardiovascular",

  // --- criterio F3 ---
  "Estreñimiento crónico": "Gastrointestinal",

  // --- criterio G1 / G2 / G3 / G4 ---
  "EPOC": "Respiratorio",
  "EPOC grave": "Respiratorio",
  "Insuficiencia respiratoria": "Respiratorio",

  // --- Antidepresivos Tricíclicos ---
  "Demencia": "Neurológico",
  "Deterioro cognitivo": "Neurológico",
  "Delirio": "Neurológico",
  "Glaucoma de ángulo estrecho": "Oftalmológico",
  "Trastornos de conducción cardíaca": "Cardiovascular",
  "Prostatismo": "Urológico",
  "Retención urinaria": "Urológico",
  "Caídas de repetición": "Geriátrico",
  "Episodio depresivo": "Psiquiátrico",

  // --- Neurolépticos/Antipsicóticos ---
  "Parkinsonismo": "Neurológico",
  "Parkinsonismo inducido por fármacos": "Neurológico",
  "Demencia por cuerpos de Lewy": "Neurológico",
  "Disfagia": "Gastrointestinal",
  "Síntomas conductuales de la demencia": "Neurológico",
  "Enfermedad vascular coronaria": "Cardiovascular",
  "Enfermedad vascular cerebral": "Cardiovascular",
  "Enfermedad vascular periférica": "Cardiovascular",
  "Psicosis": "Psiquiátrico",
  "Insomnio": "Psiquiátrico",

  // --- AINEs ---
  "Insuficiencia cardíaca": "Cardiovascular",
  "Hipertensión grave": "Cardiovascular",
  "Hipertensión moderada": "Cardiovascular",
  "Antecedentes de úlcera péptica": "Gastrointestinal",
  "Antecedentes de hemorragia HC": "Gastrointestinal",
  "Gota activa": "Reumatológico",
  "Dolor leve": "Sintomático",
  "Dolor leve-moderado": "Sintomático",
  "Dolor moderado-grave": "Sintomático",
  "Dolor neuropático": "Neurológico",
  "Artritis": "Reumatológico",
  "Artritis reumatoide": "Reumatológico",
  "Artrosis": "Reumatológico",

  // --- Betabloqueantes ---
  "Hipertensión arterial no complicada": "Cardiovascular",
  "Diabetes con episodios frecuentes de hipoglucemia": "Endocrino",

  // --- Amiodarona ---
  "Taquiarritmias supraventriculares": "Cardiovascular",

  // --- Diuréticos de Asa ---
  "Edemas maleolares": "Síntoma",
  "Hipopotasemia": "Metabólico",

  // --- Diuréticos Tiazídicos ---
  "Hiponatremia": "Metabólico",
  "Hipercalcemia": "Metabólico",

  // --- Antihipertensivos de acción central ---
  "Riesgo de caídas de repetición": "Síntoma",
  "Intolerancia/fallo a otros antihipertensivos": "Cardiovascular",

  // --- IECA y ARA-II ---
  "Hiperpotasemia": "Metabólico",
  "Enfermedad vascular estable": "Cardiovascular",
  "Enfermedad vascular estable sin indicación clara": "Cardiovascular",

  // --- Antagonistas de aldosterona ---
  "Enfermedad renal grave": "Renal",

  // --- Inhibidores Factor Xa ---
  "Insuficiencia renal terminal (TFGe < 15 ml/min)": "Renal",

  // --- Inhibidores PDE5 ---
  "Insuficiencia cardíaca grave con hipotensión (PAS < 90 mmHg)": "Cardiovascular",

  // --- Prolongadores QTc ---
  "Intervalo QTc prolongado": "Cardiovascular",

  // --- Antidepresivos ISRS ---
  "Hiponatremia significativa (Na+ < 130 mmol/L)": "Metabólico",

  // --- Antidepresivos Tricíclicos (ATCs) ---
  "Prostatismo / Retención urinaria": "Urológico",

  // --- Ácido acetilsalicílico / Antagonistas Vitamina K ---
  "Antecedentes de EVAG": "Gastrointestinal",
  "Riesgo significativo de sangrado": "Hematológico",
  "Antecedentes de sangrado grave": "Hematológico",
  "Diátesis hemorrágica": "Hematológico",

  // --- Estrógenos ---
  "Antecedentes de cáncer de mama o útero": "Oncológico",
  "Antecedentes de tromboembolismo venoso": "Hematológico",
  "Antecedentes de enfermedad coronaria o vascular": "Cardiovascular",
  "Útero intacto sin progestágenos": "Ginecológico",

  // --- Sistema nervioso central (D) ---
  "Epilepsia": "Neurológico",
  "Temblor esencial benigno": "Neurológico",
  "Alergia": "Inmunológico",
  "Prurito": "Dermatológico",

  // --- Sistema urogenital (I) ---
  "Hiperplasia benigna de próstata": "Urológico",
  "Incontinencia urinaria de urgencia": "Urológico",
  "Bacteriuria asintomática": "Infeccioso",
  "Obstrucción del tracto urinario inferior": "Urológico",
  "Poliaquiuria": "Urológico",

  // --- Sistema endocrino (J) ---
  "Hipotensión sintomática": "Cardiovascular",
  "Hipotiroidismo subclínico": "Endocrino",

  // --- Sistema musculoesquelético (H) ---
  "Hepatopatía crónica": "Hepático",
  "Malnutrición": "Metabólico",

  // --- START criterios cardiovascular ---
  "Cardiopatía isquémica": "Cardiovascular",
  "Insuficiencia cardíaca con FE reducida": "Cardiovascular",
  "Fibrilación auricular paroxística": "Cardiovascular",
  "FA con mal control de frecuencia cardíaca": "Cardiovascular",
  "Déficit de hierro": "Hematológico",

  // --- START criterios neurológico/psiquiátrico ---
  "Enfermedad de Parkinson": "Neurológico",
  "Depresión mayor": "Psiquiátrico",
  "Enfermedad de Alzheimer leve-moderada": "Neurológico",
  "Ansiedad grave persistente": "Psiquiátrico",
  "Síndrome de piernas inquietas": "Neurológico",

  // --- START criterios renal ---
  "Proteinuria / microalbuminuria": "Renal",
  "Hiperparatiroidismo secundario": "Endocrino",
  "Anemia sintomática": "Hematológico",
  "Hiperfosfatemia": "Metabólico",

  // --- START criterios gastrointestinal ---
  "ERGE grave o estenosis esofágica péptica": "Gastrointestinal",
  "Esofagitis por reflujo": "Gastrointestinal",
  "Diverticulosis": "Gastrointestinal",
  "Úlcera péptica activa por H. pylori": "Gastrointestinal",

  // --- START criterios respiratorio ---
  "Asma crónica": "Respiratorio",
  "Asma moderada-grave": "Respiratorio",
  "EPOC estadio GOLD 1-2": "Respiratorio",
  "EPOC estadio GOLD 3-4": "Respiratorio",

  // --- START criterios musculoesquelético ---
  "Artritis reumatoide activa incapacitante": "Reumatológico",
  "Osteoporosis": "Reumatológico",
  "Fractura por fragilidad": "Reumatológico",
  "Osteopenia": "Reumatológico",
  "Gota recurrente": "Reumatológico",
  "Déficit de vitamina D confirmado": "Metabólico",

  // --- START criterios genitourinario ---
  "Vaginitis atrófica sintomática": "Ginecológico",
  "Infecciones urinarias recurrentes": "Urológico",
  "Disfunción eréctil": "Urológico",

  // --- START criterios endocrino ---
  "Diabetes mellitus": "Endocrino",

  // --- START criterios analgésicos ---
  "Neuralgia postherpética": "Neurológico",

};

// 🔹 Mapeo a claves internas (para usar en criterios/json-logic)
export const DIAGNOSIS_MAP: Record<string, string> = {

  // --- criterio B1 ---
  "Insuficiencia cardíaca con función sistólica conservada": "ic_funcion_sistolica_conservada",

  // --- criterio B2 ---
  "Insuficiencia cardíaca NYHA III-IV": "ic_nyha_3_4",

  // --- criterio B4
  "Bradicardia": "bradicardia",
  "Bloqueo AV de segundo grado": "bloqueo_av_grado_2",
  "Bloqueo AV completo": "bloqueo_av_completo",

  // --- criterio B5 ---
  "Angina de pecho": "angina",
  "Aneurisma aórtico": "aneurisma_aortico",
  "HTA": "hta",

  // --- criterio B10 ---
  "Incontinencia urinaria": "incontinencia_urinaria",

  // --- criterio B16 ---
  "Fragilidad": "fragilidad",
  "Enfermedad cardiovascular establecida": "enfermedad_cardiovascular",

  // --- criterio B20 / I5 ---
  "Estenosis aórtica grave sintomática": "estenosis_aortica_grave_sintomatica",
  "Hipotensión ortostática": "hipotension_ortostatica",
  "Síncopes recurrentes": "sincopes_recurrentes",

  // --- criterio B21 ---
  "Fibrilación auricular": "fibrilacion_auricular",

  // --- criterio C3 ---
  "Ictus previo": "ictus_previo",

  // --- criterio C8 / C9 ---
  "TVP primer episodio sin factores persistentes": "tvp_primer_episodio_sin_factores_persistentes",
  "TEP primer episodio sin factores persistentes": "tep_primer_episodio_sin_factores_persistentes",

  // --- criterio C11 ---
  "Prótesis valvular metálica": "protesis_valvular_metalica",
  "Estenosis mitral moderada-grave": "estenosis_mitral_moderada_grave",

  // --- criterio F3 ---
  "Estreñimiento crónico": "estrenimiento_cronico",

  // --- criterio G1 / G2 / G3 / G4 ---
  "EPOC": "epoc",
  "EPOC grave": "epoc_grave",
  "Insuficiencia respiratoria": "insuficiencia_respiratoria",

  // --- Antidepresivos Tricíclicos ---
  "Demencia": "demencia",
  "Deterioro cognitivo": "deterioro_cognitivo",
  "Delirio": "delirio",
  "Glaucoma de ángulo estrecho": "glaucoma_angulo_estrecho",
  "Trastornos de conducción cardíaca": "trastornos_conduccion_cardiaca",
  "Prostatismo": "prostatismo",
  "Retención urinaria": "retencion_urinaria",
  "Caídas de repetición": "caidas_repeticion",
  "Episodio depresivo": "episodio_depresivo",

  // --- Neurolépticos/Antipsicóticos ---
  "Parkinsonismo": "parkinsonismo",
  "Parkinsonismo inducido por fármacos": "parkinsonismo_inducido_por_farmacos",
  "Demencia por cuerpos de Lewy": "demencia_cuerpos_lewy",
  "Disfagia": "disfagia",
  "Síntomas conductuales de la demencia": "sintomas_conductuales_demencia",
  "Enfermedad vascular coronaria": "enfermedad_vascular_coronaria",
  "Enfermedad vascular cerebral": "enfermedad_vascular_cerebral",
  "Enfermedad vascular periférica": "enfermedad_vascular_periferica",
  "Psicosis": "psicosis",
  "Insomnio": "insomnio",

  // --- AINEs ---
  "Insuficiencia cardíaca": "insuficiencia_cardiaca",
  "Hipertensión grave": "hipertension_grave",
  "Hipertensión moderada": "hipertension_moderada",
  "Antecedentes de úlcera péptica": "antecedentes_ulcera_peptica",
  "Antecedentes de hemorragia HC": "antecedentes_hemorragia_hc",
  "Gota activa": "gota_activa",
  "Dolor leve": "dolor_leve",
  "Dolor leve-moderado": "dolor_leve_moderado",
  "Dolor moderado-grave": "dolor_moderado_grave",
  "Dolor neuropático": "dolor_neuropatico",
  "Artritis": "artritis",
  "Artritis reumatoide": "artritis_reumatoide",
  "Artrosis": "artrosis",

  // --- Betabloqueantes ---
  "Hipertensión arterial no complicada": "hta_no_complicada",
  "Diabetes con episodios frecuentes de hipoglucemia": "diabetes_hipoglucemias_frecuentes",

  // --- Amiodarona ---
  "Taquiarritmias supraventriculares": "taquiarritmias_supraventriculares",

  // --- Diuréticos de Asa ---
  "Edemas maleolares": "edemas_maleolares",
  "Hipopotasemia": "hipopotasemia",

  // --- Diuréticos Tiazídicos ---
  "Hiponatremia": "hiponatremia",
  "Hipercalcemia": "hipercalcemia",

  // --- Antihipertensivos de acción central ---
  "Riesgo de caídas de repetición": "riesgo_caidas_repeticion",
  "Intolerancia/fallo a otros antihipertensivos": "intolerancia_otros_antihipertensivos",

  // --- IECA y ARA-II ---
  "Hiperpotasemia": "hiperpotasemia",
  "Enfermedad vascular estable": "enfermedad_vascular_estable",
  "Enfermedad vascular estable sin indicación clara": "enfermedad_vascular_estable_sin_indicacion",

  // --- Antagonistas de aldosterona ---
  "Enfermedad renal grave": "enfermedad_renal_grave",

  // --- Inhibidores Factor Xa ---
  "Insuficiencia renal terminal (TFGe < 15 ml/min)": "insuficiencia_renal_terminal",

  // --- Inhibidores PDE5 ---
  "Insuficiencia cardíaca grave con hipotensión (PAS < 90 mmHg)": "insuficiencia_cardiaca_grave_hipotension",

  // --- Prolongadores QTc ---
  "Intervalo QTc prolongado": "intervalo_qtc_prolongado",

  // --- Antidepresivos ISRS ---
  "Hiponatremia significativa (Na+ < 130 mmol/L)": "hiponatremia_significativa",

  // --- Antidepresivos Tricíclicos (ATCs) ---
  "Prostatismo / Retención urinaria": "prostatismo_retencion_urinaria",

  // --- Ácido acetilsalicílico ---
  "Antecedentes de EVAG": "antecedentes_evag",
  "Riesgo significativo de sangrado": "riesgo_significativo_sangrado",
  "Antecedentes de sangrado grave": "antecedentes_sangrado_grave",
  "Diátesis hemorrágica": "diatesis_hemorragica",

  // --- Estrógenos ---
  "Antecedentes de cáncer de mama o útero": "cancer_mama_utero",
  "Antecedentes de tromboembolismo venoso": "tromboembolismo_venoso",
  "Antecedentes de enfermedad coronaria o vascular": "enfermedad_coronaria_vascular",
  "Útero intacto sin progestágenos": "utero_intacto_sin_progestagenos",

  // --- Sistema nervioso central (D) ---
  "Epilepsia": "epilepsia",
  "Temblor esencial benigno": "temblor_esencial_benigno",
  "Alergia": "alergia",
  "Prurito": "prurito",

  // --- Sistema urogenital (I) ---
  "Hiperplasia benigna de próstata": "hiperplasia_benigna_prostata",
  "Incontinencia urinaria de urgencia": "incontinencia_urinaria_urgencia",
  "Bacteriuria asintomática": "bacteriuria_asintomatica",
  "Obstrucción del tracto urinario inferior": "obstruccion_tracto_urinario_inferior",
  "Poliaquiuria": "poliaquiuria",

  // --- Sistema endocrino (J) ---
  "Hipotensión sintomática": "hipotension_sintomatica",
  "Hipotiroidismo subclínico": "hipotiroidismo_subclinico",

  // --- Sistema musculoesquelético / Analgésicos ---
  "Hepatopatía crónica": "hepatopatia_cronica",
  "Malnutrición": "malnutricion",

  // --- START criterios cardiovascular ---
  "Cardiopatía isquémica": "cardiopatia_isquemica",
  "Insuficiencia cardíaca con FE reducida": "insuficiencia_cardiaca_fe_reducida",
  "Fibrilación auricular paroxística": "fibrilacion_auricular_paroxistica",
  "FA con mal control de frecuencia cardíaca": "fa_mal_control_frecuencia",
  "Déficit de hierro": "deficit_hierro",

  // --- START criterios neurológico/psiquiátrico ---
  "Enfermedad de Parkinson": "parkinson",
  "Depresión mayor": "depresion_mayor",
  "Enfermedad de Alzheimer leve-moderada": "alzheimer",
  "Ansiedad grave persistente": "ansiedad_grave",
  "Síndrome de piernas inquietas": "sindrome_piernas_inquietas",

  // --- START criterios renal ---
  "Proteinuria / microalbuminuria": "proteinuria",
  "Hiperparatiroidismo secundario": "hiperparatiroidismo_secundario",
  "Anemia sintomática": "anemia_sintomatica",
  "Hiperfosfatemia": "hiperfosfatemia",

  // --- START criterios gastrointestinal ---
  "ERGE grave o estenosis esofágica péptica": "erge_grave",
  "Esofagitis por reflujo": "esofagitis",
  "Diverticulosis": "diverticulosis",
  "Úlcera péptica activa por H. pylori": "ulcera_peptica_activa_h_pylori",

  // --- START criterios respiratorio ---
  "Asma crónica": "asma_cronica",
  "Asma moderada-grave": "asma_moderada_grave",
  "EPOC estadio GOLD 1-2": "epoc_gold_1_2",
  "EPOC estadio GOLD 3-4": "epoc_gold_3_4",

  // --- START criterios musculoesquelético ---
  "Artritis reumatoide activa incapacitante": "artritis_reumatoide_activa",
  "Osteoporosis": "osteoporosis",
  "Fractura por fragilidad": "fractura_fragilidad",
  "Osteopenia": "osteopenia",
  "Gota recurrente": "gota_recurrente",
  "Déficit de vitamina D confirmado": "deficit_vitamina_d",

  // --- START criterios genitourinario ---
  "Vaginitis atrófica sintomática": "vaginitis_atrofica",
  "Infecciones urinarias recurrentes": "infecciones_urinarias_recurrentes",
  "Disfunción eréctil": "disfuncion_erectil",

  // --- START criterios endocrino ---
  "Diabetes mellitus": "diabetes",

  // --- START criterios analgésicos ---
  "Neuralgia postherpética": "neuralgia_postherpetica",

};

export const DIAGNOSIS_REVERSE_MAP: Record<string, string> =
  Object.fromEntries(
    Object.entries(DIAGNOSIS_MAP).map(([label, key]) => [key, label])
  );

// 🔹 Normalizador
export function normalizeDiagnosis(d: string): string {
  return DIAGNOSIS_MAP[d] ?? d.toLowerCase().replace(/\s+/g, "_");
}
