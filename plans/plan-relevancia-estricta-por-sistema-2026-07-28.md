# Plan — Relevancia estricta por sistema en «Relevantes de otros sistemas» (2026-07-28)

> Origen: revisión con los tutores (2026-07-28). Diagnóstico verificado contra
> `src/assets/data/criteria.json` (218 criterios), `medications.ts`,
> `medications-taxonomy.ts`, `system-relevance.ts` y `group-visibility.ts`.
>
> **Problema declarado por los tutores:** «cualquier checkbox de "Relevantes de
> otros sistemas" debería resaltar un elemento de la pestaña actual relacionado.
> Si no tiene relación con nada, es decir si no se enciende un aviso de la
> pestaña actual, no debería estar ahí.»
>
> **Regla implementable derivada:** un fármaco solo puede aparecer en el bucket
> «Relevantes de otros sistemas» del tab T si está referenciado por al menos un
> criterio cuyo `system` mapea **específicamente** a T (sin comodín transversal).
> No se puede exigir que el criterio *dispare* en el momento de marcar la
> casilla — no hay diagnósticos ni dosis todavía —, pero sí que el fármaco sea
> candidato real a disparar un criterio de esa sección.
>
> **Estado:** implementado (Fases 1, 2, 3.3, 6). Pendientes de tutores: 3.1 y 3.2.
> Fase 5 (limpieza de `classesByTab`/`dxsByTab`) no aplicada a propósito.

## 0. Diagnóstico verificado

| Observación de los tutores | Diagnóstico | Fase |
|---|---|---|
| Clorfeniramina seleccionable en cardiovascular | Confirmado. `ANTIHISTAMINICO` aparece en 3 criterios: 2 de *Sistema nervioso central* y 1 de *Riesgo de caídas*. Ninguno cardiovascular | 1 |
| Benzodiacepinas, opioides, gabapentinoides, hipnóticos Z, ISRS, IRSN, antiepilépticos, antiespasmódicos urinarios, antiparkinsonianos, laxantes en cardiovascular | Misma causa raíz única (ver abajo) | 1 |
| Alfabloqueantes «sin criterio cardiovascular explícito» | **Resuelto contra el texto fuente (2026-07-28): los tutores se equivocan.** B20 dice «Antihipertensivos […] excepto los inhibidores del sistema renina-angiotensina»; los alfabloqueantes son antihipertensivos y no son inhibidores del SRA → dentro del alcance. `STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA` los cita en polaridad positiva y su `summary` los nombra. **Permanecen en cardiovascular, sin cambios.** Pero abre el sub-hallazgo 3.2 | 3.2 |
| Quinina: «el documento menciona quinolonas en B15, no quinina» | Confirmado como problema de dato, no de motor. Ni "quinina" ni "tamoxifeno" aparecen en ningún criterio, pero ambos llevan la clase `PROLONGADOR_QTC` (`medications.ts:308,310`) y `STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO` es cardiovascular | 3.1 |
| Tamoxifeno en cardiovascular | Igual que quinina | 3.1 |
| «Si solo queda un elemento del grupo relacionado, solo ese debe permanecer» | Ya implementado: `relevantDrugs()` filtra a nivel de fármaco usando `medication.drugClasses` (`group-visibility.ts:49-56`). Sale gratis al corregir el conjunto de clases; añadir test de regresión | 1.4 |
| «Al marcar debe resaltarse lo relacionado en la pestaña actual» | No implementado. `Relevance` guarda `Set<string>` de clases sin procedencia; no hay forma de saber *qué criterio* justifica cada casilla | 2 |

### Causa raíz (Fase 1)

`system-relevance.ts:33-36` marca cuatro sistemas como `TRANSVERSAL`:

```ts
'Analgésicos':                           [TRANSVERSAL],
'Riesgo de caídas':                      [TRANSVERSAL],
'Carga antimuscarínica/anticolinérgica': [TRANSVERSAL],
'Indicación de la medicación':           [TRANSVERSAL],
```

Son **31 de los 218 criterios** (8 + 14 + 1 + 8). `buildRelevance` los expande a
**todos** los tabs (`system-relevance.ts:186-191`) y los acumula en
`classesByTab`. Después, `computeMedGroupBuckets` usa esa relevancia expandida
para los grupos multi-fármaco:

```ts
// group-visibility.ts:128
const allowed = group.drugs.length > 1 ? fullClasses : specificClasses;
```

