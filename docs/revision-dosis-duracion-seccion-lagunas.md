## Informe de sección: Lagunas de umbral y arquitectura

**Worktree:** `C:\Users\jcarl\orca\workspaces\TFG\tarpon`  
**Rama:** `fix/diagnosticosComplex`  
**Manifiesto:** `docs/revision-dosis-duracion-medicacion.md`  
**Routing:** D2, B21, P1 → todas `DUDA` → resueltas por protocolo **`resolutor-profundo`** (investigación; sin implementación de lógica de criterios ni captura masiva).  
**Entregable P1:** `docs/plan-mejora-dosis-duracion-medicacion.md` (creado).

### Corregidos (bug confirmado y arreglado)

_Ninguno. Las tres incidencias son dudas; no se tocó lógica ni UI de producción._

### Verificados (no era bug / no reproducible)

_Ninguno en esta sección (no había ítems VERIFICAR)._

### Pendientes de decisión humana (duda)

#### D2 — Once criterios con umbral en texto y lógica solo de presencia
[resuelto por: profundo]

**Estado recibido:** duda  
**Resultado:** opciones investigadas (alcance confirmado en código; sin elegir ganador de arquitectura más allá del plan condicionado en P1)

**Diagnóstico / alcance real**

Confirmado el patrón “laguna Digoxina-antes-de-campos”: el summary (y/o la guía STOPP) menciona dosis o duración, pero `criteria.json` solo usa `inDrugClass` / combinación de clases + diagnósticos. Los operadores genéricos `medicationClassDurationAbove` y `medicationClassDoseMgAbove` ya existen en el motor; la UI solo alimenta Digoxina, Hierro oral e IBP.

Inventario verificado (núcleo + afines):

| Criterio | Umbral en summary app | Logic actual |
|----------|----------------------|--------------|
| `STOPP-C1-AAS-DOSIS-ALTA` | > 100 mg/día | solo `inDrugClass` AAS |
| `STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA` | ≥ 3 g/día | clase + hepatopatía/malnutrición |
| `STOPP-C3-AAS-CLOPIDOGREL-ICTUS` | > 4 semanas | `multipleANTIAGREGANTES` + ictus (sin duración) |
| `STOPP-D15-ANTIPSICOTICO-SCPD` | > 12 semanas | neuroléptico + SCPD |
| `STOPP-D8-BENZODIACEPINA-USO-PROLONGADO` | ≥ 4 semanas | solo clase |
| `STOPP-D10-BENZODIACEPINA-INSOMNIO` | ≥ 2 semanas | benzo + insomnio |
| `STOPP-D11-HIPNOTICO-Z-INSOMNIO` | ≥ 2 semanas | hipnótico-Z + insomnio |
| `STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE` | > 3 meses | corticoide + AR |
| `STOPP-H6-AINE-COLCHICINA-GOTA-CRONICA` | «forma prolongada» | AINE/colchicina + gota |
| `STOPP-H9-OPIOIDE-ARTROSIS` | «largo plazo» | opioide + artrosis |
| Afines | C8/C9 («> 6 meses»); H3 guía «> 3 meses» vs summary app sin umbral | presencia + dx |

B21 Digoxina-FA se trata aparte (misma familia de laguna, pero `durationDays` ya capturado para E1).

**Opciones (no se elige ganadora aquí)**

1. **Tratar umbrales como evaluables** — capturar dosis/duración y endurecer `logic` (por criterio o lote). Requiere validación clínica de cada umbral y decisión de producto sobre carga de UI.  
2. **Tratar umbrales como narrativa / alerta de revisión** — mantener logic de presencia; opcionalmente aclarar el wording del summary para no prometer comprobación numérica. Requiere validación clínica + producto (copy).  
3. **Enfoque híbrido** — evaluar numéricamente solo umbrales nítidos (p.ej. C1 100 mg, D8 4 semanas); dejar «largo plazo» / «prolongada» como alerta hasta fijar número. Requiere validación clínica explícita por fila.

Arquitectura de captura (A/B/C) documentada en el plan P1; la recomendación allí es **condicionada** al recuento clínico, no una elección definitiva de orquestación.

**Ficheros consultados (solo lectura):** `src/assets/data/criteria.json`, `src/app/core/types.ts`, `src/app/core/services/criteria-engine.service.ts`, `src/app/steps/meds-step/meds-step.component.html`, `docs/STOPP_START_CRITERIOS_CONTEXTO.md`, `docs/motor-criterios.md`.  
**Tests:** no ejecutados (sin cambios de código).  
**Incidencias relacionadas:** B21 (caso Digoxina con campo ya existente); P1 (plan); D1 del manifiesto (inventario de lo ya estructurado).

