# STOPP/START v3 — Contexto completo para la app Angular

## Arquitectura de la app

- **Angular 20 standalone-component SPA**
- Flujo wizard: `/ → /paciente → /diagnosticos → /analitica → /medicaciones → /resultados`
- Estado centralizado en `CaseStoreService` con **signals** y persistencia en localStorage.
- Motor de criterios en `CriteriaEngineService`: carga `src/assets/data/criteria.json`, evalúa con **json-logic-js** y operadores custom.
- **Normalización a minúsculas** antes de evaluar (tanto datos del paciente como valores en criterios).
- Operadores custom: `inDrugClass`, `digoxinaDosisAlta`, `multipleNSAIDs`, `multipleLoopDiuretics`, `multipleThiazideDiuretics`, `multipleIECA`, `multipleARAII`, `multipleAldosteroneAntagonists`, `multipleDiureticosAhorradoresPotasio`, `multipleISRS`.

### Estructura de un criterio en `criteria.json`

```json
{
  "id": "STOPP-B1",
  "type": "STOPP",
  "system": "cardiovascular",
  "summary": "Texto descriptivo del criterio",
  "severity": "moderate",
  "logic": { /* json-logic rule tree operando sobre PatientCase */ },
  "excludes": {
    "medications": ["nombre1"],
    "drugClasses": ["CLASE1"]
  }
}
```

- `logic` opera sobre el objeto `PatientCase` — acceso vía `var: "diagnoses"`, `var: "medications"`, `var: "labs.egfr_ml_min_173"`, etc.
- Si el criterio debe impedir añadir una medicación, incluir bloque `excludes` con `medications` (nombres concretos) y/o `drugClasses` (tags en MAYÚSCULAS).

### Datos clave

- **Medicaciones**: `src/app/core/data/medications.ts` — array `MEDICATIONS` con `{ id, drugClasses[] }`.
- **Diagnósticos**: `src/app/core/data/diagnoses.ts` — lista estática de strings.
- **Tipos**: `src/app/core/types.ts` — `PatientCase`, `PatientInfo`, `Med`, `Crit`, `Labs`, `Severity`.

---

## Criterios STOPP v3 — Versión española completa

> Las siguientes prescripciones son potencialmente inapropiadas en pacientes mayores de 65 años.

---

### Sección A. Indicación de la medicación

| ID | Criterio |
|----|----------|
| A1 | Cualquier medicamento prescrito sin una indicación clínica basada en la evidencia |
| A2 | Cualquier medicamento prescrito con una duración superior a la recomendada, cuando la duración del tratamiento está bien definida |
| A3 | Cualquier prescripción concomitante de dos fármacos de la misma clase para su uso diario y regular (con excepción de las prescripciones a demanda) como dos AINE, ISRS, diuréticos de asa, IECA, anticoagulantes, neurolépticos, opioides (debe optimizarse la monoterapia con un único fármaco de esa clase antes de considerar uno nuevo) |

---

### Sección B. Sistema cardiovascular

