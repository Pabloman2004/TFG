# Checklist de verificación — snackbars y enlaces de «Relevantes de otros sistemas»

> Generado el 2026-07-28 a partir del código real (`resolveForeignHighlight`,
> `resolveForeignDxHighlight`, `relatedSelectionLinks`) sobre `criteria.json`,
> `MEDICATIONS` y las taxonomías. **370 casillas foráneas**: 235 en el paso 1
> (medicamentos) y 135 en el paso 2 (diagnósticos). Todas se comprueban con **caso
> limpio** (sin nada más marcado); las columnas de enlace suponen esa casilla como
> única selección.

## Cómo leer cada sección

- **A · Con enlace en el mismo tab** (101 casillas): al marcarlas se resalta uno o varios
  elementos de la pestaña actual **y** aparece el chip 🔗 persistente. Además sale el aviso
  con lo que aún falta. Aquí se comprueba el resaltado y el contador del chip.
- **B · Sin enlace en este tab** (269 casillas): el requisito vive en otra pantalla o
  pestaña, así que aquí no hay nada que resaltar. El aviso dice **qué tipo** de elemento es
  (medicamento o diagnóstico), **en qué paso** y **en qué pestaña**. Al navegar hasta allí,
  ese elemento debe mostrar el chip 🔗 contando lo que lo está esperando.

## Un caso de cada situación (empieza por aquí)

| # | Caso | Dónde | Qué debe pasar |
|---|---|---|---|
| 1 | **Enlace mismo tab, un criterio** | Paso 1 · Cardiovascular · marcar **Sildenafilo** | Resalta **Nitratos** + chip 🔗 1. Aviso: `Relacionado con STOPP B14 — requiere: Nitratos` |
| 2 | **Enlace mismo tab, varios grupos** | Paso 1 · Cardiovascular · marcar **Amilorida** | Resalta **Antag. aldosterona + ARA-II + IECA** a la vez, chip 🔗 1 en cada uno |
| 3 | **Dos casillas al mismo grupo** | Paso 1 · Cardiovascular · marcar **Prednisona**, luego **Ibuprofeno** | «Diurét. de asa» pasa de 🔗 1 a **🔗 2** azul sólido. Tooltip: «2 elementos ya marcados se relacionan con este grupo: Ibuprofeno (medicamento), Prednisona (medicamento)» |
| 4 | **Enlace que CRUZA de paso** | Paso 1 · Cardiovascular · marcar **Ondansetrón** y **Litio**, luego ir a Paso 2 · Cardiovascular | Aviso en el paso 1: `Relacionado con STOPP B15 — requiere: Intervalo QTc prolongado (diagnóstico · paso 2 · Cardiovascular)`. Al llegar al paso 2, **«Intervalo QTc prolongado» lleva chip 🔗 2** con tooltip «2 elementos ya marcados necesitan este diagnóstico: Litio (medicamento), Ondansetrón (medicamento)» |
| 5 | **Enlace cruzado inverso** | Paso 2 · Cardiovascular · marcar **«Intervalo QTc prolongado»**, luego ir a Paso 1 · Cardiovascular | **Antiarrítmicos** y **Antianginosos** llevan chip 🔗 1 (contienen amiodarona / dronedarona / ranolazina, que prolongan el QTc) |
| 6 | **Varios criterios en un aviso** | Paso 2 · Neurológico · marcar **Prostatismo** | `Relacionado con STOPP D1 y STOPP D4` + una línea por criterio, cada requisito con su tipo y ubicación |

---

## Aclaración: STOPP B15 no es un umbral de dosis ni de duración

Aparece en **25 de las 370 casillas** —el criterio más frecuente del tab cardiovascular—
porque 22 fármacos del catálogo llevan la clase `PROLONGADOR_QTC`. Pero lo que pide no es
un número, es un **diagnóstico marcable**:

```json
{"and":[ {"inDrugClass":["PROLONGADOR_QTC", …]},
         {"or":[ {"in":["intervalo_qtc_prolongado", {"var":"diagnoses"}]},
                 {">=":[{"var":"labs.qtc_ms"}, 450]} ]} ]}
```

Es el patrón `and[fármaco, or[diagnóstico, lab]]` que la Fase 6.2 conservó **a propósito**:
el valor de laboratorio (qtc_ms ≥ 450) es una **alternativa opcional**, nunca un requisito.
Marcando el diagnóstico **«Intervalo QTc prolongado»** (paso 2 · Cardiovascular · grupo
«Arritmias y conducción») el criterio salta sin escribir ni un milisegundo.

Los gates duros de dosis y duración que sí se eliminaron eran otros 12 criterios
(C1, F2, F4, D8, D10, D11, D15, B21, E1, H4, L6 y START-H2). B15 nunca estuvo entre ellos.

- [ ] Comprobar: marcar **Ondansetrón** en cardiovascular y el diagnóstico
      **«Intervalo QTc prolongado»** → B15 salta, sin tocar ningún campo numérico.

---

## Comprobaciones transversales

- [ ] Todo aviso indica el **tipo** del requisito: `(medicamento · paso 1 · …)` o
      `(diagnóstico · paso 2 · …)`. Nunca es ambiguo entre las dos pestañas homónimas.
