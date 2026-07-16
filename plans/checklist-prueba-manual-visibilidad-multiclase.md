# Checklist manual — visibilidad multiclase de medicamentos

## Preparación

- [ ] Ejecutar `npx ng serve --host 127.0.0.1 --port 4200`.
- [ ] Abrir `http://127.0.0.1:4200`.
- [ ] Reiniciar el caso para evitar selecciones persistidas de pruebas anteriores.

## 1. Digoxina en Renal

- [ ] Abrir el tab **Renal** del paso Medicamentos.
- [ ] Confirmar que **Digoxina** aparece en **Relevantes de otros sistemas**.
- [ ] Seleccionar Digoxina desde Renal.
- [ ] Confirmar que aparecen los campos de dosis en µg/día y duración.
- [ ] Cambiar a **Cardiovascular** y comprobar que Digoxina continúa seleccionada.
- [ ] Deseleccionarla en Cardiovascular y confirmar que también queda desmarcada al volver a Renal.

## 2. AOD multiclase en Renal

- [ ] En Renal, localizar el grupo **AODs** de otros sistemas.
- [ ] Confirmar que contiene Apixaban, Dabigatrán, Edoxaban y Rivaroxaban.
- [ ] Confirmar que **Warfarina** y **Acenocumarol** no aparecen en ese grupo renal.
- [ ] Seleccionar Apixaban desde Renal.
- [ ] Cambiar a **Anticoagulantes** y comprobar que Apixaban aparece seleccionado.
- [ ] Verificar que los badges de ambos tabs cuentan una única selección, no duplicados.

## 3. Filtrado de grupos

- [ ] En Renal, localizar **FAMEs** dentro de relevantes de otros sistemas.
- [ ] Confirmar que muestra **Metotrexato**.
- [ ] Confirmar que no muestra otros FAME sin clase `ANTIMETABOLITO`.
- [ ] En Anticoagulantes, localizar **Antiarrítmicos**.
- [ ] Confirmar que muestra **Amiodarona** por su clase inhibidora de P-gp.
- [ ] Confirmar que no muestra **Flecainida** en ese grupo foráneo.

## 4. Otros casos renales

- [ ] Confirmar que **Nitrofurantoína** aparece en Renal.
- [ ] Confirmar que los bifosfonatos aparecen en Renal.
- [ ] Confirmar que colchicina y metformina siguen siendo seleccionables en Renal.

## 5. Gastrointestinal y Urológico

- [ ] Abrir **Gastrointestinal** y confirmar que aparece el grupo **Hierro oral** con sulfato, fumarato y gluconato ferroso.
- [ ] Seleccionar un hierro oral y comprobar que la misma selección aparece en su tab de origen.
- [ ] Confirmar que **Antibióticos generales** aparecen como relevantes en Gastrointestinal.
- [ ] Abrir **Urológico** y confirmar que también aparecen los antibióticos relevantes.
- [ ] Verificar que Amoxicilina puede seleccionarse desde ambos tabs y conserva una única selección compartida.

## 6. Nuevos grupos seleccionables

- [ ] En **Endocrino/Metabólico**, comprobar el grupo **Análogos de vasopresina**.
- [ ] Confirmar que contiene Desmopresina y Vasopresina.
- [ ] En Endocrino/Metabólico, confirmar que **Metformina** aparece bajo Biguanidas y **Tamoxifeno** bajo Antineoplásicos.
- [ ] En **Cardiovascular**, comprobar que Ranolazina es seleccionable.
- [ ] En **SNC**, comprobar que Atropina es seleccionable.
- [ ] En **Antibióticos**, comprobar los grupos Antifúngicos, Antipalúdicos y Antibióticos urinarios.
- [ ] Confirmar que Quinina y Nitrofurantoína aparecen en esos grupos principales aunque también sean relevantes en otros tabs.
- [ ] En **Osteo/Músculo-esquelético**, comprobar el grupo Inmunosupresores.

## 7. Inhibidores de P-gp en Anticoagulantes

- [ ] Abrir **Anticoagulantes**.
- [ ] Confirmar que pueden localizarse como relevantes Ciclosporina, Itraconazol, Ketoconazol, Quinina, Ranolazina y Tamoxifeno.
- [ ] Seleccionar uno y comprobar que queda marcado también en su grupo de origen.
- [ ] Confirmar que un medicamento no aparece dos veces dentro del mismo tab aunque pertenezca a varias clases o grupos.

## 8. Regresiones generales

- [ ] Confirmar que los grupos propios habituales siguen visibles.
- [ ] Confirmar que el tab **Otros** no contiene medicamentos que ya afloran por relevancia específica.
- [ ] Marcar un tab vacío como revisado y comprobar que se desmarca automáticamente al seleccionar un medicamento relevante.
- [ ] Exportar y volver a cargar el caso; comprobar que las selecciones se conservan.

## 9. Política diagnóstica y sistemas transversales

- [ ] Abrir el paso Diagnósticos y entrar en **Cardiovascular**.
- [ ] Confirmar que **Dolor neuropático** aparece en “Relevantes de otros sistemas”.
- [ ] Repetir la comprobación en **Renal** y **Psiquiátrico**.
- [ ] Abrir **Neurológico** y confirmar que Dolor neuropático aparece como diagnóstico propio, sin duplicado foráneo.
- [ ] Abrir **Otros** y confirmar que no existe una sección “Relevantes de otros sistemas”.
- [ ] En Neurológico, confirmar que **Efectos extrapiramidales por neurolépticos** aparece como propio.
- [ ] En Psiquiátrico, confirmar que aparece como relevante procedente de Neurológico; registrar este resultado para su futura validación clínica.
- [ ] En Gastrointestinal, confirmar que **Esofagitis erosiva** aparece como diagnóstico propio y no duplicado.
- [ ] Volver al paso Medicamentos y confirmar que **Paracetamol** permanece en **Otros**.
- [ ] Confirmar que Paracetamol no aflora en Cardiovascular ni Renal únicamente por pertenecer al sistema transversal Analgésicos.
- [ ] Seleccionar un AINE desde un tab donde sea foráneo y comprobar que la selección se comparte con Osteo/Músculo-esquelético sin duplicarse.

## Resultado

- [ ] Todas las comprobaciones pasan.
- [ ] Registrar cualquier diferencia indicando tab, grupo, medicamento y si era propio o relevante de otro sistema.