| ID | Criterio |
|----|----------|
| B1 | Digoxina para la insuficiencia cardíaca con función sistólica ventricular conservada (no hay evidencia clara de su beneficio) |
| B2 | Verapamilo o diltiazem en la insuficiencia cardíaca grado III o IV de la NYHA (pueden empeorar la insuficiencia cardíaca con fracción de eyección reducida) |
| B3 | Betabloqueantes en combinación con verapamilo o diltiazem (riesgo de bloqueo cardíaco) |
| B4 | Fármacos para el control de la frecuencia cardíaca (betabloqueantes, verapamilo, diltiazem o digoxina) con bradicardia (< 50 lpm) o con bloqueo cardíaco de segundo grado o bloqueo cardíaco completo (riesgo de hipotensión grave o asistolia) |
| B5 | Betabloqueantes en monoterapia para la hipertensión arterial no complicada (no asociada a angina de pecho, aneurismas aórticos u otras patologías donde los betabloqueantes están indicados), ya que no hay evidencia sólida de su eficacia |
| B6 | Amiodarona como tratamiento antiarrítmico de primera línea en las taquiarritmias supraventriculares (mayor riesgo de efectos secundarios graves que los betabloqueantes, digoxina, verapamilo o diltiazem) |
| B7 | Diuréticos de asa como tratamiento de primera línea de la hipertensión, salvo que exista insuficiencia cardíaca concomitante que requiera tratamiento diurético (falta de datos para esta indicación; existen alternativas más seguras y efectivas) |
| B8 | Diuréticos de asa para los edemas maleolares sin evidencia clínica, bioquímica o radiológica de insuficiencia cardíaca, insuficiencia hepática, síndrome nefrótico o insuficiencia renal (la elevación de los miembros inferiores y/o las medias de compresión son generalmente más apropiadas) |
| B9 | Diuréticos tiazídicos en presencia de hipopotasemia (potasio sérico < 3,0 mmol/l), hiponatremia (sodio sérico < 130 mmol/l) o hipercalcemia (calcio sérico corregido > 2,65 mmol/l) significativas, o con antecedentes de gota (las tiazidas pueden producir hipopotasemia, hiponatremia, hipercalcemia y gota) |
| B10 | Diuréticos de asa para el tratamiento de la hipertensión cuando existe incontinencia urinaria (pueden empeorar la incontinencia) |
| B11 | Antihipertensivos de acción central como metildopa, clonidina, moxonidina, rilmenidina o guanfacina, salvo que exista intolerancia o falta de eficacia con otros antihipertensivos (los antihipertensivos de acción central son generalmente peor tolerados por los mayores que por los jóvenes) |
| B12 | IECA o ARA-II en pacientes con hiperpotasemia (potasio sérico > 5,5 mmol/l) |
| B13 | Antagonistas de la aldosterona (p. ej., espironolactona, eplerenona) junto con otros fármacos que puedan aumentar los niveles de potasio (p.ej., IECA, ARA-II, amilorida, triamtereno) sin monitorizar el potasio sérico (riesgo de hiperpotasemia grave > 6,0 mmol/l; el potasio sérico debería monitorizarse periódicamente, al menos cada 6 meses) |
| B14 | Inhibidores de la fosfodiesterasa 5 (p.ej., sildenafilo, tadalafilo, vardenafilo) en la insuficiencia cardíaca grave con hipotensión (presión arterial sistólica < 90 mmHg) o asociados al tratamiento de la angina de pecho con nitratos (riesgo de colapso cardiovascular) |
| B15 | Medicamentos que prolongan el intervalo QT corregido (QTc) en pacientes con QTc previamente prolongado (> 450 ms en hombres y > 470 ms en mujeres), incluyendo quinolonas, macrólidos, ondansetrón, citalopram (dosis > 20 mg/día), escitalopram (dosis > 10 mg/día), antidepresivos tricíclicos, litio, haloperidol, digoxina, antiarrítmicos de los grupos Ia y III, tizanidina, fenotiazinas, astemizol, mirabegrón (riesgo de arritmias ventriculares potencialmente mortales) |
| B16 | Estatinas como prevención primaria de eventos cardiovasculares en ≥ 85 años y fragilidad establecida con una esperanza de vida menor a 3 años (falta evidencia de su eficacia) |
| B17 | AINE sistémicos (no tópicos) a largo plazo si hay antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica (mayor riesgo de trombosis) |
| B18 | Antipsicóticos a largo plazo si hay antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica (mayor riesgo de trombosis) |
| B19 | AINE o corticoides sistémicos en presencia de insuficiencia cardíaca que requiera el uso de diuréticos de asa (riesgo de descompensación de insuficiencia cardíaca) |
| B20 | Antihipertensivos en la estenosis aórtica grave sintomática excepto los inhibidores del sistema renina-angiotensina (riesgo de hipotensión grave y síncopes) |
| B21 | Digoxina como tratamiento de primera línea para el control de la frecuencia cardíaca a largo plazo (> 3 meses) en la fibrilación auricular (mayor mortalidad; son preferibles los betabloqueantes cardioselectivos) |

---

### Sección C. Antiagregantes/anticoagulantes

