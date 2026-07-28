# Checklist de prueba manual — relevancia estricta + eliminación de gates (2026-07-28)

> Cubre las Fases 1, 2 (incl. 2.7), 3.3 y 6 del
> `plan-relevancia-estricta-por-sistema-2026-07-28.md`.
> Arranca con `npm start` y usa un caso **vacío** (botón «Nuevo caso» o recarga limpia)
> antes de cada bloque salvo que se indique lo contrario.

---

## Bloque A — Fase 1: casillas foráneas en Cardiovascular

Paso 1 (Medicamentos) → pestaña **Cardiovascular** → bloque «Relevantes de otros sistemas».

### A.1 — NO deben aparecer (era el fallo que reportaron los tutores)

- [ ] Clorfeniramina
- [ ] Dexclorfeniramina
- [ ] Difenhidramina
- [ ] Alprazolam
- [ ] Diazepam
- [ ] Lorazepam
- [ ] Gabapentina
- [ ] Pregabalina
- [ ] Zolpidem
- [ ] Zopiclona
- [ ] Tramadol
- [ ] Morfina
- [ ] Oxibutinina
- [ ] Solifenacina
- [ ] Tolterodina
- [ ] Biperideno
- [ ] Trihexifenidilo
- [ ] Lactulosa
- [ ] Macrogol
- [ ] Carbamazepina
- [ ] Levetiracetam
- [ ] Fluoxetina
- [ ] Sertralina
- [ ] Duloxetina
- [ ] Venlafaxina

### A.2 — SÍ deben aparecer (y cada uno tiene criterio cardiovascular explícito)

| Fármaco | Grupo de origen | Criterio que lo justifica |
|---|---|---|
| [ ] Ibuprofeno / Naproxeno / Diclofenaco / Celecoxib / Indometacina / Piroxicam | AINE (Osteo) | B17, B19 |
| [ ] Prednisona / Dexametasona / Hidrocortisona / Metilprednisolona | Corticoides (Endocrino/Resp.) | B19 |
| [ ] Haloperidol / Risperidona / Olanzapina / Quetiapina / Aripiprazol / Clozapina | Neurolépticos (SNC) | B18 (+B15 algunos) |
| [ ] Ondansetrón, Litio, Azitromicina, Claritromicina, Eritromicina, Ciprofloxacino, Levofloxacino, Moxifloxacino, Amitriptilina, Nortriptilina, Imipramina, Clomipramina, Doxepina, Citalopram, Escitalopram, Mirabegrón, Tizanidina, Astemizol | Prolongadores QTc (varios) | B15 |
| [ ] Simvastatina / Atorvastatina / Rosuvastatina / Pravastatina | Estatinas (Endocrino) | B16, START-B2 |
| [ ] Hierro carboximaltosa IV / Hierro sacarosa IV | Hierro IV (Renal/Hemato) | START-B11 |
| [ ] Sildenafilo / Tadalafilo / Vardenafilo | iPDE5 (Urológico) | B14 |
| [ ] Amilorida / Triamtereno | Ahorradores de K (Renal) | B13 |
| [ ] Doxazosina / Terazosina / Prazosina / Indoramina | Alfabloqueantes (Urológico) | B20, START-B1 |

### A.3 — Excepciones conocidas (pendientes de respuesta de los tutores)

Estos **siguen apareciendo** en Cardiovascular a propósito: son las fases 3.1 y 3.2
del plan, que no se tocan sin confirmación clínica. Si los tutores vuelven a
señalarlos, es la respuesta que hay que darles.

- [ ] **Quinina** y **Tamoxifeno** — llevan la clase `PROLONGADOR_QTC` en el
      catálogo aunque B15 (según los tutores) cita quinolonas, no estos. Fase 3.1.
- [ ] **Tamsulosina** y **Alfuzosina** — llevan `ALFABLOQUEANTE` y B20 los captura
      por término genérico, pero son uroselectivos para HBP, no antihipertensivos.
      Fase 3.2.