`fullClasses` = `classesByTab` (incluye transversal) → todo grupo con ≥2
fármacos tocado por caídas / carga anticolinérgica / analgésicos / indicación
aflora en **todas** las pestañas. Los grupos unitarios ya usan `specificClasses`
y por eso no presentan el fallo.

### Contraste esperado tras el fix

Clases con criterio cardiovascular explícito (26), calculadas de `criteria.json`:

```
AINE, ALFABLOQUEANTE, ANTAGONISTA_ALDOSTERONA, ANTIARITMICO,
ANTIARITMICO_CLASE_III, ANTIHIPERTENSIVO_CENTRAL, ARA2, BETABLOQUEANTE,
BETABLOQUEANTE_CARDIOSELECTIVO, BETABLOQUEANTE_NO_CARDIOSELECTIVO,
CALCIOANTAGONISTA_DHP, CALCIOANTAGONISTA_NO_DHP, CORTICOIDE_SISTEMICO,
DIGOXINA, DIURETICO_AHORRADOR_POTASIO, DIURETICO_ASA, DIURETICO_TIAZIDICO,
ESTATINA, HIERRO_IV, IECA, INHIBIDOR_PDE5, ISGLT2, NEUROLEPTICO, NITRATO,
PROLONGADOR_QTC, SACUBITRILO_VALSARTAN
```

Cubre la lista «sí tienen criterio cardiovascular explícito» de los tutores
(AINE→B17/B19, CORTICOIDE→B19, NEUROLEPTICO→B18, PROLONGADOR_QTC→B15,
ESTATINA→B16/START-B2, HIERRO_IV→START-B11, INHIBIDOR_PDE5→B14, ahorradores de
potasio→B13) y elimina `ANTIHISTAMINICO`, `BENZODIACEPINA`, `OPIOIDE`,
`ANTICOLINERGICO`, `GABAPENTINOIDE`, `HIPNOTICO_Z`, `ISRS`, `ISRN`, `LAXANTE`,
`ANTIEPILEPTICO`, `ANTIESPASMODICO_URINARIO`, `ANTIPARKINSONIANO_ANTICOLINERGICO`.

### Lo que NO rompe (verificar en Fase 4)

- **Ningún fármaco queda inalcanzable.** Cada uno conserva su tab de origen; el
  bucket «Relevantes de otros sistemas» solo es un atajo.
- Los criterios transversales siguen disparando igual: `buildRelevance` afecta a
  la **visibilidad de casillas**, no a `CriteriaEngineService.evaluate`. STOPP K
  (caídas), M1 (carga anticolinérgica) y L (analgésicos) seguirán saltando al
  marcar sus fármacos en su tab propio.
- El afloramiento de grupos unitarios fuera de «Otros» ya usa
  `specificClassesByTab` vía `globallySpecificClasses` (`group-visibility.ts:81-83`,
  `114-117`): **no se toca**.
- El lado de diagnósticos ya es correcto: `computeDxGroupBuckets` usa
  `specificDxsByTab` (`group-visibility.ts:200`). Solo se añade test de regresión.

---

## Fase 1 — Filtro estricto por sistema (TDD)

Cambio de una línea en producción; el trabajo real son los tests. Toda la fase
sigue RED → GREEN → refactor, un test fallando antes de cada edición.

### 1.1 RED: casilla sin criterio del tab actual no aparece

En `src/app/core/group-visibility.spec.ts`, usando los helpers ya existentes
`makeRelevance(classesByTab, specificClassesByTab)` (líneas 35-39):

- **Test:** un grupo multi-fármaco cuya clase está en `classesByTab['cardiovascular']`
  pero **no** en `specificClassesByTab['cardiovascular']` (procedencia transversal)
  no aparece en `foreignRelevant` del tab cardiovascular.
- Debe fallar con el código actual (hoy aparece).

### 1.2 RED: la relevancia específica sí sigue aflorando

- **Test:** grupo multi-fármaco cuya clase está en `specificClassesByTab['cardiovascular']`
  (p. ej. `CORTICOIDE_SISTEMICO`, origen tab endocrino) **sí** aparece en
  `foreignRelevant` de cardiovascular, con `originTabId`/`originTabLabel` correctos.
- Debe pasar ya; es la red de seguridad contra un fix demasiado agresivo.

### 1.3 GREEN: usar siempre la relevancia específica