| ID | Criterio |
|----|----------|
| C1 | Ácido acetilsalicílico (AAS) en tratamiento crónico a dosis superiores a 100 mg al día (aumento del riesgo de sangrado sin evidencia de mayor eficacia) |
| C2 | Antiagregantes, antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa en presencia de un riesgo significativo de sangrado (p.ej., hipertensión grave no controlada, diátesis hemorrágicas, sangrado reciente espontáneo significativo) (alto riesgo de sangrado) |
| C3 | AAS más clopidogrel para la prevención secundaria del ictus durante más de 4 semanas, salvo que el paciente tenga un stent coronario implantado en los 12 meses previos, un síndrome coronario agudo o una estenosis carotídea grave sintomática (no hay evidencia de beneficios a largo plazo frente al clopidogrel en monoterapia) |
| C4 | Antiagregantes junto con antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa en pacientes con fibrilación auricular crónica, salvo que el paciente tenga un stent coronario o una estenosis coronaria de alto grado (> 50%) objetivada por coronariografía (el antiagregante no aporta beneficios) |
| C5 | Antiagregantes junto con antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa en pacientes con enfermedad coronaria, cerebrovascular o arterial periférica estables sin una clara indicación de anticoagulación (el tratamiento combinado no aporta beneficios) |
| C6 | Ticlopidina en cualquier circunstancia (clopidogrel y prasugrel tienen eficacia similar, evidencia más sólida y menos efectos secundarios) |
| C7 | Antiagregantes como alternativa a los antagonistas de la vitamina K, los inhibidores directos de la trombina o los inhibidores directos del factor Xa para la prevención del ictus en pacientes con fibrilación auricular crónica (no hay evidencia de eficacia) |
| C8 | Antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa para un primer episodio de trombosis venosa profunda durante > 6 meses sin que persistan los factores desencadenantes ya que no se han demostrado beneficios |
| C9 | Antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa para un primer episodio de tromboembolismo pulmonar durante > 6 meses sin que persistan los factores desencadenantes ya que no se han demostrado beneficios |
| C10 | AINE junto con antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa (riesgo de hemorragia digestiva grave) |
| C11 | Antagonistas de la vitamina K como anticoagulantes de primera línea en la fibrilación auricular, salvo en presencia de prótesis valvular cardíaca metálica, estenosis mitral moderada-grave o TFGe < 15 ml/min/1,73 m² (los inhibidores directos de la trombina y los inhibidores del factor Xa son igual de eficaces y más seguros que los antagonistas de la vitamina K) |
| C12 | Inhibidores selectivos de la recaptación de la serotonina en combinación con antagonistas de la vitamina K, inhibidores directos de la trombina o inhibidores del factor Xa en pacientes con antecedentes de sangrado grave (mayor riesgo de sangrado debido a los efectos antiagregantes de los ISRS) |
| C13 | Inhibidores directos de la trombina (p.ej., dabigatrán) en combinación con diltiazem o verapamilo (aumento del riesgo de sangrado) |
| C14 | Apixabán, dabigatrán, edoxabán o rivaroxabán en combinación con fármacos inhibidores de la glucoproteína P (p.ej., amiodarona, azitromicina, carvedilol, ciclosporina, dronedarona, itraconazol, ketoconazol (sistémico), macrólidos, quinina, ranolazina, tamoxifeno, ticagrelor, verapamilo) ya que aumenta el riesgo de sangrado |
| C15 | Estrógenos o andrógenos sistémicos con antecedentes de tromboembolismo venoso (aumento del riesgo de recurrencia) |
| C16 | AAS en prevención primaria de enfermedades cardiovasculares |

---

### Sección D. Sistema nervioso central

