# Checklist — prueba manual de TODOS los criterios

Fuente: `criteria.json` (222 criterios). Tabs según `medications-taxonomy.ts` y `diagnoses-taxonomy.ts`.

Formato: `N. ID — resumen — Para que salte: …` con **[tab …]** en cada fármaco y dx.

Leyenda tabs meds: tab principal (+ tabs adicionales si aplica). Grupos unitarios pueden estar en **Otros** si no hay relevancia/dx habilitante.

Leyenda tabs dx: tab de diagnósticos en la UI (`Otros (Sistema)` = subgrupo dentro del tab Otros).

---

## Analgésicos

*(STOPP: 6 | START: 3)*

### STOPP

1. STOPP-L1-OPIOIDE-DOLOR-LEVE — Evitar opioides potentes (morfina, oxicodona, fentanilo, buprenorfina, metadona, t… — Para que salte: marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) + (dx **Dolor leve** [tab Otros (Sintomático)] | dx **Dolor leve-moderado** [tab Otros (Sintomático)])

2. STOPP-L2-OPIOIDE-SIN-LAXANTE — Evitar opioides en uso habitual sin asociar laxantes de forma concomitante. Riesgo… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) [y NO marcar **Lactulosa** [tab Gastrointestinal] (clase LAXANTE)]

3. STOPP-L3-OPIOIDE-PROLONGADO-SIN-RAPIDO — Evitar opioides de acción prolongada sin asociar opioides de acción rápida disponi… — Para que salte: marcar **Morfina LP** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE_LP) + dx **Dolor moderado-grave** [tab Otros (Sintomático)] [y NO marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE_RAPIDO)]

4. STOPP-L4-LIDOCAINA-TOPICA-ARTROSIS — Evitar parche de lidocaína tópica para el tratamiento del dolor crónico de la artr… — Para que salte: marcar **Lidocaína parche** [tab Otros] (clase ANESTESICO_TOPICO) + dx **Artrosis** [tab Reumatológico]

5. STOPP-L5-GABAPENTINOIDE-DOLOR-NO-NEUROPATICO — Evitar gabapentinoides (gabapentina, pregabalina) para el tratamiento del dolor no… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Gabapentina** [tab Osteo/Músculo-esq. + SNC] (clase GABAPENTINOIDE) [y NO marcar dx **Dolor neuropático** [tab Neurológico]]

6. STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA — Revisar paracetamol en pacientes malnutridos (IMC < 18) o con hepatopatía crónica:… — Para que salte: marcar **Paracetamol** [tab Osteo/Músculo-esq. (grupo unitario; si no visible → Otros)] (clase ANALGESICO_SIMPLE) + (dx **Hepatopatía crónica** [tab Otros (Hepático)] | dx **Malnutrición** [tab Metabólico])

### START

1. START-K1-OPIOIDE-DOLOR-MODERADO-GRAVE — Considerar opioide potente para dolor moderado-grave no artrósico. El paracetamol … — Para que salte: dx **Dolor moderado-grave** [tab Otros (Sintomático)] [y NO marcar dx **Artrosis** [tab Reumatológico]; y NO marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE)]

2. START-K2-LAXANTE-CON-OPIOIDE — Considerar iniciar laxante. El paciente recibe opioides de forma regular y no tien… — Para que salte: marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) [y NO marcar **Lactulosa** [tab Gastrointestinal] (clase LAXANTE)]

3. START-K3-LIDOCAINA-TOPICA-DOLOR-NEUROPATICO — Considerar parche de lidocaína tópica al 5% para dolor neuropático localizado (p. … — Para que salte: (dx **Neuralgia postherpética** [tab Neurológico] | dx **Dolor neuropático** [tab Neurológico]) [y NO marcar **Lidocaína parche** [tab Otros] (clase ANESTESICO_TOPICO)]

---

## Anticoagulantes/Antiagregantes

*(STOPP: 24 | START: 2)*

### STOPP

1. STOPP-C1-AAS-DOSIS-ALTA — Revisar AAS en tratamiento crónico: si se toma a dosis superiores a 100 mg/día hay… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase AAS)

2. STOPP-C10-AINE-ANTICOAGULANTES — Evitar AINEs en pacientes en tratamiento con anticoagulantes. Riesgo de hemorragia… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)

3. STOPP-C10F3-AINE-ISRS — Evitar AINEs con ISRS. Riesgo incrementado de sangrado gastrointestinal. — Para que salte: marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS) + marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE)

4. STOPP-C10F3-ANTICOAGULANTE-ISRS — Evitar anticoagulantes con ISRS. Riesgo incrementado de sangrado gastrointestinal. — Para que salte: marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS) + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)

5. STOPP-C11-AVK-FA-PRIMERA-LINEA — Evitar antagonistas de la vitamina K como anticoagulantes de primera línea en la F… — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE_AVK) + dx **FA** [tab Cardiovascular] + (TFGe=null (lab — sin pantalla UI) | TFGe=15 (lab — sin pantalla UI)) [y NO marcar dx **Prótesis valvular metálica** [tab Cardiovascular]; y NO marcar dx **Estenosis mitral moderada-grave** [tab Cardiovascular]]

6. STOPP-C12-ISRS-ANTICOAGULANTE-SANGRADO — Evitar ISRS en pacientes con antecedentes de hemorragia grave que utilizan anticoa… — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE) + dx **Antecedentes de sangrado grave** [tab Hematológico]

7. STOPP-C13-VERAPAMILO-INHIBIDORES-TROMBINA — Evitar uso concomitante de verapamilo/diltiazem con inhibidores directos de la tro… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + marcar **Dabigatrán** [tab Anticoagulantes] (clase INHIBIDOR_DIRECTO_TROMBINA)

8. STOPP-C14-ACOD-INHIBIDORES-GLUCOPROTEINA-P — Evitar inhibidores de la glucoproteína P (azitromicina, claritromicina, eritromici… — Para que salte: marcar **Apixaban** [tab Anticoagulantes] (clase ANTICOAGULANTE_DIRECTO) + marcar **Azitromicina** [tab Antibióticos + Cardiovascular] (clase INHIBIDOR_GLUCOPROTEINA_P)

9. STOPP-C14-AMIODARONA-AOD — Evitar uso conjunto de amiodarona con anticoagulantes orales directos (Apixaban, D… — Para que salte: marcar **Amiodarona** [tab Cardiovascular] (clase ANTIARITMICO) + marcar **Apixaban** [tab Anticoagulantes] (clase ANTICOAGULANTE_DIRECTO)

10. STOPP-C14-VERAPAMILO-INHIBIDORES-GLUCOPROTEINA-P — Evitar uso concomitante de verapamilo/diltiazem con inhibidores de la glucoproteín… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + marcar **Apixaban** [tab Anticoagulantes] (clase ANTICOAGULANTE_DIRECTO)

11. STOPP-C15-ANDROGENOS-TROMBOEMBOLISMO-VENOSO — Evitar andrógenos en pacientes con antecedentes de tromboembolismo venoso. Aumento… — Para que salte: marcar **Testosterona** [tab Otros] (clase ANDROGENO) + dx **Antecedentes de tromboembolismo venoso** [tab Hematológico]

12. STOPP-C16-AAS-PREVENCION-PRIMARIA — Evitar AAS en prevención primaria cardiovascular (sin enfermedad cardiovascular es… — Para que salte: marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase AAS) [y NO marcar dx **Enfermedad cardiovascular establecida** [tab Cardiovascular]; y NO marcar dx **Enfermedad vascular coronaria** [tab Cardiovascular]; y NO marcar dx **Angina de pecho** [tab Cardiovascular]; y NO marcar dx **Enfermedad vascular cerebral** [tab Cardiovascular]; y NO marcar dx **Enfermedad vascular periférica** [tab Cardiovascular]]

13. STOPP-C2-AAS-RIESGO-SANGRADO — Evitar antiagregantes y anticoagulantes en pacientes con riesgo significativo de s… — Para que salte: marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase AAS) + dx **Riesgo significativo de sangrado** [tab Hematológico]

14. STOPP-C2-ANTIAGREGANTE-RIESGO-SANGRADO — Evitar antiagregantes plaquetarios en pacientes con riesgo significativo de sangra… — Para que salte: marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE) + (dx **HTA grave** [tab Cardiovascular] | dx **Diátesis hemorrágica** [tab Hematológico])

15. STOPP-C2-AVK-RIESGO-SANGRADO — Evitar antagonistas de vitamina K en pacientes con riesgo significativo de sangrad… — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE) + (dx **HTA grave** [tab Cardiovascular] | dx **Diátesis hemorrágica** [tab Hematológico])

16. STOPP-C3-AAS-CLOPIDOGREL-ICTUS — Evitar AAS más clopidogrel para la prevención secundaria del ictus durante más de … — Para que salte: dx **Ictus previo** [tab Neurológico] + marcar 2 antiagregantes (p. ej. **Ácido acetilsalicílico** [tab Anticoagulantes] + **Clopidogrel** [tab Anticoagulantes])

17. STOPP-C4-ANTICOAGULANTE-ANTIAGREGANTE-FA — Evitar añadir anticoagulantes con antiagregantes plaquetarios en FA crónica. La co… — Para que salte: dx **FA** [tab Cardiovascular] + marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE) + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)

