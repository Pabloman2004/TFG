# Checklist — prueba manual criterios Sistema cardiovascular

Fuente: `criteria.json` (45 criterios). Tabs según `medications-taxonomy.ts` y `diagnoses-taxonomy.ts`.

Formato: `N. ID — resumen — Para que salte: …` con **[tab …]** en cada fármaco y dx.

Leyenda tabs meds: tab principal (+ tabs adicionales si aplica). Grupos unitarios pueden estar en **Otros** si no hay relevancia/dx habilitante.

Leyenda tabs dx: tab de diagnósticos en la UI (`Otros (Sistema)` = subgrupo dentro del tab Otros).

---

## Sistema cardiovascular

*(STOPP: 34 | START: 11)*

### STOPP

1. STOPP-B1-DIGOXINA — Evitar digoxina en pacientes con insuficiencia cardíaca con función sistólica vent… — Para que salte: marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) + dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular]

2. STOPP-B10-DIURETICO-ASA-INCONTINENCIA — Evitar diuréticos de asa para el tratamiento de la HTA cuando existe incontinencia… — Para que salte: marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA) + (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular]) + dx **Incontinencia urinaria** [tab Urológico]

3. STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS — Evitar antihipertensivos de acción central (metildopa, clonidina, moxonidina, rilm… — Para que salte: marcar **Metildopa** [tab Cardiovascular] (clase ANTIHIPERTENSIVO_CENTRAL) + (dx **HTA** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular]) [y NO marcar dx **Intolerancia/fallo a otros antihipertensivos** [tab Cardiovascular]]

4. STOPP-B12-ARA2-HIPERPOTASEMIA — Evitar ARA-II en presencia de hiperpotasemia significativa (Potasio sérico > 5.5 m… — Para que salte: marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) + (dx **Hiperpotasemia** [tab Metabólico] | K+=null (lab — sin pantalla UI) + K+=5.6 (lab — sin pantalla UI))

5. STOPP-B12-IECA-HIPERPOTASEMIA — Evitar IECA en presencia de hiperpotasemia significativa (Potasio sérico > 5.5 mmo… — Para que salte: marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) + (dx **Hiperpotasemia** [tab Metabólico] | K+=null (lab — sin pantalla UI) + K+=5.6 (lab — sin pantalla UI))

6. STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO — Evitar uso de antagonistas de la aldosterona (espironolactona, eplerenona) con fár… — Para que salte: marcar **Espironolactona** [tab Cardiovascular + Renal] (clase ANTAGONISTA_ALDOSTERONA) + (marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) | marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) | marcar **Amilorida** [tab Renal] (clase DIURETICO_AHORRADOR_POTASIO))

7. STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO — Evitar uso de ARA-II con diuréticos ahorradores de potasio (amilorida, triamtereno… — Para que salte: marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) + marcar **Amilorida** [tab Renal] (clase DIURETICO_AHORRADOR_POTASIO)

8. STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO — Evitar uso de IECA con diuréticos ahorradores de potasio (amilorida, triamtereno, … — Para que salte: marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) + marcar **Amilorida** [tab Renal] (clase DIURETICO_AHORRADOR_POTASIO)

9. STOPP-B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION — Evitar inhibidores de la fosfodiesterasa 5 (sildenafilo, tadalafilo, vardenafilo) … — Para que salte: marcar **Sildenafilo** [tab Urológico] (clase INHIBIDOR_PDE5) + dx **Insuficiencia cardíaca grave** [tab Cardiovascular] + (dx **Hipotensión sintomática** [tab Cardiovascular] | PAS=null (lab — sin pantalla UI) + PAS=89 (lab — sin pantalla UI))

