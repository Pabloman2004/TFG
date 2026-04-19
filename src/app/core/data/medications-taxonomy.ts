import { MEDICATIONS } from './medications';

export interface DrugGroup {
  id: string;
  label: string;
  drugs: string[];
  drugClass?: string;
}

export interface DrugCategory {
  id: string;
  label: string;
  groups: DrugGroup[];
}

const byClass = (dc: string): string[] =>
  MEDICATIONS
    .filter(m => m.drugClasses.includes(dc))
    .map(m => m.id);

export const DRUG_CATEGORIES: DrugCategory[] = [
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    groups: [
      { id: 'betabloqueantes', label: 'Betabloqueantes', drugClass: 'BETABLOQUEANTE', drugs: byClass('BETABLOQUEANTE') },
      { id: 'ieca', label: 'IECA', drugClass: 'IECA', drugs: byClass('IECA') },
      { id: 'ara2', label: 'ARA-II', drugClass: 'ARA2', drugs: byClass('ARA2') },
      { id: 'diur_asa', label: 'Diurét. de asa', drugClass: 'DIURETICO_ASA', drugs: byClass('DIURETICO_ASA') },
      { id: 'diur_tiaz', label: 'Diurét. tiazídicos', drugClass: 'DIURETICO_TIAZIDICO', drugs: byClass('DIURETICO_TIAZIDICO') },
      { id: 'antag_aldo', label: 'Antag. aldosterona', drugClass: 'ANTAGONISTA_ALDOSTERONA', drugs: byClass('ANTAGONISTA_ALDOSTERONA') },
      { id: 'ca_dhp', label: 'Calcioant. DHP', drugClass: 'CALCIOANTAGONISTA_DHP', drugs: byClass('CALCIOANTAGONISTA_DHP') },
      { id: 'ca_nodhp', label: 'Calcioant. no DHP', drugClass: 'CALCIOANTAGONISTA_NO_DHP', drugs: byClass('CALCIOANTAGONISTA_NO_DHP') },
      { id: 'antiarritmicos', label: 'Antiarrítmicos', drugClass: 'ANTIARITMICO', drugs: byClass('ANTIARITMICO') },
      { id: 'nitratos', label: 'Nitratos', drugClass: 'NITRATO', drugs: byClass('NITRATO') },
      { id: 'digoxina', label: 'Digoxina', drugClass: 'DIGOXINA', drugs: byClass('DIGOXINA') },
      { id: 'sac_val', label: 'Sacubitrilo/Valsartán', drugClass: 'SACUBITRILO_VALSARTAN', drugs: byClass('SACUBITRILO_VALSARTAN') },
      { id: 'antihta_central', label: 'Antihipertens. central', drugClass: 'ANTIHIPERTENSIVO_CENTRAL', drugs: byClass('ANTIHIPERTENSIVO_CENTRAL') },
      { id: 'isglt2', label: 'iSGLT2', drugClass: 'ISGLT2', drugs: byClass('ISGLT2') },
    ],
  },
  {
    id: 'anticoagulantes',
    label: 'Anticoagulantes',
    groups: [
      { id: 'avk', label: 'Antivitamina K', drugClass: 'ANTICOAGULANTE_AVK', drugs: byClass('ANTICOAGULANTE_AVK') },
      { id: 'aod', label: 'AODs', drugClass: 'ANTICOAGULANTE_DIRECTO', drugs: byClass('ANTICOAGULANTE_DIRECTO') },
      { id: 'antiagregantes', label: 'Antiagregantes', drugClass: 'ANTIAGREGANTE', drugs: byClass('ANTIAGREGANTE') },
    ],
  },
  {
    id: 'snc',
    label: 'SNC',
    groups: [
      { id: 'isrs', label: 'ISRS', drugClass: 'ISRS', drugs: byClass('ISRS') },
      { id: 'isrn', label: 'IRSN', drugClass: 'ISRN', drugs: byClass('ISRN') },
      { id: 'tricicl', label: 'Tricíclicos', drugClass: 'ANTIDEPRESIVO_TRICICLICO', drugs: byClass('ANTIDEPRESIVO_TRICICLICO') },
      { id: 'bzd', label: 'Benzodiacepinas', drugClass: 'BENZODIACEPINA', drugs: byClass('BENZODIACEPINA') },
      { id: 'hipn_z', label: 'Hipnóticos Z', drugClass: 'HIPNOTICO_Z', drugs: byClass('HIPNOTICO_Z') },
      { id: 'neurolep', label: 'Neurolépticos', drugClass: 'NEUROLEPTICO', drugs: byClass('NEUROLEPTICO') },
      { id: 'antiepilep', label: 'Antiepilépticos', drugClass: 'ANTIEPILÉPTICO', drugs: byClass('ANTIEPILÉPTICO') },
      { id: 'gabap', label: 'Gabapentinoides', drugClass: 'GABAPENTINOIDE', drugs: byClass('GABAPENTINOIDE') },
      { id: 'iache', label: 'Inh. acetilcolinesterasa', drugClass: 'INHIBIDOR_ACETILCOLINESTERASA', drugs: byClass('INHIBIDOR_ACETILCOLINESTERASA') },
      { id: 'antidem', label: 'Antidemencia', drugClass: 'ANTIDEMENCIA', drugs: byClass('ANTIDEMENCIA') },
      { id: 'estab_anim', label: 'Estab. del ánimo', drugClass: 'ESTABILIZADOR_ANIMO', drugs: byClass('ESTABILIZADOR_ANIMO') },
      { id: 'dopa', label: 'Dopaminérgicos', drugClass: 'DOPAMINERGICO', drugs: [...byClass('DOPAMINERGICO'), ...byClass('AGONISTA_DOPAMINERGICO')] },
      { id: 'antipark_ach', label: 'Antipark. anticolin.', drugClass: 'ANTIPARKINSONIAN_ANTICOLINERGICO', drugs: byClass('ANTIPARKINSONIAN_ANTICOLINERGICO') },
      { id: 'opioides', label: 'Opioides', drugClass: 'OPIOIDE', drugs: byClass('OPIOIDE') },
    ],
  },
  {
    id: 'renal',
    label: 'Renal',
    groups: [
      { id: 'epo', label: 'Eritropoyetina', drugClass: 'EPO', drugs: byClass('EPO') },
      { id: 'quel_fos', label: 'Quelantes de fósforo', drugClass: 'QUELANTE_FOSFORO', drugs: byClass('QUELANTE_FOSFORO') },
      { id: 'vit_d', label: 'Vitamina D', drugClass: 'VITAMINA_D', drugs: byClass('VITAMINA_D') },
      { id: 'calcio', label: 'Calcio', drugClass: 'CALCIO', drugs: byClass('CALCIO') },
      { id: 'hierro_oral', label: 'Hierro oral', drugClass: 'HIERRO_ORAL', drugs: byClass('HIERRO_ORAL') },
      { id: 'hierro_iv', label: 'Hierro IV', drugClass: 'HIERRO_IV', drugs: byClass('HIERRO_IV') },
      { id: 'diur_ahorr', label: 'Diurét. ahorr. K', drugClass: 'DIURETICO_AHORRADOR_POTASIO', drugs: byClass('DIURETICO_AHORRADOR_POTASIO') },
      { id: 'diur_asa', label: 'Diurét. de asa', drugClass: 'DIURETICO_ASA', drugs: byClass('DIURETICO_ASA') },
      { id: 'antag_aldo', label: 'Antag. aldosterona', drugClass: 'ANTAGONISTA_ALDOSTERONA', drugs: byClass('ANTAGONISTA_ALDOSTERONA') },
      { id: 'ieca', label: 'IECA', drugClass: 'IECA', drugs: byClass('IECA') },
      { id: 'ara2', label: 'ARA-II', drugClass: 'ARA2', drugs: byClass('ARA2') },
      { id: 'isglt2', label: 'iSGLT2', drugClass: 'ISGLT2', drugs: byClass('ISGLT2') },
    ],
  },
  {
    id: 'gastrointestinal',
    label: 'Gastrointestinal',
    groups: [
      { id: 'ibp', label: 'IBP', drugClass: 'IBP', drugs: byClass('IBP') },
      { id: 'laxantes', label: 'Laxantes', drugClass: 'LAXANTE', drugs: byClass('LAXANTE') },
      { id: 'procineticos', label: 'Procinéticos', drugClass: 'PROCINETICO', drugs: byClass('PROCINETICO') },
      { id: 'antiemet', label: 'Antieméticos', drugClass: 'ANTIEMETICO_5HT3', drugs: byClass('ANTIEMETICO_5HT3') },
      { id: 'probioticos', label: 'Probióticos', drugClass: 'PROBIOTICO', drugs: byClass('PROBIOTICO') },
      { id: 'fibra', label: 'Fibra', drugClass: 'FIBRA', drugs: byClass('FIBRA') },
      { id: 'antiesp', label: 'Antiespasmódicos', drugClass: 'ANTIESPASMÓDICO', drugs: byClass('ANTIESPASMÓDICO') },
    ],
  },
  {
    id: 'respiratorio',
    label: 'Respiratorio',
    groups: [
      { id: 'lama', label: 'LAMA', drugClass: 'LAMA', drugs: byClass('LAMA') },
      { id: 'laba', label: 'LABA', drugClass: 'LABA', drugs: byClass('LABA') },
      { id: 'ci_inh', label: 'Corticoides inhalados', drugClass: 'CORTICOIDE_INHALADO', drugs: byClass('CORTICOIDE_INHALADO') },
      { id: 'metilxant', label: 'Metilxantinas', drugClass: 'METILXANTINA', drugs: byClass('METILXANTINA') },
      { id: 'antihist1g', label: 'Antihist. 1ª gen.', drugClass: 'ANTIHISTAMINICO_1GEN', drugs: byClass('ANTIHISTAMINICO_1GEN') },
      { id: 'corticoide_sist', label: 'Corticoides sistémicos', drugClass: 'CORTICOIDE_SISTEMICO', drugs: byClass('CORTICOIDE_SISTEMICO') },
    ],
  },
  {
    id: 'endocrino',
    label: 'Endocrino/Metabólico',
    groups: [
      { id: 'sulfonil', label: 'Sulfonilureas', drugClass: 'SULFONILUREA', drugs: byClass('SULFONILUREA') },
      { id: 'tzd', label: 'Tiazolidindionas', drugClass: 'TIAZOLIDINDIONA', drugs: byClass('TIAZOLIDINDIONA') },
      { id: 'biguan', label: 'Biguanidas', drugClass: 'BIGUANIDA', drugs: byClass('BIGUANIDA') },
      { id: 'tiroid', label: 'Hormona tiroidea', drugClass: 'HORMONA_TIROIDEA', drugs: byClass('HORMONA_TIROIDEA') },
      { id: 'estat', label: 'Estatinas', drugClass: 'ESTATINA', drugs: byClass('ESTATINA') },
      { id: 'ixo', label: 'Inh. xantina oxidasa', drugClass: 'INHIBIDOR_XANTINA_OXIDASA', drugs: byClass('INHIBIDOR_XANTINA_OXIDASA') },
      { id: 'corticoide_sist', label: 'Corticoides sistémicos', drugClass: 'CORTICOIDE_SISTEMICO', drugs: byClass('CORTICOIDE_SISTEMICO') },
      { id: 'acido_folico', label: 'Ácido fólico', drugClass: 'ACIDO_FOLICO', drugs: byClass('ACIDO_FOLICO') },
      { id: 'isglt2', label: 'iSGLT2', drugClass: 'ISGLT2', drugs: byClass('ISGLT2') },
    ],
  },
  {
    id: 'urologico',
    label: 'Urológico',
    groups: [
      { id: 'alfa', label: 'Alfabloqueantes', drugClass: 'ALFABLOQUEANTE', drugs: byClass('ALFABLOQUEANTE') },
      { id: 'alfa_prost', label: 'Alfabloq. prostático', drugClass: 'ALFABLOQUEANTE_PROSTATICO', drugs: byClass('ALFABLOQUEANTE_PROSTATICO') },
      { id: 'i5ar', label: 'Inh. 5-α reductasa', drugClass: 'INHIBIDOR_5ALFA_REDUCTASA', drugs: byClass('INHIBIDOR_5ALFA_REDUCTASA') },
      { id: 'anti_ve', label: 'Antiesp. urinarios', drugClass: 'ANTIESPASMÓDICO_URINARIO', drugs: byClass('ANTIESPASMÓDICO_URINARIO') },
      { id: 'b3', label: 'Agonista β3', drugClass: 'AGONISTA_BETA3', drugs: byClass('AGONISTA_BETA3') },
      { id: 'est_top', label: 'Estrógenos tópicos', drugClass: 'ESTROGENO_TOPICO', drugs: byClass('ESTROGENO_TOPICO') },
      { id: 'pde5', label: 'Inh. PDE5', drugClass: 'INHIBIDOR_PDE5', drugs: byClass('INHIBIDOR_PDE5') },
    ],
  },
  {
    id: 'osteo',
    label: 'Osteo/Músculo-esq.',
    groups: [
      { id: 'bifosf', label: 'Bifosfonatos', drugClass: 'BIFOSFONATO', drugs: byClass('BIFOSFONATO') },
      { id: 'antirres', label: 'Antirresortivos', drugClass: 'ANTIRRESORTIVO', drugs: byClass('ANTIRRESORTIVO') },
      { id: 'anab_oseo', label: 'Anabolizantes óseos', drugClass: 'ANABOLIZANTE_OSEO', drugs: byClass('ANABOLIZANTE_OSEO') },
      { id: 'colchi', label: 'Colchicina', drugClass: 'COLCHICINA', drugs: byClass('COLCHICINA') },
      { id: 'fame', label: 'FAMEs', drugClass: 'FAME', drugs: byClass('FAME') },
      { id: 'relaj_musc', label: 'Relaj. musculares', drugClass: 'RELAJANTE_MUSCULAR', drugs: byClass('RELAJANTE_MUSCULAR') },
      { id: 'aine', label: 'AINEs', drugClass: 'AINE', drugs: byClass('AINE') },
      { id: 'paracetamol', label: 'Analgésicos simples', drugClass: 'ANALGESICO_SIMPLE', drugs: byClass('ANALGESICO_SIMPLE') },
      { id: 'opioides', label: 'Opioides', drugClass: 'OPIOIDE', drugs: byClass('OPIOIDE') },
      { id: 'gabap', label: 'Gabapentinoides', drugClass: 'GABAPENTINOIDE', drugs: byClass('GABAPENTINOIDE') },
      { id: 'tricicl', label: 'Tricíclicos', drugClass: 'ANTIDEPRESIVO_TRICICLICO', drugs: byClass('ANTIDEPRESIVO_TRICICLICO') },
    ],
  },
  {
    id: 'antibioticos',
    label: 'Antibióticos',
    groups: [
      { id: 'quinol', label: 'Quinolonas', drugClass: 'QUINOLONA', drugs: byClass('QUINOLONA') },
      { id: 'macrol', label: 'Macrólidos', drugClass: 'MACROLIDO', drugs: byClass('MACROLIDO') },
      { id: 'atb_urin', label: 'Antibióticos urinarios', drugClass: 'ANTIBIOTICO_URINARIO', drugs: byClass('ANTIBIOTICO_URINARIO') },
      { id: 'atb_grales', label: 'Antibióticos generales', drugClass: 'ANTIBIOTICO', drugs: ['Amoxicilina', 'Amoxicilina/Clavulánico', 'Cefalexina', 'Doxiciclina', 'Trimetoprim/Sulfametoxazol'] },
    ],
  },
];