18. STOPP-C5-ANTIAGREGANTE-ANTICOAGULANTE-VASCULAR-ESTABLE — Evitar la combinación de antiagregantes plaquetarios con anticoagulantes en enferm… — Para que salte: (dx **Enfermedad vascular estable** [tab Cardiovascular] | dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular]) + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE) + marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE)

19. STOPP-C5-ARA2-ENFERMEDAD-VASCULAR-ESTABLE — Evitar ARA-II en enfermedad vascular estable sin indicación clara. El tratamiento … — Para que salte: marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) + dx **Enfermedad vascular estable sin indicación clara** [tab Cardiovascular] + (NO marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE) | NO marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE))

20. STOPP-C5-IECA-ENFERMEDAD-VASCULAR-ESTABLE — Evitar IECA en enfermedad vascular estable sin indicación clara. El tratamiento co… — Para que salte: marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) + dx **Enfermedad vascular estable sin indicación clara** [tab Cardiovascular] + (NO marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE) | NO marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE))

21. STOPP-C6-TICLOPIDINA-OBSOLETA — Evitar ticlopidina en cualquier circunstancia. El clopidogrel y el prasugrel tiene… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Ticlopidina** [tab Anticoagulantes] (clase TICLOPIDINA)

22. STOPP-C7-ANTIAGREGANTE-FA-SIN-ANTICOAGULANTE — Evitar antiagregantes como alternativa a los anticoagulantes en la FA crónica. No … — Para que salte: dx **FA** [tab Cardiovascular] + marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE) [y NO marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)]

23. STOPP-C8-ANTICOAGULANTE-TVP-PRIMER-EPISODIO — Evitar anticoagulantes (AVK/ACOD) para un primer episodio de TVP durante más de 6 … — Para que salte: dx **TVP primer episodio sin factores persistentes** [tab Hematológico] + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)

24. STOPP-C9-ANTICOAGULANTE-TEP-PRIMER-EPISODIO — Evitar anticoagulantes (AVK/ACOD) para un primer episodio de TEP durante más de 6 … — Para que salte: dx **TEP primer episodio sin factores persistentes** [tab Hematológico] + marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)

### START

1. START-C1-ANTICOAGULANTE-FA — Considerar iniciar anticoagulante (ACOD preferentemente o AVK). El paciente tiene … — Para que salte: (dx **FA** [tab Cardiovascular] | dx **FA paroxística** [tab Cardiovascular]) [y NO marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)]

2. START-C2-ANTIAGREGANTE-ENFERMEDAD-VASCULAR — Considerar iniciar antiagregante (AAS, clopidogrel, prasugrel o ticagrelor). El pa… — Para que salte: (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular] | dx **Cardiopatía isquémica** [tab Cardiovascular] | dx **Ictus previo** [tab Neurológico]) [y NO marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase ANTIAGREGANTE); y NO marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE)]

---

## Carga antimuscarínica/anticolinérgica

*(STOPP: 2 | START: 0)*

### STOPP

1. STOPP-M1-ADT-ANTICOLINERGICOS — Evitar uso concomitante de antidepresivos tricíclicos con otros fármacos anticolin… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + marcar 2 anticolinérgicos (p. ej. **Oxibutinina** [tab Urológico] + **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC])

2. STOPP-M1-NEUROLEPTICO-ANTICOLINERGICOS — Evitar uso concomitante de neurolépticos anticolinérgicos con otros fármacos antic… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + marcar 2 anticolinérgicos (p. ej. **Oxibutinina** [tab Urológico] + **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC])

---

## Indicación de la medicación

*(STOPP: 8 | START: 0)*

### STOPP

1. STOPP-A3-AINE-DUPLICIDAD — Evitar uso simultáneo de dos AINEs. Duplicidad innecesaria, aumenta riesgo de efec… — Para que salte: marcar 2 AINEs distintos (p. ej. **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] + **Naproxeno** [tab Cardiovascular + Osteo/Músculo-esq.])

2. STOPP-A3-ANTAGONISTA-ALDOSTERONA-DUPLICIDAD — Evitar uso concomitante de dos antagonistas de la aldosterona. Duplicidad innecesa… — Para que salte: marcar 2 antag. aldosterona (p. ej. **Espironolactona** [tab Cardiovascular + Renal] + **Eplerenona** [tab Cardiovascular + Renal])

3. STOPP-A3-ARA2-DUPLICIDAD — Evitar uso concomitante de dos ARA-II. Duplicidad innecesaria; no prescribir dos A… — Para que salte: marcar 2 ARA-II (p. ej. **Valsartán** [tab Cardiovascular + Renal] + **Losartán** [tab Cardiovascular + Renal])

4. STOPP-A3-DIURETICO-AHORRADOR-POTASIO-DUPLICIDAD — Evitar uso concomitante de dos o más diuréticos ahorradores de potasio (amilorida,… — Para que salte: marcar 2 ahorradores K+ (p. ej. **Amilorida** [tab Cardiovascular + Renal] + **Triamtereno** [tab Cardiovascular + Renal])

5. STOPP-A3-DIURETICO-ASA-USO-CONCOMITANTE — Evitar uso concomitante de dos diuréticos de asa. No se deben prescribir dos fárma… — Para que salte: marcar 2 diuréticos de asa (p. ej. **Furosemida** [tab Cardiovascular + Renal] + **Torasemida** [tab Cardiovascular + Renal])

6. STOPP-A3-IECA-DUPLICIDAD — Evitar uso concomitante de dos IECA. Duplicidad innecesaria; no prescribir dos IEC… — Para que salte: marcar 2 IECA (p. ej. **Enalapril** [tab Cardiovascular + Renal] + **Ramipril** [tab Cardiovascular + Renal])

7. STOPP-A3-ISRS-DUPLICIDAD — Evitar el uso simultáneo de dos fármacos de la clase ISRS (ej. Sertralina + Fluoxe… — Para que salte: marcar 2 ISRS (p. ej. **Sertralina** [tab Cardiovascular + SNC] + **Fluoxetina** [tab Cardiovascular + SNC])

8. STOPP-A3-TIAZIDA-USO-CONCOMITANTE — Evitar uso concomitante de dos diuréticos tiazídicos. Duplicidad innecesaria; se d… — Para que salte: marcar 2 tiazídicos (p. ej. **Hidroclorotiazida** [tab Cardiovascular] + **Indapamida** [tab Cardiovascular])

---

## Riesgo de caídas

*(STOPP: 14 | START: 0)*

### STOPP

1. STOPP-K1-BENZODIACEPINA-CAIDAS — Evitar benzodiacepinas en pacientes con caídas de repetición. Pueden reducir el ni… — Para que salte: marcar **Diazepam** [tab SNC] (clase BENZODIACEPINA) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

2. STOPP-K10-ALFABLOQUEANTE-PROSTATICO-CAIDAS — Evitar bloqueantes alfa-1-adrenérgicos (exceptuando silodosina) para síntomas pros… — Para que salte: marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE) + dx **Caídas de repetición** [tab Otros (Geriátrico)] + dx **Hiperplasia benigna de próstata** [tab Urológico]

3. STOPP-K11-ANTIHIPERTENSIVO-CENTRAL-CAIDAS — Evitar antihipertensivos de acción central en pacientes con riesgo de caídas de re… — Para que salte: marcar **Metildopa** [tab Cardiovascular] (clase ANTIHIPERTENSIVO_CENTRAL) + dx **Riesgo de caídas de repetición** [tab Otros (Síntoma)]

4. STOPP-K12-ANTIMUSCARÍNICO-VEJIGA-CAIDAS — Evitar antimuscarínicos para la vejiga hiperactiva o incontinencia urinaria de urg… — Para que salte: marcar **Oxibutinina** [tab Urológico] (clase ANTIESPASMÓDICO_URINARIO) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

5. STOPP-K2-NEUROLEPTICO-CAIDAS — Evitar neurolépticos en pacientes con caídas de repetición. Pueden causar parkinso… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

6. STOPP-K3-VASODILATADOR-CAIDAS-HIPOTENSION — Evitar vasodilatadores (nitratos, alfabloqueantes, inhibidores PDE5) en pacientes … — Para que salte: (marcar **Isosorbide** [tab Cardiovascular] (clase NITRATO) | marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE) | marcar **Sildenafilo** [tab Cardiovascular + Urológico] (clase INHIBIDOR_PDE5)) + dx **Caídas de repetición** [tab Otros (Geriátrico)] + dx **Hipotensión ortostática** [tab Cardiovascular]

7. STOPP-K4-ADT-CAIDAS — Evitar antidepresivos tricíclicos en pacientes con caídas de repetición. Pueden re… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

8. STOPP-K4-HIPNOTICO-Z-CAIDAS — Evitar hipnóticos-Z (zopiclona, zolpidem, zaleplon) en pacientes con caídas de rep… — Para que salte: marcar **Zolpidem** [tab SNC] (clase HIPNOTICO_Z) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

9. STOPP-K5-ANTIEPILÉPTICO-CAIDAS — Evitar antiepilépticos en pacientes con caídas de repetición. Pueden reducir el ni… — Para que salte: marcar **Carbamazepina** [tab SNC] (clase ANTIEPILÉPTICO) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

10. STOPP-K6-ANTIHISTAMINICO-1GEN-CAIDAS — Evitar antihistamínicos de primera generación en pacientes con caídas de repetició… — Para que salte: marcar **Astemizol** [tab Respiratorio] (clase ANTIHISTAMINICO_1GEN) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

