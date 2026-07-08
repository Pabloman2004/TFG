# Verificación independiente de `auditoria-cardiovascular.md`

Verificación escéptica y de solo lectura. Cada veredicto se apoya en
`fichero:línea` que he abierto y leído yo mismo, no en lo que afirma el informe.

## 1. Tabla resumen

| Hallazgo | Veredicto | Fichero:línea comprobado | Nota breve |
|---|---|---|---|
| H1 — No existe `system == "cardiovascular"`; se resuelve por SYSTEM_TO_TABS | CONFIRMADO | `criteria.json` (0 matches de `"cardiovascular"`, 48 de `"Sistema cardiovascular"`); `system-relevance.ts:23` | Mapeo `'Sistema cardiovascular': ['cardiovascular']`. Anticoagulantes NO mapea a cardiovascular (`:31`). |
| H2a — Digoxina en MEDICATIONS | CONFIRMADO | `medications.ts:105` | `{ id: "Digoxina", drugClasses: ["DIGOXINA"] }`. |
| H2b — Sacubitrilo/Valsartán en MEDICATIONS | CONFIRMADO | `medications.ts:390` | `{ id: "Sacubitrilo/Valsartán", drugClasses: ["SACUBITRILO_VALSARTAN"] }`. |
| H2c — `computeMedGroupBuckets` oculta grupos de 1 fármaco | CONFIRMADO | `group-visibility.ts:46` y `:58` | `ownAll` filtra `drugs.length > 1`; foráneos descartan `drugs.length <= 1`. Afecta a TODOS los tabs salvo `otros`. |
| H3 — Seis entradas B13 con `system: "Sistema cardiovascular"` | CONFIRMADO | `criteria.json:228,236,244,252,260,268` | 1 general + 5 subreglas, summaries distintos. Coinciden con los seis del informe. |
| H4 — `critCode(id) = id.split('-')[1]` | CONFIRMADO | `criteria-groups.ts:20-22` | `STOPP-B13-IECA-...` → `[1]` = `"B13"`. |
| H5 — B13 NO lo causa `multipleAldosteroneAntagonists` | CONFIRMADO | `criteria.json:16` (único uso, en STOPP-A3); `criteria-engine.service.ts:199-203, 250` | Operador solo en A3; factory devuelve un `boolean` único. |
| H6 — Literales "Start"/"STOP" en plantillas | CONFIRMADO | `meds-step.component.html:260,318`; `diagnosis-step.component.html:302,360`; `report.service.ts:156,163` | Badges dicen `Start`/`STOP`; el PDF ya usa `STOPP`/`START`. |
| H7 — Dependencias ignoran dx negativos (dentro de `!`) | CONFIRMADO | `dx-dependencies.ts:104-138`; `diagnosis-family.ts:75-118`; `criteria.json:478,480` | Estenosis mitral solo en STOPP-C11, dentro de `!`, sistema `Anticoagulantes/Antiagregantes` (no cardiovascular). |

**Total: 7 CONFIRMADOS, 0 REFUTADOS, 0 PARCIALES, 0 NO VERIFICABLES.**

---

## 2. Detalle por hallazgo

### H1 — El sistema es "Sistema cardiovascular", no "cardiovascular" — CONFIRMADO

- **Qué dice el informe:** ningún criterio tiene `system == "cardiovascular"` literal; el tab se resuelve vía `SYSTEM_TO_TABS` (`"Sistema cardiovascular" -> cardiovascular`) en `system-relevance.ts:22-46`.
- **Qué he encontrado:**
  - Búsqueda de `"system": "cardiovascular"` en `criteria.json`: **0 coincidencias**.
  - Búsqueda de `"system": "Sistema cardiovascular"`: **48 coincidencias**.
  - El mapeo real:

```22:36:src/app/core/data/system-relevance.ts
export const SYSTEM_TO_TABS: Record<string, readonly TabId[]> = {
  'Sistema cardiovascular':                ['cardiovascular'],
  'Sistema nervioso central':              ['snc', 'neurologico', 'psiquiatrico'],
  ...
  'Anticoagulantes/Antiagregantes':        ['anticoagulantes', 'hematologico'],
  'Analgésicos':                           [TRANSVERSAL],
  ...
};
```

  - `'Sistema cardiovascular' -> ['cardiovascular']` en `:23`. `'Anticoagulantes/Antiagregantes' -> ['anticoagulantes','hematologico']` (NO cardiovascular) en `:31`. `'Analgésicos' -> [TRANSVERSAL]` (`'*'`, todos los tabs) en `:32`.