`src/app/core/group-visibility.ts`:

- Línea 128: `const allowed = group.drugs.length > 1 ? fullClasses : specificClasses;`
  → `const allowed = specificClasses;`
- Eliminar `fullClasses` (líneas 107-109), que queda sin uso.
- Simplificar el objeto de `candidates` (líneas 127-135): `allowed` deja de
  variar por candidato; puede salir del `map` y usarse directamente en el bucle.
- Actualizar el comentario de las líneas 105-106, que describe el comportamiento
  antiguo.

### 1.4 RED→GREEN: grupo reducido a un solo fármaco relevante

- **Test:** grupo de 3 fármacos donde solo uno tiene una clase en
  `specificClassesByTab` del tab actual → `foreignRelevant` contiene el grupo con
  `drugs.length === 1` y ese fármaco. Cubre el requisito explícito de los tutores.
- Previsiblemente pasa sin cambios; si falla, corregir `relevantDrugs`.

### 1.5 Test de integración con datos reales

Nuevo test (o ampliación de `system-relevance.spec.ts`) que carga
`criteria.json`, `MEDICATIONS` y `DRUG_CATEGORIES` reales y afirma sobre el tab
`cardiovascular`:

- `foreignRelevant` **no** contiene: `Clorfeniramina`, `Dexclorfeniramina`,
  `Difenhidramina`, `Alprazolam`, `Diazepam`, `Lorazepam`, `Gabapentina`,
  `Pregabalina`, `Zolpidem`, `Zopiclona`, `Tramadol`, `Morfina`, `Oxibutinina`,
  `Solifenacina`, `Tolterodina`, `Biperideno`, `Trihexifenidilo`, `Lactulosa`,
  `Macrogol`, `Carbamazepina`, `Levetiracetam`, `Fluoxetina`, `Sertralina`,
  `Duloxetina`, `Venlafaxina`.
- `foreignRelevant` **sí** contiene: `Prednisona`, `Ibuprofeno`, `Haloperidol`,
  `Ondansetrón`, `Mirabegrón`, `Sildenafilo`, `Litio`, `Ciprofloxacino`,
  `Azitromicina`, `Amitriptilina`, `Amilorida`, `Simvastatina`.

Este test es el contrato con la revisión de los tutores; debe leer los datos
reales, no fixtures.

### 1.6 Regresión del lado de diagnósticos

Test en `group-visibility.spec.ts` que confirma que `computeDxGroupBuckets`
ignora la relevancia transversal (usa `specificDxsByTab`) — hoy ya es así, se
fija para que no se pierda.

### 1.7 Documentación enlazada

`group-visibility.ts` y `system-relevance.ts` llevan cabecera `@linked`.
Actualizar `docs/flujo-pasos.md` y `docs/motor-criterios.md` con la regla nueva
y el papel residual de `TRANSVERSAL`. Ejecutar `scripts/check-links.sh`.

**Criterio de salida Fase 1:** suite completa en verde, `tsc` limpio,
`check-links.sh` limpio, y el test 1.5 pasando con datos reales.

---

## Fase 2 — Resaltado del criterio relacionado

> **Requisito (confirmado por el usuario 2026-07-28):** al marcar una casilla de
> «Relevantes de otros sistemas» se resalta durante unos segundos aquello —uno o
> varios elementos— **de la pestaña actual** con lo que tiene relación directa.
>
> **Restricción medida sobre los datos reales.** El elemento relacionado del tab
> actual solo existe cuando el criterio empareja el fármaco foráneo con **otra
> clase de medicación presente en ese tab**. En cardiovascular, **34 de los 46
> criterios citan una sola clase de medicación**: el resto de la condición son
> diagnósticos, que viven en el paso de diagnósticos, no en la pestaña de
> medicación. Por tanto el resaltado literal es posible en unos casos e
> imposible en otros:
>
> | Fármaco foráneo | Criterio | Qué se resalta en cardiovascular |
> |---|---|---|
> | Prednisona, ibuprofeno | B19 | Grupo «Diuréticos de asa» ✅ |
> | Sildenafilo, tadalafilo | B14 | Grupo «Nitratos» ✅ |
> | Amilorida, triamtereno | B13 | IECA / ARA-II / antagonistas de aldosterona ✅ |
> | Ondansetrón, litio, haloperidol, azitromicina, amitriptilina, mirabegrón, tizanidina, astemizol | B15 | **Nada** — la otra mitad es el QTc prolongado (diagnóstico) ❌ |
> | AINE, neurolépticos | B17 / B18 | **Nada** — la otra mitad es el antecedente vascular (diagnóstico) ❌ |
> | Estatinas | B16 | **Nada** — edad + fragilidad (diagnóstico) ❌ |
> | Hierro IV | START-B11 | **Nada** — IC + déficit de hierro (diagnóstico) ❌ |
>
> **Diseño resultante: cascada de tres niveles**, en este orden de preferencia,
> de forma que siempre se resalte algo y nunca quede una casilla muda.
>
> Nota: la Fase 6 (eliminación de los gates de dosis y duración) aumenta la
> frecuencia con que el nivel 2 está disponible, porque más criterios llegan a
> dispararse. No la sustituye: el gate de diagnóstico permanece.