### A.4 — Grupo reducido a un solo fármaco

- [ ] En Cardiovascular, un grupo foráneo con varios miembros muestra **solo** los
      miembros con clase relevante, no el grupo entero (p. ej. de los antibióticos
      solo salen los macrólidos/quinolonas prolongadores de QTc, no todos).

### A.5 — Repetir el barrido en otros tabs

- [ ] Pestaña **SNC**: ningún fármaco puramente cardiovascular (Furosemida,
      Amlodipino, Losartán…) en «Relevantes de otros sistemas» salvo que un
      criterio de SNC lo cite (Digoxina, betabloqueantes y verapamilo/diltiazem sí,
      por D-bradicardia/confusión).
- [ ] Pestaña **Renal**: mismo criterio.
- [ ] Ninguna casilla del bloque foráneo queda «muda»: al marcarla siempre pasa algo
      (ver Bloque B).

---

## Bloque B — Fase 2: resaltado al marcar una casilla foránea

El resaltado dura **8 segundos**. La cascada es **aditiva**: resalta lo que puede
**y además** avisa de lo que falta si el criterio aún no ha saltado.

### B.1 — Nivel 1: resalta grupos de la pestaña actual

- [ ] Cardiovascular → marcar **Prednisona** (foráneo) → se resalta el grupo
      **«Diurét. de asa»** de la pestaña actual (B19).
- [ ] Cardiovascular → marcar **Ibuprofeno** → se resalta **«Diurét. de asa»** (B19).
- [ ] Cardiovascular → marcar **Sildenafilo** → se resalta **«Nitratos»** (B14).
- [ ] Cardiovascular → marcar **Amilorida** → se resaltan **a la vez** «IECA»,
      «ARA-II» y «Antag. aldosterona» (B13).

### B.2 — Negativos (no debe resaltar)

- [ ] **Desmarcar** cualquiera de los anteriores → no resalta nada.
- [ ] Marcar un fármaco del bloque **propio** de la pestaña (p. ej. Furosemida en
      Cardiovascular) → no resalta nada.
- [ ] Esperar 3 s tras marcar → el resaltado desaparece solo.
- [ ] Cambiar de pestaña justo después de marcar → no queda resaltado colgado.

### B.3 — Nivel 2: resalta la tarjeta del criterio disparado

- [ ] Paso 2 → marcar el diagnóstico **«Intervalo QTc prolongado»**. Volver al paso 1
      → Cardiovascular → marcar **Ondansetrón** → se resalta la **tarjeta STOPP B15**
      en la columna derecha (no un grupo).

### B.4 — Aviso (snackbar) con lo que falta

Con caso limpio (sin diagnósticos). Textos exactos verificados sobre los datos reales:

- [ ] Cardiovascular → **Ondansetrón** →
      `Relacionado con STOPP B15 — requiere: Intervalo QTc prolongado`
- [ ] Cardiovascular → **Hierro carboximaltosa IV** →
      `Relacionado con START B11 — requiere: Déficit de hierro; Insuficiencia cardíaca con FE reducida`
- [ ] Cardiovascular → **Simvastatina** →
      `Relacionado con START B2 — requiere: Enfermedad cardiovascular establecida u otras 3 variantes; Fragilidad`
- [ ] Cardiovascular → **Prednisona** → resalta «Diurét. de asa» **y además** muestra
      `Relacionado con STOPP B19 — requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes`
- [ ] El aviso lleva **fondo azul oscuro con borde izquierdo claro** y botón «Entendido»
      (no el gris por defecto de Material).
- [ ] Nunca aparece un código en mayúsculas con guiones bajos tipo `DIURETICO_ASA`.
- [ ] El aviso siempre distingue **STOPP** de **START** (nunca dice solo «B2»).
- [ ] Nunca repite el mismo código dos veces («STOPP B14 y STOPP B14»).

### B.4 bis — Varios criterios y ubicación del requisito