- **Veredicto:** CONFIRMADO. La premisa fundacional es correcta; la auditoría apuntó al sistema correcto.

### H2 — Bug de visibilidad de grupos de un solo fármaco — CONFIRMADO

- **(a) Digoxina:** `medications.ts:105` → `{ id: "Digoxina", drugClasses: ["DIGOXINA"] }`. CONFIRMADO.
- **(b) Sacubitrilo/Valsartán:** `medications.ts:390` → `{ id: "Sacubitrilo/Valsartán", drugClasses: ["SACUBITRILO_VALSARTAN"] }`. CONFIRMADO.
- **(c) Condición exacta:**

```45:48:src/app/core/group-visibility.ts
  const cat = categories.find(c => c.id === tabId);
  const ownAll = (cat ? cat.groups.filter(g => g.drugs.length > 1) : [])
    .slice()
    .sort((a, b) => ES_COLLATOR.compare(a.label, b.label));
```

```57:58:src/app/core/group-visibility.ts
    for (const g of c.groups) {
      if (g.drugs.length <= 1 || !g.drugClass) continue;
```

  Los grupos propios (`ownAll`) requieren `drugs.length > 1` (`:46`); los foráneos descartan `drugs.length <= 1` (`:58`). La rama del tab `otros` (`:30-43`) es la única que recoge grupos con `drugs.length === 1`. **Por tanto, un grupo de un solo fármaco solo aparece en `otros`, nunca en un tab de sistema.**
  - **¿Afecta a todos los tabs?** Sí. La función es pura y genérica respecto a `tabId`; la condición se aplica a cualquier tab que no sea `otrosTabId`. No hay rama especial para cardiovascular. Afecta a TODOS los sistemas.
- **Veredicto:** CONFIRMADO en sus tres partes.

### H3 — Seis entradas B13 solapadas — CONFIRMADO

- **Qué dice el informe:** 1 regla general + 5 subreglas B13, todas `system: "Sistema cardiovascular"`, summaries distintos, en `criteria.json:228-273`.
- **Qué he encontrado** (ids reales por `"id": "STOPP-B13`):
  1. `:228` STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO (general: antag. aldosterona + (IECA|ARA2|ahorrador K))
  2. `:236` STOPP-B13-ARA2-ANTAGONISTA-ALDOSTERONA
  3. `:244` STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO
  4. `:252` STOPP-B13-DIURETICO-AHORRADOR-POTASIO-ANTAGONISTA
  5. `:260` STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA
  6. `:268` STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO
  - Las seis tienen `"system": "Sistema cardiovascular"` (`:230, :238, :246, :254, :262, :270`) y `summary` distinto cada una.
- **Veredicto:** CONFIRMADO. Son exactamente seis y coinciden con los del informe.

### H4 — El badge colapsa por `id.split('-')[1]` — CONFIRMADO

```20:22:src/app/core/criteria-groups.ts
export function critCode(id: string): string {
  return id.split('-')[1] ?? '';
}
```

- `"STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA".split('-')` = `["STOPP","B13","IECA","ANTAGONISTA","ALDOSTERONA"]`; `[1]` = `"B13"`. Las seis entradas B13 colapsan al mismo badge.
- **Veredicto:** CONFIRMADO.

### H5 — B13 NO lo causa `multipleAldosteroneAntagonists` — CONFIRMADO

- **Único uso en `criteria.json`:** `:16`, dentro de STOPP-A3:

```12:17:src/assets/data/criteria.json
      "id": "STOPP-A3-ANTAGONISTA-ALDOSTERONA-DUPLICIDAD",
      "type": "STOPP",
      "system": "Indicación de la medicación",
      "summary": "Evitar uso concomitante de dos antagonistas de la aldosterona...",
      "logic": {"multipleAldosteroneAntagonists":[{"var":"medications"}]},
      "excludes": {"medications":["Espironolactona","Eplerenona"],"drugClasses":["ANTAGONISTA_ALDOSTERONA"]}
```

  (Nota: el sistema de A3 es `"Indicación de la medicación"`, no cardiovascular.)