11. STOPP-K7-OPIOIDE-CAIDAS — Evitar opioides en pacientes con caídas de repetición. Pueden reducir el nivel de … — Para que salte: marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

12. STOPP-K8-ISRS-CAIDAS — Evitar ISRS e ISRN en pacientes con caídas de repetición. Pueden reducir el nivel … — Para que salte: marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS) + dx **Caídas de repetición** [tab Otros (Geriátrico)]

13. STOPP-K8-PSICOTROPICO-CAIDAS — Evitar psicotrópicos (antidepresivos, litio) en presencia de caídas de repetición.… — Para que salte: marcar **Litio** [tab Cardiovascular + SNC] (clase PSICOTROPICO) + dx **Riesgo de caídas de repetición** [tab Otros (Síntoma)]

14. STOPP-K9-ALFABLOQUEANTE-HTA-CAIDAS — Evitar bloqueantes alfa-1-adrenérgicos como antihipertensivos en pacientes con caí… — Para que salte: marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE) + dx **Caídas de repetición** [tab Otros (Geriátrico)] + (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular])

---

## Sistema cardiovascular

*(STOPP: 34 | START: 11)*

### STOPP

1. STOPP-B1-DIGOXINA — Evitar digoxina en pacientes con insuficiencia cardíaca con función sistólica vent… — Para que salte: marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) + dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular]

2. STOPP-B10-DIURETICO-ASA-INCONTINENCIA — Evitar diuréticos de asa para el tratamiento de la HTA cuando existe incontinencia… — Para que salte: marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA) + (dx **HTA** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular]) + dx **Incontinencia urinaria** [tab Urológico]

3. STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS — Evitar antihipertensivos de acción central (metildopa, clonidina, moxonidina, rilm… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Metildopa** [tab Cardiovascular] (clase ANTIHIPERTENSIVO_CENTRAL) + (dx **HTA** [tab Cardiovascular] | dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular] | dx **HTA no complicada** [tab Cardiovascular]) [y NO marcar dx **Intolerancia/fallo a otros antihipertensivos** [tab Cardiovascular]]

4. STOPP-B12-ARA2-HIPERPOTASEMIA — Evitar ARA-II en presencia de hiperpotasemia significativa (Potasio sérico > 5.5 m… — Para que salte: marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) + (dx **Hiperpotasemia** [tab Metabólico] | K+=null (lab — sin pantalla UI) + K+=5.6 (lab — sin pantalla UI))

5. STOPP-B12-IECA-HIPERPOTASEMIA — Evitar IECA en presencia de hiperpotasemia significativa (Potasio sérico > 5.5 mmo… — Para que salte: marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) + (dx **Hiperpotasemia** [tab Metabólico] | K+=null (lab — sin pantalla UI) + K+=5.6 (lab — sin pantalla UI))

6. STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO — Evitar uso de antagonistas de la aldosterona (espironolactona, eplerenona) con fár… — Para que salte: marcar **Espironolactona** [tab Cardiovascular + Renal] (clase ANTAGONISTA_ALDOSTERONA) + (marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) | marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) | marcar **Amilorida** [tab Cardiovascular + Renal] (clase DIURETICO_AHORRADOR_POTASIO))

7. STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO — Evitar uso de ARA-II con diuréticos ahorradores de potasio (amilorida, triamtereno… — Para que salte: marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2) + marcar **Amilorida** [tab Cardiovascular + Renal] (clase DIURETICO_AHORRADOR_POTASIO)

8. STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO — Evitar uso de IECA con diuréticos ahorradores de potasio (amilorida, triamtereno, … — Para que salte: marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) + marcar **Amilorida** [tab Cardiovascular + Renal] (clase DIURETICO_AHORRADOR_POTASIO)

9. STOPP-B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION — Evitar inhibidores de la fosfodiesterasa 5 (sildenafilo, tadalafilo, vardenafilo) … — Para que salte: marcar **Sildenafilo** [tab Cardiovascular + Urológico] (clase INHIBIDOR_PDE5) + dx **Insuficiencia cardíaca grave** [tab Cardiovascular] + (dx **Hipotensión sintomática** [tab Cardiovascular] | PAS=null (lab — sin pantalla UI) + PAS=89 (lab — sin pantalla UI))

10. STOPP-B14-INHIBIDOR-PDE5-NITRATOS — Evitar uso de inhibidores de la fosfodiesterasa 5 (sildenafilo, tadalafilo, varden… — Para que salte: marcar **Sildenafilo** [tab Cardiovascular + Urológico] (clase INHIBIDOR_PDE5) + marcar **Isosorbide** [tab Cardiovascular] (clase NITRATO)

11. STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO — Evitar fármacos que prolongan el intervalo QTc (quinolonas, macrólidos, ondansetró… — Para que salte: marcar **Ciprofloxacino** [tab Antibióticos + Cardiovascular] (clase PROLONGADOR_QTC) + (dx **Intervalo QTc prolongado** [tab Cardiovascular] | QTc=null (lab — sin pantalla UI) + QTc=450 (lab — sin pantalla UI))

12. STOPP-B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO — Evitar estatinas como prevención primaria cardiovascular en pacientes ≥ 85 años co… — Para que salte: marcar **Atorvastatina** [tab Cardiovascular + Endocrino/Metabólico] (clase ESTATINA) + edad ≥ 85 (campo paciente — sin pantalla UI) + dx **Fragilidad** [tab Otros (Geriátrico)] [y NO marcar dx **Enfermedad cardiovascular establecida** [tab Cardiovascular]]

13. STOPP-B17-AINE-ENFERMEDAD-VASCULAR — Evitar AINEs en pacientes con enfermedad vascular (coronaria, cerebral, periférica… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular])

14. STOPP-B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR — Evitar neurolépticos en pacientes con enfermedad vascular coronaria, cerebral o pe… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular])

15. STOPP-B19-AINE-INSUFICIENCIA-CARDIACA — Evitar AINEs o corticoides en pacientes con insuficiencia cardíaca que requiera di… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular]) + marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA)

16. STOPP-B19-CORTICOIDE-SISTEMICO-IC — Evitar corticoides sistémicos en pacientes con insuficiencia cardíaca que requiera… — Para que salte: marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular] | dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular]) + marcar **Furosemida** [tab Cardiovascular + Renal] (clase DIURETICO_ASA)

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

3. START-B11-HIERRO-IV-IC-DEFICIT-HIERRO — Considerar hierro intravenoso. El paciente tiene IC con FE reducida y déficit de h… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + dx **Déficit de hierro** [tab Hematológico] [y NO marcar **Hierro carboximaltosa IV** [tab Cardiovascular + Renal] (clase HIERRO_IV)]

4. START-B2-ESTATINA-ENFERMEDAD-VASCULAR — Considerar iniciar estatina. El paciente tiene enfermedad vascular establecida (co… — Para que salte: (dx **Enfermedad vascular coronaria** [tab Cardiovascular] | dx **Enfermedad vascular cerebral** [tab Cardiovascular] | dx **Enfermedad vascular periférica** [tab Cardiovascular] | dx **Enfermedad cardiovascular establecida** [tab Cardiovascular]) [y NO marcar **Atorvastatina** [tab Cardiovascular + Endocrino/Metabólico] (clase ESTATINA)]

5. START-B3-IECA-CARDIOPATIA-ISQUEMICA — Considerar iniciar IECA. El paciente tiene cardiopatía isquémica y no recibe IECA. — Para que salte: dx **Cardiopatía isquémica** [tab Cardiovascular] [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA)]

6. START-B4-BETABLOQUEANTE-CARDIOPATIA-ISQUEMICA — Considerar iniciar betabloqueante. El paciente tiene cardiopatía isquémica sintomá… — Para que salte: dx **Cardiopatía isquémica** [tab Cardiovascular] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE)]

7. START-B5-IECA-IC-FE-REDUCIDA — Considerar iniciar IECA (o ARA-II si no tolerado). El paciente tiene insuficiencia… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA); y NO marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2); y NO marcar **Sacubitrilo/Valsartán** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase SACUBITRILO_VALSARTAN)]

8. START-B6-BETABLOQUEANTE-IC-FE-REDUCIDA — Considerar iniciar betabloqueante cardioselectivo (bisoprolol, nebivolol, metoprol… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE_CARDIOSELECTIVO); y NO marcar **Carvedilol** [tab Cardiovascular] (clase BETABLOQUEANTE_NO_CARDIOSELECTIVO)]

9. START-B7-ANTAGONISTA-ALDOSTERONA-IC — Considerar iniciar antagonista de aldosterona (espironolactona, eplerenona). El pa… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + (TFGe=null (lab — sin pantalla UI) | TFGe=31 (lab — sin pantalla UI)) [y NO marcar **Espironolactona** [tab Cardiovascular + Renal] (clase ANTAGONISTA_ALDOSTERONA)]

10. START-B8-ISGLT2-INSUFICIENCIA-CARDIACA — Considerar iniciar iSGLT2 (canagliflozina, dapagliflozina, empagliflozina, ertugli… — Para que salte: (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular]) [y NO marcar **Canagliflozina** [tab Cardiovascular + Endocrino/Metabólico + Renal] (clase ISGLT2)]

