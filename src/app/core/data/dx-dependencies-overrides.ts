// Overrides clínicos del piloto cardiovascular y casos donde la derivación pura
// desde criteria.json no reproduce el comportamiento curado manualmente.
// Cada clase está respaldada por un criterio STOPP en criteria.json (ID en comentario).

import { DxTrigger } from './dx-dependencies';

export const DX_DEPENDENCIES_OVERRIDES: Record<string, DxTrigger> = {
  'Insuficiencia cardíaca con función sistólica conservada': {
    // STOPP-B9: DIGOXINA; STOPP-B10: DIURETICO_ASA; STOPP-B11: AINE/CORTICOIDE; STOPP-J2: TIAZOLIDINDIONA
    classes: ['AINE', 'CORTICOIDE_SISTEMICO', 'DIGOXINA', 'DIURETICO_ASA', 'TIAZOLIDINDIONA'],
    tooltip:
      'Disponible si se marca AINE, corticoide sistémico, Digoxina, diurético de asa o tiazolidindiona',
  },
  'Insuficiencia cardíaca NYHA III-IV': {
    // STOPP-B6: ANTIARITMICO; STOPP-B7: CALCIOANTAGONISTA_NO_DHP; STOPP-B10: DIURETICO_ASA;
    // STOPP-B11: AINE/CORTICOIDE; STOPP-J2: TIAZOLIDINDIONA
    classes: [
      'AINE',
      'ANTIARITMICO',
      'CALCIOANTAGONISTA_NO_DHP',
      'CORTICOIDE_SISTEMICO',
      'DIURETICO_ASA',
      'TIAZOLIDINDIONA',
    ],
    tooltip:
      'Disponible si se marca AINE, antiarrítmico (Dronedarona), Verapamilo/Diltiazem, corticoide sistémico, diurético de asa o tiazolidindiona',
  },
  Bradicardia: {
    // STOPP-B3: BETABLOQUEANTE; STOPP-B7: CALCIOANTAGONISTA_NO_DHP; STOPP-B9: DIGOXINA;
    // STOPP-D17: INHIBIDOR_ACETILCOLINESTERASA
    classes: ['BETABLOQUEANTE', 'CALCIOANTAGONISTA_NO_DHP', 'DIGOXINA', 'INHIBIDOR_ACETILCOLINESTERASA'],
    tooltip:
      'Disponible si se marca betabloqueante, Verapamilo/Diltiazem, Digoxina o inhibidor de la acetilcolinesterasa',
  },
  'Bloqueo AV de segundo grado': {
    // STOPP-D4: BETABLOQUEANTE; STOPP-B7: CALCIOANTAGONISTA_NO_DHP; STOPP-B9: DIGOXINA;
    // STOPP-D17: INHIBIDOR_ACETILCOLINESTERASA
    classes: ['BETABLOQUEANTE', 'CALCIOANTAGONISTA_NO_DHP', 'DIGOXINA', 'INHIBIDOR_ACETILCOLINESTERASA'],
    tooltip:
      'Disponible si se marca betabloqueante, Verapamilo/Diltiazem, Digoxina o inhibidor de la acetilcolinesterasa',
  },
  'Bloqueo AV completo': {
    // STOPP-D4: BETABLOQUEANTE; STOPP-B7: CALCIOANTAGONISTA_NO_DHP; STOPP-B9: DIGOXINA;
    // STOPP-D17: INHIBIDOR_ACETILCOLINESTERASA
    classes: ['BETABLOQUEANTE', 'CALCIOANTAGONISTA_NO_DHP', 'DIGOXINA', 'INHIBIDOR_ACETILCOLINESTERASA'],
    tooltip:
      'Disponible si se marca betabloqueante, Verapamilo/Diltiazem, Digoxina o inhibidor de la acetilcolinesterasa',
  },
  'HTA no complicada': {
    // STOPP-B3: BETABLOQUEANTE; STOPP-B10: DIURETICO_ASA; STOPP-B1: ANTIHIPERTENSIVO_CENTRAL;
    // STOPP-B6: ANTIARITMICO; STOPP-K9: ALFABLOQUEANTE
    classes: ['ALFABLOQUEANTE', 'ANTIARITMICO', 'ANTIHIPERTENSIVO_CENTRAL', 'BETABLOQUEANTE', 'DIURETICO_ASA'],
    tooltip:
      'Disponible si se marca alfabloqueante, antiarrítmico (Amiodarona), antihipertensivo central, betabloqueante o diurético de asa',
  },
  'HTA grave': {
    // STOPP-H2: AINE; STOPP-D3: ISRN; STOPP-K9: ALFABLOQUEANTE; STOPP-C2: ANTIAGREGANTE/ANTICOAGULANTE;
    // STOPP-I6: AGONISTA_BETA3; STOPP-B10: DIURETICO_ASA; STOPP-B1: ANTIHIPERTENSIVO_CENTRAL
    classes: [
      'AGONISTA_BETA3',
      'AINE',
      'ALFABLOQUEANTE',
      'ANTIAGREGANTE',
      'ANTICOAGULANTE',
      'ANTIHIPERTENSIVO_CENTRAL',
      'DIURETICO_ASA',
      'ISRN',
    ],
    tooltip:
      'Disponible si se marca agonista beta3, AINE, alfabloqueante, antiagregante, anticoagulante, antihipertensivo central, diurético de asa o ISRN',
  },
  'HTA moderada': {
    // STOPP-H2: AINE; STOPP-K9: ALFABLOQUEANTE; STOPP-B10: DIURETICO_ASA; STOPP-B1: ANTIHIPERTENSIVO_CENTRAL
    classes: ['AINE', 'ALFABLOQUEANTE', 'ANTIHIPERTENSIVO_CENTRAL', 'DIURETICO_ASA'],
    tooltip:
      'Disponible si se marca AINE, alfabloqueante, antihipertensivo central o diurético de asa',
  },
  'Riesgo de caídas de repetición': {
    // STOPP-K8-PSICOTROPICO: PSICOTROPICO (lógica+); STOPP-K11: ANTIHIPERTENSIVO_CENTRAL (lógica+)
    // STOPP-K8-PSICOTROPICO excludes: ANTIDEPRESIVO_TRICICLICO e ISRN (venían solo de excludes)
    classes: ['ANTIDEPRESIVO_TRICICLICO', 'ANTIHIPERTENSIVO_CENTRAL', 'ISRN', 'PSICOTROPICO'],
    tooltip:
      'Disponible si se marca antidepresivo tricíclico, antihipertensivo central, ISRN o psicotrópico',
  },
  'Riesgo significativo de sangrado': {
    // STOPP-C2-AAS: AAS (lógica+); STOPP-D7: ISRS (lógica+)
    // STOPP-C2-ANTIAGREGANTE y C2-AVK: ANTIAGREGANTE/ANTICOAGULANTE (venían solo de excludes de C2-AAS)
    classes: ['AAS', 'ANTIAGREGANTE', 'ANTICOAGULANTE', 'ISRS'],
    tooltip:
      'Disponible si se marca AAS, antiagregante (Clopidogrel, etc.), anticoagulante o ISRS',
  },
  'Taquiarritmias supraventriculares': {
    classes: ['ANTIARITMICO'],
    tooltip: 'Disponible si se marca un antiarrítmico (Amiodarona)',
  },
  'Estenosis aórtica grave sintomática': {
    classes: [
      'BETABLOQUEANTE',
      'ANTIHIPERTENSIVO_CENTRAL',
      'DIURETICO_ASA',
      'DIURETICO_TIAZIDICO',
      'ALFABLOQUEANTE',
    ],
    tooltip:
      'Disponible si se marca betabloqueante, antihipertensivo central, diurético de asa, tiazida o alfabloqueante',
  },
  'Insuficiencia cardíaca grave': {
    classes: ['INHIBIDOR_PDE5', 'NITRATO'],
    tooltip: 'Disponible si se marca inhibidor PDE5 (Sildenafilo, Tadalafilo) o un nitrato',
  },
  'Intervalo QTc prolongado': {
    classes: [
      'ANTIDEPRESIVO_TRICICLICO',
      'DIGOXINA',
      'NEUROLEPTICO',
      'ISRS',
      'PROLONGADOR_QTC',
      'ANTIARITMICO',
    ],
    tooltip:
      'Disponible si se marca tricíclico, Digoxina, neuroléptico, ISRS, prolongador del QTc o antiarrítmico',
  },
};
