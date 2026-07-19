# Revisión: visibilidad clínica por sistema

## Alcance y resultado

Auditoría diagnóstica de los 216 criterios de `criteria.json`, seguida de la
implementación de la visibilidad farmacológica multiclase.

- Las 91 clases farmacológicas referenciadas por `inDrugClass` existen en
  `medications.ts`.
- Los 130 códigos de diagnóstico referenciados literalmente existen en
  `DIAGNOSIS_MAP` y `DIAGNOSIS_GROUPS`.
- Las omisiones de visibilidad de medicamentos descritas en las secciones 2 y 3
  quedaron corregidas mediante intersección por medicamento, relevancia explícita
  para operadores especiales y cobertura taxonómica.
- No se han encontrado diagnósticos ausentes del catálogo, aunque sí dependencias
  diagnósticas implícitas que el índice de relevancia no registra.

## 1. Reglas actuales

### Medicamentos

1. La categoría principal y el grupo se declaran manualmente en
   `medications-taxonomy.ts`.
2. `extractReferences()` reconoce clases expresadas mediante `inDrugClass`; para
   operadores especiales, `buildRelevance()` une
   `relevance.medicationClasses`.
3. El campo `system` del criterio se convierte en uno o varios tabs mediante
   `SYSTEM_TO_TABS` (`system-relevance.ts:21-36`).
4. La visibilidad se decide por la intersección entre todas las clases de cada
   medicamento y las clases relevantes del tab. Los grupos foráneos se filtran
   al subconjunto coincidente y se deduplican por ID.
5. E1, F2 y F4 declaran relevancia explícita para Digoxina, IBP y hierro oral.
   `excludes` no genera relevancia y solo participa en el cálculo de
   medicamentos desaconsejados.
6. `additionalCategories` está declarado en la taxonomía, pero
   `computeMedGroupBuckets()` no lo consulta. Actualmente es metadato sin efecto.

### Diagnósticos

1. El tab principal lo decide manualmente `DIAGNOSIS_GROUPS[label]` en
   `diagnoses.ts`.
2. `DIAGNOSIS_SUBGROUPS` solo decide el subgrupo visual dentro del tab.
3. `TAB_ORDER` crea los tabs principales. Los sistemas incluidos en
   `OTROS_SYSTEMS` se agrupan en `Otros` (`diagnoses-taxonomy.ts:16-53`).
4. Un diagnóstico aparece como **relevante de otro sistema** cuando:
   - la lógica contiene literalmente `in: [codigo, { var: "diagnoses" }]`;
   - el `system` del criterio está mapeado a ese tab;
   - su tab principal es distinto.
5. El extractor no distingue referencias positivas de negaciones o exclusiones:
   cualquier referencia literal genera relevancia.
6. `Otros` nunca recibe relevantes de otros sistemas
   (`group-visibility.ts:122`).
7. Un diagnóstico catalogado siempre aparece como mínimo en su tab principal.
   No aparecería si faltase en `DIAGNOSIS_GROUPS`, si su código no coincidiese con
   `DIAGNOSIS_MAP`, si el sistema del criterio no estuviese mapeado o si la
   dependencia fuese implícita y no literal.

## 2. RESUELTO — Digoxina no aparecía en Renal

STOPP-E1 pertenece a `Sistema renal`, menciona Digoxina y la excluye, pero su
`logic` utiliza:

- `egfrBelow`
- `digoxinaDosisAlta`

No utiliza `inDrugClass: ["DIGOXINA", ...]` (`criteria.json:748-753`).
`extractReferences()` desconoce `digoxinaDosisAlta` y no inspecciona
`excludes.drugClasses`. En consecuencia, `DIGOXINA` no se añade a
`specificClassesByTab["renal"]`.

Digoxina está correctamente catalogada como `DIGOXINA`, pero su grupo es
unitario y pertenece a Cardiovascular (`medications.ts:103-106`;
`medications-taxonomy.ts:43`). Los grupos unitarios extranjeros solo aparecen
cuando su clase está en la relevancia específica del tab. Por eso E1 se evalúa
correctamente en el motor, pero Digoxina no aparece en “Relevantes de otros
sistemas” de Renal.

**Resolución:** E1 declara `relevance.medicationClasses: ["DIGOXINA"]` y el
cálculo por medicamento hace aflorar Digoxina en Renal. Existe una regresión con
los datos clínicos reales.

## 3. Otros medicamentos con omisiones equivalentes