11. START-B9-SACUBITRILO-VALSARTAN-IC — Considerar sacubitrilo/valsartán en IC con FE reducida sintomática pese a tratamie… — Para que salte: dx **Insuficiencia cardíaca con FE reducida** [tab Cardiovascular] + (marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA) | marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2)) [y NO marcar **Sacubitrilo/Valsartán** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase SACUBITRILO_VALSARTAN)]

---

## Sistema endocrino

*(STOPP: 11 | START: 1)*

### STOPP

1. STOPP-J1-SULFONILUREA-VIDA-MEDIA-LARGA — Evitar sulfonilureas de vida media larga (glibenclamida, clorpropamida, glimepirid… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Glibenclamida** [tab Endocrino/Metabólico] (clase SULFONILUREA)

2. STOPP-J10-VASOPRESINA-INCONTINENCIA — Evitar análogos de la vasopresina (desmopresina, vasopresina) para la incontinenci… — Para que salte: marcar **Desmopresina** [tab Otros] (clase ANALOGO_VASOPRESINA) + (dx **Incontinencia urinaria** [tab Urológico] | dx **Poliaquiuria** [tab Urológico])

3. STOPP-J2-TIAZOLIDINDIONA-INSUFICIENCIA-CARDIACA — Evitar tiazolidindionas (rosiglitazona, pioglitazona) en pacientes con insuficienc… — Para que salte: marcar **Rosiglitazona** [tab Endocrino/Metabólico] (clase TIAZOLIDINDIONA) + (dx **Insuficiencia cardíaca** [tab Cardiovascular] | dx **Insuficiencia cardíaca NYHA III-IV** [tab Cardiovascular] | dx **Insuficiencia cardíaca con función sistólica conservada** [tab Cardiovascular])

4. STOPP-J3-BETABLOQUEANTE-DIABETES-HIPOGLUCEMIA — Evitar betabloqueantes no cardioselectivos en pacientes con diabetes con episodios… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + dx **Diabetes con episodios frecuentes de hipoglucemia** [tab Endocrino]

5. STOPP-J4-ISGLT2-HIPOTENSION — Evitar inhibidores del cotransportador sodio-glucosa tipo 2 (iSGLT2) en presencia … — Para que salte: marcar **Canagliflozina** [tab Cardiovascular + Endocrino/Metabólico + Renal] (clase ISGLT2) + dx **Hipotensión sintomática** [tab Cardiovascular]

6. STOPP-J5-ESTROGENOS-CANCER-MAMA-UTERO — Evitar estrógenos en pacientes con antecedentes de cáncer de mama o útero. Riesgo … — Para que salte: marcar **Estrógenos conjugados** [tab Otros] (clase ESTROGENO) + dx **Antecedentes de cáncer de mama o útero** [tab Otros (Oncológico)]

7. STOPP-J6-ESTROGENOS-TROMBOEMBOLISMO-VENOSO — Evitar estrógenos en pacientes con antecedentes de tromboembolismo venoso. Aumento… — Para que salte: marcar **Estrógenos conjugados** [tab Otros] (clase ESTROGENO) + dx **Antecedentes de tromboembolismo venoso** [tab Hematológico]

8. STOPP-J7-ANDROGENOS-ENFERMEDAD-CORONARIA — Evitar andrógenos en pacientes con antecedentes de enfermedad coronaria o vascular… — Para que salte: marcar **Testosterona** [tab Otros] (clase ANDROGENO) + dx **Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica** [tab Cardiovascular]

9. STOPP-J7-ESTROGENOS-ENFERMEDAD-CORONARIA — Evitar estrógenos en pacientes con antecedentes de enfermedad coronaria o vascular… — Para que salte: marcar **Estrógenos conjugados** [tab Otros] (clase ESTROGENO) + dx **Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica** [tab Cardiovascular]

10. STOPP-J8-ESTROGENOS-SIN-PROGESTAGENOS — Evitar estrógenos sin progestágenos en mujeres con útero intacto. Riesgo de cáncer… — Para que salte: marcar **Estrógenos conjugados** [tab Otros] (clase ESTROGENO) + dx **Útero intacto sin progestágenos** [tab Ginecológico]

11. STOPP-J9-LEVOTIROXINA-HIPOTIROIDISMO-SUBCLINICO — Evitar levotiroxina para el hipotiroidismo subclínico (T4 libre normal con TSH ele… — Para que salte: marcar **Levotiroxina** [tab Endocrino/Metabólico (grupo unitario; si no visible → Otros)] (clase HORMONA_TIROIDEA) + (dx **Hipotiroidismo subclínico** [tab Endocrino] | TSH=null (lab — sin pantalla UI) + TSH=5.5 (lab — sin pantalla UI) + TSH=9 (lab — sin pantalla UI))

### START

1. START-J1-IECA-ARA2-DIABETES-PROTEINURIA — Considerar iniciar IECA (o ARA-II si no tolerado). El paciente tiene diabetes con … — Para que salte: dx **Diabetes mellitus** [tab Endocrino] + dx **Proteinuria / microalbuminuria** [tab Renal] + (TFGe=null (lab — sin pantalla UI) | TFGe=30 (lab — sin pantalla UI)) [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA); y NO marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2)]

---

## Sistema gastrointestinal

*(STOPP: 10 | START: 7)*

### STOPP

1. STOPP-F1-PROCINETICO-PARKINSONISMO — Evitar proclorperazina o metoclopramida en presencia de parkinsonismo. Riesgo de e… — Para que salte: marcar **Proclorperazina** [tab Cardiovascular + Gastrointestinal + SNC] (clase PROCINETICO) + dx **Parkinsonismo** [tab Neurológico]

2. STOPP-F2-IBP-TRATAMIENTO-PROLONGADO — IBP a dosis terapéuticas plenas durante más de 8 semanas sin revisión. Valorar red… — Para que salte: marcar **Omeprazol** [tab Gastrointestinal] (clase IBP) + duración ≥ 57 días

3. STOPP-F3-ANTICOLINERGICO-ESTRENIMIENTO — Evitar fármacos antimuscarínicos en estreñimiento crónico. Riesgo de empeoramiento… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTICOLINERGICO) + dx **Estreñimiento crónico** [tab Gastrointestinal]

4. STOPP-F3-FARMACOS-ESTRENIMIENTO — Evitar fármacos que suelen causar estreñimiento (antimuscarínicos/anticolinérgicos… — Para que salte: (marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) | marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) | marcar **Sulfato ferroso** [tab Renal] (clase HIERRO_ORAL)) + dx **Estreñimiento crónico** [tab Gastrointestinal]

5. STOPP-F4-HIERRO-ORAL-DOSIS-ALTA — Revisar hierro oral: dosis elementales superiores a 200 mg/día no aportan mayor ab… — Para que salte: marcar **Sulfato ferroso** [tab Renal] (clase HIERRO_ORAL) + dosis ≥ 201 mg/día

6. STOPP-F5-CORTICOIDE-ULCERA-PEPTICA — Evitar corticosteroides con antecedentes de enfermedad ulcerosa péptica o esofagit… — Para que salte: marcar **Prednisona** (clase CORTICOIDE_SISTEMICO) + (dx **Antecedentes de úlcera péptica** | dx **Esofagitis erosiva**) [y NO marcar **Omeprazol** (clase IBP)]

7. STOPP-F6-ANTIAGREGANTE-EVAG — Evitar antiagregantes plaquetarios en pacientes con antecedentes de EVAG (estómago… — Para que salte: marcar cualquier antiagregante [tab Anticoagulantes] (clase ANTIAGREGANTE) + dx **Antecedentes de EVAG** [tab Gastrointestinal]

8. STOPP-F6-AVK-EVAG — Evitar antagonistas de vitamina K en pacientes con antecedentes de EVAG (estómago … — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE_AVK) + dx **Antecedentes de EVAG** [tab Gastrointestinal]

9. STOPP-F7-NEUROLEPTICO-DISFAGIA — Evitar neurolépticos en pacientes con disfagia. Aumento del riesgo de neumonía asp… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + dx **Disfagia** [tab Gastrointestinal]

10. STOPP-F8-MEGESTROL-OREXIGENO — Evitar acetato de megestrol como orexígeno. Aumento del riesgo de trombosis y mort… — Para que salte: marcar **Acetato de megestrol** [tab Gastrointestinal] (clase OREXICO)

### START

1. START-F1-IBP-ERGE-GRAVE — Considerar iniciar IBP. El paciente tiene ERGE grave o estenosis péptica esofágica… — Para que salte: dx **ERGE grave o estenosis esofágica péptica** [tab Gastrointestinal] [y NO marcar **Omeprazol** [tab Gastrointestinal] (clase IBP)]

2. START-F2-IBP-AAS-ULCERA-ESOFAGITIS — Considerar añadir IBP. El paciente recibe AAS a dosis bajas y tiene antecedentes d… — Para que salte: (dx **Antecedentes de úlcera péptica** [tab Gastrointestinal] | dx **Esofagitis por reflujo** [tab Gastrointestinal]) + marcar **Ácido acetilsalicílico** [tab Anticoagulantes] (clase AAS) [y NO marcar **Omeprazol** [tab Gastrointestinal] (clase IBP)]

3. START-F3-IBP-AINE — Considerar añadir IBP. El paciente está en tratamiento con AINE y no tiene protecc… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) [y NO marcar **Omeprazol** [tab Gastrointestinal] (clase IBP)]

