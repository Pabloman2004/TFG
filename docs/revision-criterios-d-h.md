# Revisión de criterios STOPP D–H

## Alcance

Ronda TDD para reproducir y corregir los hallazgos comunicados en las
secciones D, E, F, G y H. Cada sección se cierra únicamente después de revisar
sus pruebas rojas, el cambio mínimo y las regresiones.

## Sección D — Sistema nervioso central

- **BUG**: D2 no dispara en el flujo real.
- **BUG**: D5 y D15 están fusionados y no pueden generar dos alertas.
- **BUG**: D20 no ofrece todos los productos reportados.
- **VERIFICAR**: D1, D3–D14, D16–D19 y D21–D25.
- **VERIFICAR**: D23 funciona en el motor, pero debe ser accesible desde el flujo
  de selección.
- **DUDA resuelta**: Demencia y SCPD se agrupan visualmente cuando pertenecen al
  mismo grupo, sin fusionar sus códigos clínicos.

## Sección E — Sistema renal

- **BUG**: la interfaz no permite introducir TFGe, dosis ni duración, por lo que
  E1 y los criterios dependientes de TFGe no son activables normalmente.
- **BUG**: E2 y E3 usan clases de anticoagulantes demasiado amplias.
- **VERIFICAR**: E1–E10 y los límites de TFGe.
- **DECISIÓN**: `enfermedad_renal_grave` equivale a TFGe <30;
  `insuficiencia_renal_terminal`, a TFGe <15; el umbral <10 exige valor
  numérico.

## Sección F — Sistema gastrointestinal

- **BUG**: F2 no dispone de los datos necesarios de diagnóstico y duración.
- **BUG**: F4 ignora la dosis de hierro.
- **BUG**: F5 no exige corticoide y falta esofagitis erosiva.
- **BUG**: F6 confunde ticlopidina con otros antiagregantes y AVK con AOD.
- **BUG**: F8 no muestra megestrol en la selección.
- **VERIFICAR**: F1, F3 y F7.

## Sección G — Sistema respiratorio

- **VERIFICAR**: G1–G4.
- **DECISIÓN**: se acepta G2 con EPOC genérica en esta ronda.

## Sección H — Sistema musculoesquelético

- **BUG**: H6 no contempla gota recurrente ni colchicina.
- **VERIFICAR**: H1–H5 y H7–H9, con casos explícitos para H3 y H5.

## Informes de sección

| Sección | RED | GREEN | Regresión | Aprobación |
|---|---|---|---|---|
| D | D5/D15 fusionados, catálogo D20 y agrupación sin cubrir | 114 specs dirigidos | Suite completa | Aprobada |
| E | E2/E3 demasiado amplios y datos clínicos inaccesibles | 56 specs dirigidos | Suite completa | Aprobada |
| F | F2/F4/F5/F6/F8 reproducidos | Specs F y catálogos | Suite completa | Aprobada |
| G | Sin regresiones reproducidas | Specs G1–G4 | Suite completa | Aprobada |
| H | H6 no contemplaba gota recurrente/colchicina | Specs H1–H9 | Suite completa | Aprobada |

## Resolución final

- D2 sí dispara con un ATC real y `episodio_depresivo`; el comportamiento ya
  estaba cubierto y no requirió relajar la regla.
- D5 y D15 son alertas independientes. D20 dispone de todos los productos
  reportados y de un grupo seleccionable.
- D23 exige un dopaminérgico y permite seleccionar en Neurológico
  «Parkinsonismo inducido por fármacos» o «Efectos extrapiramidales por
  neurolépticos»; cualquiera de las dos condiciones activa el criterio.
- La interfaz permite introducir TFGe, dosis y duración necesarias para E1,
  F2 y F4. E2 queda limitado a dabigatrán y E3 a inhibidores del factor Xa.
- El caso «ibuprofeno + antecedente ulceroso» pertenece a H1, no a F2. F2
  evalúa un IBP durante más de ocho semanas.
- F5 exige corticoide y admite úlcera previa o esofagitis erosiva sin IBP.
  F6 produce una sola alerta por antiagregante o AVK. Megestrol es seleccionable.
- G1–G4, H1–H5 y H7–H9 conservan el comportamiento reportado. H6 admite AINE
  o colchicina con gota activa o recurrente.

## Verificación integral

- Karma: `610 SUCCESS`.
- Build Angular de desarrollo: correcto.
- Auditoría del catálogo: sin clases ni diagnósticos desconocidos.
- Linked Chunks: `0 problemas`.