| ID | Criterio |
|----|----------|
| D1 | Antidepresivos tricíclicos en presencia de demencia, glaucoma de ángulo estrecho, trastornos de la conducción cardíaca, prostatismo, estreñimiento crónico, caídas recientes o antecedentes de retención urinaria (riesgo de empeoramiento de estas enfermedades) |
| D2 | Inicio de un antidepresivo tricíclico como tratamiento antidepresivo de primera línea (mayor riesgo de efectos secundarios con ATC que con ISRS o ISRN) |
| D3 | Inhibidores de la recaptación de serotonina/noradrenalina (p.ej., venlafaxina, duloxetina) en presencia de hipertensión grave (presión arterial sistólica > 180 mmHg ± presión arterial diastólica > 105 mmHg) (riesgo de empeoramiento de la hipertensión) |
| D4 | Neurolépticos con efectos antimuscarínicos/anticolinérgicos moderados-potentes (acepromazina, clorpromazina, clozapina, flupentixol, flufenazina, levomepromazina, olanzapina, pipotiazina, promazina, tioridazina) con antecedentes de prostatismo o retención urinaria (alto riesgo de retención urinaria) |
| D5 | Neurolépticos para los síntomas conductuales y psicológicos de la demencia sin ajustes de dosis ni revisión de la medicación en más de 3 meses (mayor riesgo de efectos secundarios extrapiramidales, empeoramiento cognitivo crónico y morbimortalidad cardiovascular) |
| D6 | Inhibidores de la recaptación de serotonina (ISRS) en presencia de hiponatremia significativa concurrente o reciente (sodio sérico < 130 mmol/l) (riesgo de precipitar o exacerbar una hiponatremia) |
| D7 | Inhibidores de la recaptación de serotonina (ISRS) en presencia de sangrado significativo concurrente o reciente (riesgo de precipitar o exacerbar hemorragias por sus efectos antiagregantes) |
| D8 | Benzodiacepinas durante ≥ 4 semanas (no hay indicación para tratamientos más prolongados; riesgo de sedación, confusión, pérdida de equilibrio, caídas, accidentes de tráfico; todas las benzodiacepinas deberían suspenderse de forma gradual si el tratamiento ha superado las 2 semanas, ya que al suspenderse de forma brusca existe riesgo de síndrome de abstinencia) |
| D9 | Benzodiacepinas para la agitación o los síntomas psicóticos de la demencia (sin evidencia de eficacia) |
| D10 | Benzodiacepinas para el insomnio durante ≥ 2 semanas (alto riesgo de dependencia, mayor riesgo de caídas, fracturas y accidentes de tráfico) |
| D11 | Hipnóticos-Z (zolpidem, zopiclona, zaleplon) para el insomnio durante ≥ 2 semanas (mayor riesgo de caídas, fracturas) |
| D12 | Neurolépticos (salvo clozapina y quetiapina) en pacientes con parkinsonismo o demencia por cuerpos de Lewy (riesgo de efectos extrapiramidales graves) |
| D13 | Anticolinérgicos/antimuscarínicos (biperideno, orfenadrina, prociclidina, trihexifenidilo) para tratar los efectos secundarios extrapiramidales de los neurolépticos (riesgo de toxicidad anticolinérgica) |
| D14 | Fármacos con efectos anticolinérgicos/antimuscarínicos potentes en pacientes con delirium o demencia (riesgo de empeoramiento cognitivo). Son fármacos con efectos anticolinérgicos potentes frecuentemente prescritos los ATC (amitriptilina, doxepina, imipramina, nortriptilina), algunos antipsicóticos (clorpromazina, clozapina, tioridazina), antihistamínicos de primera generación (difenhidramina, clorfeniramina), algunos antiespasmódicos vesicales (tolterodina, oxibutinina), hioscina, prociclidina, benzatropina, tizanidina |
| D15 | Neurolépticos antipsicóticos en pacientes con SCPD durante más de 12 semanas salvo que estos sean graves y no respondan a otros tratamientos (aumento del riesgo de ictus e infarto de miocardio) |
| D16 | Neurolépticos antipsicóticos como hipnóticos, salvo que el trastorno del sueño se deba a psicosis o SCPD (riesgo de confusión, hipotensión, efectos secundarios extrapiramidales, caídas) |
| D17 | Inhibidores de la acetilcolinesterasa con antecedentes de bradicardia persistente (< 60 lpm), bloqueo cardíaco o síncopes recurrentes de etiología no explicada (riesgo de trastornos de la conducción, síncope o lesiones) |
| D18 | Inhibidores de la acetilcolinesterasa junto con fármacos que reducen la frecuencia cardíaca, como betabloqueantes, digoxina, diltiazem, verapamilo (riesgo de trastornos de la conducción, síncope o lesiones) |
| D19 | Memantina en pacientes con epilepsia conocida previa o actual (aumento del riesgo de crisis epilépticas) |
| D20 | Nootrópicos en demencia, incluyendo Gingko biloba, piracetam, pramiracetam, fenilpiracetam, aniracetam, fosfatidilserina, modafinilo, L-teanina, ácidos grasos omega-3, Panax ginseng, rodiola, creatina (sin evidencia de eficacia) |
| D21 | Fenotiazinas como tratamiento de primera línea de la psicosis o síntomas no cognitivos de la demencia, ya que existen alternativas más seguras y eficaces (las fenotiazinas son sedantes, tienen importante toxicidad antimuscarínica en mayores, salvo la proclorperazina en náuseas/vómitos/vértigo, la clorpromazina para control del hipo persistente y la levomepromazina como antiemético en cuidados paliativos) |
| D22 | Levodopa o agonistas dopaminérgicos para el temblor esencial benigno (sin evidencia de eficacia) |
| D23 | Levodopa o agonistas dopaminérgicos para tratar los efectos secundarios extrapiramidales de los neurolépticos o el parkinsonismo por fármacos (para evitar una cascada de prescripción potencialmente inapropiada) |
| D24 | Antihistamínicos de primera generación como tratamiento de primera línea de la alergia o el prurito (actualmente están disponibles antihistamínicos más seguros, menos tóxicos y con menos efectos secundarios) |
| D25 | Antihistamínicos de primera generación para el insomnio (alto riesgo de efectos secundarios; los hipnóticos-Z son más seguros y adecuados para el tratamiento a corto plazo) |