4. START-F4-FIBRA-DIVERTICULOSIS-ESTRENIMIENTO — Considerar suplementos de fibra (plantago ovata, metilcelulosa). El paciente tiene… — Para que salte: dx **Diverticulosis** [tab Gastrointestinal] + dx **Estreñimiento crónico** [tab Gastrointestinal] [y NO marcar **Plantago ovata (ispaghula)** [tab Gastrointestinal] (clase FIBRA)]

5. START-F5-LAXANTE-ESTRENIMIENTO-CRONICO — Considerar iniciar laxante osmótico (lactulosa, macrogol). El paciente tiene estre… — Para que salte: dx **Estreñimiento crónico** [tab Gastrointestinal] [y NO marcar **Lactulosa** [tab Gastrointestinal] (clase LAXANTE)]

6. START-F6-PROBIOTICO-CON-ANTIBIOTICO — Considerar probiótico (Saccharomyces boulardii, Lactobacillus) de forma concomitan… — Para que salte: marcar **Ciprofloxacino** [tab Antibióticos + Cardiovascular] (clase ANTIBIOTICO) [y NO marcar **Saccharomyces boulardii** [tab Gastrointestinal] (clase PROBIOTICO)]

7. START-F7-ERRADICACION-H-PYLORI — Considerar tratamiento erradicador de Helicobacter pylori en la enfermedad ulceros… — Para que salte: dx **Úlcera péptica activa por H. pylori** [tab Gastrointestinal] [y NO marcar **Omeprazol** [tab Gastrointestinal] (clase IBP)]

---

## Sistema musculoesquelético

*(STOPP: 10 | START: 7)*

### STOPP

1. STOPP-H1-AINE-ULCERA-HEMORRAGIA — Evitar AINEs en pacientes con antecedentes de úlcera péptica o hemorragia HC. Salv… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + (dx **Antecedentes de úlcera péptica** [tab Gastrointestinal] | dx **Antecedentes de hemorragia HC** [tab Gastrointestinal])

2. STOPP-H2-AINE-HIPERTENSION-GRAVE — Evitar AINEs en pacientes con HTA grave/moderada. Riesgo de empeoramiento de la HTA. — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + (dx **HTA grave** [tab Cardiovascular] | dx **HTA moderada** [tab Cardiovascular])

3. STOPP-H3-AINE-ARTRITIS-ARTROSIS — Evitar AINEs en artritis/artrosis. Debería probarse paracetamol antes de usar AINEs. — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + (dx **Artritis** [tab Reumatológico] | dx **Artrosis** [tab Reumatológico])

4. STOPP-H3B-AINE-DOLOR-LEVE — Evitar AINEs para el dolor leve-moderado cuando no se han probado primero los anal… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + dx **Dolor leve-moderado** [tab Otros (Sintomático)]

5. STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE — Evitar corticosteroides a largo plazo (> 3 meses) como monoterapia en la artritis … — Para que salte: marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + dx **Artritis reumatoide** [tab Reumatológico]

6. STOPP-H5-CORTICOIDE-ARTROSIS — Evitar corticosteroides sistémicos para la artrosis (salvo inyecciones intraarticu… — Para que salte: marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + dx **Artrosis** [tab Reumatológico]

7. STOPP-H6-AINE-COLCHICINA-GOTA-CRONICA — Revisar AINEs o colchicina usados de forma prolongada en gota crónica o recurrente… — Para que salte: (marcar **Ibuprofeno** (clase AINE) | marcar **Colchicina** (clase COLCHICINA)) + (dx **Gota activa** | dx **Gota recurrente**)

8. STOPP-H7-AINE-CORTICOIDES — Evitar AINEs en combinación con corticosteroides para el tratamiento de artritis/e… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + (dx **Artritis** [tab Reumatológico] | dx **Artritis reumatoide** [tab Reumatológico] | dx **Artritis reumatoide activa incapacitante** [tab Reumatológico] | dx **Artrosis** [tab Reumatológico] | dx **Gota activa** [tab Reumatológico] | dx **Gota recurrente** [tab Reumatológico])

9. STOPP-H8-BIFOSFONATO-ENFERMEDAD-DIGESTIVA-ALTA — Evitar bisfosfonatos orales en pacientes con antecedentes de enfermedades digestiv… — Para que salte: marcar **Alendronato** [tab Osteo/Músculo-esq.] (clase BIFOSFONATO) + (dx **Disfagia** [tab Gastrointestinal] | dx **Antecedentes de úlcera péptica** [tab Gastrointestinal] | dx **Antecedentes de hemorragia HC** [tab Gastrointestinal])

10. STOPP-H9-OPIOIDE-ARTROSIS — Evitar opioides a largo plazo para el tratamiento de la artrosis. Sin evidencia de… — Para que salte: marcar **Morfina** [tab Osteo/Músculo-esq. + SNC] (clase OPIOIDE) + dx **Artrosis** [tab Reumatológico]

### START

1. START-H1-FAME-ARTRITIS-REUMATOIDE-ACTIVA — Considerar iniciar FAME (metotrexato, leflunomida, sulfasalazina, hidroxicloroquin… — Para que salte: dx **Artritis reumatoide activa incapacitante** [tab Reumatológico] [y NO marcar **Metotrexato** [tab Osteo/Músculo-esq.] (clase FAME)]

2. START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE — Considerar añadir bisfosfonato y vitamina D (con calcio) para prevención de osteop… — Para que salte: marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + (NO marcar **Alendronato** [tab Osteo/Músculo-esq.] (clase BIFOSFONATO) | NO marcar **Colecalciferol** [tab Renal] (clase VITAMINA_D))

3. START-H3-VITAMINA-D-OSTEOPOROSIS — Considerar vitamina D. El paciente tiene osteoporosis conocida o fractura por frag… — Para que salte: (dx **Osteoporosis** [tab Reumatológico] | dx **Fractura por fragilidad** [tab Reumatológico]) [y NO marcar **Colecalciferol** [tab Renal] (clase VITAMINA_D)]

4. START-H4-ANTIRRESORTIVO-OSTEOPOROSIS — Considerar antirresortivo (bisfosfonato, denosumab) o anabolizante óseo (teriparat… — Para que salte: (dx **Osteoporosis** [tab Reumatológico] | dx **Fractura por fragilidad** [tab Reumatológico]) [y NO marcar **Alendronato** [tab Osteo/Músculo-esq.] (clase ANTIRRESORTIVO); y NO marcar **Teriparatida** [tab Osteo/Músculo-esq. (grupo unitario; si no visible → Otros)] (clase ANABOLIZANTE_OSEO)]

5. START-H5-VITAMINA-D-DEFICIT-CAIDAS-OSTEOPENIA — Considerar vitamina D en paciente mayor con déficit confirmado de vitamina D que n… — Para que salte: (dx **Déficit de vitamina D confirmado** [tab Metabólico] | dx **Caídas de repetición** [tab Otros (Geriátrico)] | dx **Osteopenia** [tab Reumatológico]) [y NO marcar **Colecalciferol** [tab Renal] (clase VITAMINA_D)]

6. START-H8-INHIBIDOR-XANTINA-OXIDASA-GOTA — Considerar inhibidor de la xantina oxidasa (alopurinol, febuxostat) como profilaxi… — Para que salte: dx **Gota recurrente** [tab Reumatológico] [y NO marcar **Alopurinol** [tab Endocrino/Metabólico] (clase INHIBIDOR_XANTINA_OXIDASA)]

7. START-H9-ACIDO-FOLICO-METOTREXATO — Considerar suplemento de ácido fólico. El paciente recibe metotrexato y no tiene á… — Para que salte: marcar **Metotrexato** [tab Osteo/Músculo-esq.] (clase ANTIMETABOLITO) [y NO marcar **Ácido fólico** [tab Endocrino/Metabólico (grupo unitario; si no visible → Otros)] (clase ACIDO_FOLICO)]

---

## Sistema nervioso central

*(STOPP: 32 | START: 7)*

### STOPP

1. STOPP-D1-ADT-CONDUCCION-CARDIACA — Evitar antidepresivos tricíclicos en pacientes con trastornos de conducción cardía… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + dx **Trastornos de conducción cardíaca** [tab Cardiovascular]

2. STOPP-D1-ADT-ESTRENIMIENTO — Evitar antidepresivos tricíclicos en pacientes con estreñimiento crónico. Riesgo d… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + dx **Estreñimiento crónico** [tab Gastrointestinal]

3. STOPP-D1-ADT-PROSTATISMO — Evitar antidepresivos tricíclicos en pacientes con prostatismo o retención urinari… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + (dx **Prostatismo** [tab Urológico] | dx **Retención urinaria** [tab Urológico])

4. STOPP-D1-D14_1-ADT-DEMENCIA — Evitar antidepresivos tricíclicos en pacientes con demencia, deterioro cognitivo o… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + (dx **Demencia** [tab Neurológico] | dx **Deterioro cognitivo** [tab Neurológico] | dx **Delirio** [tab Neurológico])

5. STOPP-D1-I2-ADT-GLAUCOMA — Evitar antidepresivos tricíclicos en pacientes con glaucoma de ángulo estrecho. Ri… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + dx **Glaucoma de ángulo estrecho** [tab Otros (Oftalmológico)]

6. STOPP-D10-BENZODIACEPINA-INSOMNIO — Evitar benzodiacepinas para el insomnio durante ≥ 2 semanas. Alto riesgo de depend… — Para que salte: marcar **Diazepam** [tab SNC] (clase BENZODIACEPINA) + dx **Insomnio** [tab Psiquiátrico]

7. STOPP-D11-HIPNOTICO-Z-INSOMNIO — Evitar hipnóticos-Z (zolpidem, zopiclona, zaleplon) para el insomnio durante ≥ 2 s… — Para que salte: marcar **Zolpidem** [tab SNC] (clase HIPNOTICO_Z) + dx **Insomnio** [tab Psiquiátrico]

8. STOPP-D12-F1-NEUROLEPTICO-PARKINSON-LEWY — Evitar neurolépticos (bajo olanzapina y quetiapina) en pacientes con parkinsonismo… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + (dx **Parkinsonismo** [tab Neurológico] | dx **Demencia por cuerpos de Lewy** [tab Neurológico])

9. STOPP-D13-ANTIPARKINSONIAN-ANTICOLINERGICO-NEUROLEPTICO — Evitar anticolinérgicos/antimuscarínicos antiparkinsonians (biperideno, orfenadrin… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + marcar **Biperideno** [tab SNC] (clase ANTIPARKINSONIAN_ANTICOLINERGICO)

10. STOPP-D14-ANTICOLINERGICO-DEMENCIA — Evitar fármacos antimuscarínicos en presencia de delirium o demencia. Los efectos … — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTICOLINERGICO) + (dx **Demencia** [tab Neurológico] | dx **Delirio** [tab Neurológico])

11. STOPP-D16-NEUROLEPTICO-HIPNOTICO — No usar neurolépticos como hipnóticos. Salvo que el insomnio se deba a psicosis o … — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + dx **Insomnio** [tab Psiquiátrico] [y NO marcar dx **Psicosis** [tab Psiquiátrico]; y NO marcar dx **Síntomas conductuales de la demencia** [tab Neurológico]]

12. STOPP-D17-IACE-BRADICARDIA-BLOQUEO-SINCOPE — Evitar inhibidores de la acetilcolinesterasa con antecedentes de bradicardia persi… — Para que salte: marcar **Donepezilo** [tab SNC] (clase INHIBIDOR_ACETILCOLINESTERASA) + (dx **Bradicardia** [tab Cardiovascular] | FC=null (lab — sin pantalla UI) + FC=59 (lab — sin pantalla UI) | dx **Bloqueo AV de segundo grado** [tab Cardiovascular] | dx **Bloqueo AV completo** [tab Cardiovascular] | dx **Síncopes recurrentes** [tab Cardiovascular])

13. STOPP-D18-BETABLOQUEANTE-INTERACCION-FC — Evitar uso concomitante de betabloqueantes con otros fármacos que reducen la frecu… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + (marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) | marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP))

14. STOPP-D18-DIGOXINA-INHIBIDORES-ACETILCOLINESTERASA — Evitar uso concomitante de digoxina e inhibidores de acetilcolinesterasa (donepezi… — Para que salte: marcar **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] (clase DIGOXINA) + marcar **Donepezilo** [tab SNC] (clase INHIBIDOR_ACETILCOLINESTERASA)

15. STOPP-D18-VERAPAMILO-INHIBIDORES-ACETILCOLINESTERASA — Evitar uso concomitante de verapamilo/diltiazem e inhibidores de acetilcolinestera… — Para que salte: marcar **Verapamilo** [tab Cardiovascular] (clase CALCIOANTAGONISTA_NO_DHP) + marcar **Donepezilo** [tab SNC] (clase INHIBIDOR_ACETILCOLINESTERASA)

16. STOPP-D19-MEMANTINA-EPILEPSIA — Evitar memantina en pacientes con epilepsia conocida previa o actual. Aumento del … — Para que salte: marcar **Memantina** [tab SNC (grupo unitario; si no visible → Otros)] (clase ANTAGONISTA_NMDA) + dx **Epilepsia** [tab Neurológico]

17. STOPP-D2-ADT-DEPRESION-PRIMERA-LINEA — No usar antidepresivos tricíclicos como primera línea en episodio depresivo. Se pr… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTIDEPRESIVO_TRICICLICO) + dx **Episodio depresivo** [tab Psiquiátrico]