10. STOPP-B14-INHIBIDOR-PDE5-NITRATOS — Evitar uso de inhibidores de la fosfodiesterasa 5 (sildenafilo, tadalafilo, varden… — Para que salte: marcar **Sildenafilo** [tab Urológico] (clase INHIBIDOR_PDE5) + marcar **Isosorbide** [tab Cardiovascular] (clase NITRATO)

11. STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO — Evitar fármacos que prolongan el intervalo QTc (quinolonas, macrólidos, ondansetró… — Para que salte: marcar **Ciprofloxacino** [tab Antiinfecciosos] (clase PROLONGADOR_QTC) + (dx **Intervalo QTc prolongado** [tab Cardiovascular] | QTc=null (lab — sin pantalla UI) + QTc=450 (lab — sin pantalla UI))

12. STOPP-B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO — Evitar estatinas como prevención primaria cardiovascular en pacientes ≥ 85 años co… — Para que salte: marcar **Atorvastatina** [tab Endocrino/Metabólico] (clase ESTATINA) + edad ≥ 85 (campo paciente — sin pantalla UI) + dx **Fragilidad** [tab Otros (Geriátrico)] [y NO marcar dx **Enfermedad cardiovascular establecida** [tab Cardiovascular]]

13. STOPP-B17-AINE-ENFERMEDAD-VASCULAR — Evitar AINEs en pacientes con enfermedad vascular (coronaria, cerebral, periférica… — Para que salte: marcar **Ibuprofeno** [tab Osteo/Músculo-esq.] (clase AINE) + (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular] | dx **Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica** [tab Cardiovascular])

14. STOPP-B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR — Evitar neurolépticos en pacientes con enfermedad vascular coronaria, cerebral o pe… — Para que salte: marcar **Haloperidol** [tab SNC] (clase NEUROLEPTICO) + (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular] | dx **Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica** [tab Cardiovascular])

15. STOPP-B19-AINE-INSUFICIENCIA-CARDIACA — Evitar AINEs o corticoides en pacientes con insuficiencia cardíaca que requiera di… — Para que salte: marcar **Ibuprofeno** [tab Osteo/Músculo-esq.] (clase AINE) + (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular]) + marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA)

16. STOPP-B19-CORTICOIDE-SISTEMICO-IC — Evitar corticoides sistémicos en pacientes con insuficiencia cardíaca que requiera… — Para que salte: marcar **Prednisona** [tab Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular]) + marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA)

17. STOPP-B2-VERAPAMILO-IC-NYHA — Evitar verapamilo/diltiazem en insuficiencia cardíaca grado III o IV de la NYHA. P… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular]

18. STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA — Evitar antihipertensivos (diuréticos, antihipertensivos centrales, alfabloqueantes… — Para que salte: marcar **Metildopa** [tab Cardiovascular] (clase ANTIHIPERTENSIVO_CENTRAL) + dx **Estenosis aórtica grave sintomática** [tab Cardiovascular]

19. STOPP-B20-BETABLOQUEANTE-ESTENOSIS-AORTICA — Evitar betabloqueantes en pacientes con estenosis aórtica grave sintomática. Riesg… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + dx **Estenosis aórtica grave sintomática** [tab Cardiovascular]

20. STOPP-B21-DIGOXINA-FA — Evitar digoxina como primera línea en FA a largo plazo (> 3 meses). Asociada a may… — Para que salte: dx **FA** [tab Cardiovascular] + marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA)

21. STOPP-B3-VERAPAMILO-BETABLOQUEANTES — Evitar uso concomitante de verapamilo/diltiazem con betabloqueantes. Riesgo de blo… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE)

22. STOPP-B4-BETABLOQUEANTE-BRADICARDIA — Evitar betabloqueantes en pacientes con bradicardia (< 50 lpm). Riesgo de hipotens… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + (dx **Bradicardia** [tab Cardiovascular] | FC=null (lab — sin pantalla UI) + FC=49 (lab — sin pantalla UI))

23. STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO — Evitar digoxina en pacientes con bloqueo cardíaco (2º grado o completo). Riesgo de… — Para que salte: marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) + (dx **Bloqueo AV de segundo grado** [tab Cardiovascular] | dx **Bloqueo AV completo** [tab Cardiovascular])

24. STOPP-B4-DIGOXINA-BRADICARDIA — Evitar digoxina en pacientes con bradicardia (< 50 lpm). Riesgo de hipotensión gra… — Para que salte: marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) + (dx **Bradicardia** [tab Cardiovascular] | FC=null (lab — sin pantalla UI) + FC=49 (lab — sin pantalla UI))