---

#### B21 — `STOPP-B21-DIGOXINA-FA` promete «> 3 meses» sin comprobar duración
[resuelto por: profundo]

**Estado recibido:** duda  
**Resultado:** opciones investigadas — **lógica no tocada** (mandato explícito)

**Diagnóstico**

- Summary: «Evitar digoxina como primera línea en FA a largo plazo (> 3 meses)…»
- Logic actual: `fibrilacion_auricular` + `inDrugClass` DIGOXINA — **no** usa `durationDays`.
- Guía (`docs/STOPP_START_CRITERIOS_CONTEXTO.md` B21): misma idea de control de frecuencia a largo plazo (> 3 meses) en FA.
- Contraste E1: mismo fármaco; UI en tab Renal ya captura `doseMcgDay` y `durationDays`; operador `digoxinaDosisAlta` exige ≥ 125 µg/día y `durationDays > 90`. Ese valor de duración **ya está disponible** en el modelo si el usuario lo rellena, pero B21 lo ignora.
- Por tanto el coste técnico de *exigir* duración en B21 sería bajo; la duda no es de ingeniería sino de **interpretación clínica** (¿umbral evaluable vs narrativa de la guía?).

**Opciones (no se elige ganadora)**

1. **Narrativa de la guía** — mantener logic actual (Digoxina + FA). El «> 3 meses» contextualiza la recomendación STOPP sin filtrar por duración. Riesgo: summary promete un umbral que el motor no aplica (posible falsa sensación de precisión). Requiere validación clínica.  
2. **Exigir duración** — p.ej. añadir `medicationClassDurationAbove` DIGOXINA > 90 (o condición sobre `durationDays`) a la logic de B21, reutilizando el input existente. Riesgo: si el clínico no rellena duración, el criterio deja de disparar (falso negativo). Requiere validación clínica + decisión de producto sobre dato vacío.  
3. **Ajuste solo de copy** — suavizar el summary para no anclar «> 3 meses» como condición de disparo, sin cambiar logic. Requiere validación clínica/producto sobre fidelidad a la guía.

**Ficheros consultados:** `criteria.json` (`STOPP-B21-DIGOXINA-FA`, `STOPP-E1-DIGOXINA-RENAL`), `meds-step.component.html`, `criteria-engine.service.ts` (`digoxinaDosisAlta`).  
**Tests:** no ejecutados / no modificados.  
**Comparte causa con:** D2 (texto con umbral vs logic de presencia); se distingue porque el campo UI ya existe.

---

#### P1 — Plan de mejora opciones A/B/C y priorización
[resuelto por: profundo]

**Estado recibido:** duda (entregable documental)  
**Resultado:** opciones investigadas + documento entregado

**Entregable:** `docs/plan-mejora-dosis-duracion-medicacion.md`

Contiene:

1. Separación **clínica / producto / técnica**.  
2. Tres arquitecturas: **A** config data-driven; **B** componente reutilizable tipo `<med-dose-input>`; **C** patrón manual documentado.  
3. **Recomendación condicionada** (no elección absoluta): si tras revisión clínica >5–6 de los ~11 merecen captura real → orientar a Opción A; si solo 2–3 → patrón manual (C) razonable, opcionalmente B; zona intermedia → B como puente.  
4. Tabla de priorización de criterios restantes (impacto clínico × coste técnico), con B21 como P0 de decisión aislada.  
5. Secuencia de trabajo post-autorización (cerrar clínica → contar → arquitectura → TDD incremental).

No se eligió opción ganadora definitiva más allá de esa regla condicionada pedida en el manifiesto.

### Bloqueados

_Ninguno. Las dudas quedan abiertas a decisión humana (clínica/producto); no hubo fallo técnico que escalar._

### Estado de tests

No se ejecutó la suite: esta sección solo produjo documentación (`docs/plan-mejora-dosis-duracion-medicacion.md` y este informe). Sin cambios en `src/`.

---

### Notas para `orquestador-revision`

- La sección **no se cierra** aquí; queda pendiente decisión humana sobre D2 (alcance por criterio), B21 (narrativa vs duración) y, tras el recuento clínico, la arquitectura A/B/C según la regla condicionada de P1.
- Prohibiciones respetadas: no captura masiva; no cambio de logic de B21 ni de criterios del inventario D2.
)