18. STOPP-D20-NOOTROPICO-DEMENCIA — Evitar nootrópicos (Ginkgo biloba, piracetam, modafinilo, etc.) en demencia. Sin e… — Para que salte: marcar **Ginkgo biloba** [tab Otros] (clase NOOTROPICO) + dx **Demencia** [tab Neurológico]

19. STOPP-D21-FENOTIAZINA-PRIMERA-LINEA-PSICOSIS — Evitar fenotiazinas como tratamiento de primera línea de la psicosis o síntomas no… — Para que salte: marcar **Clorpromazina** [tab Cardiovascular + SNC] (clase FENOTIAZINA) + (dx **Psicosis** [tab Psiquiátrico] | dx **Síntomas conductuales de la demencia** [tab Neurológico])

20. STOPP-D22-DOPAMINERGICO-TEMBLOR-ESENCIAL — Evitar levodopa o agonistas dopaminérgicos para el temblor esencial benigno. Sin e… — Para que salte: (marcar **Levodopa/Carbidopa** [tab SNC] (clase DOPAMINERGICO) | marcar **Pramipexol** [tab SNC] (clase AGONISTA_DOPAMINERGICO)) + dx **Temblor esencial benigno** [tab Neurológico]

21. STOPP-D23-DOPAMINERGICO-PARKINSONISMO-FARMACOLOGICO — Evitar levodopa o agonistas dopaminérgicos para tratar los efectos secundarios ext… — Para que salte: (dx **Parkinsonismo inducido por fármacos** | dx **Efectos extrapiramidales por neurolépticos**) [tab Neurológico] + (marcar **Levodopa/Carbidopa** [tab SNC] (clase DOPAMINERGICO) | marcar **Pramipexol** [tab SNC] (clase AGONISTA_DOPAMINERGICO))

22. STOPP-D24-ANTIHISTAMINICO-1GEN-ALERGIA — Evitar antihistamínicos de primera generación como tratamiento de primera línea de… — Para que salte: marcar **Astemizol** [tab Respiratorio] (clase ANTIHISTAMINICO_1GEN) + (dx **Alergia** [tab Otros (Inmunológico)] | dx **Prurito** [tab Otros (Dermatológico)])

23. STOPP-D25-ANTIHISTAMINICO-1GEN-INSOMNIO — Evitar antihistamínicos de primera generación para el insomnio. Alto riesgo de efe… — Para que salte: marcar **Astemizol** [tab Respiratorio] (clase ANTIHISTAMINICO_1GEN) + dx **Insomnio** [tab Psiquiátrico]

24. STOPP-D3-ISRN-HIPERTENSION-GRAVE — Evitar inhibidores de la recaptación de serotonina/noradrenalina (venlafaxina, dul… — Para que salte: marcar **Venlafaxina** [tab SNC] (clase ISRN) + dx **HTA grave** [tab Cardiovascular]

25. STOPP-D4-BETABLOQUEANTE-BLOQUEO-CARDIACO — Evitar betabloqueantes en pacientes con bloqueo cardíaco de 2º grado o completo. R… — Para que salte: marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE) + (dx **Bloqueo AV de segundo grado** [tab Cardiovascular] | dx **Bloqueo AV completo** [tab Cardiovascular])

26. STOPP-D4-NEUROLEPTICO-PROSTATISMO — Evitar neurolépticos antimuscariínicos en pacientes con prostatismo o retención ur… — Para que salte: marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO) + (dx **Prostatismo** [tab Urológico] | dx **Retención urinaria** [tab Urológico])

27. STOPP-D5-NEUROLEPTICO-SINTOMAS-DEMENCIA — Evitar neurolépticos para síntomas conductuales de la demencia sin revisión o ajuste… — Para que salte: dx **Síntomas conductuales de la demencia** [tab Neurológico] + marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO)

28. STOPP-D15-ANTIPSICOTICO-SCPD — Revisar antipsicóticos usados para síntomas conductuales y psicológicos de la demencia… — Para que salte: dx **Síntomas conductuales de la demencia** [tab Neurológico] + marcar **Haloperidol** [tab Cardiovascular + SNC] (clase NEUROLEPTICO)

29. STOPP-D6-ISRS-HIPONATREMIA — Evitar ISRS en pacientes con hiponatremia significativa (Na+ < 130 mmol/L). Riesgo… — Para que salte: marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS) + ((dx **Hiponatremia significativa (Na+ < 130 mmol/L)** [tab Metabólico] | dx **Hiponatremia** [tab Metabólico]) | Na+=null (lab — sin pantalla UI) + Na+=129.9 (lab — sin pantalla UI))

30. STOPP-D7-ISRS-SANGRADO — Evitar ISRS en pacientes con presencia de sangrado significativo concurrente actua… — Para que salte: marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS) + dx **Riesgo significativo de sangrado** [tab Hematológico]

31. STOPP-D8-BENZODIACEPINA-USO-PROLONGADO — Benzodiacepinas durante ≥ 4 semanas no están indicadas. Riesgo de sedación, confus… — Para que salte: edad ≥ 65 (campo paciente — sin pantalla UI) + marcar **Diazepam** [tab SNC] (clase BENZODIACEPINA)