- [ ] Ningún aviso muestra códigos en mayúsculas con guiones bajos (`DIURETICO_ASA`).
- [ ] Ningún aviso repite el mismo código («STOPP B14 y STOPP B14»).
- [ ] El aviso distingue siempre **STOPP** de **START**.
- [ ] El resaltado dura **8 s**; el chip 🔗 **persiste** mientras la casilla siga marcada.
- [ ] Desmarcar la casilla quita el chip y no resalta nada.
- [ ] Con «reducir movimiento» activado, el resaltado cambia de color pero no anima.

---

# Paso 1 — Medicamentos

## Cardiovascular (57 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Celecoxib** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Diclofenaco** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Ibuprofeno** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Indometacina** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Naproxeno** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Piroxicam** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP B17 y STOPP B19<br>— STOPP B17 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B19 requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Alfuzosina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Doxazosina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Indoramina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Prazosina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Tamsulosina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Terazosina** | Urológico | Antag. calcio DHP + Antag. calcio no DHP + Antihipertens. central + ARA-II + Betabloqueantes + Diurét. de asa + Diurét. tiazídicos + IECA + Sacubitrilo/Valsartán | Relacionado con START B1 y STOPP B20<br>— START B1 requiere: HTA u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B20 requiere: Estenosis aórtica grave sintomática (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Dexametasona** | Respiratorio | Diurét. de asa | Relacionado con STOPP B19 — requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Hidrocortisona** | Respiratorio | Diurét. de asa | Relacionado con STOPP B19 — requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Metilprednisolona** | Respiratorio | Diurét. de asa | Relacionado con STOPP B19 — requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Prednisona** | Respiratorio | Diurét. de asa | Relacionado con STOPP B19 — requiere: Diurét. de asa; Insuficiencia cardíaca u otras 4 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | **Amilorida** | Renal | Antag. aldosterona + ARA-II + IECA | Relacionado con STOPP B13 — requiere: Antag. aldosterona |
| [ ] | **Triamtereno** | Renal | Antag. aldosterona + ARA-II + IECA | Relacionado con STOPP B13 — requiere: Antag. aldosterona |
| [ ] | **Sildenafilo** | Urológico | Nitratos | Relacionado con STOPP B14 — requiere: Nitratos |
| [ ] | **Tadalafilo** | Urológico | Nitratos | Relacionado con STOPP B14 — requiere: Nitratos |
| [ ] | **Vardenafilo** | Urológico | Nitratos | Relacionado con STOPP B14 — requiere: Nitratos |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Mirabegrón, Ondansetrón, Astemizol, Tamoxifeno, Quinina, Litio … (20 en total) | Relacionado con STOPP B15 — requiere: Intervalo QTc prolongado (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | Atorvastatina, Pravastatina, Rosuvastatina, Simvastatina | Relacionado con START B2 y STOPP B16<br>— START B2 requiere: Enfermedad cardiovascular establecida u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular); Fragilidad (diagnóstico · paso 2 · Otros)<br>— STOPP B16 requiere: Enfermedad cardiovascular establecida (diagnóstico · paso 2 · Cardiovascular); Fragilidad (diagnóstico · paso 2 · Otros) |
| [ ] | Hierro carboximaltosa IV, Hierro sacarosa IV | Relacionado con START B11 — requiere: Déficit de hierro (diagnóstico · paso 2 · Hematológico); Insuficiencia cardíaca con FE reducida (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | Aripiprazol, Clozapina, Olanzapina, Quetiapina, Risperidona | Relacionado con STOPP B18 — requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular) |
| [ ] | Clorpromazina, Haloperidol, Levomepromazina, Proclorperazina, Tioridazina | Relacionado con STOPP B15 y STOPP B18<br>— STOPP B15 requiere: Intervalo QTc prolongado (diagnóstico · paso 2 · Cardiovascular)<br>— STOPP B18 requiere: Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica u otras 3 variantes (diagnóstico · paso 2 · Cardiovascular) |