### 2.1 Procedencia en `Relevance` (TDD sobre `system-relevance.spec.ts`)

- Añadir a la interfaz `Relevance`:
  ```ts
  /** tabId → (drugClass → ids de criterios específicos de ese tab que la citan) */
  readonly specificClassCriteriaByTab: ReadonlyMap<TabId, ReadonlyMap<string, ReadonlySet<string>>>;
  ```
- Rellenarlo en `buildRelevance` dentro del bloque `if (!isTransversal)`
  (`system-relevance.ts:198-206`), en el mismo recorrido que
  `specificClassesByTab`. Coste O(1) adicional por criterio.
- Tests: un criterio cardiovascular que cita `CORTICOIDE_SISTEMICO` produce
  `specificClassCriteriaByTab.get('cardiovascular').get('CORTICOIDE_SISTEMICO')`
  conteniendo su `id`; un criterio transversal no aporta nada al mapa.

### 2.2 Helper puro fármaco → criterios

En `group-visibility.ts` (o módulo nuevo `foreign-provenance.ts`):

```ts
export const foreignDrugCriterionIds = (opts: {
  drugId: string;
  tabId: string;
  relevance: Relevance | null;
  medications: readonly Med[];
}): readonly string[]
```

Interseca las `drugClasses` del fármaco con las claves del mapa del tab y
devuelve la unión ordenada y deduplicada de ids de criterio. Tests: fármaco con
dos clases relevantes → ids de ambas sin duplicados; fármaco sin relevancia en
ese tab → `[]` (invariante: tras la Fase 1, **ningún** fármaco del bucket puede
devolver `[]`; añadir test que lo verifique con datos reales, cerrando el bucle
con el requisito de los tutores).

### 2.3 Nivel 1 — Resaltar los grupos co-partícipes del tab actual

Es el resaltado que piden los tutores en su forma literal.

- Helper puro nuevo, `relatedOwnGroupIds({ drugId, tabId, relevance, categories, medications })`:
  para cada criterio devuelto por 2.2, tomar **las demás** clases que cita, e
  intersecarlas con las clases de los grupos de `groupBuckets().ownAll`. Devuelve
  ids de grupo.
- Requiere que 2.1 guarde también, por criterio, el conjunto completo de clases
  citadas. Añadir a `Relevance`:
  ```ts
  readonly classesByCriterion: ReadonlyMap<string, ReadonlySet<string>>;
  ```
- Signals `highlightedGroupIds` y `highlightedCriterionIds`, más un
  `highlightTimer` privado.
- En `toggleDrug`, cuando el fármaco pertenece a un grupo de
  `groupBuckets().foreignRelevant` **y** la acción es marcar (no desmarcar):
  calcular y escribir ambos signals, limpiarlos a los 3 s (`setTimeout`,
  cancelando el anterior; limpiar también en `ngOnDestroy`).
- Plantilla: en `.drug-col` del bucket propio añadir
  `[class.drug-col--highlight]="isGroupHighlighted(group)"`.
- CSS en `meds-step.component.css`: animación de énfasis (borde + fondo) con
  `@media (prefers-reduced-motion: reduce)` que desactive la animación y deje
  solo el cambio de color.

Tests: (a) marcar prednisona en cardiovascular resalta el grupo «Diuréticos de
asa»; (b) marcar sildenafilo resalta «Nitratos»; (c) marcar amilorida resalta
IECA, ARA-II y antagonistas de aldosterona (varios a la vez, como piden los
tutores); (d) desmarcar no resalta; (e) marcar un fármaco de `ownAll` no dispara
resaltado; (f) el resaltado se limpia a los 3 s.