- **Comportamiento del operador (devuelve booleano único):**

```199:203:src/app/core/services/criteria-engine.service.ts
    const makeMultipleClassOp = (drugClass: string, threshold = 1) =>
      (meds: unknown): boolean => {
        if (!Array.isArray(meds)) return false;
        return countByClass(meds as Med[], drugClass) >= threshold;
      };
```

```250:250:src/app/core/services/criteria-engine.service.ts
    jsonLogic.add_operation('multipleAldosteroneAntagonists',    makeMultipleClassOp('antagonista_aldosterona', 2));
```

- **Veredicto:** CONFIRMADO. El operador solo aparece en A3 y produce un único `boolean`; no genera las repeticiones de B13. La causa real es la duplicación de entradas (H3).

### H6 — Literales "Start"/"STOP" en las plantillas — CONFIRMADO

- `meds-step.component.html:260` → `Start <span class="badge-n">{{ startCriteria().length }}</span>`
- `meds-step.component.html:318` → `STOP <span class="badge-n">{{ stoppCriteria().length }}</span>`
- `diagnosis-step.component.html:302` → `Start <span ...>`
- `diagnosis-step.component.html:360` → `STOP <span ...>`
- El resto sí usa mayúsculas: `report.service.ts:156` → `STOPP — Prescripciones potencialmente inapropiadas`; `:163` → `START — Prescripciones recomendadas`.
- **Veredicto:** CONFIRMADO. Los cuatro badges dicen `Start`/`STOP`; el PDF rotula correctamente.

### H7 — Las dependencias ignoran los dx negativos — CONFIRMADO

- **`buildDxDependencies`** (`dx-dependencies.ts:104-138`) recorre solo criterios STOPP (`:114`) y obtiene los dx con `extractPositiveDxCodesForDependencies(c.logic)` (`:116`).
- **`extractPositiveDxCodesForDependencies`** delega en `walkPositiveDx(logic, false)` (`diagnosis-family.ts:113-118`). En `walkPositiveDx`:

```83:107:src/app/core/data/diagnosis-family.ts
  if ('!' in obj || 'not' in obj) {
    return walkPositiveDx(obj['!'] ?? obj['not'], true);
  }
  ...
  if (
    'in' in obj &&
    Array.isArray(inClause) &&
    typeof inClause[0] === 'string' &&
    ...
    (inClause[1] as Record<string, unknown>)['var'] === 'diagnoses' &&
    !negated
  ) {
    return new Set([inClause[0]]);
  }
```

  Al entrar en un `!`/`not` marca `negated = true` (`:84`) y la cláusula `in` de diagnósticos solo devuelve el código si `!negated` (`:104`). Es decir, **los dx dentro de `!` se ignoran**.
- **Estenosis mitral solo en STOPP-C11:** búsqueda de `estenosis_mitral` en `criteria.json` → única coincidencia en `:480`, dentro de un `!`:
  `{"!":{"in":["estenosis_mitral_moderada_grave",{"var":"diagnoses"}]}}`.
- **C11 NO está en el tab cardiovascular:**

```476:478:src/assets/data/criteria.json
      "id": "STOPP-C11-AVK-FA-PRIMERA-LINEA",
      "type": "STOPP",
      "system": "Anticoagulantes/Antiagregantes",
```

  `"Anticoagulantes/Antiagregantes"` mapea a `['anticoagulantes','hematologico']` (`system-relevance.ts:31`), no a cardiovascular.
- **Veredicto:** CONFIRMADO. Las funciones existen y se comportan como describe el informe; "Estenosis mitral moderada-grave" solo aparece negada en C11, fuera del tab cardiovascular, por lo que no se atenúa por dependencia de fármaco.

---

## 3. Discrepancias con el informe

Ninguna discrepancia sustantiva. Solo pequeños desplazamientos/precisiones de
número de línea (el contenido citado existe y dice lo afirmado):

- **H1:** el informe cita `system-relevance.ts:22-46`. El objeto `SYSTEM_TO_TABS`
  ocupa realmente `:22-36`; la línea del mapeo cardiovascular es `:23`. El rango
  `45-46` corresponde a `resolveTabsForSystem`. El rango del informe engloba ambos
  bloques, así que es correcto pero impreciso.