---

### Sección E. Sistema renal

> Los siguientes medicamentos son potencialmente inapropiados en personas mayores con enfermedad renal aguda o crónica por debajo de determinados umbrales de TFGe.

| ID | Criterio |
|----|----------|
| E1 | Digoxina en tratamiento a largo plazo (> 90 días) a dosis mantenidas ≥ 125 µg/día con TFGe < 30 ml/min/1,73 m² (riesgo de intoxicación digitálica si no se monitorizan los niveles plasmáticos) |
| E2 | Inhibidores directos de la trombina (p.ej., dabigatrán) con TFGe < 30 ml/min/1,73 m² (riesgo de sangrado) |
| E3 | Inhibidores del factor Xa (p.ej., rivaroxabán, apixabán, edoxabán) con TFGe < 15 ml/min/1,73 m² (riesgo de sangrado) |
| E4 | AINE con TFGe < 50 ml/min/1,73 m² (riesgo de deterioro de la función renal) |
| E5 | Colchicina con TFGe < 10 ml/min/1,73 m² (riesgo de toxicidad por colchicina) |
| E6 | Metformina con TFGe < 30 ml/min/1,73 m² (riesgo de acidosis láctica) |
| E7 | Antagonistas de la aldosterona (p.ej., espironolactona, eplerenona) con TFGe < 30 ml/min/1,73 m² (riesgo de hiperpotasemia grave) |
| E8 | Nitrofurantoína con TFGe < 45 ml/min/1,73 m² (riesgo de toxicidad por nitrofurantoína) |
| E9 | Bisfosfonatos con TFGe < 30 ml/min/1,73 m² (mayor riesgo de insuficiencia renal aguda) |
| E10 | Metotrexato con TFGe < 30 ml/min/1,73 m² |

---

### Sección F. Sistema gastrointestinal

| ID | Criterio |
|----|----------|
| F1 | Proclorperazina o metoclopramida en presencia de parkinsonismo (riesgo de empeoramiento de los síntomas parkinsonianos) |
| F2 | Inhibidores de la bomba de protones para la enfermedad ulcerosa péptica o esofagitis péptica no complicada a dosis terapéuticas plenas durante > 8 semanas (normalmente está indicada la reducción de la dosis, la retirada o el tratamiento de mantenimiento con antagonistas H2) |
| F3 | Medicamentos que suelen causar estreñimiento (p.ej., antimuscarínicos/anticolinérgicos, hierro oral, opioides, verapamilo, antiácidos con aluminio) en pacientes con estreñimiento crónico cuando existan alternativas que no estriñan (riesgo de exacerbar el estreñimiento) |
| F4 | Hierro oral a dosis elementales superiores a 200 mg/día (p.ej., hierro fumarato > 600 mg/día, hierro sulfato > 600 mg/día, hierro gluconato > 1.800 mg/día; no hay evidencia de mayor absorción por encima de estas dosis) |
| F5 | Corticosteroides con antecedentes de enfermedad ulcerosa péptica o esofagitis erosiva (riesgo de reaparición de la enfermedad ulcerosa salvo con uso simultáneo de un IBP) |
| F6 | Antiagregantes o anticoagulantes con antecedentes de ectasia vascular antral gástrica (EVAG, «estómago en sandía») (riesgo de sangrado digestivo grave) |
| F7 | Neurolépticos en presencia de disfagia (aumento del riesgo de neumonía aspirativa) |
| F8 | Acetato de megestrol como orexígeno (aumento del riesgo de trombosis y mortalidad sin eficacia demostrada) |

