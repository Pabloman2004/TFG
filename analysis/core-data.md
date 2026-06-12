# Análisis: core-data

## Propósito

Este módulo es el **catálogo de datos clínicos estáticos** de la aplicación: define el universo de diagnósticos y medicamentos que un clínico puede registrar, sus agrupaciones taxonómicas para la UI (tabs, grupos, subgrupos), las reglas de visibilidad condicional de diagnósticos cardiovasculares según los fármacos seleccionados, y el índice de relevancia que conecta cada criterio STOPP/START con los tabs de la interfaz. Existe para separar el conocimiento de dominio clínico (qué diagnósticos/fármacos existen y cómo se categorizan) del código de evaluación y de la UI.

## Ficheros

- `src/app/core/data/diagnoses.ts` — Tres mapas (`DIAGNOSIS_GROUPS`, `DIAGNOSIS_MAP`, `DIAGNOSIS_SUBGROUPS`) más su inverso `DIAGNOSIS_REVERSE_MAP`; exporta `normalizeDiagnosis` (label → clave interna snake_case) y `resolveDiagnosisLabel` (clave interna → label legible, con soporte de diagnósticos personalizados `grupo__sufijo`).
- `src/app/core/data/diagnoses-taxonomy.ts` — Construye en tiempo de carga el array `DIAGNOSIS_TABS: DiagnosisTab[]` y el plano `DIAGNOSIS_CATEGORIES: DiagnosisGroup[]` a partir de `DIAGNOSIS_GROUPS` y `DIAGNOSIS_SUBGROUPS`; controla el orden de tabs y agrupa los sistemas minoritarios bajo la pestaña "Otros".
- `src/app/core/data/medications.ts` — Catálogo `MEDICATIONS: Med[]` (~140 fármacos) con sus clases farmacológicas; exporta `MED_NAMES` para autocompletado.
- `src/app/core/data/medications-taxonomy.ts` — Construye `DRUG_CATEGORIES: DrugCategory[]` (9 categorías clínicas, ~50 grupos) y exporta `resolveMedicationLabel` (convierte IDs `otro__<groupId>` al label del grupo).
- `src/app/core/data/cardiovascular-dx-dependencies.ts` — Mapa `CARDIOVASCULAR_DX_DEPS` (12 diagnósticos cardiovasculares con dependencia de fármacos) y función `isDiagnosisEnabled(label, meds)` que decide si un diagnóstico cardiovascular debe mostrarse habilitado en función de los medicamentos activos.
- `src/app/core/data/system-relevance.ts` — Define `SYSTEM_TO_TABS` (mapeo sistema clínico → tabs UI), exporta `buildRelevance(criteria, allTabIds): Relevance` que indexa qué clases farmacológicas y diagnósticos son relevantes por tab; incluye la función auxiliar `extractReferences` que camina árboles JSON Logic para extraer referencias.
- `src/app/core/data/diagnoses.spec.ts` — Tests de `resolveDiagnosisLabel` (8 casos).
- `src/app/core/data/medications-taxonomy.spec.ts` — Tests de `resolveMedicationLabel` (6 casos).
- `src/app/core/data/cardiovascular-dx-dependencies.spec.ts` — Tests de `isDiagnosisEnabled` y de la integridad del mapa `CARDIOVASCULAR_DX_DEPS` (13 casos).
- `src/app/core/data/system-relevance.spec.ts` — Tests de `SYSTEM_TO_TABS`, `resolveTabsForSystem`, `extractReferences` y `buildRelevance` (17 casos).

## Dependencias

### Hacia otros módulos del repo
- `src/app/core/types.ts` — Se importan los tipos `Med`, `Crit` y `JsonLogicRule` desde `../types`. `Med` se usa en `medications.ts`, `cardiovascular-dx-dependencies.ts` y sus specs; `Crit`/`JsonLogicRule` se usan en `system-relevance.ts` y su spec.
- `src/app/steps/meds-step/meds-step.component.ts` — Consume `MEDICATIONS` y `DRUG_CATEGORIES`/`DrugCategory`/`DrugGroup`.
- `src/app/steps/diagnosis-step/diagnosis-step.component.ts` — Consume `MEDICATIONS`, `normalizeDiagnosis`, `DIAGNOSIS_REVERSE_MAP`, `DIAGNOSIS_TABS`/`DiagnosisTab`/`DiagnosisGroup`, `CARDIOVASCULAR_DX_DEPS` e `isDiagnosisEnabled`.
- `src/app/core/services/criteria-engine.service.ts` — Consume `Relevance` y `buildRelevance` de `system-relevance.ts`.