- [ ] Cardiovascular → **Simvastatina** → el aviso nombra **los dos** criterios, con una
      línea por criterio:
      ```
      Relacionado con START B2 y STOPP B16
      — START B2 requiere: Enfermedad cardiovascular establecida u otras 3 variantes (paso 2 · Cardiovascular); Fragilidad (paso 2 · Otros)
      — STOPP B16 requiere: Enfermedad cardiovascular establecida (paso 2 · Cardiovascular); Fragilidad (paso 2 · Otros)
      ```
- [ ] Paso 2 → **Neurológico** → marcar **«Prostatismo»** (foráneo) →
      ```
      Relacionado con STOPP D1 y STOPP D4
      — STOPP D1 requiere: Tricíclicos (paso 1 · SNC o Osteo/Músculo-esq.)
      — STOPP D4 requiere: Neurolépticos (paso 1 · SNC)
      ```
- [ ] Las líneas se ven **una debajo de otra**, no todo seguido (`white-space: pre-line`).
- [ ] Paso 2 → **Cardiovascular** → **«Hipercalcemia»** →
      `Relacionado con STOPP B9 — requiere: Diurét. tiazídicos (paso 1 · Cardiovascular)`
- [ ] **No** se anota ubicación cuando el requisito está donde ya estás: en Cardiovascular
      con Prednisona, «Diurét. de asa» aparece **sin** paréntesis, mientras que
      «Insuficiencia cardíaca…» sí lleva `(paso 2 · Cardiovascular)`.
- [ ] Si una clase vive en varias pestañas se nombran hasta dos, unidas por « o ».

### B.5 — Paridad en diagnósticos (Fase 2.7)

Paso 2 (Diagnósticos) → pestaña **Cardiovascular** → bloque «Relevantes de otros sistemas».

- [ ] Marcar un diagnóstico foráneo que emparejе con otro de la pestaña actual
      (p. ej. **«Déficit de hierro»** desde Hematológico) → se resalta
      **«Insuficiencia cardíaca con FE reducida»** en la pestaña actual (START-B11).
- [ ] Marcar un diagnóstico foráneo sin pareja visible → aparece snackbar con el
      código del criterio y los requisitos legibles.
- [ ] Desmarcar → no resalta.

### B.7 — Alternativas: no se resalta lo que no acerca el criterio

El caso que detectaste. START-H5 exige *déficit de vitamina D* **Y** (*caídas* **o**
*osteopenia* **o** *no sale de casa*): osteopenia y «no sale de casa» son
alternativas entre sí, marcar las dos no aporta nada.

- [ ] Paso 2 → pestaña **Reumatológico** → marcar **«No sale de casa»** (foráneo, de
      Geriátrico) → **NO** se resalta «Osteopenia».
- [ ] En su lugar aparece
      `Relacionado con START H5 — requiere: Déficit de vitamina D confirmado`.
- [ ] Marcar además **«Déficit de vitamina D confirmado»** (pestaña Metabólico) →
      ahora **sí** salta START-H5 en la columna derecha.

### B.8 — Enlace persistente: dos casillas foráneas → el mismo grupo

El indicador que faltaba: mientras las casillas sigan marcadas, el grupo propio
lleva un chip azul 🔗 con el número de foráneos que apuntan a él.

- [ ] Cardiovascular → marcar **Prednisona** → «Diurét. de asa» muestra chip **🔗 1**
      (azul claro).
- [ ] Marcar ahora **Ibuprofeno** → el mismo grupo pasa a **🔗 2** y el chip se vuelve
      **azul sólido** (variante `--multi`).
- [ ] Pasar el ratón por el chip → tooltip
      «2 medicamentos de otros sistemas se relacionan con este grupo: Ibuprofeno, Prednisona».
- [ ] Desmarcar Ibuprofeno → vuelve a **🔗 1**. Desmarcar Prednisona → el chip desaparece.
- [ ] El chip **sobrevive** a los 8 s del pulso: sigue ahí mientras el fármaco esté marcado.
- [ ] Equivalente en diagnósticos: dos diagnósticos foráneos que apunten al mismo
      diagnóstico propio muestran el chip con el contador.