| Criterio | Medicamento o clase que no aflora correctamente | Tab esperado | Causa |
|---|---|---|---|
| STOPP-E2 | Dabigatrán / `INHIBIDOR_DIRECTO_TROMBINA` | Renal | La lógica usa una clase sin grupo equivalente; el grupo visible es AOD / `ANTICOAGULANTE_DIRECTO`. |
| STOPP-E3 | Apixabán, edoxabán y rivaroxabán / `INHIBIDOR_FACTOR_XA` | Renal | La clase lógica no coincide con la clase del grupo AOD. |
| STOPP-E8 | Nitrofurantoína / `NITROFURANTOINA` | Renal | El grupo visible usa `ANTIBIOTICO_URINARIO`. |
| STOPP-E10 | Metotrexato / `ANTIMETABOLITO` | Renal | El medicamento está agrupado como FAME. |
| STOPP-F4 | Hierro oral | Gastrointestinal | Usa el operador especial `medicationClassDoseMgAbove`, que no se extrae. |
| START-F6 | `ANTIBIOTICO` | Gastrointestinal | No existe un grupo con esa clase agregada; los antibióticos están divididos en grupos más concretos. |
| STOPP-I8 | `ANTIBIOTICO` | Urológico | Mismo desacoplamiento entre clase lógica y grupos visibles. |
| STOPP-J10 | Desmopresina y vasopresina / `ANALOGO_VASOPRESINA` | Endocrino | La clase existe en el catálogo, pero no tiene grupo taxonómico. |
| STOPP-D14 | Parte de `ANTICOLINERGICO` | SNC | No existe grupo agregado; solo afloran los miembros alcanzados por otras clases. |
| STOPP-F3 | Parte de `ANTICOLINERGICO` | Gastrointestinal | Mismo desacoplamiento. |
| STOPP-I2 | Anticolinérgicos no urinarios | Urológico | Solo afloran los incluidos en el grupo urinario. |
| STOPP-B15 | Parte de `PROLONGADOR_QTC` | Cardiovascular | No existe grupo agregado; varios miembros quedan fuera si ninguna otra clase los hace aflorar. |
| STOPP-C14 | Parte de `INHIBIDOR_GLUCOPROTEINA_P` | Anticoagulantes | No existe un grupo con esa clase. |

El extractor sintáctico continúa sin interpretar operadores especiales. E1, F2
y F4 compensan esta limitación mediante relevancia explícita. Los operadores de
duplicidad `multiple*` pertenecen a sistemas transversales y se mantienen fuera
del índice hasta decidir la política transversal.

**Estado:** las omisiones visibles de la tabla quedaron resueltas. La
intersección usa todas las clases de cada medicamento, incluso si la clase del
grupo visual es distinta o el grupo no declara `drugClass`. E1 y F4 aportan el
metadato que faltaba; J10 dispone de grupo propio para análogos de vasopresina.
Además, todos los medicamentos pertenecientes a clases referenciadas quedan
cubiertos por al menos un grupo taxonómico.

### Defecto de catálogo separado

Paroxetina y Fluvoxamina aparecen en `excludes.medications` de
STOPP-A3-ISRS-DUPLICIDAD, STOPP-C12 y STOPP-D7, pero no existen en
`MEDICATIONS`. No son seleccionables y el motor omite su exclusión al no poder
crear el medicamento de prueba (`criteria-engine.service.ts:131-134`).

**Clasificación:** BUG de catálogo/exclusiones, independiente de la visibilidad
entre tabs.

## 4. Diagnósticos: resultado de la auditoría

No hay códigos literales usados por criterios que falten en el catálogo. Los
casos encontrados son apariciones secundarias amplias o discutibles, no
diagnósticos desaparecidos.

### Relevancias secundarias destacadas

| Sistema del criterio | Diagnósticos de otros tabs que aparecen como relevantes |
|---|---|
| Cardiovascular | Gota, alteraciones metabólicas, incontinencia urinaria, fragilidad, déficit de hierro, insuficiencia renal/hepática y síndrome nefrótico. |
| Anticoagulantes/Antiagregantes | HTA, FA, enfermedad vascular, valvulopatías e ictus aparecen en Hematológico. |
| Sistema nervioso central | Todas las referencias se expanden conjuntamente a Neurológico y Psiquiátrico, aunque pertenezcan solo a uno de ellos o a otros sistemas. |
| Renal | Hiperparatiroidismo secundario, hiperfosfatemia y anemia sintomática. |
| Gastrointestinal | Parkinsonismo. |
| Respiratorio | Glaucoma y obstrucción urinaria. |
| Musculoesquelético | Úlcera, hemorragia digestiva, disfagia, HTA, dolor y caídas. |
| Urogenital | Todas las referencias se expanden a Urológico y Ginecológico, incluso cuando solo corresponden a uno. |
| Endocrino | Todas las referencias se expanden a Endocrino y Metabólico. |

