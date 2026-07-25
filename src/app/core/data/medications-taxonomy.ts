// @linked docs/catalogo-clinico.md
// Si cambias DRUG_CATEGORIES, grupos o resolveMedicationLabel, actualiza el doc enlazado.

import { MEDICATIONS } from './medications';

export interface DrugGroup {
  id: string;
  label: string;
  fullName?: string;
  drugs: string[];
  drugClass?: string;
}

export interface DrugCategory {
  id: string;
  label: string;
  fullName?: string;
  groups: DrugGroup[];
}

const byClass = (dc: string): string[] =>
  MEDICATIONS
    .filter(m => m.drugClasses.includes(dc))
    .map(m => m.id);

const RAW_DRUG_CATEGORIES: DrugCategory[] = [
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    groups: [
      { id: 'betabloqueantes', label: 'Betabloqueantes', fullName: 'Betabloqueantes. Cardioselectivos (para START-B6 en IC con FE reducida): bisoprolol, nebivolol, metoprolol, carvedilol', drugs: byClass('BETABLOQUEANTE'), drugClass: 'BETABLOQUEANTE' },
      { id: 'ieca', label: 'IECA', fullName: 'Inhibidores de la enzima convertidora de angiotensina', drugs: byClass('IECA'), drugClass: 'IECA' },
      { id: 'ara2', label: 'ARA-II', fullName: 'Antagonistas del receptor de angiotensina II', drugs: byClass('ARA2'), drugClass: 'ARA2' },
      { id: 'diur_asa', label: 'Diurét. de asa', fullName: 'Diuréticos de asa (furosemida, torasemida)', drugs: byClass('DIURETICO_ASA'), drugClass: 'DIURETICO_ASA' },
      { id: 'diur_tiaz', label: 'Diurét. tiazídicos', fullName: 'Diuréticos tiazídicos (hidroclorotiazida, clortalidona, indapamida)', drugs: byClass('DIURETICO_TIAZIDICO'), drugClass: 'DIURETICO_TIAZIDICO' },
      { id: 'antag_aldo', label: 'Antag. aldosterona', fullName: 'Antagonistas de la aldosterona (espironolactona, eplerenona)', drugs: byClass('ANTAGONISTA_ALDOSTERONA'), drugClass: 'ANTAGONISTA_ALDOSTERONA' },
      { id: 'ca_dhp', label: 'Antag. calcio DHP', fullName: 'Antagonistas del calcio dihidropiridínicos (amlodipino, nifedipino, lercanidipino…)', drugs: byClass('CALCIOANTAGONISTA_DHP'), drugClass: 'CALCIOANTAGONISTA_DHP' },
      { id: 'ca_nodhp', label: 'Antag. calcio no DHP', fullName: 'Antagonistas del calcio no dihidropiridínicos (verapamilo, diltiazem)', drugs: byClass('CALCIOANTAGONISTA_NO_DHP'), drugClass: 'CALCIOANTAGONISTA_NO_DHP' },
      { id: 'antiarritmicos', label: 'Antiarrítmicos', drugs: byClass('ANTIARITMICO'), drugClass: 'ANTIARITMICO' },
      { id: 'nitratos', label: 'Nitratos', drugs: byClass('NITRATO'), drugClass: 'NITRATO' },
      { id: 'digoxina', label: 'Digoxina', drugs: byClass('DIGOXINA'), drugClass: 'DIGOXINA' },
      { id: 'sac_val', label: 'Sacubitrilo/Valsartán', drugs: byClass('SACUBITRILO_VALSARTAN'), drugClass: 'SACUBITRILO_VALSARTAN' },
      { id: 'antihta_central', label: 'Antihipertens. central', fullName: 'Antihipertensivos de acción central (metildopa, clonidina, moxonidina…)', drugs: byClass('ANTIHIPERTENSIVO_CENTRAL'), drugClass: 'ANTIHIPERTENSIVO_CENTRAL' },
      { id: 'antianginosos', label: 'Antianginosos', fullName: 'Otros antianginosos (ranolazina)', drugs: byClass('ANTIANGINOSO'), drugClass: 'ANTIANGINOSO' },
      { id: 'isglt2', label: 'iSGLT2', fullName: 'Inhibidores del cotransportador sodio-glucosa tipo 2 (canagliflozina, dapagliflozina…)', drugs: byClass('ISGLT2'), drugClass: 'ISGLT2' },
    ],
  },
  {
    id: 'anticoagulantes',
    label: 'Anticoagulantes',
    groups: [
      { id: 'avk', label: 'Antivitamina K', fullName: 'Anticoagulantes antagonistas de la vitamina K (warfarina, acenocumarol)', drugs: byClass('ANTICOAGULANTE_AVK'), drugClass: 'ANTICOAGULANTE_AVK' },
      { id: 'aod', label: 'AODs', fullName: 'Anticoagulantes orales directos (apixabán, rivaroxabán, dabigatrán, edoxabán)', drugs: byClass('ANTICOAGULANTE_DIRECTO'), drugClass: 'ANTICOAGULANTE_DIRECTO' },
      { id: 'antiagregantes', label: 'Antiagregantes', drugs: byClass('ANTIAGREGANTE'), drugClass: 'ANTIAGREGANTE' },
    ],
  },
  {
    id: 'snc',
    label: 'SNC',
    fullName: 'Sistema nervioso central',
    groups: [
      { id: 'isrs', label: 'ISRS', fullName: 'Inhibidores selectivos de la recaptación de serotonina', drugs: byClass('ISRS'), drugClass: 'ISRS' },
      { id: 'isrn', label: 'IRSN', fullName: 'Inhibidores de la recaptación de serotonina y noradrenalina', drugs: byClass('ISRN'), drugClass: 'ISRN' },
      { id: 'tricicl', label: 'Tricíclicos', fullName: 'Antidepresivos tricíclicos (amitriptilina, nortriptilina, imipramina…)', drugs: byClass('ANTIDEPRESIVO_TRICICLICO'), drugClass: 'ANTIDEPRESIVO_TRICICLICO' },
      { id: 'bzd', label: 'Benzodiacepinas', drugs: byClass('BENZODIACEPINA'), drugClass: 'BENZODIACEPINA' },
      { id: 'hipn_z', label: 'Hipnóticos Z', fullName: 'Hipnóticos no benzodiacepínicos (zolpidem, zopiclona, zaleplon)', drugs: byClass('HIPNOTICO_Z'), drugClass: 'HIPNOTICO_Z' },
      { id: 'neurolep', label: 'Neurolépticos', drugs: byClass('NEUROLEPTICO'), drugClass: 'NEUROLEPTICO' },
      { id: 'antiepilep', label: 'Antiepilépticos', drugs: byClass('ANTIEPILÉPTICO'), drugClass: 'ANTIEPILÉPTICO' },
      { id: 'gabap', label: 'Gabapentinoides', fullName: 'Gabapentinoides (gabapentina, pregabalina)', drugs: byClass('GABAPENTINOIDE'), drugClass: 'GABAPENTINOIDE' },
      { id: 'iache', label: 'Inh. acetilcolinesterasa', fullName: 'Inhibidores de la acetilcolinesterasa (donepezilo, rivastigmina, galantamina)', drugs: byClass('INHIBIDOR_ACETILCOLINESTERASA'), drugClass: 'INHIBIDOR_ACETILCOLINESTERASA' },
      { id: 'antidem', label: 'Antidemencia', fullName: 'Antidemencia / antagonistas NMDA (memantina)', drugs: byClass('ANTIDEMENCIA'), drugClass: 'ANTIDEMENCIA' },
      { id: 'estab_anim', label: 'Estab. del ánimo', fullName: 'Estabilizadores del estado de ánimo (litio)', drugs: byClass('ESTABILIZADOR_ANIMO'), drugClass: 'ESTABILIZADOR_ANIMO' },
      { id: 'dopa', label: 'Dopaminérgicos', drugs: [...byClass('DOPAMINERGICO'), ...byClass('AGONISTA_DOPAMINERGICO')], drugClass: 'DOPAMINERGICO' },
      { id: 'antipark_ach', label: 'Antipark. anticolin.', fullName: 'Antiparkinsonianos anticolinérgicos (biperideno, trihexifenidilo…)', drugs: byClass('ANTIPARKINSONIAN_ANTICOLINERGICO'), drugClass: 'ANTIPARKINSONIAN_ANTICOLINERGICO' },
      { id: 'atropina', label: 'Atropina', drugs: ['Atropina'], drugClass: 'ANTICOLINERGICO' },
      { id: 'nootropicos', label: 'Nootrópicos', drugs: byClass('NOOTROPICO'), drugClass: 'NOOTROPICO' },
      { id: 'opioides', label: 'Opioides', drugs: byClass('OPIOIDE'), drugClass: 'OPIOIDE' },
    ],
  },
  {
    id: 'renal',
    label: 'Renal',
    groups: [
      { id: 'epo', label: 'Eritropoyetina', fullName: 'Agentes estimulantes de la eritropoyesis (eritropoyetina alfa, darbepoetina)', drugs: byClass('EPO'), drugClass: 'EPO' },
      { id: 'quel_fos', label: 'Quelantes de fósforo', drugs: byClass('QUELANTE_FOSFORO'), drugClass: 'QUELANTE_FOSFORO' },
      { id: 'vit_d', label: 'Vitamina D', drugs: byClass('VITAMINA_D'), drugClass: 'VITAMINA_D' },
      { id: 'calcio', label: 'Calcio', drugs: byClass('CALCIO'), drugClass: 'CALCIO' },
      { id: 'hierro_oral', label: 'Hierro oral', drugs: byClass('HIERRO_ORAL'), drugClass: 'HIERRO_ORAL' },
      { id: 'hierro_iv', label: 'Hierro IV', fullName: 'Hierro intravenoso (hierro carboximaltosa, hierro sacarosa)', drugs: byClass('HIERRO_IV'), drugClass: 'HIERRO_IV' },
      { id: 'diur_ahorr', label: 'Diurét. ahorr. K', fullName: 'Diuréticos ahorradores de potasio (amilorida, triamtereno)', drugs: byClass('DIURETICO_AHORRADOR_POTASIO'), drugClass: 'DIURETICO_AHORRADOR_POTASIO' },
      { id: 'diur_asa', label: 'Diurét. de asa', fullName: 'Diuréticos de asa (furosemida, torasemida)', drugs: byClass('DIURETICO_ASA'), drugClass: 'DIURETICO_ASA' },
      { id: 'antag_aldo', label: 'Antag. aldosterona', fullName: 'Antagonistas de la aldosterona (espironolactona, eplerenona)', drugs: byClass('ANTAGONISTA_ALDOSTERONA'), drugClass: 'ANTAGONISTA_ALDOSTERONA' },
      { id: 'ieca', label: 'IECA', fullName: 'Inhibidores de la enzima convertidora de angiotensina', drugs: byClass('IECA'), drugClass: 'IECA' },
      { id: 'ara2', label: 'ARA-II', fullName: 'Antagonistas del receptor de angiotensina II', drugs: byClass('ARA2'), drugClass: 'ARA2' },
      { id: 'isglt2', label: 'iSGLT2', fullName: 'Inhibidores del cotransportador sodio-glucosa tipo 2', drugs: byClass('ISGLT2'), drugClass: 'ISGLT2' },
    ],
  },
  {
    id: 'gastrointestinal',
    label: 'Gastrointestinal',
    groups: [
      { id: 'ibp', label: 'IBP', fullName: 'Inhibidores de la bomba de protones (omeprazol, pantoprazol…)', drugs: byClass('IBP'), drugClass: 'IBP' },
      { id: 'laxantes', label: 'Laxantes', drugs: byClass('LAXANTE'), drugClass: 'LAXANTE' },
      { id: 'procineticos', label: 'Procinéticos', fullName: 'Procinéticos (metoclopramida)', drugs: byClass('PROCINETICO'), drugClass: 'PROCINETICO' },
      { id: 'antiemet', label: 'Antieméticos', fullName: 'Antieméticos antagonistas 5-HT3 (ondansetrón)', drugs: byClass('ANTIEMETICO_5HT3'), drugClass: 'ANTIEMETICO_5HT3' },
      { id: 'probioticos', label: 'Probióticos', drugs: byClass('PROBIOTICO'), drugClass: 'PROBIOTICO' },
      { id: 'fibra', label: 'Fibra', fullName: 'Suplementos de fibra dietética (plantago ovata, metilcelulosa)', drugs: byClass('FIBRA'), drugClass: 'FIBRA' },
      { id: 'antiesp', label: 'Antiespasmódicos', drugs: byClass('ANTIESPASMÓDICO'), drugClass: 'ANTIESPASMÓDICO' },
      { id: 'orexigenos', label: 'Orexígenos', drugs: byClass('OREXICO'), drugClass: 'OREXICO' },
    ],
  },
  {
    id: 'respiratorio',
    label: 'Respiratorio',
    groups: [
      { id: 'lama', label: 'LAMA', fullName: 'Antimuscarínicos de acción larga inhalados (tiotropio, aclidinio, umeclidinio…)', drugs: byClass('LAMA'), drugClass: 'LAMA' },
      { id: 'laba', label: 'LABA', fullName: 'Agonistas beta-2 de acción larga inhalados (formoterol, salmeterol, indacaterol…)', drugs: byClass('LABA'), drugClass: 'LABA' },
      { id: 'ci_inh', label: 'Corticoides inhalados', drugs: byClass('CORTICOIDE_INHALADO'), drugClass: 'CORTICOIDE_INHALADO' },
      { id: 'oxigenoterapia', label: 'Oxigenoterapia', fullName: 'Oxigenoterapia domiciliaria crónica (habitualmente ≥15 h/día)', drugs: byClass('OXIGENOTERAPIA'), drugClass: 'OXIGENOTERAPIA' },
      { id: 'metilxant', label: 'Metilxantinas', fullName: 'Metilxantinas (teofilina)', drugs: byClass('METILXANTINA'), drugClass: 'METILXANTINA' },
      { id: 'antihist1g', label: 'Antihist. 1ª gen.', fullName: 'Antihistamínicos de primera generación (difenhidramina, clorfeniramina…)', drugs: byClass('ANTIHISTAMINICO_1GEN'), drugClass: 'ANTIHISTAMINICO_1GEN' },
      { id: 'corticoide_sist', label: 'Corticoides sistémicos', drugs: byClass('CORTICOIDE_SISTEMICO'), drugClass: 'CORTICOIDE_SISTEMICO' },
    ],
  },
  {
    id: 'endocrino',
    label: 'Endocrino/Metabólico',
    groups: [
      { id: 'sulfonil', label: 'Sulfonilureas', fullName: 'Sulfonilureas (glibenclamida, glimepirida, clorpropamida)', drugs: byClass('SULFONILUREA'), drugClass: 'SULFONILUREA' },
      { id: 'tzd', label: 'Tiazolidindionas', fullName: 'Tiazolidindionas (rosiglitazona, pioglitazona)', drugs: byClass('TIAZOLIDINDIONA'), drugClass: 'TIAZOLIDINDIONA' },
      { id: 'biguan', label: 'Biguanidas', fullName: 'Biguanidas (metformina)', drugs: byClass('BIGUANIDA'), drugClass: 'BIGUANIDA' },
      { id: 'tiroid', label: 'Hormona tiroidea', fullName: 'Hormona tiroidea (levotiroxina)', drugs: byClass('HORMONA_TIROIDEA'), drugClass: 'HORMONA_TIROIDEA' },
      { id: 'estat', label: 'Estatinas', drugs: byClass('ESTATINA'), drugClass: 'ESTATINA' },
      { id: 'ixo', label: 'Inh. xantina oxidasa', fullName: 'Inhibidores de la xantina oxidasa (alopurinol, febuxostat)', drugs: byClass('INHIBIDOR_XANTINA_OXIDASA'), drugClass: 'INHIBIDOR_XANTINA_OXIDASA' },
      { id: 'corticoide_sist', label: 'Corticoides sistémicos', drugs: byClass('CORTICOIDE_SISTEMICO'), drugClass: 'CORTICOIDE_SISTEMICO' },
      { id: 'acido_folico', label: 'Ácido fólico', drugs: byClass('ACIDO_FOLICO'), drugClass: 'ACIDO_FOLICO' },
      { id: 'isglt2', label: 'iSGLT2', fullName: 'Inhibidores del cotransportador sodio-glucosa tipo 2', drugs: byClass('ISGLT2'), drugClass: 'ISGLT2' },
      { id: 'analogo_vasopresina', label: 'Análogos de vasopresina', fullName: 'Análogos de la vasopresina (desmopresina, vasopresina)', drugs: byClass('ANALOGO_VASOPRESINA'), drugClass: 'ANALOGO_VASOPRESINA' },
      { id: 'antineoplasicos', label: 'Antineoplásicos', fullName: 'Tratamientos antineoplásicos hormonales (tamoxifeno)', drugs: byClass('ANTINEOPLASICO'), drugClass: 'ANTINEOPLASICO' },
      { id: 'estrogenos_sist', label: 'Estrógenos sistémicos', fullName: 'Estrógenos sistémicos (estrógenos conjugados, estradiol). Relevantes en antecedente de tromboembolismo venoso o de enfermedad coronaria/vascular.', drugs: byClass('ESTROGENO'), drugClass: 'ESTROGENO' },
      { id: 'androgenos', label: 'Andrógenos', fullName: 'Andrógenos sistémicos (testosterona). Relevantes en antecedente de tromboembolismo venoso o de enfermedad coronaria/vascular.', drugs: byClass('ANDROGENO'), drugClass: 'ANDROGENO' },
    ],
  },
  {
    id: 'urologico',
    label: 'Urológico',
    groups: [
      { id: 'alfa', label: 'Alfabloqueantes', drugs: byClass('ALFABLOQUEANTE'), drugClass: 'ALFABLOQUEANTE' },
      { id: 'alfa_prost', label: 'Alfabloq. prostático', fullName: 'Alfabloqueante prostático selectivo (silodosina)', drugs: byClass('ALFABLOQUEANTE_PROSTATICO'), drugClass: 'ALFABLOQUEANTE_PROSTATICO' },
      { id: 'i5ar', label: 'Inh. 5-α reductasa', fullName: 'Inhibidores de la 5-alfa reductasa (finasterida, dutasterida)', drugs: byClass('INHIBIDOR_5ALFA_REDUCTASA'), drugClass: 'INHIBIDOR_5ALFA_REDUCTASA' },
      { id: 'anti_ve', label: 'Antiesp. urinarios', fullName: 'Antiespasmodicos urinarios / antimuscarínicos urinarios (oxibutinina, tolterodina, solifenacina)', drugs: byClass('ANTIESPASMÓDICO_URINARIO'), drugClass: 'ANTIESPASMÓDICO_URINARIO' },
      { id: 'b3', label: 'Agonista β3', fullName: 'Agonistas beta-3 adrenérgicos (mirabegrón)', drugs: byClass('AGONISTA_BETA3'), drugClass: 'AGONISTA_BETA3' },
      { id: 'est_top', label: 'Estrógenos tópicos', fullName: 'Estrógenos tópicos vaginales (estriol, promestrieno)', drugs: byClass('ESTROGENO_TOPICO'), drugClass: 'ESTROGENO_TOPICO' },
      { id: 'pde5', label: 'Inh. PDE5', fullName: 'Inhibidores de la fosfodiesterasa 5 (sildenafilo, tadalafilo, vardenafilo)', drugs: byClass('INHIBIDOR_PDE5'), drugClass: 'INHIBIDOR_PDE5' },
    ],
  },
  {
    id: 'osteo',
    label: 'Osteo/Músculo-esq.',
    fullName: 'Osteoarticular / Músculo-esquelético',
    groups: [
      { id: 'bifosf', label: 'Bifosfonatos', drugs: byClass('BIFOSFONATO'), drugClass: 'BIFOSFONATO' },
      { id: 'antirres', label: 'Antirresortivos (amplio)', fullName: 'Categoría amplia de antirresortivos: incluye los bifosfonatos y el denosumab. Los bifosfonatos se muestran también en su grupo propio; el solapamiento es intencional, no es un duplicado.', drugs: byClass('ANTIRRESORTIVO'), drugClass: 'ANTIRRESORTIVO' },
      { id: 'anab_oseo', label: 'Anabolizantes óseos', fullName: 'Anabolizantes óseos (teriparatida)', drugs: byClass('ANABOLIZANTE_OSEO'), drugClass: 'ANABOLIZANTE_OSEO' },
      { id: 'colchi', label: 'Colchicina', drugs: byClass('COLCHICINA'), drugClass: 'COLCHICINA' },
      { id: 'fame', label: 'FAMEs', fullName: 'Fármacos antirreumáticos modificadores de la enfermedad (metotrexato, leflunomida…)', drugs: byClass('FAME'), drugClass: 'FAME' },
      { id: 'inmunosupresores', label: 'Inmunosupresores', fullName: 'Inmunosupresores sistémicos (ciclosporina, metotrexato)', drugs: byClass('INMUNOSUPRESOR'), drugClass: 'INMUNOSUPRESOR' },
      { id: 'relaj_musc', label: 'Relaj. musculares', fullName: 'Relajantes musculares (tizanidina)', drugs: byClass('RELAJANTE_MUSCULAR'), drugClass: 'RELAJANTE_MUSCULAR' },
      { id: 'aine', label: 'AINEs', fullName: 'Antiinflamatorios no esteroideos (ibuprofeno, naproxeno, diclofenaco…)', drugs: byClass('AINE'), drugClass: 'AINE' },
      { id: 'paracetamol', label: 'Analgésicos simples', fullName: 'Analgésicos simples / no opioides (paracetamol)', drugs: byClass('ANALGESICO_SIMPLE'), drugClass: 'ANALGESICO_SIMPLE' },
      { id: 'opioides', label: 'Opioides', drugs: byClass('OPIOIDE'), drugClass: 'OPIOIDE' },
      { id: 'gabap', label: 'Gabapentinoides', fullName: 'Gabapentinoides (gabapentina, pregabalina)', drugs: byClass('GABAPENTINOIDE'), drugClass: 'GABAPENTINOIDE' },
      { id: 'tricicl', label: 'Tricíclicos', fullName: 'Antidepresivos tricíclicos (amitriptilina, nortriptilina…)', drugs: byClass('ANTIDEPRESIVO_TRICICLICO'), drugClass: 'ANTIDEPRESIVO_TRICICLICO' },
      { id: 'anest_top', label: 'Anestésicos tópicos', fullName: 'Anestésicos tópicos (lidocaína parche 5%)', drugs: byClass('ANESTESICO_TOPICO'), drugClass: 'ANESTESICO_TOPICO' },
    ],
  },
  {
    id: 'antibioticos',
    label: 'Antiinfecciosos',
    groups: [
      { id: 'quinol', label: 'Quinolonas', fullName: 'Quinolonas / fluoroquinolonas (ciprofloxacino, levofloxacino, moxifloxacino)', drugs: byClass('QUINOLONA'), drugClass: 'QUINOLONA' },
      { id: 'macrol', label: 'Macrólidos', fullName: 'Macrólidos (azitromicina, claritromicina, eritromicina)', drugs: byClass('MACROLIDO'), drugClass: 'MACROLIDO' },
      { id: 'atb_urin', label: 'Antibióticos urinarios', fullName: 'Antibióticos urinarios (nitrofurantoína)', drugs: byClass('ANTIBIOTICO_URINARIO'), drugClass: 'ANTIBIOTICO_URINARIO' },
      { id: 'antifungicos', label: 'Antifúngicos', fullName: 'Antifúngicos sistémicos (itraconazol, ketoconazol)', drugs: byClass('ANTIFUNGICO'), drugClass: 'ANTIFUNGICO' },
      { id: 'antipaludicos', label: 'Antipalúdicos', fullName: 'Antipalúdicos (quinina)', drugs: byClass('ANTIPALUDICO'), drugClass: 'ANTIPALUDICO' },
      { id: 'atb_grales', label: 'Antibióticos generales', drugs: ['Amoxicilina', 'Amoxicilina/Clavulánico', 'Cefalexina', 'Doxiciclina', 'Trimetoprim/Sulfametoxazol'] },
    ],
  },
];

const ES_COLLATOR = new Intl.Collator('es', { sensitivity: 'base' });

export const DRUG_CATEGORIES: DrugCategory[] = RAW_DRUG_CATEGORIES.map(cat => ({
  ...cat,
  groups: cat.groups
    .map(g => ({ ...g, drugs: g.drugs.slice().sort((a, b) => ES_COLLATOR.compare(a, b)) }))
    .sort((a, b) => ES_COLLATOR.compare(a.label, b.label)),
}));

const MED_GROUP_LABEL_MAP: Record<string, string> = Object.fromEntries(
  RAW_DRUG_CATEGORIES.flatMap(cat => cat.groups.map(g => [g.id, g.label]))
);

export function resolveMedicationLabel(id: string): string {
  if (!id.startsWith('otro__')) return id;
  const groupId = id.slice('otro__'.length);
  const groupLabel = MED_GROUP_LABEL_MAP[groupId];
  return groupLabel ? `Otro (${groupLabel})` : 'Otro (sin especificar)';
}