---

### Sección G. Sistema respiratorio

| ID | Criterio |
|----|----------|
| G1 | Teofilina como monoterapia para la EPOC (existen alternativas más seguras y efectivas; riesgo de efectos adversos por el estrecho margen terapéutico) |
| G2 | Corticosteroides sistémicos en lugar de corticosteroides inhalados para el tratamiento de mantenimiento de la EPOC moderada-grave (exposición innecesaria a los efectos secundarios a largo plazo de los corticosteroides sistémicos; existen alternativas inhaladas más efectivas) |
| G3 | Broncodilatadores antimuscarínicos de acción larga (LAMA) (p.ej., tiotropio, aclidinio, umeclidinio, glicopirronio) con antecedentes de glaucoma de ángulo estrecho (pueden exacerbar el glaucoma) u obstrucción del tracto urinario inferior (pueden causar retención urinaria) |
| G4 | Benzodiacepinas con insuficiencia respiratoria aguda o crónica (p.ej., pO2 < 60 mmHg ± pCO2 > 50 mmHg; riesgo de exacerbación de la insuficiencia respiratoria) |

---

### Sección H. Sistema musculoesquelético

| ID | Criterio |
|----|----------|
| H1 | AINE, exceptuando los inhibidores selectivos de la COX-2, con antecedentes de enfermedad ulcerosa péptica o hemorragia digestiva, salvo con el uso simultáneo de un IBP o un antagonista H2 (riesgo de reaparición de la enfermedad ulcerosa) |
| H2 | AINE en presencia de hipertensión grave mantenida (presión arterial sistólica > 170 mmHg y/o presión arterial diastólica mantenida > 100 mmHg habitualmente) (riesgo de empeoramiento de la hipertensión) |
| H3 | AINE a largo plazo (> 3 meses) para el tratamiento sintomático del dolor de la artrosis cuando no se ha probado el paracetamol (los analgésicos simples son preferibles, normalmente igual de efectivos para el tratamiento del dolor) |
| H4 | Corticosteroides a largo plazo (> 3 meses) como monoterapia para la artritis reumatoide (riesgo de efectos secundarios sistémicos de los corticosteroides) |
| H5 | Corticosteroides (salvo inyecciones intraarticulares periódicas para el dolor monoarticular) para la artrosis (riesgo de efectos secundarios sistémicos de los corticosteroides) |
| H6 | AINE o colchicina a largo plazo (> 3 meses) para el tratamiento crónico de la gota cuando no existe contraindicación para los inhibidores de la xantina-oxidasa (p.ej., alopurinol, febuxostat) (los inhibidores de la xantina-oxidasa son los fármacos profilácticos de primera elección en la gota) |
| H7 | AINE en combinación con corticosteroides para el tratamiento de la artritis/enfermedades reumatológicas de cualquier clase (mayor riesgo de enfermedad ulcerosa péptica) |
| H8 | Bisfosfonatos orales en pacientes con antecedentes de enfermedades digestivas altas (p.ej., disfagia, esofagitis, gastritis, duodenitis, enfermedad ulcerosa péptica o hemorragia digestiva alta) (riesgo de reaparición/exacerbación de esofagitis, úlcera esofágica o estenosis esofágica) |
| H9 | Opioides a largo plazo para el tratamiento de la artrosis (sin evidencia de eficacia, aumentan el riesgo de efectos secundarios graves) |

---

### Sección I. Sistema urogenital