### Externas relevantes
- No hay dependencias de librerías externas dentro del módulo; usa únicamente APIs estándar de JavaScript/TypeScript (`Intl.Collator`, `Map`, `Set`, `Object.entries`, `Array.prototype`).

## Conceptos de negocio

- **Criterios STOPP/START**: taxonomía de prescripción inapropiada (STOPP) y omisión de prescripción indicada (START) en geriatría.
- **Diagnósticos clínicos**: entidades nosológicas codificadas con claves internas snake_case; agrupadas por sistema orgánico con subgrupos opcionales.
- **Medicamentos y clases farmacológicas**: fármacos individuales identificados por nombre comercial/DCI, cada uno con una o varias clases (`drugClasses`) que representan el mecanismo o grupo terapéutico.
- **Taxonomía de UI**: estructura de tabs y grupos para mostrar diagnósticos y medicamentos en la interfaz clínica.
- **Dependencias de diagnósticos cardiovasculares**: regla de negocio por la que ciertos diagnósticos cardiovasculares sólo son seleccionables si se han registrado determinados fármacos (p.ej. bradicardia sólo si hay betabloqueante, calcioantagonista no-DHP o digoxina).
- **Relevancia por tab**: índice que permite filtrar qué clases farmacológicas y diagnósticos son clínicamente pertinentes para cada pestaña de la UI, según los sistemas clínicos definidos en `criteria.json`.
- **Diagnósticos y medicamentos personalizados**: soporte de ítems añadidos por el usuario fuera del catálogo, codificados con el patrón `grupo__sufijo` o `otro__groupId`.

## Problemas detectados

- **Duplicación de grupos en `medications-taxonomy.ts`**: varios grupos se repiten en múltiples categorías (p.ej. `diur_asa` aparece en `cardiovascular` y `renal`; `antag_aldo` ídem; `isglt2` en `cardiovascular`, `renal` y `endocrino`; `opioides` en `snc` y `osteo`). El mecanismo `additionalCategories` sólo se usa en algunos casos — no hay una estrategia uniforme: algunos grupos se duplican manualmente (con objetos distintos pero idénticos) y otros usan `additionalCategories`. Esto puede causar desincronías si se edita un grupo en una categoría y se olvida el otro.
- **`additionalCategories` declarado pero sin consumidor visible**: el campo `additionalCategories?: string[]` se define en la interfaz `DrugGroup` y se asigna en varios grupos, pero el código de `medications-taxonomy.ts` no lo usa en la construcción de `DRUG_CATEGORIES`; queda como metadato que sólo tendría utilidad si un componente consumidor lo procesa. ASUNCIÓN: el componente `meds-step` o algún servicio lo lee para duplicar la visualización; no se ha confirmado en el análisis de este módulo.
- **`DIAGNOSIS_SUBGROUPS` sólo cubre el sistema Cardiovascular**: el resto de sistemas orgánicos no tienen subgrupos definidos, lo que puede limitar la granularidad de la UI para sistemas con muchos diagnósticos (p.ej. Neurológico, Reumatológico). No está claro si es una decisión de diseño permanente o una limitación pendiente.
- **Normalización parcial en `normalizeDiagnosis`**: el fallback `d.toLowerCase().replace(/\s+/g, "_")` no elimina acentos ni caracteres especiales, lo que puede generar claves inconsistentes para diagnósticos no registrados en `DIAGNOSIS_MAP` (p.ej. `"Ictus agudo"` → `"ictus_agudo"` pero `"Ictús agudo"` → `"ictús_agudo"`). El mismo problema afecta a la función `slug` de `diagnoses-taxonomy.ts`, que sí normaliza NFD, pero esa función es interna y no se exporta.
- **Falta de tests para `diagnoses-taxonomy.ts` y `medications.ts`**: no existe ningún fichero `.spec.ts` para estos dos ficheros. `diagnoses-taxonomy.ts` contiene lógica de construcción no trivial (`buildTabs`, `buildGroupsForSystem`, agrupación de "Otros") que podría beneficiarse de pruebas de integración. `medications.ts` es un catálogo puro pero la integridad de las clases asignadas no se valida automáticamente.
- **No hay tests de `normalizeDiagnosis`**: sólo se testea `resolveDiagnosisLabel`; la función `normalizeDiagnosis` (que es el punto de entrada desde componentes) carece de tests directos.
- **Ausencia de TODOs/FIXMEs en el código**: no se han encontrado comentarios de este tipo en ningún fichero del módulo.
- ASUNCIÓN: `criteria.json` (referenciado conceptualmente por `system-relevance.ts` y `cardiovascular-dx-dependencies.ts`) se carga desde fuera de este módulo (probablemente en `criteria-engine.service.ts`); no se ha analizado aquí.
