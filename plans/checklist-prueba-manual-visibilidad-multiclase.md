# Checklist manual — visibilidad multiclase de medicamentos

## Preparación

- [ ] Ejecutar `npx ng serve --host 127.0.0.1 --port 4200`.
- [ ] Abrir `http://127.0.0.1:4200`.
- [ ] Reiniciar el caso para evitar selecciones persistidas de pruebas anteriores.

## 1. Digoxina en Renal

- [x] Abrir el tab **Renal** del paso Medicamentos.
- [x] Confirmar que **Digoxina** aparece en **Relevantes de otros sistemas**.
- [x] Seleccionar Digoxina desde Renal.
- [x] Confirmar que aparecen los campos de dosis en µg/día y duración.
- [x] Cambiar a **Cardiovascular** y comprobar que Digoxina continúa seleccionada.
- [x] Deseleccionarla en Cardiovascular y confirmar que también queda desmarcada al volver a Renal.

## 2. AOD multiclase en Renal

- [x] En Renal, localizar el grupo **AODs** de otros sistemas.
- [x] Confirmar que contiene Apixaban, Dabigatrán, Edoxaban y Rivaroxaban.
- [x] Confirmar que **Warfarina** y **Acenocumarol** no aparecen en ese grupo renal.
- [x] Seleccionar Apixaban desde Renal.
- [x] Cambiar a **Anticoagulantes** y comprobar que Apixaban aparece seleccionado.
- [x] Verificar que los badges de ambos tabs cuentan una única selección, no duplicados.

## 3. Filtrado de grupos

- [x] En Renal, localizar **FAMEs** dentro de relevantes de otros sistemas.
- [x] Confirmar que muestra **Metotrexato**.
- [x] Confirmar que no muestra otros FAME sin clase `ANTIMETABOLITO`.
- [x] En Anticoagulantes, localizar **Antiarrítmicos**.
- [x] Confirmar que muestra **Amiodarona** por su clase inhibidora de P-gp.
- [x] Confirmar que no muestra **Flecainida** en ese grupo foráneo.

## 4. Otros casos renales

- [x] Confirmar que **Nitrofurantoína** aparece en Renal.
- [x] Confirmar que los bifosfonatos aparecen en Renal.
- [x] Confirmar que colchicina y metformina siguen siendo seleccionables en Renal.

## 5. Gastrointestinal y Urológico

- [x] Abrir **Gastrointestinal** y confirmar que aparece el grupo **Hierro oral** con sulfato, fumarato y gluconato ferroso.
- [x] Seleccionar un hierro oral y comprobar que la misma selección aparece en su tab de origen.
- [x] Confirmar que **Antibióticos generales** aparecen como relevantes en Gastrointestinal.
- [x] Abrir **Urológico** y confirmar que también aparecen los antibióticos relevantes.
- [x] Verificar que Amoxicilina puede seleccionarse desde ambos tabs y conserva una única selección compartida.

## 6. Nuevos grupos seleccionables

- [x] En **Endocrino/Metabólico**, comprobar el grupo **Análogos de vasopresina**.
- [x] Confirmar que contiene Desmopresina y Vasopresina.
- [x] En **Cardiovascular**, comprobar que Ranolazina es seleccionable.
- [x] En **SNC**, comprobar que Atropina es seleccionable.
- [x] En **Antibióticos**, comprobar los grupos Antifúngicos y Antipalúdicos.
- [x] En **Osteo/Músculo-esquelético**, comprobar el grupo Inmunosupresores.

## 7. Inhibidores de P-gp en Anticoagulantes

- [x] Abrir **Anticoagulantes**.
- [x] Confirmar que pueden localizarse como relevantes Ciclosporina, Itraconazol, Ketoconazol, Quinina, Ranolazina y Tamoxifeno.
- [x] Seleccionar uno y comprobar que queda marcado también en su grupo de origen.
- [x] Confirmar que un medicamento no aparece dos veces dentro del mismo tab aunque pertenezca a varias clases o grupos.

## 8. Regresiones generales

- [x] Confirmar que los grupos propios habituales siguen visibles.
- [x] Confirmar que el tab **Otros** no contiene medicamentos que ya afloran por relevancia específica.
- [x] Marcar un tab vacío como revisado y comprobar que se desmarca automáticamente al seleccionar un medicamento relevante.
- [x] Exportar y volver a cargar el caso; comprobar que las selecciones se conservan.
- [ ] Confirmar que la política actual de diagnósticos y sistemas transversales no ha cambiado.

## Resultado

- [ ] Todas las comprobaciones pasan.
- [ ] Registrar cualquier diferencia indicando tab, grupo, medicamento y si era propio o relevante de otro sistema.