32. STOPP-D9-BENZODIACEPINA-DEMENCIA-AGITACION — Evitar benzodiacepinas para la agitación o síntomas psicóticos de la demencia. Sin… — Para que salte: marcar **Diazepam** [tab SNC] (clase BENZODIACEPINA) + (dx **Demencia** [tab Neurológico] | dx **Síntomas conductuales de la demencia** [tab Neurológico])

### START

1. START-D1-DOPAMINERGICO-PARKINSON — Considerar iniciar levodopa o agonista dopaminérgico. El paciente tiene enfermedad… — Para que salte: dx **Enfermedad de Parkinson** [tab Neurológico] [y NO marcar **Levodopa/Carbidopa** [tab SNC] (clase DOPAMINERGICO); y NO marcar **Pramipexol** [tab SNC] (clase AGONISTA_DOPAMINERGICO)]

2. START-D2-ANTIDEPRESIVO-NO-ATC-DEPRESION — Considerar iniciar antidepresivo no tricíclico (ISRS o ISRN). El paciente tiene de… — Para que salte: (dx **Episodio depresivo** [tab Psiquiátrico] | dx **Depresión mayor** [tab Psiquiátrico]) [y NO marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS); y NO marcar **Venlafaxina** [tab SNC] (clase ISRN)]

3. START-D3-IACE-ALZHEIMER — Considerar iniciar inhibidor de acetilcolinesterasa (donepezilo, rivastigmina, gal… — Para que salte: dx **Enfermedad de Alzheimer leve-moderada** [tab Neurológico] [y NO marcar **Donepezilo** [tab SNC] (clase INHIBIDOR_ACETILCOLINESTERASA)]

4. START-D4-RIVASTIGMINA-DEMENCIA-LEWY-PARKINSON — Considerar iniciar rivastigmina. El paciente tiene demencia por cuerpos de Lewy o … — Para que salte: (dx **Demencia por cuerpos de Lewy** [tab Neurológico] | dx **Enfermedad de Parkinson** [tab Neurológico]) [y NO marcar **Donepezilo** [tab SNC] (clase INHIBIDOR_ACETILCOLINESTERASA)]

5. START-D5-ISRS-ANSIEDAD-GRAVE — Considerar iniciar ISRS (o ISRN o pregabalina si los ISRS están contraindicados). … — Para que salte: dx **Ansiedad grave persistente** [tab Psiquiátrico] [y NO marcar **Sertralina** [tab Cardiovascular + SNC] (clase ISRS); y NO marcar **Venlafaxina** [tab SNC] (clase ISRN); y NO marcar **Gabapentina** [tab Osteo/Músculo-esq. + SNC] (clase GABAPENTINOIDE)]

6. START-D6-AGONISTA-DOPAMINERGICO-PIERNAS-INQUIETAS — Considerar iniciar agonista dopaminérgico (ropinirol, pramipexol, rotigotina) para… — Para que salte: dx **Síndrome de piernas inquietas** [tab Neurológico] + (TFGe=null (lab — sin pantalla UI) | TFGe=30 (lab — sin pantalla UI)) [y NO marcar **Pramipexol** [tab SNC] (clase AGONISTA_DOPAMINERGICO)]

7. START-D7-PROPRANOLOL-TEMBLOR-ESENCIAL — Considerar propranolol para el temblor esencial con deterioro funcional y discapac… — Para que salte: dx **Temblor esencial benigno** [tab Neurológico] [y NO marcar **Metoprolol** [tab Cardiovascular] (clase BETABLOQUEANTE)]

---

## Sistema renal

*(STOPP: 10 | START: 4)*

### STOPP

1. STOPP-E1-DIGOXINA-RENAL — Digoxina en tratamiento a largo plazo (> 90 días) a dosis mantenidas ≥ 125 μg/día … — Para que salte: TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal]) + **Digoxina** [tab Cardiovascular (grupo unitario; si no visible → Otros)] con dosis ≥125 µg/día y duración >90 días (JSON: doseMcgDay/durationDays)

2. STOPP-E10-METOTREXATO-INSUFICIENCIA-RENAL — Evitar metotrexato con TFGe < 30 ml/min/1,73 m². Riesgo de toxicidad grave por acu… — Para que salte: marcar **Metotrexato** [tab Osteo/Músculo-esq.] (clase ANTIMETABOLITO) + TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal])

3. STOPP-E2-DABIGATRAN-RENAL — Evitar dabigatrán con TFGe < 30 ml/min/1,73 m². Riesgo muy elevado de hemorragia g… — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE) + TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal])

4. STOPP-E3-FACTOR-XA-RENAL — Evitar inhibidores del Factor Xa con TFGe < 15 ml/min. Riesgo elevado de sangrado … — Para que salte: marcar **Warfarina** [tab Anticoagulantes] (clase ANTICOAGULANTE) + TFGe < 15 (lab egfr=14 o dx **Enfermedad renal grave** [tab Renal])

5. STOPP-E4-AINE-INSUFICIENCIA-RENAL — Evitar AINEs en pacientes con insuficiencia renal (TFGe < 50 ml/min). Riesgo de de… — Para que salte: marcar **Ibuprofeno** [tab Cardiovascular + Osteo/Músculo-esq.] (clase AINE) + TFGe < 50 (lab egfr=49 o dx **Enfermedad renal grave** [tab Renal])

6. STOPP-E5-COLCHICINA-INSUFICIENCIA-RENAL — Evitar colchicina con TFGe < 10 ml/min/1,73 m². Riesgo de toxicidad grave por colc… — Para que salte: marcar **Colchicina** [tab Osteo/Músculo-esq. (grupo unitario; si no visible → Otros)] (clase COLCHICINA) + TFGe < 10 (lab egfr=9 o dx **Enfermedad renal grave** [tab Renal])

7. STOPP-E6-METFORMINA-INSUFICIENCIA-RENAL — Evitar metformina con TFGe < 30 ml/min/1,73 m². Riesgo de acidosis láctica. — Para que salte: marcar **Metformina** [tab Endocrino/Metabólico (grupo unitario; si no visible → Otros)] (clase BIGUANIDA) + TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal])

8. STOPP-E7-ANTAGONISTA-ALDOSTERONA-INSUFICIENCIA-RENAL — Evitar antagonistas de la aldosterona en enfermedad renal grave (eFG < 30 ml/min/1… — Para que salte: marcar **Espironolactona** [tab Cardiovascular + Renal] (clase ANTAGONISTA_ALDOSTERONA) + TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal])

9. STOPP-E8-NITROFURANTOINA-INSUFICIENCIA-RENAL — Evitar nitrofurantoína con TFGe < 45 ml/min/1,73 m². Riesgo de toxicidad por nitro… — Para que salte: marcar **Nitrofurantoína** [tab Antibióticos (grupo unitario; si no visible → Otros)] (clase NITROFURANTOINA) + TFGe < 45 (lab egfr=44 o dx **Enfermedad renal grave** [tab Renal])

10. STOPP-E9-BIFOSFONATO-INSUFICIENCIA-RENAL — Evitar bisfosfonatos con TFGe < 30 ml/min/1,73 m². Mayor riesgo de insuficiencia r… — Para que salte: marcar **Alendronato** [tab Osteo/Músculo-esq.] (clase BIFOSFONATO) + TFGe < 30 (lab egfr=29 o dx **Enfermedad renal grave** [tab Renal])

### START

1. START-E1-CALCITRIOL-ERC-HIPOCALCEMIA-HIPERPARATIROIDISMO — Considerar 1-alfa-hidroxicolecalciferol o calcitriol. El paciente tiene ERC grave … — Para que salte: TFGe=null (lab — sin pantalla UI) + TFGe=29 (lab — sin pantalla UI) + Ca corr.=null (lab — sin pantalla UI) + Ca corr.=2 (lab — sin pantalla UI) + dx **Hiperparatiroidismo secundario** [tab Endocrino] [y NO marcar **Colecalciferol** [tab Renal] (clase VITAMINA_D)]

2. START-E2-QUELANTE-FOSFORO-ERC-HIPERFOSFATEMIA — Considerar quelante del fósforo (sevelámero, carbonato de lantano). El paciente ti… — Para que salte: TFGe=null (lab — sin pantalla UI) + TFGe=29 (lab — sin pantalla UI) + dx **Hiperfosfatemia** [tab Metabólico] [y NO marcar **Sevelámero** [tab Renal] (clase QUELANTE_FOSFORO)]

3. START-E3-EPO-ERC-ANEMIA — Considerar análogo de eritropoyetina. El paciente tiene ERC grave (TFGe < 30) con … — Para que salte: TFGe=null (lab — sin pantalla UI) + TFGe=29 (lab — sin pantalla UI) + dx **Anemia sintomática** [tab Hematológico] [y NO marcar **Eritropoyetina alfa** [tab Renal] (clase EPO)]