| ID | Criterio |
|----|----------|
| I1 | Fármacos antimuscarínicos sistémicos en presencia de demencia o deterioro cognitivo crónico (aumentan el riesgo de confusión y de agitación) |
| I2 | Fármacos antimuscarínicos sistémicos en presencia de glaucoma de ángulo estrecho (riesgo de exacerbación) |
| I3 | Fármacos antimuscarínicos sistémicos para el tratamiento de síntomas urinarios en hiperplasia benigna de próstata y volumen residual posmiccional > 200 ml (sin clara eficacia y con mayor riesgo de retención urinaria en hombres mayores) |
| I4 | Fármacos antimuscarínicos sistémicos en presencia de estreñimiento (riesgo de empeoramiento del estreñimiento) |
| I5 | Bloqueantes alfa-1-adrenérgicos (exceptuando la silodosina) (p.ej., alfuzosina, doxazosina, indoramina, tamsulosina, terazosina) en presencia de hipotensión ortostática sintomática o antecedentes de síncope (riesgo de desencadenar síncopes de repetición) |
| I6 | Mirabegrón en presencia de hipertensión lábil o grave (riesgo de empeoramiento de la hipertensión) |
| I7 | Duloxetina en presencia de urgencia urinaria o la incontinencia urinaria por urgencia (está indicada en la incontinencia urinaria de esfuerzo, no en la urgencia urinaria o la incontinencia urinaria por urgencia) |
| I8 | Antibióticos para el tratamiento de la bacteriuria asintomática (no está indicado su tratamiento) |

---

### Sección J. Sistema endocrino

| ID | Criterio |
|----|----------|
| J1 | Sulfonilureas de vida media larga (p.ej., glibenclamida, clorpropamida, glimepirida) para la diabetes mellitus tipo 2 (riesgo de hipoglucemia prolongada) |
| J2 | Tiazolidindionas (p.ej., rosiglitazona, pioglitazona) en pacientes con insuficiencia cardíaca (riesgo de descompensación de insuficiencia cardíaca) |
| J3 | Betabloqueantes no cardioselectivos en pacientes con diabetes mellitus con frecuentes episodios de hipoglucemia (riesgo de enmascaramiento de los síntomas de hipoglucemia) |
| J4 | Inhibidores del cotransportador sodio-glucosa tipo 2 (iSGLT2) (p.ej., canagliflozina, dapagliflozina, empagliflozina, ertugliflozina) en presencia de hipotensión sintomática (riesgo de exacerbación de la hipotensión) |
| J5 | Estrógenos sistémicos con antecedentes de cáncer de mama (aumento del riesgo de recurrencia) |
| J6 | Estrógenos sistémicos con antecedentes de tromboembolismo venoso (aumento del riesgo de recurrencia) |
| J7 | Terapia hormonal sustitutiva (estrógenos con progestágenos) con antecedentes de enfermedad coronaria, cerebrovascular o arterial periférica (aumento del riesgo de trombosis arterial aguda) |
| J8 | Estrógenos sistémicos sin progestágenos en mujeres con útero intacto (riesgo de cáncer de endometrio) |
| J9 | Levotiroxina para el hipotiroidismo subclínico (T4 libre normal con TSH elevada, pero < 10 U/l) (sin evidencia de beneficio, riesgo de tirotoxicosis iatrogénica) |
| J10 | Análogos de la vasopresina (p.ej., desmopresina, vasopresina) para la incontinencia urinaria o la poliaquiuria (riesgo de hiponatremia sintomática) |

---

### Sección K. Fármacos que aumentan de forma predecible el riesgo de caídas en personas mayores

| ID | Criterio |
|----|----------|
| K1 | Benzodiacepinas en pacientes con caídas de repetición (pueden reducir el nivel de conciencia y deteriorar el equilibrio) |
| K2 | Neurolépticos en pacientes con caídas recurrentes (pueden causar parkinsonismo) |
| K3 | Vasodilatadores en pacientes con caídas de repetición con hipotensión postural persistente (descenso de la presión arterial sistólica ≥ 20 mmHg y/o descenso de la presión arterial diastólica ≥ 10 mmHg) (riesgo de síncopes, caídas) |
| K4 | Hipnóticos-Z (p.ej., zopiclona, zolpidem, zaleplon) en pacientes con caídas de repetición (pueden causar sedación diurna prolongada, ataxia) |
| K5 | Antiepilépticos en pacientes con caídas de repetición (pueden reducir el nivel de conciencia, pueden deteriorar la función del cerebelo) |
| K6 | Antihistamínicos de primera generación en pacientes con caídas de repetición (pueden reducir el nivel de conciencia) |
| K7 | Opioides en pacientes con caídas de repetición (pueden reducir el nivel de conciencia) |
| K8 | Antidepresivos en pacientes con caídas de repetición (pueden reducir el nivel de conciencia) |
| K9 | Bloqueantes alfa-1-adrenérgicos como antihipertensivos en pacientes con caídas de repetición (pueden causar hipotensión ortostática) |
| K10 | Bloqueantes alfa-1-adrenérgicos (exceptuando la silodosina) para los síntomas prostáticos obstructivos en pacientes con caídas de repetición (pueden causar hipotensión ortostática) |
| K11 | Antihipertensivos de acción central (pueden reducir el nivel de conciencia y pueden causar hipotensión ortostática) |
| K12 | Antimuscarínicos para el tratamiento de la vejiga hiperactiva o la incontinencia urinaria de urgencia (pueden reducir el nivel de conciencia) |