## Anticoagulantes (32 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Celecoxib** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Diclofenaco** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Ibuprofeno** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Indometacina** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Naproxeno** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Piroxicam** | Osteo/Músculo-esq. | Antivitamina K + AODs | Relacionado con STOPP C10 — requiere: Anticoagulante |
| [ ] | **Testosterona** | Endocrino/Metabólico | AODs | Relacionado con STOPP C14 y STOPP C15<br>— STOPP C14 requiere: AODs<br>— STOPP C15 requiere: Antecedentes de tromboembolismo venoso (diagnóstico · paso 2 · Hematológico) |
| [ ] | **Diltiazem** | Cardiovascular | AODs | Relacionado con STOPP C13 y STOPP C14<br>— STOPP C13 requiere: Inhibidor directo trombina<br>— STOPP C14 requiere: AODs |
| [ ] | **Verapamilo** | Cardiovascular | AODs | Relacionado con STOPP C13 y STOPP C14<br>— STOPP C13 requiere: Inhibidor directo trombina<br>— STOPP C14 requiere: AODs |
| [ ] | **Ranolazina** | Cardiovascular | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Amiodarona** | Cardiovascular | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Dronedarona** | Cardiovascular | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Itraconazol** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Ketoconazol** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Tamoxifeno** | Endocrino/Metabólico | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Quinina** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Carvedilol** | Cardiovascular | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Estradiol** | Endocrino/Metabólico | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Estrógenos conjugados** | Endocrino/Metabólico | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Ciclosporina** | Osteo/Músculo-esq. | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Citalopram** | SNC | Antivitamina K + AODs | Relacionado con STOPP C12 — requiere: Antecedentes de sangrado grave (diagnóstico · paso 2 · Hematológico); Anticoagulante |
| [ ] | **Escitalopram** | SNC | Antivitamina K + AODs | Relacionado con STOPP C12 — requiere: Antecedentes de sangrado grave (diagnóstico · paso 2 · Hematológico); Anticoagulante |
| [ ] | **Fluoxetina** | SNC | Antivitamina K + AODs | Relacionado con STOPP C12 — requiere: Antecedentes de sangrado grave (diagnóstico · paso 2 · Hematológico); Anticoagulante |
| [ ] | **Sertralina** | SNC | Antivitamina K + AODs | Relacionado con STOPP C12 — requiere: Antecedentes de sangrado grave (diagnóstico · paso 2 · Hematológico); Anticoagulante |
| [ ] | **Azitromicina** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Claritromicina** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |
| [ ] | **Eritromicina** | Antiinfecciosos | AODs | Relacionado con STOPP C14 — requiere: AODs |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Candesartán, Losartán, Valsartán, Enalapril, Ramipril | Relacionado con STOPP C5 — requiere: Enfermedad vascular estable sin indicación clara (diagnóstico · paso 2 · Cardiovascular) |

## SNC (18 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Diltiazem** | Cardiovascular | Inh. acetilcolinesterasa | Relacionado con STOPP D18 — requiere: Betabloqueantes (medicamento · paso 1 · Cardiovascular) |
| [ ] | **Verapamilo** | Cardiovascular | Inh. acetilcolinesterasa | Relacionado con STOPP D18 — requiere: Betabloqueantes (medicamento · paso 1 · Cardiovascular) |
| [ ] | **Digoxina** | Cardiovascular | Inh. acetilcolinesterasa | Relacionado con STOPP D18 — requiere: Betabloqueantes (medicamento · paso 1 · Cardiovascular) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Oxibutinina, Solifenacina, Tolterodina, Hioscina, Tizanidina | Relacionado con STOPP D14 — requiere: Delirio o Demencia (diagnóstico · paso 2 · Neurológico) |
| [ ] | Astemizol | Relacionado con STOPP D24 y STOPP D25<br>— STOPP D24 requiere: Alergia o Prurito (diagnóstico · paso 2 · Otros)<br>— STOPP D25 requiere: Insomnio (diagnóstico · paso 2 · Psiquiátrico) |
| [ ] | Clorfeniramina, Dexclorfeniramina, Difenhidramina | Relacionado con STOPP D14, STOPP D24 y STOPP D25<br>— STOPP D14 requiere: Delirio o Demencia (diagnóstico · paso 2 · Neurológico)<br>— STOPP D24 requiere: Alergia o Prurito (diagnóstico · paso 2 · Otros)<br>— STOPP D25 requiere: Insomnio (diagnóstico · paso 2 · Psiquiátrico) |
| [ ] | Atenolol, Bisoprolol, Carvedilol, Metoprolol, Nebivolol, Propranolol | Relacionado con START D7 y STOPP D18<br>— START D7 requiere: Temblor esencial benigno (diagnóstico · paso 2 · Neurológico)<br>— STOPP D18 requiere: Antag. calcio no DHP o Digoxina (medicamento · paso 1 · Cardiovascular) |

## Renal (19 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Celecoxib** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Diclofenaco** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Ibuprofeno** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Indometacina** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Naproxeno** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Piroxicam** | Osteo/Músculo-esq. | Diurét. de asa | Relacionado con STOPP E4 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Nitrofurantoína | Relacionado con STOPP E8 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Apixaban, Edoxaban, Rivaroxaban | Relacionado con STOPP E3 — requiere: Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Dabigatrán | Relacionado con STOPP E2 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Alendronato, Ibandronato, Risedronato, Zoledronato | Relacionado con STOPP E9 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Metformina | Relacionado con STOPP E6 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Colchicina | Relacionado con STOPP E5 |
| [ ] | Digoxina | Relacionado con STOPP E1 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Metotrexato | Relacionado con STOPP E10 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |

## Gastrointestinal (52 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Celecoxib** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Diclofenaco** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Ibuprofeno** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Indometacina** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Naproxeno** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Piroxicam** | Osteo/Músculo-esq. | IBP | Relacionado con START F3 |
| [ ] | **Ácido acetilsalicílico** | Anticoagulantes | IBP | Relacionado con START F2 y STOPP F6<br>— START F2 requiere: Antecedentes de úlcera péptica o Esofagitis por reflujo (diagnóstico · paso 2 · Gastrointestinal)<br>— STOPP F6 requiere: Antecedentes de EVAG (diagnóstico · paso 2 · Gastrointestinal) |
| [ ] | **Amoxicilina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Amoxicilina/Clavulánico** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Cefalexina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Doxiciclina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Trimetoprim/Sulfametoxazol** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Nitrofurantoína** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Azitromicina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Claritromicina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Eritromicina** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Ciprofloxacino** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Levofloxacino** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |
| [ ] | **Moxifloxacino** | Antiinfecciosos | Probióticos | Relacionado con START F6 — requiere: Inmunocompromiso o deterioro grave (diagnóstico · paso 2 · Otros) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Diltiazem, Verapamilo, Fumarato ferroso, Gluconato ferroso, Sulfato ferroso, Buprenorfina parche … (14 en total) | Relacionado con STOPP F3 — requiere: Estreñimiento crónico (diagnóstico · paso 2 · Gastrointestinal) |
| [ ] | Clopidogrel, Prasugrel, Ticagrelor, Ticlopidina, Acenocumarol, Warfarina | Relacionado con STOPP F6 — requiere: Antecedentes de EVAG (diagnóstico · paso 2 · Gastrointestinal) |
| [ ] | Dexametasona, Hidrocortisona, Metilprednisolona, Prednisona | Relacionado con STOPP F5 — requiere: Antecedentes de úlcera péptica o Esofagitis erosiva (diagnóstico · paso 2 · Gastrointestinal) |
| [ ] | Aripiprazol, Clorpromazina, Clozapina, Haloperidol, Levomepromazina, Olanzapina … (9 en total) | Relacionado con STOPP F7 — requiere: Disfagia (diagnóstico · paso 2 · Gastrointestinal) |

## Respiratorio (5 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Alprazolam, Clonazepam, Diazepam, Lorazepam, Midazolam | Relacionado con STOPP G4 — requiere: EPOC grave o Insuficiencia respiratoria (diagnóstico · paso 2 · Respiratorio) |

## Endocrino/Metabólico (7 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Candesartán, Losartán, Valsartán, Enalapril, Ramipril | Relacionado con START J1 — requiere: Diabetes mellitus (diagnóstico · paso 2 · Endocrino); Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) y 1 requisito más |
| [ ] | Carvedilol, Propranolol | Relacionado con STOPP J3 — requiere: Diabetes con episodios frecuentes de hipoglucemia (diagnóstico · paso 2 · Endocrino) |

## Urológico (35 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Amoxicilina, Amoxicilina/Clavulánico, Cefalexina, Doxiciclina, Trimetoprim/Sulfametoxazol, Nitrofurantoína … (12 en total) | Relacionado con STOPP I8 — requiere: Bacteriuria asintomática (diagnóstico · paso 2 · Otros) |
| [ ] | Hioscina, Clorfeniramina, Dexclorfeniramina, Difenhidramina, Biperideno, Orfenadrina … (22 en total) | Relacionado con STOPP I2 y STOPP I4<br>— STOPP I2 requiere: Glaucoma de ángulo estrecho (diagnóstico · paso 2 · Otros)<br>— STOPP I4 requiere: Estreñimiento crónico (diagnóstico · paso 2 · Gastrointestinal) |
| [ ] | Duloxetina | Relacionado con STOPP I7 — requiere: Incontinencia urinaria de urgencia (diagnóstico · paso 2 · Urológico) |

