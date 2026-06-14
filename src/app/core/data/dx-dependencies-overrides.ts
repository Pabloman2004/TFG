// Overrides clínicos del piloto cardiovascular y casos donde la derivación pura
// desde criteria.json no reproduce el comportamiento curado manualmente.

import { DxTrigger } from './dx-dependencies';

export const DX_DEPENDENCIES_OVERRIDES: Record<string, DxTrigger> = {
  'Insuficiencia cardíaca con función sistólica conservada': {
    classes: ['DIGOXINA', 'DIURETICO_ASA', 'AINE', 'CORTICOIDE_SISTEMICO'],
    tooltip: 'Disponible si se marca Digoxina, diurético de asa, AINE o corticoide sistémico',
  },
  'Insuficiencia cardíaca NYHA III-IV': {
    classes: [
      'ANTIARITMICO',
      'CALCIOANTAGONISTA_NO_DHP',
      'DIURETICO_ASA',
      'AINE',
      'CORTICOIDE_SISTEMICO',
    ],
    tooltip:
      'Disponible si se marca antiarrítmico (Dronedarona), Verapamilo/Diltiazem, diurético de asa, AINE o corticoide sistémico',
  },
  Bradicardia: {
    classes: ['BETABLOQUEANTE', 'CALCIOANTAGONISTA_NO_DHP', 'DIGOXINA'],
    tooltip: 'Disponible si se marca betabloqueante, Verapamilo/Diltiazem o Digoxina',
  },
  'Bloqueo AV de segundo grado': {
    classes: ['DIGOXINA', 'CALCIOANTAGONISTA_NO_DHP'],
    tooltip: 'Disponible si se marca Digoxina o Verapamilo/Diltiazem',
  },
  'Bloqueo AV completo': {
    classes: ['DIGOXINA', 'CALCIOANTAGONISTA_NO_DHP'],
    tooltip: 'Disponible si se marca Digoxina o Verapamilo/Diltiazem',
  },
  'HTA no complicada': {
    classes: ['BETABLOQUEANTE', 'DIURETICO_ASA', 'ANTIHIPERTENSIVO_CENTRAL', 'ANTIARITMICO'],
    tooltip:
      'Disponible si se marca betabloqueante, diurético de asa, antihipertensivo central o Amiodarona',
  },
  'HTA grave': {
    classes: ['DIURETICO_ASA', 'ANTIHIPERTENSIVO_CENTRAL'],
    tooltip: 'Disponible si se marca diurético de asa o antihipertensivo central',
  },
  'HTA moderada': {
    classes: ['DIURETICO_ASA', 'ANTIHIPERTENSIVO_CENTRAL'],
    tooltip: 'Disponible si se marca diurético de asa o antihipertensivo central',
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