### 2.4 Nivel 2 — Resaltar la tarjeta del criterio disparado

Si el nivel 1 no produce ningún grupo (los 34 criterios de una sola clase), pero
el criterio **sí** está en `applicableCriteria()`, resaltar su tarjeta.

- Plantilla: en `.crit-card` de las secciones START y STOPP
  (`meds-step.component.html:344,407`) añadir
  `[class.crit-card--highlight]="isCriterionHighlighted(c)"`.

Tests: marcar ondansetrón con «QTc prolongado» ya seleccionado resalta la
tarjeta de B15.

### 2.5 Nivel 3 — Aviso con el criterio y lo que le falta

Si no hay grupo que resaltar **ni** tarjeta visible (caso frecuente: el
diagnóstico requerido aún no está marcado), mostrar un `MatSnackBar` de 3 s:

```
Relacionado con STOPP B15 — requiere: QTc prolongado
```

Códigos vía `critCode`; los diagnósticos que faltan salen de las referencias del
criterio menos los ya seleccionados. Esto cierra el requisito «ninguna casilla
sin explicación» incluso cuando no hay nada que iluminar en pantalla, y de paso
le dice al usuario qué le falta por rellenar.

Tests: (a) marcar ondansetrón sin diagnósticos → snackbar nombrando B15 y el QTc;
(b) marcar hierro IV → snackbar nombrando START-B11.

### 2.6 Invariante de cierre

Test con datos reales: **para todo fármaco de `foreignRelevant` de todo tab**, la
cascada produce al menos un resultado (grupo, tarjeta o aviso), y
`foreignDrugCriterionIds` nunca devuelve `[]`. Es la formulación comprobable del
requisito de los tutores: ninguna casilla del bucket carece de relación con el
sistema actual.

### 2.7 Paridad en diagnósticos

Aplicar 2.1-2.6 a `DiagnosisStepComponent` usando `specificDxsByTab`, con un
mapa análogo `specificDxCriteriaByTab`. Mismo patrón, mismos tests. Aquí el
nivel 1 tiene mejor cobertura que en medicación: los criterios que emparejan dos
diagnósticos son más frecuentes.

---

## Fase 3 — Datos clínicos a validar con los tutores

3.1 y 3.2 NO son bugs de motor y no deben resolverse por iniciativa del agente:
requieren respuesta de los tutores. Dejar preparados los cambios y aplicarlos
solo tras confirmación. 3.3 sí es de motor y puede ejecutarse sin esperar.

### 3.1 `PROLONGADOR_QTC` en quinina y tamoxifeno

- `medications.ts:308`: `{ id: "Quinina", drugClasses: ["ANTIPALUDICO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] }`
- `medications.ts:310`: `{ id: "Tamoxifeno", drugClasses: ["ANTINEOPLASICO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] }`
- Si el listado de B15 de la fuente cita quinolonas y no quinina/tamoxifeno,
  retirar `PROLONGADOR_QTC` de ambos. Efecto: desaparecen de cardiovascular y
  los grupos unitarios «Antipalúdicos» y «Antineoplásicos»
  (`medications-taxonomy.ts:139,185`) dejan de aflorar ahí.
- **Antes de tocar nada:** ejecutar el mismo contraste sobre el resto de
  fármacos con `PROLONGADOR_QTC` y comprobar cuáles están nombrados
  explícitamente en B15. Presentar la lista completa a los tutores, no solo
  estos dos casos.

### 3.2 B20 y los alfabloqueantes uroselectivos (tamsulosina, alfuzosina)

**Resuelto en cuanto a la clase: los alfabloqueantes se quedan en cardiovascular.**
El texto de B20 —«Antihipertensivos en la estenosis aórtica grave sintomática
excepto los inhibidores del sistema renina-angiotensina»— los cubre por término
genérico; la única exclusión son IECA/ARA-II y el modelado la respeta. La lista
de los tutores tenía un hueco aquí. No hay cambio que hacer en la relevancia.

**Sub-hallazgo real, este sí accionable.** `ALFABLOQUEANTE` agrupa seis fármacos
(`medications.ts:211-216`): Alfuzosina, Doxazosina, Prazosina, Indoramina,
Tamsulosina, Terazosina. Tamsulosina y alfuzosina son **uroselectivos (α1A) para
HBP, no antihipertensivos** → B20 no debería dispararles. El propio catálogo ya
reconoce este matiz para un tercer fármaco:

```ts
// medications.ts:430
// SILODOSINA (alfabloqueante prostático selectivo; excluido de ALFABLOQUEANTE
// por seguridad en caídas)
{ id: "Silodosina", drugClasses: ["ALFABLOQUEANTE_PROSTATICO"] },
```

Es una inconsistencia interna: silodosina se separó, tamsulosina y alfuzosina no.

**No vale con quitarles la clase.** Para `STOPP-I5` (hipotensión/síncope), `K9` y
`K10` (caídas) tamsulosina **sí** debe llevar `ALFABLOQUEANTE`: causa hipotensión
ortostática. El arreglo va en B20, no en el fármaco. Dos opciones a presentar a
los tutores:

- (a) Clase nueva `ALFABLOQUEANTE_ANTIHIPERTENSIVO` (doxazosina, terazosina,
  prazosina, indoramina) y B20 pasa a citarla. Tamsulosina/alfuzosina conservan
  `ALFABLOQUEANTE` para I5/K9/K10. Es la opción limpia.
- (b) B20 mantiene `ALFABLOQUEANTE` y se añade una exclusión explícita de los
  uroselectivos en su lógica. Menos limpia, no escala.

Efecto en el bucket: tras (a), tamsulosina y alfuzosina dejan de ofrecerse en
cardiovascular; doxazosina, terazosina, prazosina e indoramina se quedan.

### 3.3 Polaridad de las referencias en `extractReferences`

Descubierto al verificar 3.2. `extractReferences` (`system-relevance.ts:92-124`)
recorre la lógica sin distinguir si una clase está bajo un `!`. En
`START-B1-ANTIHIPERTENSIVO-HTA`, `ALFABLOQUEANTE` aparece **solo negado**: marcar
el fármaco no enciende el aviso, lo suprime. Seis clases están en esa situación
en criterios cardiovasculares:

```
CALCIOANTAGONISTA_DHP        <- START-B1
SACUBITRILO_VALSARTAN        <- START-B1, START-B5, START-B9
BETABLOQUEANTE_CARDIOSELECTIVO / _NO_CARDIOSELECTIVO  <- START-B6
ISGLT2                       <- START-B8
HIERRO_IV                    <- START-B11
```

**Cuidado: la regla ingenua «solo polaridad positiva» rompería todos los START.**
Un START se modela por construcción como *«cumple la indicación Y NO toma ya el
fármaco»*, así que el fármaco recomendado siempre aparece negado. `HIERRO_IV` lo
demuestra: los tutores lo listan como legítimo (START-B11) y lo es, pese a
aparecer solo bajo `!`.

**Regla correcta, por tipo de criterio:**

- `type: 'STOPP'` → solo cuenta la clase en polaridad positiva (marcarla puede
  encender el aviso).
- `type: 'START'` → cuentan ambas polaridades (la clase negada *es* el fármaco
  recomendado).

Las seis clases anteriores vienen todas de criterios START, así que **hoy este
cambio no altera el bucket cardiovascular**. Se codifica como red de seguridad
para que un STOPP futuro con una clase solo negada no genere casillas fantasma.

Implementación (TDD sobre `system-relevance.spec.ts`): `walk` recibe un flag
`negated` que se invierte al descender por la clave `!`; `buildRelevance` decide
si aceptar la referencia según `c.type`. Tests: (a) STOPP con clase solo negada
→ no aparece en `specificClassesByTab`; (b) START con clase solo negada → sí
aparece; (c) `HIERRO_IV` sigue apareciendo en cardiovascular con datos reales;
(d) STOPP con la misma clase en ambas polaridades → aparece.

**Prioridad:** media. No bloquea la revisión de los tutores. Hacerlo después de
la Fase 1 y en commit propio.

---

## Fase 4 — Verificación

1. `npm test` (suite completa) + `npx tsc --noEmit` + `scripts/check-links.sh`.
2. Regenerar los checklists de prueba manual con `scripts/gen-checklist-tabs.js`
   (afectan `plans/checklist-prueba-manual-*.md`, cuyo contenido depende de la
   visibilidad por tab).
3. Ejecutar `scripts/audit-criteria.cjs` por si el filtro nuevo deja algún
   criterio sin ruta de captura para sus fármacos.