## Osteo/Músculo-esq. (10 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Ácido fólico** | Endocrino/Metabólico | FAMEs + Inmunosupresores | Relacionado con START H9 — requiere: Antimetabolito |
| [ ] | **Dexametasona** | Respiratorio | AINEs + Antirresortivos (amplio) + Bifosfonatos | Relacionado con STOPP H4, STOPP H5 y STOPP H7<br>— STOPP H4 requiere: Artritis reumatoide (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H5 requiere: Artrosis (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H7 requiere: AINEs; Artritis u otras 5 variantes (diagnóstico · paso 2 · Reumatológico) |
| [ ] | **Hidrocortisona** | Respiratorio | AINEs + Antirresortivos (amplio) + Bifosfonatos | Relacionado con STOPP H4, STOPP H5 y STOPP H7<br>— STOPP H4 requiere: Artritis reumatoide (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H5 requiere: Artrosis (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H7 requiere: AINEs; Artritis u otras 5 variantes (diagnóstico · paso 2 · Reumatológico) |
| [ ] | **Metilprednisolona** | Respiratorio | AINEs + Antirresortivos (amplio) + Bifosfonatos | Relacionado con STOPP H4, STOPP H5 y STOPP H7<br>— STOPP H4 requiere: Artritis reumatoide (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H5 requiere: Artrosis (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H7 requiere: AINEs; Artritis u otras 5 variantes (diagnóstico · paso 2 · Reumatológico) |
| [ ] | **Prednisona** | Respiratorio | AINEs + Antirresortivos (amplio) + Bifosfonatos | Relacionado con STOPP H4, STOPP H5 y STOPP H7<br>— STOPP H4 requiere: Artritis reumatoide (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H5 requiere: Artrosis (diagnóstico · paso 2 · Reumatológico)<br>— STOPP H7 requiere: AINEs; Artritis u otras 5 variantes (diagnóstico · paso 2 · Reumatológico) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Alopurinol, Febuxostat | Relacionado con START H8 — requiere: Gota recurrente (diagnóstico · paso 2 · Reumatológico) |
| [ ] | Calcifediol, Calcitriol, Colecalciferol | Relacionado con START H2, START H3 y START H5<br>— START H2 requiere: Corticoides sistémicos (medicamento · paso 1 · Respiratorio o Endocrino/Metabólico)<br>— START H3 requiere: Fractura por fragilidad o Osteoporosis (diagnóstico · paso 2 · Reumatológico)<br>— START H5 requiere: Caídas de repetición u otras 3 variantes (diagnóstico · paso 2 · Otros); Déficit de vitamina D confirmado (diagnóstico · paso 2 · Metabólico) |

---

# Paso 2 — Diagnósticos

## Cardiovascular (16 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Enfermedad renal grave** | Renal | Insuficiencia cardíaca con FE reducida | Relacionado con START B7 — requiere: Insuficiencia cardíaca con FE reducida; Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | **Insuficiencia renal terminal (TFGe < 15 ml/min)** | Renal | Insuficiencia cardíaca con FE reducida + FA + Estenosis mitral moderada-grave + Prótesis valvular metálica | Relacionado con START B7 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia cardíaca con FE reducida |
| [ ] | **Incontinencia urinaria** | Urológico | HTA + HTA grave + HTA moderada + HTA no complicada | Relacionado con STOPP B10 — requiere: Diurét. de asa (medicamento · paso 1 · Cardiovascular o Renal); HTA u otras 3 variantes |
| [ ] | **Déficit de hierro** | Hematológico | Insuficiencia cardíaca con FE reducida | Relacionado con START B11 — requiere: Insuficiencia cardíaca con FE reducida |
| [ ] | **Edemas maleolares** | Otros | Insuficiencia cardíaca + Insuficiencia cardíaca con FE reducida + Insuficiencia cardíaca con función sistólica conservada + Insuficiencia cardíaca grave + Insuficiencia cardíaca NYHA III-IV | Relacionado con STOPP B8 — requiere: Diurét. de asa (medicamento · paso 1 · Cardiovascular o Renal); Insuficiencia cardíaca u otras 7 variantes |
| [ ] | **Fragilidad** | Otros | Enfermedad cardiovascular establecida + Enfermedad vascular cerebral + Enfermedad vascular coronaria + Enfermedad vascular periférica | Relacionado con START B2 y STOPP B16<br>— START B2 requiere: Enfermedad cardiovascular establecida u otras 3 variantes<br>— STOPP B16 requiere: Enfermedad cardiovascular establecida; Estatinas (medicamento · paso 1 · Endocrino/Metabólico) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Insuficiencia renal, Síndrome nefrótico, Insuficiencia hepática | Relacionado con STOPP B8 — requiere: Diurét. de asa (medicamento · paso 1 · Cardiovascular o Renal); Edemas maleolares (diagnóstico · paso 2 · Otros) |
| [ ] | Hipercalcemia, Hiponatremia, Hipopotasemia, Antecedentes de gota, Gota activa, Gota recurrente | Relacionado con STOPP B9 — requiere: Diurét. tiazídicos (medicamento · paso 1 · Cardiovascular) |
| [ ] | Hiperpotasemia | Relacionado con STOPP B12 — requiere: ARA-II (medicamento · paso 1 · Cardiovascular o Renal) |

## Neurológico (18 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Enfermedad renal grave** | Renal | Síndrome de piernas inquietas | Relacionado con START D6 — requiere: Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal); Síndrome de piernas inquietas |
| [ ] | **Insuficiencia renal terminal (TFGe < 15 ml/min)** | Renal | Síndrome de piernas inquietas | Relacionado con START D6 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Síndrome de piernas inquietas |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Bloqueo AV completo, Bloqueo AV de segundo grado, Bradicardia, Síncopes recurrentes | Relacionado con STOPP D17 — requiere: Inh. acetilcolinesterasa (medicamento · paso 1 · SNC) |
| [ ] | HTA grave | Relacionado con STOPP D3 — requiere: IRSN (medicamento · paso 1 · SNC) |
| [ ] | Trastornos de conducción cardíaca, Estreñimiento crónico, Glaucoma de ángulo estrecho | Relacionado con STOPP D1 — requiere: Tricíclicos (medicamento · paso 1 · SNC o Osteo/Músculo-esq.) |
| [ ] | Hiponatremia, Hiponatremia significativa (Na+ < 130 mmol/L) | Relacionado con STOPP D6 — requiere: ISRS (medicamento · paso 1 · SNC) |
| [ ] | Prostatismo, Prostatismo / Retención urinaria, Retención urinaria | Relacionado con STOPP D1 y STOPP D4<br>— STOPP D1 requiere: Tricíclicos (medicamento · paso 1 · SNC o Osteo/Músculo-esq.)<br>— STOPP D4 requiere: Neurolépticos (medicamento · paso 1 · SNC) |
| [ ] | Riesgo significativo de sangrado | Relacionado con STOPP D7 — requiere: ISRS (medicamento · paso 1 · SNC) |
| [ ] | Alergia, Prurito | Relacionado con STOPP D24 — requiere: Antihist. 1ª gen. (medicamento · paso 1 · Respiratorio) |

## Psiquiátrico (18 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Bloqueo AV completo, Bloqueo AV de segundo grado, Bradicardia, Síncopes recurrentes | Relacionado con STOPP D17 — requiere: Inh. acetilcolinesterasa (medicamento · paso 1 · SNC) |
| [ ] | HTA grave | Relacionado con STOPP D3 — requiere: IRSN (medicamento · paso 1 · SNC) |
| [ ] | Trastornos de conducción cardíaca, Estreñimiento crónico, Glaucoma de ángulo estrecho | Relacionado con STOPP D1 — requiere: Tricíclicos (medicamento · paso 1 · SNC o Osteo/Músculo-esq.) |
| [ ] | Enfermedad renal grave | Relacionado con START D6 — requiere: Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal); Síndrome de piernas inquietas (diagnóstico · paso 2 · Neurológico) |
| [ ] | Insuficiencia renal terminal (TFGe < 15 ml/min) | Relacionado con START D6 — requiere: Enfermedad renal grave (diagnóstico · paso 2 · Renal); Síndrome de piernas inquietas (diagnóstico · paso 2 · Neurológico) |
| [ ] | Hiponatremia, Hiponatremia significativa (Na+ < 130 mmol/L) | Relacionado con STOPP D6 — requiere: ISRS (medicamento · paso 1 · SNC) |
| [ ] | Prostatismo, Prostatismo / Retención urinaria, Retención urinaria | Relacionado con STOPP D1 y STOPP D4<br>— STOPP D1 requiere: Tricíclicos (medicamento · paso 1 · SNC o Osteo/Músculo-esq.)<br>— STOPP D4 requiere: Neurolépticos (medicamento · paso 1 · SNC) |
| [ ] | Riesgo significativo de sangrado | Relacionado con STOPP D7 — requiere: ISRS (medicamento · paso 1 · SNC) |
| [ ] | Alergia, Prurito | Relacionado con STOPP D24 — requiere: Antihist. 1ª gen. (medicamento · paso 1 · Respiratorio) |

## Renal (4 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Hiperfosfatemia** | Metabólico | Enfermedad renal grave + Insuficiencia renal terminal (TFGe < 15 ml/min) | Relacionado con START E2 — requiere: Enfermedad renal grave; Insuficiencia renal terminal (TFGe < 15 ml/min) |
| [ ] | **Hipocalcemia** | Metabólico | Enfermedad renal grave + Insuficiencia renal terminal (TFGe < 15 ml/min) | Relacionado con START E1 — requiere: Enfermedad renal grave; Hiperparatiroidismo secundario (diagnóstico · paso 2 · Endocrino); Insuficiencia renal terminal (TFGe < 15 ml/min) |
| [ ] | **Hiperparatiroidismo secundario** | Endocrino | Enfermedad renal grave + Insuficiencia renal terminal (TFGe < 15 ml/min) | Relacionado con START E1 — requiere: Enfermedad renal grave; Hipocalcemia (diagnóstico · paso 2 · Metabólico); Insuficiencia renal terminal (TFGe < 15 ml/min) |
| [ ] | **Anemia sintomática** | Hematológico | Enfermedad renal grave + Insuficiencia renal terminal (TFGe < 15 ml/min) | Relacionado con START E3 — requiere: Enfermedad renal grave; Insuficiencia renal terminal (TFGe < 15 ml/min) |

## Metabólico (15 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Enfermedad renal grave** | Renal | Hiperfosfatemia + Hipocalcemia | Relacionado con START J1 — requiere: Diabetes mellitus (diagnóstico · paso 2 · Endocrino); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal); Proteinuria / microalbuminuria (diagnóstico · paso 2 · Renal) |
| [ ] | **Insuficiencia renal terminal (TFGe < 15 ml/min)** | Renal | Hiperfosfatemia + Hipocalcemia | Relacionado con START J1 — requiere: Diabetes mellitus (diagnóstico · paso 2 · Endocrino); Enfermedad renal grave (diagnóstico · paso 2 · Renal); Proteinuria / microalbuminuria (diagnóstico · paso 2 · Renal) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica | Relacionado con STOPP J7 — requiere: Andrógenos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Hipotensión sintomática | Relacionado con STOPP J4 — requiere: iSGLT2 (medicamento · paso 1 · Cardiovascular o Renal (+1)) |
| [ ] | Insuficiencia cardíaca, Insuficiencia cardíaca con FE reducida, Insuficiencia cardíaca con función sistólica conservada, Insuficiencia cardíaca grave, Insuficiencia cardíaca NYHA III-IV | Relacionado con STOPP J2 — requiere: Tiazolidindionas (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Proteinuria / microalbuminuria | Relacionado con START J1 — requiere: Diabetes mellitus (diagnóstico · paso 2 · Endocrino); Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |
| [ ] | Incontinencia urinaria, Poliaquiuria | Relacionado con STOPP J10 — requiere: Análogos de vasopresina (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Útero intacto sin progestágenos | Relacionado con STOPP J8 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Antecedentes de tromboembolismo venoso | Relacionado con STOPP J6 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Antecedentes de cáncer de mama o útero | Relacionado con STOPP J5 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |

## Endocrino (15 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Enfermedad renal grave** | Renal | Diabetes mellitus + Hiperparatiroidismo secundario | Relacionado con START J1 — requiere: Diabetes mellitus; Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal); Proteinuria / microalbuminuria (diagnóstico · paso 2 · Renal) |
| [ ] | **Insuficiencia renal terminal (TFGe < 15 ml/min)** | Renal | Diabetes mellitus + Hiperparatiroidismo secundario | Relacionado con START J1 — requiere: Diabetes mellitus; Enfermedad renal grave (diagnóstico · paso 2 · Renal); Proteinuria / microalbuminuria (diagnóstico · paso 2 · Renal) |
| [ ] | **Proteinuria / microalbuminuria** | Renal | Diabetes mellitus | Relacionado con START J1 — requiere: Diabetes mellitus; Enfermedad renal grave (diagnóstico · paso 2 · Renal); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica | Relacionado con STOPP J7 — requiere: Andrógenos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Hipotensión sintomática | Relacionado con STOPP J4 — requiere: iSGLT2 (medicamento · paso 1 · Cardiovascular o Renal (+1)) |
| [ ] | Insuficiencia cardíaca, Insuficiencia cardíaca con FE reducida, Insuficiencia cardíaca con función sistólica conservada, Insuficiencia cardíaca grave, Insuficiencia cardíaca NYHA III-IV | Relacionado con STOPP J2 — requiere: Tiazolidindionas (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Incontinencia urinaria, Poliaquiuria | Relacionado con STOPP J10 — requiere: Análogos de vasopresina (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Útero intacto sin progestágenos | Relacionado con STOPP J8 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Antecedentes de tromboembolismo venoso | Relacionado con STOPP J6 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |
| [ ] | Antecedentes de cáncer de mama o útero | Relacionado con STOPP J5 — requiere: Estrógenos sistémicos (medicamento · paso 1 · Endocrino/Metabólico) |

## Gastrointestinal (4 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Enfermedad de Parkinson, Parkinsonismo, Parkinsonismo inducido por fármacos | Relacionado con STOPP F1 — requiere: Procinéticos (medicamento · paso 1 · Gastrointestinal) |
| [ ] | Inmunocompromiso o deterioro grave | Relacionado con START F6 — requiere: Antibiotico |

## Respiratorio (2 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Obstrucción del tracto urinario inferior, Glaucoma de ángulo estrecho | Relacionado con STOPP G3 — requiere: LAMA (medicamento · paso 1 · Respiratorio) |

## Urológico (8 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **HTA grave** | Cardiovascular | Incontinencia urinaria | Relacionado con STOPP I6 — requiere: Agonista β3 (medicamento · paso 1 · Urológico) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Hipotensión ortostática, Síncopes recurrentes | Relacionado con STOPP I5 — requiere: Alfabloqueantes (medicamento · paso 1 · Urológico) |
| [ ] | Demencia, Deterioro cognitivo | Relacionado con STOPP I1 — requiere: Antiesp. urinarios (medicamento · paso 1 · Urológico) |
| [ ] | Estreñimiento crónico | Relacionado con STOPP I4 — requiere: Atropina (medicamento · paso 1 · SNC) |
| [ ] | Bacteriuria asintomática | Relacionado con STOPP I8 — requiere: Antibiotico |
| [ ] | Glaucoma de ángulo estrecho | Relacionado con STOPP I2 — requiere: Atropina (medicamento · paso 1 · SNC) |

## Ginecológico (8 casillas)

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Hipotensión ortostática, Síncopes recurrentes | Relacionado con STOPP I5 — requiere: Alfabloqueantes (medicamento · paso 1 · Urológico) |
| [ ] | HTA grave | Relacionado con STOPP I6 — requiere: Agonista β3 (medicamento · paso 1 · Urológico) |
| [ ] | Demencia, Deterioro cognitivo | Relacionado con STOPP I1 — requiere: Antiesp. urinarios (medicamento · paso 1 · Urológico) |
| [ ] | Estreñimiento crónico | Relacionado con STOPP I4 — requiere: Atropina (medicamento · paso 1 · SNC) |
| [ ] | Bacteriuria asintomática | Relacionado con STOPP I8 — requiere: Antibiotico |
| [ ] | Glaucoma de ángulo estrecho | Relacionado con STOPP I2 — requiere: Atropina (medicamento · paso 1 · SNC) |

## Reumatológico (12 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Déficit de vitamina D confirmado** | Metabólico | Osteopenia | Relacionado con START H5 — requiere: Caídas de repetición u otras 3 variantes (diagnóstico · paso 2 · Otros) |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | HTA grave, HTA moderada | Relacionado con STOPP H2 — requiere: AINEs (medicamento · paso 1 · Osteo/Músculo-esq.) |
| [ ] | Malnutrición, Hepatopatía crónica | Relacionado con STOPP L6 — requiere: Analgésicos simples (medicamento · paso 1 · Osteo/Músculo-esq.) |
| [ ] | Antecedentes de hemorragia HC, Antecedentes de úlcera péptica | Relacionado con STOPP H1 y STOPP H8<br>— STOPP H1 requiere: AINEs (medicamento · paso 1 · Osteo/Músculo-esq.)<br>— STOPP H8 requiere: Bifosfonatos (medicamento · paso 1 · Osteo/Músculo-esq.) |
| [ ] | Disfagia | Relacionado con STOPP H8 — requiere: Bifosfonatos (medicamento · paso 1 · Osteo/Músculo-esq.) |
| [ ] | Caídas de repetición, No sale de casa, Riesgo de caídas de repetición | Relacionado con START H5 — requiere: Déficit de vitamina D confirmado (diagnóstico · paso 2 · Metabólico) |
| [ ] | Dolor leve-moderado | Relacionado con STOPP H3B — requiere: AINEs (medicamento · paso 1 · Osteo/Músculo-esq.) |

## Hematológico (15 casillas)

### A · Con enlace en el mismo tab — se resalta y aparece el chip 🔗

| ✓ | Marcar | Viene de | Debe resaltar (chip 🔗) | Aviso esperado |
|---|---|---|---|---|
| [ ] | **Insuficiencia renal terminal (TFGe < 15 ml/min)** | Renal | Anemia sintomática | Relacionado con STOPP C11 — requiere: Antivitamina K (medicamento · paso 1 · Anticoagulantes); Estenosis mitral moderada-grave (diagnóstico · paso 2 · Cardiovascular); FA (diagnóstico · paso 2 · Cardiovascular) y 1 requisito más |

### B · Sin enlace en este tab — solo aviso, el requisito está en otra pantalla

> Tras marcarlas, ve a donde diga el aviso: allí el elemento requerido debe llevar el chip 🔗.

| ✓ | Marcar cualquiera de | Aviso esperado (idéntico para todos) |
|---|---|---|
| [ ] | Angina de pecho | Relacionado con STOPP C16 — requiere: Aas; Cardiopatía isquémica (diagnóstico · paso 2 · Cardiovascular); Enfermedad cardiovascular establecida (diagnóstico · paso 2 · Cardiovascular) y 4 requisitos más |
| [ ] | Cardiopatía isquémica | Relacionado con STOPP C16 — requiere: Aas; Angina de pecho (diagnóstico · paso 2 · Cardiovascular); Enfermedad cardiovascular establecida (diagnóstico · paso 2 · Cardiovascular) y 4 requisitos más |
| [ ] | Enfermedad cardiovascular establecida | Relacionado con STOPP C16 — requiere: Aas; Angina de pecho (diagnóstico · paso 2 · Cardiovascular); Cardiopatía isquémica (diagnóstico · paso 2 · Cardiovascular) y 4 requisitos más |
| [ ] | Enfermedad vascular cerebral, Enfermedad vascular coronaria, Enfermedad vascular periférica | Relacionado con STOPP C5 y STOPP C16<br>— STOPP C5 requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes); Anticoagulante<br>— STOPP C16 requiere: Aas; Angina de pecho (diagnóstico · paso 2 · Cardiovascular); Cardiopatía isquémica (diagnóstico · paso 2 · Cardiovascular) y 4 requisitos más |
| [ ] | Enfermedad vascular estable | Relacionado con STOPP C5 — requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes); Anticoagulante |
| [ ] | Enfermedad vascular estable sin indicación clara | Relacionado con STOPP C5 — requiere: ARA-II (medicamento · paso 1 · Cardiovascular o Renal) |
| [ ] | Estenosis mitral moderada-grave | Relacionado con STOPP C11 — requiere: Antivitamina K (medicamento · paso 1 · Anticoagulantes); FA (diagnóstico · paso 2 · Cardiovascular); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) y 1 requisito más |
| [ ] | FA | Relacionado con STOPP C7, STOPP C4 y STOPP C11<br>— STOPP C7 requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes)<br>— STOPP C4 requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes); Anticoagulante<br>— STOPP C11 requiere: Antivitamina K (medicamento · paso 1 · Anticoagulantes); Estenosis mitral moderada-grave (diagnóstico · paso 2 · Cardiovascular); Insuficiencia renal terminal (TFGe < 15 ml/min) (diagnóstico · paso 2 · Renal) y 1 requisito más |
| [ ] | FA paroxística | Relacionado con START C1 |
| [ ] | HTA grave | Relacionado con STOPP C2 — requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes) |
| [ ] | Prótesis valvular metálica | Relacionado con STOPP C11 — requiere: Antivitamina K (medicamento · paso 1 · Anticoagulantes); Estenosis mitral moderada-grave (diagnóstico · paso 2 · Cardiovascular); FA (diagnóstico · paso 2 · Cardiovascular) y 1 requisito más |
| [ ] | Ictus previo | Relacionado con STOPP C3 y STOPP C16<br>— STOPP C3 requiere: Antiagregantes (medicamento · paso 1 · Anticoagulantes)<br>— STOPP C16 requiere: Aas; Angina de pecho (diagnóstico · paso 2 · Cardiovascular); Cardiopatía isquémica (diagnóstico · paso 2 · Cardiovascular) y 4 requisitos más |
