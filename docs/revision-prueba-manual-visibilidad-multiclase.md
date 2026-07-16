# Revisión de prueba manual — visibilidad multiclase

## Alcance

Revisar los problemas observados durante la ejecución de
`plans/checklist-prueba-manual-visibilidad-multiclase.md`, determinar su causa y
corregir los BUG confirmados mediante TDD.

## Sección 1 — Renal

### BUG potencial

- Metformina no aparece en Renal.
- Bifosfonatos no aparecen en Renal.
- Verificar si el fallo afecta a otros grupos propios o foráneos.

## Sección 2 — Antibióticos

### VERIFICAR

- Antibióticos generales aparecen como relevantes en Gastrointestinal y
  Urológico.
- Determinar qué criterios justifican ambas apariciones y si debe mostrarse la
  clase completa o un subconjunto.

### BUG potencial

- El grupo Antipalúdicos no se encuentra en el tab Antibióticos.
- Determinar si está oculto por ser unitario, si aflora en otro sistema o si la
  clasificación principal es incorrecta.

## Sección 3 — Tamoxifeno y grupos principales unitarios

### BUG potencial

- Tamoxifeno aparece en Cardiovascular y Anticoagulantes, pero no en su categoría
  principal Endocrino/Metabólico.
- Determinar si el comportamiento deriva de la regla histórica que oculta
  grupos unitarios propios sin relevancia específica.
- Buscar otros medicamentos afectados por el mismo patrón.

## Sección 4 — Regresiones y checklist

### VERIFICAR

- Confirmar mediante pruebas automatizadas que no cambió la construcción de
  relevancia diagnóstica.
- Confirmar que la expansión de sistemas transversales conserva el
  comportamiento previo.
- Convertir la comprobación manual ambigua en pasos observables y concretos.

## Entregable

- Informe aprobado por sección con clasificación BUG / VERIFICAR / DUDA.
- Correcciones TDD para los BUG confirmados.
- Documentación y checklist actualizadas.
- Suite, build, auditoría y Linked Chunks en verde.

## Informe aprobado

### 1. Renal

- **Metformina — VERIFICAR:** el cálculo ya la incluía en Renal bajo el grupo
  Biguanidas. Se añadió una regresión explícita.
- **Bifosfonatos — BUG corregido:** Antirresortivos se procesaba antes por orden
  alfabético y capturaba los cuatro IDs. La deduplicación prioriza ahora la
  coincidencia directa entre clase relevante y `group.drugClass`.

### 2. Antibióticos

- **Gastrointestinal — comportamiento correcto:** START-F6 referencia la clase
  agregada `ANTIBIOTICO` para indicar probiótico concomitante.
- **Urológico — comportamiento correcto:** STOPP-I8 referencia cualquier
  `ANTIBIOTICO` ante bacteriuria asintomática.
- **STOPP-I8 — BUG corregido:** `excludes` usaba únicamente
  `ANTIBIOTICO_URINARIO`; ahora usa `ANTIBIOTICO`, igual que su lógica.
- **Antipalúdicos — BUG corregido:** Quinina existía, pero el grupo unitario
  quedaba oculto en su tab principal.
- **DUDA pendiente:** decidir si el tab Antibióticos debe renombrarse a
  Antiinfecciosos. No se modifica en esta ronda.

### 3. Tamoxifeno y unitarios

Se confirmó un patrón general: Litio, Ondansetrón, Metformina, Ácido fólico,
Tamoxifeno, Tizanidina, Nitrofurantoína y Quinina podían aparecer en tabs
foráneos, pero no en su categoría principal.

**BUG corregido:** un grupo unitario que aflora por relevancia específica en
cualquier tab permanece visible también en su categoría principal. Paracetamol
y Lidocaína parche, relevantes solo por el sistema transversal Analgésicos,
continúan exclusivamente en Otros.

### 4. Diagnósticos y transversales

- El cambio multiclase no alteró el algoritmo de relevancia diagnóstica.
- La expansión transversal conserva el mismo comodín y los mismos cuatro
  sistemas.
- El árbol actual contiene nuevas referencias diagnósticas respecto a `HEAD`
  por cambios previos de criterios: esofagitis erosiva y efectos
  extrapiramidales. No se revierten en esta ronda.
- Se añadió una regresión automatizada para diagnósticos transversales y se
  sustituyó la comprobación manual ambigua por pasos observables.

## Correcciones aplicadas

1. Visibilidad principal consistente para grupos unitarios.
2. Prioridad de coincidencia directa antes del fallback multiclase.
3. Exclusión preventiva completa de antibióticos en STOPP-I8.
4. Regresiones con datos reales para Metformina, Bifosfonatos y los ocho
   unitarios afectados.
5. Checklist manual concretada para diagnósticos y sistemas transversales.

## Verificación final

- Pruebas unitarias: `627 SUCCESS`.
- Build de desarrollo: correcto.
- Auditoría: 216 criterios, sin clases ni diagnósticos desconocidos.
- Linked Chunks: `OK: todo limpio (0 problemas)`.