4. **E2E manual sobre el tab cardiovascular**, contrastando casilla por casilla
   contra las dos listas del correo de los tutores. Es la prueba que ellos van a
   repetir.
5. Repetir el barrido en al menos dos tabs más (SNC y renal), donde la expansión
   transversal también contaminaba.
6. Mutation testing sobre `group-visibility.ts` y `system-relevance.ts`; el fix
   es una línea y los tests deben matar el mutante que revierte a `fullClasses`.

---

## Fase 5 — Limpieza (opcional, solo tras Fase 1 y 2 en verde)

Tras la Fase 1, `Relevance.classesByTab` pierde su único consumidor de
producción (`group-visibility.ts:108`) y `dxsByTab` ya no tenía ninguno
(`computeDxGroupBuckets` usa `specificDxsByTab`).

- Verificar con grep que no queda uso fuera de specs.
- Si se confirma: eliminar ambos campos, la acumulación asociada en
  `buildRelevance` y el parámetro `allTabIds`, que solo servía para expandir el
  comodín. `TRANSVERSAL` y las cuatro entradas transversales de `SYSTEM_TO_TABS`
  pasan a significar «no aporta relevancia de visibilidad a ningún tab»;
  documentarlo en el comentario de la constante.
- Adaptar specs y `criteria-engine.service.spec.ts:200`.
- **No hacer esta fase en el mismo commit que la Fase 1**: enmascara el cambio
  de comportamiento en la revisión.

---

## Fase 6 — Eliminar los gates de dosis y duración

> **Independiente de las Fases 1-5**; puede ejecutarse en paralelo o antes.
>
> **Requisito de los tutores (2026-07-28), literal:** «este tipo de inputs, la
> idea está bien, pero creemos que no son necesarios. Independientemente de los
> días, mg y otras medidas se debe mostrar el START/STOPP correspondiente (sin
> que el usuario deba introducir esos datos). Se notifica el START/STOPP por
> defecto y se deja a criterio médico si lo debe aplicar o no.»

### 6.1 Alcance: 12 criterios

`medicationClassDurationAbove` (8):
`STOPP-B21-DIGOXINA-FA`, `STOPP-D15-ANTIPSICOTICO-SCPD`,
`STOPP-D8-BENZODIACEPINA-USO-PROLONGADO`, `STOPP-D10-BENZODIACEPINA-INSOMNIO`,
`STOPP-D11-HIPNOTICO-Z-INSOMNIO`, `STOPP-F2-IBP-TRATAMIENTO-PROLONGADO`,
`STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE`,
`START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE`.

`medicationClassDoseMgAbove` (3):
`STOPP-C1-AAS-DOSIS-ALTA`, `STOPP-F4-HIERRO-ORAL-DOSIS-ALTA`,
`STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA`.

`digoxinaDosisAlta` (1): `STOPP-E1-DIGOXINA-RENAL`.

Resuelve además el hallazgo L6 del plan de las secciones I–M («paracetamol no
salta ni con hepatopatía»), que quedó pendiente por esta misma causa.

### 6.2 Los labs quedan fuera porque el problema ya no existe

Verificado sobre `criteria.json` (2026-07-28): **32 criterios tocan valores de
laboratorio, y en los 32 el lab es una alternativa, nunca un requisito.** El
patrón es sistemático — `and[fármaco, or[diagnóstico, lab]]`:

```json
// STOPP-B9-TIAZIDA-HIPERCALCEMIA
{"and":[ {"inDrugClass":["DIURETICO_TIAZIDICO",…]},
         {"or":[ {"in":["hipercalcemia",{"var":"diagnoses"}]},
                 {">":[{"var":"labs.calcio_corregido_mmol_l"},2.65]} ]} ]}
```

Igual en B12 (hiperpotasemia), B15 (QTc), B4 (bradicardia), D6 (hiponatremia).
Y `egfrBelow` unifica ambas vías **dentro del propio operador**
(`criteria-engine.service.ts:243-258`): acepta `enfermedad_renal_grave` (≡ TFGe
< 30) e `insuficiencia_renal_terminal` (≡ TFGe < 15) como equivalentes al valor
numérico, cubriendo los 14 criterios renales de las secciones E y START-E.