### Sistemas transversales

`Riesgo de caídas`, `Analgésicos`, `Carga
antimuscarínica/anticolinérgica` e `Indicación de la medicación` usan el comodín
transversal. Sus referencias se propagan a todos los tabs conocidos.

Esto hace, por ejemplo, que tipos de dolor, artrosis, caídas, hipotensión,
hepatopatía o neuralgia aparezcan como relevantes en tabs sin una relación
orgánica directa. Es el comportamiento previsto por el algoritmo, pero requiere
validación clínica.

### Las negaciones también generan relevancia

El recorrido es puramente sintáctico. Por ejemplo, una condición expresada como
“no dolor neuropático” o “no artrosis” hace que Dolor neuropático o Artrosis se
consideren relevantes igualmente. Técnicamente es coherente con el código, pero
“referenciado por una regla” no equivale siempre a “dato útil para mostrar en
ese tab”.

## 5. Dependencias diagnósticas implícitas no indexadas

`egfrBelow` recibe el caso completo y consulta los diagnósticos:

- `enfermedad_renal_grave` como sustituto de TFGe < 30;
- `insuficiencia_renal_terminal` como sustituto de TFGe < 15.

Esto permite activar STOPP-E1, E2, E3, E4, E6, E7, E8, E9 y E10 según el umbral,
pero `extractReferences()` no registra esa dependencia porque no aparece como un
`in` literal.

**Clasificación:** BUG de integridad del índice de relevancia, actualmente sin
efecto visual: ambos diagnósticos ya tienen Renal como tab principal y los grupos
propios siempre se muestran.

## 6. Conclusiones y decisiones pendientes

### BUG resueltos

1. Digoxina y los medicamentos multiclase ya afloran aunque la clase relevante
   no coincida con la clase que nombra su grupo visual.
2. Los medicamentos de clases usadas por criterios tienen cobertura
   taxonómica; un test protege este invariante.

### Pendientes fuera de esta implementación

1. `egfrBelow` introduce dependencias diagnósticas que el índice no conoce.
2. Paroxetina y Fluvoxamina están referenciadas en exclusiones, pero no
   catalogadas.

### VERIFICAR clínicamente

1. Si la relevancia debe incluir condiciones negadas y exclusiones.
2. Si los sistemas SNC, Urogenital y Endocrino deben expandirse siempre a sus dos
   tabs asociados.
3. Si los sistemas transversales deben propagar todos sus diagnósticos y grupos a
   todos los tabs.

### DUDA de diseño

Decidir una única fuente de verdad para la visibilidad:

- ampliar el extractor para entender operadores especiales y metadatos;
- declarar explícitamente las clases y diagnósticos relevantes en cada criterio;
- o activar y mantener manualmente `additionalCategories`.

La solución no debe basarse en coincidencias accidentales entre la clase usada
por el motor y la clase elegida para nombrar un grupo visual.

## 7. Correcciones tras la prueba manual

La revisión manual posterior detectó dos interacciones no cubiertas:

1. Los grupos unitarios que afloraban en un sistema foráneo podían quedar
   ocultos en su categoría principal. La regla se corrigió para que todo
   unitario con relevancia específica en algún tab permanezca visible también
   en su tab principal. Los unitarios exclusivamente transversales, como
   Paracetamol y Lidocaína parche, continúan en Otros.
2. La deduplicación por ID podía asignar un medicamento al primer grupo
   multiclase por orden alfabético. Ahora se prioriza el grupo cuya
   `drugClass` coincide directamente con la clase relevante. En Renal, los
   bifosfonatos aparecen bajo Bifosfonatos y no quedan capturados por
   Antirresortivos.

También se corrigió STOPP-I8: su lógica afecta a cualquier `ANTIBIOTICO`, por lo
que su exclusión preventiva utiliza la misma clase agregada en lugar de limitarse
a `ANTIBIOTICO_URINARIO`.
