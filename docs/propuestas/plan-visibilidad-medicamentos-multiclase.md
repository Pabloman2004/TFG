# Plan de visibilidad multiclase de medicamentos

## Alcance

- Resolver la visibilidad de medicamentos con varias clases y los operadores especiales no detectados.
- Mantener sin cambios la política de sistemas transversales y la visibilidad de diagnósticos, pendientes de una decisión posterior.
- Conservar una sola selección por ID aunque el medicamento aparezca en varios tabs.

## Implementación TDD

1. Añadir primero pruebas de comportamiento fallidas en `src/app/core/group-visibility.spec.ts` y `src/app/core/data/system-relevance.spec.ts`:
   - un medicamento aflora si cualquiera de sus `drugClasses` intersecta las clases relevantes del tab;
   - un grupo foráneo contiene únicamente los medicamentos coincidentes;
   - un medicamento multiclase puede aparecer en varios tabs sin duplicarse dentro de uno;
   - grupos sin `drugClass` también pueden aflorar por las clases de sus medicamentos;
   - los unitarios conservan la regla actual de relevancia específica, no transversal;
   - la relevancia explícita de E1 hace aparecer Digoxina en Renal.
2. Extender `src/app/core/types.ts` y `src/app/core/data/system-relevance.ts` con metadatos explícitos y opcionales de relevancia farmacológica en el criterio, separados de `excludes`. `buildRelevance` unirá las clases extraídas de `logic` con esas clases declaradas, sin inferir visibilidad desde exclusiones.
3. Declarar en `src/assets/data/criteria.json` la relevancia de los operadores especiales no expresados mediante `inDrugClass`: E1/Digoxina, F2/IBP y F4/Hierro oral. No añadir por ahora metadatos a sistemas transversales.
4. Cambiar `src/app/core/group-visibility.ts` para recibir el catálogo `Med[]` y calcular coincidencias por medicamento:
   - normalizar las clases para la comparación;
   - filtrar cada grupo foráneo a los IDs cuya lista de clases tenga intersección con la relevancia del tab;
   - deduplicar por ID de medicamento, no por la única `drugClass` del grupo;
   - preservar grupo de origen, orden estable, tratamiento de grupos propios y regla de unitarios/`Otros`.
5. Adaptar `src/app/steps/meds-step/meds-step.component.ts` para pasar `MEDICATIONS` al cálculo puro. Verificar mediante `src/app/steps/meds-step/meds-step.component.spec.ts` que conteos, selección compartida y estado revisado siguen usando los grupos filtrados.
6. Añadir a `src/app/core/data/medications-taxonomy.ts` un grupo seleccionable para `ANALOGO_VASOPRESINA` y reforzar `src/app/core/data/medications-taxonomy.spec.ts` con cobertura del catálogo relevante. Confirmar con pruebas de datos reales los casos renales AOD, nitrofurantoína, metotrexato, Digoxina y los casos gastrointestinales/urológicos/endocrinos identificados en la auditoría.

## Documentación obligatoria del agente implementador

Antes de dar la tarea por terminada, actualizar:

- `docs/motor-criterios.md`: nuevo metadato explícito y unión con referencias derivadas.
- `docs/flujo-pasos.md`: intersección por medicamento, filtrado y deduplicación de grupos foráneos.
- `docs/catalogo-clinico.md`: grupo de análogos de vasopresina y separación entre taxonomía visual y relevancia.
- `docs/caso-clinico.md`: cambio del tipo `Crit`.
- `docs/revisiones/revision-visibilidad-clinica-por-sistema.md`: marcar hallazgos resueltos, pendientes y evidencia de verificación.
- Este documento: registrar estado final y cualquier desviación justificada del plan.

## Verificación y cierre

- Ejecutar primero las pruebas focalizadas y después la suite completa Karma/ChromeHeadless.
- Ejecutar el build de desarrollo, `node scripts/audit-criteria.cjs` y `scripts/check-links.sh` en un entorno con Bash.
- Realizar verificación de mutaciones sobre los nuevos comportamientos puros si el repositorio dispone del runner; si no existe, dejar constancia explícita de esa limitación en el informe de implementación.
- No cerrar mientras un caso relevante muestre todo el grupo en vez del subconjunto coincidente, un medicamento quede duplicado dentro del mismo tab o la documentación enlazada no refleje el comportamiento final.

## Estado de ejecución

Completado.

### Resultado

- `Crit.relevance.medicationClasses` permite declarar relevancia cuando un
  operador especial no expone `inDrugClass`. E1, F2 y F4 ya la declaran.
- Los grupos foráneos se filtran por la intersección entre las clases relevantes
  del tab y todas las clases de cada medicamento, con deduplicación por ID.
- Digoxina, AOD, nitrofurantoína, metotrexato, hierro oral y antibióticos tienen
  regresiones con los datos reales.
- Todos los medicamentos de clases referenciadas por criterios son
  seleccionables en al menos un grupo. Además del grupo previsto de análogos de
  vasopresina, fue necesario incorporar antianginosos, atropina,
  antineoplásicos, inmunosupresores, antifúngicos y antipalúdicos.
- La política de diagnósticos y sistemas transversales no se modificó.

### Verificación

- Pruebas unitarias tras la revisión manual: `627 SUCCESS`.
- Build de desarrollo: correcto.
- Auditoría de criterios: 216 criterios, sin clases ni diagnósticos desconocidos;
  `DIGOXINA` figura en la relevancia renal.
- Linked Chunks: `OK: todo limpio (0 problemas)`.
- Mutación: no ejecutada porque el repositorio no contiene runner ni
  configuración de Stryker; la limitación queda registrada aquí.

### Desviaciones justificadas

El plan mencionaba únicamente el hueco taxonómico de análogos de vasopresina.
La nueva prueba general de cobertura descubrió otros siete medicamentos
relevantes sin grupo seleccionable. Se añadieron grupos clínicos para cerrar el
invariante completo en lugar de conservar falsos negativos conocidos.

### Revisión manual posterior

La prueba manual descubrió que la regla histórica de unitarios ocultaba ocho
medicamentos en su categoría principal cuando solo eran relevantes para otro
sistema. Se añadió el invariante «si un unitario aflora específicamente en algún
tab, también aparece en su principal» y se conservaron en Otros los unitarios de
relevancia exclusivamente transversal.

También se cambió la deduplicación para priorizar coincidencias directas de
`group.drugClass` antes de usar el fallback multiclase, y se alineó la exclusión
de STOPP-I8 con la clase agregada `ANTIBIOTICO`.