---

### Sección L. Analgésicos

| ID | Criterio |
|----|----------|
| L1 | Opioides potentes orales o transdérmicos (morfina, oxicodona, fentanilo, buprenorfina, diamorfina, metadona, tramadol, petidina, pentazocina) como tratamiento de primera línea para el dolor leve (inobservancia de la escala analgésica de la OMS; no se ha usado paracetamol o AINE como tratamiento de primera línea) |
| L2 | Opioides en uso habitual (no a demanda) sin asociar laxantes (riesgo de estreñimiento grave) |
| L3 | Opioides de acción prolongada sin opioides de acción rápida para el dolor irruptivo moderado o grave (riesgo de falta de control del dolor severo) |
| L4 | Parche de lidocaína tópica para el tratamiento del dolor crónico de la artrosis (sin clara evidencia de eficacia) |
| L5 | Gabapentinoides (p.ej., gabapentina, pregabalina) para el tratamiento del dolor no neuropático (sin evidencia de eficacia) |
| L6 | Paracetamol a dosis ≥ 3 g/día en pacientes malnutridos (p.ej. IMC < 18) o hepatopatía crónica (riesgo de hepatotoxicidad) |

---

### Sección M. Carga antimuscarínica/anticolinérgica

| ID | Criterio |
|----|----------|
| M1 | Uso concomitante de dos o más fármacos con propiedades antimuscarínicas/anticolinérgicas (p.ej., antiespasmódicos vesicales, antiespasmódicos intestinales, antidepresivos tricíclicos, antihistamínicos de primera generación, neurolépticos) (riesgo de aumento de la toxicidad antimuscarínica/anticolinérgica) |

---

## Resumen numérico de criterios STOPP v3

| Sección | Nombre | N.º criterios |
|---------|--------|---------------|
| A | Indicación de la medicación | 3 |
| B | Sistema cardiovascular | 21 |
| C | Antiagregantes/anticoagulantes | 16 |
| D | Sistema nervioso central | 25 |
| E | Sistema renal | 10 |
| F | Sistema gastrointestinal | 8 |
| G | Sistema respiratorio | 4 |
| H | Sistema musculoesquelético | 9 |
| I | Sistema urogenital | 8 |
| J | Sistema endocrino | 10 |
| K | Riesgo de caídas | 12 |
| L | Analgésicos | 6 |
| M | Carga anticolinérgica | 1 |
| **Total** | | **133** |

---

## Notas para implementación en `criteria.json`

1. Cada criterio necesita su `id` (formato `STOPP-X##`), `type: "STOPP"`, `system` correspondiente, `summary` con el texto, `severity` y un bloque `logic` en json-logic.
2. Los campos de `PatientCase` disponibles para la lógica incluyen: `diagnoses` (array de strings), `medications` (array de objetos con `id` y `drugClasses`), `labs` (objeto con propiedades como `egfr_ml_min_173`, `potasio_mmol_l`, `sodio_mmol_l`, `calcio_corregido_mmol_l`, `tsh_u_l`, `t4_libre`, `hemoglobina_g_dl`, `fosforo_mmol_l`, etc.), y `patientInfo` (con `age`, `sex`, `weight`, `height`, `bmi`, `fragilidad`, etc.).
3. Usar operador `inDrugClass` para comprobar si el paciente toma medicamentos de una clase concreta. Las clases deben estar en MAYÚSCULAS en `medications.ts` y se normalizan a minúsculas en evaluación.
4. Para criterios que dependen de combinaciones de fármacos, usar operadores como `multipleNSAIDs`, `multipleLoopDiuretics`, etc.
5. Para criterios que deben excluir medicaciones del autocomplete, añadir bloque `excludes`.