- **H2 (Digoxina):** el informe cita `medications.ts:102-106`. La entrada exacta de
  Digoxina está en `:105` (las líneas `102` y `103` son el comentario
  `ANTIARRÍTMICOS` y Amiodarona). El rango incluye la línea correcta.
- **H2c:** el informe cita `group-visibility.ts:45-48`. La condición de `ownAll`
  (`drugs.length > 1`) está en `:46`; la condición simétrica de foráneos
  (`drugs.length <= 1`) está en `:58` (fuera del rango citado, pero también
  relevante para el bug). El informe acierta en la conducta.
- **H5:** el informe cita STOPP-A3 en `criteria.json:12-17`. La entrada completa va
  de `:11` a `:18`; id, summary y logic caen dentro de `:12-17`. La cita de
  `criteria-engine.service.ts:245-251` engloba la línea real de registro (`:250`).
- **H7:** el informe cita `criteria.json:476-481` para C11; la línea concreta del
  `system` es `:478` y la del `logic` con la doble negación es `:480`, ambas dentro
  del rango.

Nada de esto cambia ningún veredicto: los siete hallazgos quedan CONFIRMADOS.

---

## 4. Riesgo del fix H2

`computeMedGroupBuckets` (`group-visibility.ts:24-69`) es una función pura usada
para CUALQUIER tab de medicación, no solo cardiovascular. Cambiar la condición de
"grupos de 1 fármaco" afectaría a todos los sistemas a la vez.

**Quién la llama:**

| Consumidor | Fichero:línea | Efecto |
|---|---|---|
| `medGroupsVisibleInTab` (alias plano) | `group-visibility.ts:77` | Reexpone el resultado; usado a su vez en `meds-step.component.ts:141`. |
| `MedsStepComponent.groupBuckets` (signal) | `meds-step.component.ts:93-100` | Render real del paso de medicación; usa `activeCategoryId()`, es decir, el tab activo sea cual sea. |
| `MedsStepComponent` (vía `medGroupsVisibleInTab`) | `meds-step.component.ts:141` | Lista plana de grupos visibles del tab. |
| Tests | `group-visibility.spec.ts:58-112` | Especifican el comportamiento actual (incl. ocultación de grupos de 1). |

**Conclusión de riesgo:** como la condición (`drugs.length > 1` en `ownAll` y
`<= 1` en foráneos) es genérica por `tabId`, relajarla para mostrar grupos
unitarios surgiría a Digoxina y Sacubitrilo/Valsartán en cardiovascular, **pero
también haría visibles todos los grupos de un solo fármaco en el resto de tabs de
sistema** (y dejaría de tener sentido la pestaña `otros`, que hoy concentra esos
unitarios). Cualquier fix debe contemplar ese efecto transversal y la actualización
de `group-visibility.spec.ts`. (No se ha aplicado ningún cambio: tarea de solo
lectura.)

---

## 5. ASUNCIONES / no verificado

- **No he ejecutado la app ni los tests.** La verificación es lectura estática.
  No he comprobado en runtime que Digoxina realmente no aparezca en el tab
  cardiovascular ni que los seis B13 se rendericen como tarjetas separadas; lo
  deduzco del código leído, que es consistente con lo afirmado.
- **Conteo de "Sistema cardiovascular" (48):** es el número de objetos `system`
  con ese valor en `criteria.json`. No he cruzado uno a uno los 61 ids de la tabla
  del informe (sección 1) contra el JSON; he verificado el mecanismo y los bloques
  citados (B1, B13, etc.). Si se necesita el listado exacto íntegro, requeriría un
  volcado completo adicional.
- **Cuestiones clínicas declaradas fuera de alcance** (no juzgadas): si B6 con la
  clase `ANTIARITMICO` es un falso positivo, si B15 debería detectar más
  prolongadores de QTc, y si "enfermedad cardiovascular establecida" debe seguir
  visible. Hecho técnico subyacente comprobable de B6: la lógica de
  STOPP-B6 usa `inDrugClass("ANTIARITMICO")` y Amiodarona/Flecainida comparten esa
  clase (`medications.ts:103-104`), es decir dispara por clase y no por el fármaco
  amiodarona — **CONFIRMADO como hecho técnico**; el juicio clínico es **decisión
  clínica, fuera de alcance**.
- **Texto oficial START:** no existe en el repo, igual que asume el informe; no he
  contrastado ausencias START contra fuente externa.