**Conclusión: para los labs, la petición de los tutores ya está satisfecha.** El
usuario marca «hipercalcemia» y B9 salta sin escribir un mmol/l. No hay nada que
eliminar ni que preguntar. Los campos numéricos de laboratorio **se mantienen**
como refinamiento opcional para quien tenga la analítica delante; no bloquean
ningún aviso.

Los 12 criterios de la Fase 6.1 son los únicos donde el dato es un gate duro sin
alternativa, y por eso son los únicos en alcance.

### 6.3 Implementación (TDD)

1. **RED** por criterio: con el fármaco y el diagnóstico marcados y **sin** dosis
   ni duración capturadas, el criterio debe aparecer en `evaluate(...)`. Hoy
   falla en los 12.
2. **GREEN**: eliminar de `criteria.json` la rama de dosis/duración del `and`,
   conservando el resto de condiciones. Trabajar criterio a criterio, no con un
   reemplazo masivo.
3. Trasladar el umbral perdido al `summary`, que es donde queda el juicio
   clínico. Ejemplo: `STOPP-F2` pasa de exigir >8 semanas a decir «IBP a dosis
   plena durante más de 8 semanas — verificar duración». El usuario ve el aviso y
   decide. Es la petición literal de los tutores: notificar por defecto, aplicar
   a criterio médico.
4. Retirar los operadores `medicationClassDurationAbove`,
   `medicationClassDoseMgAbove` y `digoxinaDosisAlta` del motor
   (`criteria-engine`) y de `OPERATOR_TO_CLASS` (`system-relevance.ts:78-90`)
   **solo si** quedan sin uso; comprobar con grep antes.
5. Eliminar la captura de la UI: `CAPTURE_SPECS_BY_CLASS` completo
   (`clinical-capture.ts:23-35`), `clinicalCaptureFields`, el signal
   `clinicalCaptureFields` de `MedsStepComponent` (líneas 97-103) y su bloque de
   plantilla y CSS.
6. **Decisión de modelo de datos:** `Med.doseMgDay`, `doseMcgDay` y
   `durationDays` quedan sin escritor. Mantener los campos como opcionales en el
   tipo y en el JSON exportado —para no romper la carga de casos guardados con
   `CaseIoService`— pero dejar de pedirlos. Añadir test de retrocompatibilidad:
   un caso exportado con dosis se sigue cargando sin error.

### 6.4 Criterios que quedan sin ningún otro gate

`STOPP-E1-DIGOXINA-RENAL` usa `digoxinaDosisAlta` **junto con** `egfrBelow`: al
quitar la dosis queda el gate renal (satisfecho por diagnóstico o por TFGe), así
que no se vuelve universal. Lo mismo para los otros 10.

La excepción es **`STOPP-C1-AAS-DOSIS-ALTA`**, cuya lógica es *solo* el operador
de dosis:

```json
{"medicationClassDoseMgAbove":["AAS",100,{"var":"medications"}]}
```

**DECIDIDO por el usuario (2026-07-28): sí, debe saltar con solo seleccionar
AAS.** La lógica pasa a `{"inDrugClass":["AAS",{"var":"medications"}]}` y el
`summary` ya está redactado para ese uso — «Revisar AAS en tratamiento crónico:
si se toma a dosis superiores a 100 mg/día hay mayor riesgo de sangrado sin
evidencia de mayor eficacia. (Alerta de revisión de dosis.)». Encaja exactamente
con el modelo que piden los tutores: se notifica por defecto y el médico decide.

Verificar de todos modos, criterio a criterio, que ningún otro de los 12 queda
con el `and` vacío de forma no intencionada.

### 6.5 Verificación

Regenerar los checklists (`scripts/gen-checklist-tabs.js`), pasar
`scripts/audit-criteria.cjs` y repasar `docs/flujo-pasos.md`, que documenta la
captura clínica y queda obsoleto.

---

## Orden de commits sugerido

1. Fase 1 (fix + tests + docs) — el bug de funcionalidad core que bloquea a los tutores.
2. Fase 6 (quitar gates de dosis/duración) — independiente; mejora la cobertura
   del nivel 2 del resaltado, así que conviene antes de la Fase 2.
3. Fase 2.1-2.6 (resaltado en medicaciones).
4. Fase 2.7 (paridad en diagnósticos).
5. Fase 3.3 (polaridad) — no requiere esperar a los tutores.
6. Fases 3.1 y 3.2, solo tras respuesta de los tutores.
7. Fase 5 (limpieza).

Esperar aprobación humana antes de cada commit.