25. STOPP-B4-VERAPAMILO-BLOQUEO-CARDIACO — Evitar verapamilo/diltiazem en pacientes con bloqueo cardíaco (2º grado o completo… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + (dx **Bloqueo AV de segundo grado** [tab Cardiovascular] | dx **Bloqueo AV completo** [tab Cardiovascular])

26. STOPP-B4-VERAPAMILO-BRADICARDIA — Evitar verapamilo/diltiazem en pacientes con bradicardia (< 50 lpm). Riesgo de hip… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + (dx **Bradicardia** [tab Cardiovascular] | FC=null (lab — sin pantalla UI) + FC=49 (lab — sin pantalla UI))

27. STOPP-B5-BETABLOQUEANTE-HTA-NO-COMPLICADA — Evitar betabloqueantes en HTA no complicada. No hay evidencia sólida de su eficaci… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular])

28. STOPP-B6-AMIODARONA-TAQUIARRITMIA-PRIMERA-LINEA — Evitar amiodarona como primera línea en taquiarritmias supraventriculares. Mayor r… — Para que salte: marcar **Amiodarona** [tab Cardiovascular] (clase ANTIARITMICO) + dx **Taquiarritmias supraventriculares** [tab Cardiovascular]

29. STOPP-B7-DIURETICO-ASA-PRIMERA-LINEA-HTA — Evitar diuréticos de asa como tratamiento de primera línea de la HTA. Existen alte… — Para que salte: marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA) + (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular]) + (NO marcar dx **Insuficiencia cardíaca** [tab Cardiovascular] | NO marcar dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | NO marcar dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular])

30. STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES — Evitar diuréticos de asa en edemas maleolares sin evidencia clínica, bioquímica o … — Para que salte: marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA) + dx **Edemas maleolares** [tab Otros (Síntoma)] + (NO marcar dx **Insuficiencia cardíaca** [tab Cardiovascular] | NO marcar dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | NO marcar dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular] | NO marcar dx **Insuficiencia hepática** [tab Otros (Hepático)] | NO marcar dx **Insuficiencia renal** [tab Renal] | NO marcar dx **Síndrome nefrótico** [tab Renal])

31. STOPP-B9-TIAZIDA-GOTA — Evitar diuréticos tiazídicos en pacientes con antecedentes de gota. Las tiazidas p… — Para que salte: marcar **Hidroclorotiazida** [tab Cardiovascular] (clase DIURETICO_TIAZIDICO) + (dx **Gota activa** [tab Reumatológico] | dx **Gota recurrente** [tab Reumatológico] | dx **Antecedentes de gota** [tab Reumatológico])

32. STOPP-B9-TIAZIDA-HIPERCALCEMIA — Evitar diuréticos tiazídicos en presencia de hipercalcemia significativa (Calcio s… — Para que salte: marcar **Hidroclorotiazida** [tab Cardiovascular] (clase DIURETICO_TIAZIDICO) + (dx **Hipercalcemia** [tab Metabólico] | Ca corr.=null (lab — sin pantalla UI) + Ca corr.=2.75 (lab — sin pantalla UI))

33. STOPP-B9-TIAZIDA-HIPONATREMIA — Evitar diuréticos tiazídicos en presencia de hiponatremia significativa (Sodio sér… — Para que salte: marcar **Hidroclorotiazida** [tab Cardiovascular] (clase DIURETICO_TIAZIDICO) + (dx **Hiponatremia** [tab Metabólico] | Na+=null (lab — sin pantalla UI) + Na+=129.9 (lab — sin pantalla UI))

34. STOPP-B9-TIAZIDA-HIPOPOTASEMIA — Evitar diuréticos tiazídicos en presencia de hipopotasemia significativa (Potasio … — Para que salte: marcar **Hidroclorotiazida** [tab Cardiovascular] (clase DIURETICO_TIAZIDICO) + (dx **Hipopotasemia** [tab Metabólico] | K+=null (lab — sin pantalla UI) + K+=2.9 (lab — sin pantalla UI))

### START

1. START-B1-ANTIHIPERTENSIVO-HTA — Considerar iniciar antihipertensivo. El paciente tiene HTA y no está recibiendo tr… — Para que salte: (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular] | PAS=null (lab — sin pantalla UI) + PAS=141 (lab — sin pantalla UI) | PAD=null (lab — sin pantalla UI) + PAD=91 (lab — sin pantalla UI)) [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA); y NO marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2); y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE); y NO marcar **Hidroclorotiazida** [tab Cardiovascular] (clase DIURETICO_TIAZIDICO); y NO marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP); y NO marcar **Metildopa** [tab Cardiovascular] (clase ANTIHIPERTENSIVO_CENTRAL)]