### B.6 — Accesibilidad

- [ ] Con «reducir movimiento» activado en el sistema operativo, el resaltado
      cambia de color pero **no** anima.

---

## Bloque C — Fase 6: los avisos saltan sin pedir dosis ni duración

### C.1 — El panel de captura ya no existe

- [ ] En **ninguna** pestaña del paso 1 aparece el panel de «Dosis y duración»
      con inputs numéricos. Los campos de **analítica/constantes** del paso 2
      siguen ahí (eso es correcto, no se tocaron).

### C.2 — Los 12 criterios saltan solo con la selección

Marcar únicamente lo indicado y comprobar que el criterio aparece en la columna derecha:

| # | Criterio | Marcar | ¿Salta? |
|---|---|---|---|
| 1 | STOPP **C1** (AAS dosis alta) | AAS | [ ] |
| 2 | STOPP **F2** (IBP prolongado) | Omeprazol | [ ] |
| 3 | STOPP **F4** (hierro oral dosis alta) | Sulfato ferroso | [ ] |
| 4 | STOPP **D8** (benzo uso prolongado) | Lorazepam | [ ] |
| 5 | STOPP **D10** (benzo insomnio) | Lorazepam + dx *Insomnio* | [ ] |
| 6 | STOPP **D11** (hipnótico-Z insomnio) | Zolpidem + dx *Insomnio* | [ ] |
| 7 | STOPP **D15** (antipsicótico SCPD) | Risperidona + dx *Síntomas conductuales de la demencia* | [ ] |
| 8 | STOPP **B21** (digoxina en FA) | Digoxina + dx *Fibrilación auricular* | [ ] |
| 9 | STOPP **E1** (digoxina + renal) | Digoxina + dx *Enfermedad renal grave* | [ ] |
| 10 | STOPP **H4** (corticoide en AR) | Prednisona + dx *Artritis reumatoide* | [ ] |
| 11 | STOPP **L6** (paracetamol + hepatopatía) | Paracetamol + dx *Hepatopatía crónica* | [ ] |
| 12 | START **H2** (bifosfonato + vit. D) | Prednisona (sin bifosfonato ni vit. D) | [ ] |

> L6 era el hallazgo pendiente del plan de secciones I–M («paracetamol no salta ni
> con hepatopatía»). Debe quedar resuelto aquí.

### C.3 — El umbral sigue visible en el texto

- [ ] Cada uno de los 12 avisos menciona en su texto el umbral perdido
      («> 100 mg/día», «> 8 semanas», «> 3 meses», «≥ 3 g/día»…) y lleva la coletilla
      **«(Alerta de revisión de …)»**.

### C.4 — Los labs siguen funcionando como alternativa (no se tocaron)

- [ ] Paso 2 → marcar solo el diagnóstico **«Hipercalcemia»** + Hidroclorotiazida
      → salta **STOPP B9**, sin escribir ningún mmol/l.
- [ ] Alternativamente, escribir calcio corregido > 2,65 sin marcar el diagnóstico
      → también salta B9.

### C.5 — Retrocompatibilidad de casos guardados

- [ ] Coger un JSON de caso **antiguo** que tenga `doseMgDay` / `doseMcgDay` /
      `durationDays` e importarlo → carga sin error y sin perder medicamentos.
- [ ] Exportar un caso nuevo → el JSON ya no lleva esos campos (o los lleva vacíos),
      y se vuelve a importar sin error.

---

## Bloque D — Regresión general

- [ ] Navegación paso 1 ↔ paso 2 conserva selección.
- [ ] Copiar al portapapeles produce el texto de criterios correcto.
- [ ] Exportar / importar caso completo con medicamentos + diagnósticos + labs.
- [ ] Pestaña **«Otros»** de medicamentos sigue conteniendo los unitarios sin
      relevancia específica (p. ej. Paracetamol no debe estar duplicado).