4. START-E4-IECA-ARA2-ERC-PROTEINURIA — Considerar iniciar IECA o ARA-II. El paciente tiene ERC con proteinuria (albuminur… — Para que salte: dx **Proteinuria / microalbuminuria** [tab Renal] + (TFGe=null (lab — sin pantalla UI) | TFGe=30 (lab — sin pantalla UI)) [y NO marcar **Enalapril** [tab Cardiovascular + Renal] (clase IECA); y NO marcar **Valsartán** [tab Cardiovascular + Renal] (clase ARA2)]

---

## Sistema respiratorio

*(STOPP: 4 | START: 2)*

### STOPP

1. STOPP-G1-TEOFILINA-EPOC — Evitar teofilina como monoterapia para la EPOC. Existen alternativas más seguras y… — Para que salte: marcar **Teofilina** [tab Respiratorio (grupo unitario; si no visible → Otros)] (clase METILXANTINA) + dx **EPOC** [tab Respiratorio]

2. STOPP-G2-CORTICOIDE-SISTEMICO-EPOC — Evitar corticosteroides sistémicos en lugar de inhalados para el tratamiento de ma… — Para que salte: marcar **Prednisona** [tab Cardiovascular + Endocrino/Metabólico + Respiratorio] (clase CORTICOIDE_SISTEMICO) + dx **EPOC** [tab Respiratorio]

3. STOPP-G3-LAMA-GLAUCOMA-OBSTRUCCION-URINARIA — Evitar broncodilatadores antimuscarínicos de acción larga (LAMA: tiotropio, aclidi… — Para que salte: marcar **Tiotropio** [tab Respiratorio] (clase LAMA) + (dx **Glaucoma de ángulo estrecho** [tab Otros (Oftalmológico)] | dx **Obstrucción del tracto urinario inferior** [tab Urológico])

4. STOPP-G4-BENZODIACEPINA-INSUFICIENCIA-RESPIRATORIA — Evitar benzodiacepinas con insuficiencia respiratoria aguda o crónica. Riesgo de e… — Para que salte: marcar **Diazepam** [tab SNC] (clase BENZODIACEPINA) + (dx **Insuficiencia respiratoria** [tab Respiratorio] | dx **EPOC grave** [tab Respiratorio])

### START

1. START-G1-LAMA-LABA-EPOC-ASMA — Considerar iniciar LAMA (tiotropio, aclidinio) o LABA (formoterol, salmeterol) par… — Para que salte: (dx **EPOC estadio GOLD 1-2** [tab Respiratorio] | dx **Asma crónica** [tab Respiratorio] | dx **EPOC** [tab Respiratorio]) [y NO marcar **Tiotropio** [tab Respiratorio] (clase LAMA); y NO marcar **Formoterol** [tab Respiratorio] (clase LABA)]

2. START-G2-CORTICOIDE-INHALADO-ASMA-GRAVE-EPOC — Considerar iniciar corticosteroide inhalado pautado. El paciente tiene asma modera… — Para que salte: (dx **Asma moderada-grave** [tab Respiratorio] | dx **EPOC estadio GOLD 3-4** [tab Respiratorio] | dx **EPOC grave** [tab Respiratorio]) [y NO marcar **Beclometasona inhalada** [tab Respiratorio] (clase CORTICOIDE_INHALADO)]

---

## Sistema urogenital

*(STOPP: 7 | START: 5)*

### STOPP

1. STOPP-I1-ANTIMUSCARÍNICO-URINARIO-DEMENCIA — Evitar fármacos antimuscarínicos sistémicos (oxibutinina, tolterodina) en presenci… — Para que salte: marcar **Oxibutinina** [tab Urológico] (clase ANTIESPASMÓDICO_URINARIO) + (dx **Demencia** [tab Neurológico] | dx **Deterioro cognitivo** [tab Neurológico])

2. STOPP-I2-ANTICOLINERGICO-GLAUCOMA — Evitar fármacos antimuscarínicos sistémicos en glaucoma de ángulo estrecho. Pueden… — Para que salte: marcar **Amitriptilina** [tab Cardiovascular + Osteo/Músculo-esq. + SNC] (clase ANTICOLINERGICO) + dx **Glaucoma de ángulo estrecho** [tab Otros (Oftalmológico)]

3. STOPP-I3-ANTIMUSCARÍNICO-HBP-VOLUMEN-RESIDUAL — Evitar fármacos antimuscarínicos sistémicos para síntomas urinarios en hiperplasia… — Para que salte: marcar **Oxibutinina** [tab Urológico] (clase ANTIESPASMÓDICO_URINARIO) + dx **Hiperplasia benigna de próstata** [tab Urológico]

4. STOPP-I5-ALFABLOQUEANTE-HIPOTENSION-SINCOPE — Evitar bloqueantes alfa-1-adrenérgicos (exceptuando la silodosina: alfuzosina, dox… — Para que salte: marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE) + (dx **Hipotensión ortostática** [tab Cardiovascular] | dx **Síncopes recurrentes** [tab Cardiovascular])

5. STOPP-I6-MIRABEGRON-HIPERTENSION-GRAVE — Evitar mirabegrón en HTA grave o lábil. Riesgo de empeoramiento de la HTA. — Para que salte: marcar **Mirabegrón** [tab Cardiovascular + Urológico] (clase AGONISTA_BETA3) + dx **HTA grave** [tab Cardiovascular]

6. STOPP-I7-DULOXETINA-INCONTINENCIA-URGENCIA — Evitar duloxetina en presencia de urgencia urinaria o incontinencia urinaria por u… — Para que salte: marcar **Venlafaxina** [tab SNC] (clase ISRN) + dx **Incontinencia urinaria de urgencia** [tab Urológico]

7. STOPP-I8-ANTIBIOTICO-BACTERIURIA-ASINTOMATICA — Evitar antibióticos para el tratamiento de la bacteriuria asintomática. No está in… — Para que salte: marcar **Ciprofloxacino** [tab Antibióticos + Cardiovascular] (clase ANTIBIOTICO) + dx **Bacteriuria asintomática** [tab Otros (Infeccioso)]

### START

1. START-I1-ALFABLOQUEANTE-HBP — Considerar bloqueante alfa-1-adrenérgico (tamsulosina, silodosina, alfuzosina) par… — Para que salte: dx **Hiperplasia benigna de próstata** [tab Urológico] [y NO marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE); y NO marcar **Silodosina** [tab Urológico (grupo unitario; si no visible → Otros)] (clase ALFABLOQUEANTE_PROSTATICO); y NO marcar **Finasterida** [tab Urológico] (clase INHIBIDOR_5ALFA_REDUCTASA)]

2. START-I2-INHIBIDOR-5ALFA-REDUCTASA-HBP — Considerar inhibidor de 5-alfa reductasa (finasterida, dutasterida) para síntomas … — Para que salte: dx **Hiperplasia benigna de próstata** [tab Urológico] [y NO marcar **Finasterida** [tab Urológico] (clase INHIBIDOR_5ALFA_REDUCTASA); y NO marcar **Alfuzosina** [tab Urológico] (clase ALFABLOQUEANTE); y NO marcar **Silodosina** [tab Urológico (grupo unitario; si no visible → Otros)] (clase ALFABLOQUEANTE_PROSTATICO)]

3. START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA — Considerar estrógenos tópicos vaginales (estriol vaginal, promestrieno) en vaginit… — Para que salte: dx **Vaginitis atrófica sintomática** [tab Ginecológico] [y NO marcar **Estriol vaginal** [tab Urológico] (clase ESTROGENO_TOPICO)]

4. START-I4-ESTROGENO-TOPICO-ITU-RECURRENTES — Considerar estrógenos tópicos vaginales para prevención de infecciones urinarias r… — Para que salte: dx **Infecciones urinarias recurrentes** [tab Urológico] [y NO marcar **Estriol vaginal** [tab Urológico] (clase ESTROGENO_TOPICO)]

5. START-I5-INHIBIDOR-PDE5-DISFUNCION-ERECTIL — Considerar inhibidor de fosfodiesterasa 5 (sildenafilo, tadalafilo, vardenafilo) p… — Para que salte: dx **Disfunción eréctil** [tab Urológico] [y NO marcar **Sildenafilo** [tab Cardiovascular + Urológico] (clase INHIBIDOR_PDE5)]

---

## Totales

| Tipo | Cantidad |
|------|----------|
| STOPP | 167 |
| START | 49 |
| **Total** | **216** |

## Índice rápido — tabs de medicamentos

| Tab | Contenido principal |
|-----|---------------------|
| Cardiovascular | Betabloqueantes, IECA, ARA-II, diuréticos, antiarrítmicos, digoxina, iSGLT2… |
| Anticoagulantes | AVK, AODs, antiagregantes |
| SNC | ISRS, tricíclicos, BZD, neurolépticos, opioides… (+ Cardiovascular si additionalCategories) |
| Renal, GI, Respiratorio, Endocrino/Metabólico, Urológico, Osteo/Músculo-esq., Antibióticos | Ver taxonomy |
| Otros | Fármacos huérfanos o grupos unitarios no aflorados |

## Índice rápido — tabs de diagnósticos

Tabs propios: Cardiovascular, Neurológico, Psiquiátrico, Renal, Metabólico, Endocrino, Gastrointestinal, Respiratorio, Urológico, Ginecológico, Reumatológico, Hematológico.

Tab **Otros**: Geriátrico, Sintomático, Síntoma, Oftalmológico, Oncológico, Hepático, etc.

## OJO / casos difíciles solo con selección UI

- **Edad** y **labs**: sin pantalla; importar JSON.
- **Digoxina** [tab Cardiovascular]: grupo unitario — puede requerir dx/relevancia previa, o buscar en **Otros**.
- **Ondansetrón** [tab Gastrointestinal + Cardiovascular]: grupo unitario; si no visible → **Otros**.
- **Duplicidades** (`multiple*`): ≥2 fármacos de la misma clase.
- **START**: disparan cuando **NO** está el fármaco.
- **Dx foráneos**: algunos dx de un tab aparecen como grupo foráneo en otro tab si un criterio los referencia.