2. START-B10-BETABLOQUEANTE-FA-MAL-CONTROL — Considerar iniciar betabloqueante. El paciente tiene FA crónica con mal control de… — Para que salte: dx **FA** [tab Cardiovascular] + dx **Fibrilación auricular crónica con mal control de frecuencia cardíaca** [tab Cardiovascular] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE)]

3. START-B11-HIERRO-IV-IC-DEFICIT-HIERRO — Considerar hierro intravenoso. El paciente tiene IC con FE reducida y déficit de h… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + dx **Déficit de hierro** [tab Hematológico] [y NO marcar **Hierro carboximaltosa IV** [tab Renal] (clase HIERRO_IV)]

4. START-B2-ESTATINA-ENFERMEDAD-VASCULAR — Considerar iniciar estatina. El paciente tiene enfermedad vascular establecida (co… — Para que salte: (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular] | dx **Enfermedad cardiovascular establecida** [tab Cardiovascular]) [y NO marcar **Atorvastatina** [tab Endocrino/Metabólico] (clase ESTATINA)]

5. START-B3-IECA-CARDIOPATIA-ISQUEMICA — Considerar iniciar IECA. El paciente tiene cardiopatía isquémica y no recibe IECA. — Para que salte: dx **Cardiopatía isquémica** [tab Cardiovascular] [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA)]

6. START-B4-BETABLOQUEANTE-CARDIOPATIA-ISQUEMICA — Considerar iniciar betabloqueante. El paciente tiene cardiopatía isquémica sintomá… — Para que salte: dx **Cardiopatía isquémica** [tab Cardiovascular] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE)]

7. START-B5-IECA-IC-FE-REDUCIDA — Considerar iniciar IECA (o ARA-II si no tolerado). El paciente tiene insuficiencia… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA); y NO marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2); y NO marcar **Sacubitrilo/Valsartán** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase SACUBITRILO_VALSARTAN)]

8. START-B6-BETABLOQUEANTE-IC-FE-REDUCIDA — Considerar iniciar betabloqueante cardioselectivo (bisoprolol, nebivolol, metoprol… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE_CARDIOSELECTIVO); y NO marcar **Carvedilol** [tab Cardiovascular] (clase BETABLOQUEANTE_NO_CARDIOSELECTIVO)]

9. START-B7-ANTAGONISTA-ALDOSTERONA-IC — Considerar iniciar antagonista de aldosterona (espironolactona, eplerenona). El pa… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + (TFGe=null (lab — sin pantalla UI) | TFGe=31 (lab — sin pantalla UI)) [y NO marcar **Espironolactona** [tab Cardiovascular + Renal] (clase ANTAGONISTA_ALDOSTERONA)]

10. START-B8-ISGLT2-INSUFICIENCIA-CARDIACA — Considerar iniciar iSGLT2 (canagliflozina, dapagliflozina, empagliflozina, ertugli… — Para que salte: (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular]) [y NO marcar **Canagliflozina** [tab Cardiovascular + Endocrino/Metabólico + Renal] (clase ISGLT2)]

11. START-B9-SACUBITRILO-VALSARTAN-IC — Considerar sacubitrilo/valsartán en IC con FE reducida sintomática pese a tratamie… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + (marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) | marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2)) [y NO marcar **Sacubitrilo/Valsartán** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase SACUBITRILO_VALSARTAN)]

---

## Totales

| Tipo | Cantidad |
|------|----------|
| STOPP | 34 |
| START | 11 |
| **Total** | **45** |

## OJO / casos difíciles solo con selección UI

- **Edad** y **labs**: sin pantalla; importar JSON.
- **Digoxina** [tab Cardiovascular]: grupo unitario — puede requerir dx/relevancia previa, o buscar en **Otros**.
- **Ondansetrón** [tab Gastrointestinal + Cardiovascular]: grupo unitario; si no visible → **Otros**.
- **Duplicidades** (`multiple*`): ≥2 fármacos de la misma clase.
- **START**: disparan cuando **NO** está el fármaco.
- **Dx foráneos**: algunos dx de un tab aparecen como grupo foráneo en otro tab si un criterio los referencia.
