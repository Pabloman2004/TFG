# Informe de revisión documental del TFG

**Fecha:** 16 de agosto de 2026  
**Objeto:** memoria actual (`memoria/`)  
**Tipo de trabajo:** TFG Tipo I (ESEI, Universidade de Vigo)

Este documento resume el contraste de la memoria con la normativa disponible y con una memoria previamente aceptada. Sirve como lista de trabajo para cerrar la documentación antes del depósito.

---

## 1. Alcance

Se ha contrastado la memoria actual con:

- La normativa general de TFG de la Universidade de Vigo.
- El Reglamento de TFG de la ESEI 2024/2025.
- `Documentacion.pdf`, una memoria previamente aceptada por la ESEI.

La memoria aceptada sirve como **referencia comparativa**, pero sus decisiones no constituyen requisitos normativos.

### Limitación

El Reglamento ESEI remite a documentos adicionales **no aportados**:

- Normas de presentación.
- Guía docente.
- Rúbrica oficial del TFG Tipo I.
- Posible plantilla oficial de portada.

Por tanto, **no puede afirmarse todavía** que sean obligatorios un límite concreto de páginas, resumen, abstract, palabras clave, tipografía o estructura determinada.

---

## 2. Valoración general

La estructura de la memoria es adecuada para un TFG Tipo I y coincide con la macroestructura de la memoria aceptada. Destacan positivamente:

- Planificación con seguimiento y desviaciones.
- Arquitectura razonada mediante alternativas.
- Separación entre arquitectura, diseño y gestión de datos.
- Tratamiento de privacidad y RGPD.
- Objetivos con alcance explícito.
- Relación entre objetivos y aportaciones.
- Conclusiones técnicas y personales separadas.
- Descripción de errores reales descubiertos durante las pruebas.

Los principales problemas **no son estructurales**, sino de coherencia y evidencia:

1. Se declaran 985 pruebas superadas sin haber ejecutado la suite final.
2. No se demuestra la cobertura de los 190 criterios oficiales.
3. El alcance anunciado supera parcialmente lo evaluable desde la interfaz.
4. Quedan textos y datos provisionales.
5. Algunos contenidos se repiten en demasiados capítulos.
6. Hay afirmaciones clínicas y de usabilidad que no están suficientemente respaldadas.

---

## 3. Adecuación normativa

### Aspectos correctamente cubiertos

- El trabajo se presenta como desarrollo personal y original.
- Se indica que no integra trabajos anteriores de otras asignaturas (`01-introduccion.tex:59-66`).
- El proyecto corresponde inequívocamente a un TFG Tipo I.
- La documentación permite conocer arquitectura, diseño, requisitos, datos, pruebas y operación del producto.
- Se emplea bibliografía y un sistema uniforme de citas.
- El lenguaje utilizado es generalmente inclusivo.
- Se documenta el carácter de apoyo a la decisión, sin sustituir el juicio profesional.

### Aspectos que no pueden validarse definitivamente

Los reglamentos aportados no regulan directamente:

- Número máximo de páginas.
- Modelo de portada.
- Tipografía, márgenes o interlineado.
- Resumen o abstract.
- Palabras clave.
- Lista de siglas.
- Estilo bibliográfico concreto.

Estos puntos deben verificarse en las **normas de presentación** y la **rúbrica** vigentes.

---

## 4. Hallazgos críticos

### C1. Se presentan como superadas pruebas no ejecutadas

**Prioridad:** crítica · **Esfuerzo:** bajo si la suite pasa

En `10-pruebas.tex:139-150` se reconoce que:

- Las 985 pruebas proceden de contar cláusulas `it(`.
- Karma no se volvió a ejecutar.
- La última ejecución conocida contenía unas 807 especificaciones.

Sin embargo, en `10-pruebas.tex:152-169` todas las categorías y el total aparecen como «Superada».

El número de pruebas declaradas **no demuestra** que compilen o pasen.

**Mejora recomendada.** Ejecutar la suite final y registrar:

- Fecha
- Comando
- Navegador y entorno
- Número total ejecutado
- Pruebas omitidas
- Fallos
- Resultado final

Debe separarse el **inventario de pruebas** del **resultado de ejecución**.

---

### C2. No se demuestra la cobertura de los 190 criterios oficiales

**Prioridad:** crítica · **Esfuerzo:** alto

La memoria afirma o sugiere una cobertura completa en:

- `01-introduccion.tex:49-53`
- `02-objetivos.tex:19-30`
- `04-planificacion.tex:215-220`

No obstante, `09-gestion-datos.tex:110-120` indica:

| Fuente | STOPP | START | Total |
|--------|------:|------:|------:|
| Guía oficial | 133 | 57 | 190 |
| Aplicación | 166 | 52 | 218 |

El mayor número de reglas **no demuestra cobertura**. Los criterios pueden haberse desglosado, agrupado o dejado parcialmente sin implementar.

`13-conclusiones.tex:41-47` reconoce que la granularidad no coincide y que algunos sistemas tienen menor especialización.

**Mejora recomendada.** Crear una matriz en anexos:

| Criterio oficial | Regla o reglas | Datos necesarios | Test positivo | Test negativo | Estado |
|------------------|----------------|------------------|---------------|---------------|--------|
| STOPP-B1 | STOPP-B1-DIGOXINA | Medicación + diagnóstico | Spec correspondiente | Spec correspondiente | Completo |
| … | … | … | … | … | Parcial / no evaluable |

Estados recomendados:

- Implementado completamente
- Desglosado
- Agrupado
- Requiere confirmación manual
- No evaluable desde la interfaz
- No implementado

---

### C3. El alcance anunciado excede lo evaluable desde la interfaz

**Prioridad:** crítica · **Esfuerzo:** medio

El objetivo principal y OE1/OE2 sugieren que la aplicación automatiza los criterios STOPP/START (`02-objetivos.tex:10-31`). Sin embargo:

- La UI no captura edad ni sexo (`09-gestion-datos.tex:21-28`).
- `PatientInfo` existe, pero solo puede llegar mediante JSON (`08-diseno.tex:98-102`).
- Algunos criterios dependientes de edad no se pueden activar desde la UI (`13-conclusiones.tex:35-47`).
- La captura demográfica se deja como trabajo futuro (`14-trabajo-futuro.tex:14-20`).
- Dosis y duración tampoco se introducen (`09-gestion-datos.tex:30-38`).
- Sus umbrales quedan en el texto para que los juzgue el profesional (`08-diseno.tex:309-315`).

Se mezclan tres comportamientos distintos:

1. Evaluación completamente automática.
2. Aviso que necesita confirmación manual.
3. Criterio inaccesible desde la interfaz.

**Mejora recomendada.** Acotar objetivos y aportaciones a:

> Criterios automatizables con los datos disponibles en la aplicación.

La memoria debe cuantificar cuántos criterios pertenecen a cada categoría.

---

### C4. Persisten elementos provisionales

**Prioridad:** crítica · **Esfuerzo:** bajo

| Ubicación | Problema |
|-----------|----------|
| `main.tex:117-126` | «RELLENA ESTO»; título «Stopp/start»; «Ingenieria Informatica»; «Raquel Apellido Apellido» |
| `00b-agradecimientos.tex:7` | «Texto de agradecimientos.» |
| `04-planificacion.tex:97-120` | «Memoria pendiente»; trabajo «aún no cerrado» |
| `04-planificacion.tex:127-161` | Memoria todavía «en curso» |
| `15-anexos.tex:102-113` | Anexo reservado sin contenido real |

Estos elementos afectan directamente a la calidad del documento entregado.

**Mejora recomendada.** Completar o eliminar los elementos opcionales. El cronograma debe cerrarse con una fecha final o explicarse como corte temporal si la normativa lo admite.

---

## 5. Hallazgos de prioridad alta

### A1. «Validación clínica» es una denominación incorrecta

**Prioridad:** alta · **Esfuerzo:** bajo

`10-pruebas.tex:110-135` denomina «validación clínica» a pruebas automáticas derivadas de la guía. Pero:

- No hubo ensayo ni revisión asistencial (`02-objetivos.tex:95-98`).
- `12-aportaciones.tex:10-15` también lo reconoce.

Denominación más precisa:

> Verificación de conformidad con la guía STOPP/START.

Debe añadirse un apartado de **amenazas a la validez**:

- Interpretación realizada por el autor.
- Posible error compartido entre regla y prueba.
- Ausencia de revisión independiente completa.
- Ausencia de validación con pacientes.
- Ausencia de evaluación formal de usabilidad.

---

### A2. «Contraindicación» exagera el significado de STOPP

**Prioridad:** alta (precisión clínica) · **Esfuerzo:** bajo

Se emplea «contraindicación» para describir `excludes` en:

- `05-arquitectura.tex:25-37`, `:161-168`, `:229-247`
- `08-diseno.tex:129-133`, `:165-212`
- `09-gestion-datos.tex:94-103`, `:128-131`

STOPP identifica **prescripciones potencialmente inapropiadas**, no necesariamente contraindicaciones absolutas.

Alternativas:

- Advertencia preventiva
- Medicación potencialmente inapropiada
- Fármaco que activaría un criterio
- Exclusión sugerida por el criterio

---

### A3. Las horas retrospectivas se presentan con falsa precisión

**Prioridad:** alta · **Esfuerzo:** bajo

`04-planificacion.tex:127-136` explica que las horas:

- No proceden de un registro diario.
- Se reconstruyeron mediante Git.
- Se calibraron usando las 300 horas de los 12 ECTS.

Sin embargo, la tabla presenta exactamente **345 horas «reales»** (`04-planificacion.tex:138-161`).

Git demuestra actividad, no tiempo trabajado.

**Mejora recomendada.** Usar:

> Estimación retrospectiva de dedicación.

También sería preferible redondear las cifras o proporcionar intervalos.

---

### A4. Afirmaciones de utilidad no respaldadas

**Prioridad:** alta · **Esfuerzo:** medio

Ejemplos:

- «Poco viable en consultas» (`01-introduccion.tex:39-44`)
- «La revisión quepa en una consulta» (`07-requisitos.tex:134-137`)
- «Sin mejorar el cribado en consulta» (`08-diseno.tex:309-315`)
- «Operativizar STOPP/START en el tiempo de una consulta» (`12-aportaciones.tex:78-90`)

No se aportan mediciones de tiempo, pruebas con profesionales, estudio de usabilidad ni bibliografía suficiente sobre carga asistencial.

Deben citarse fuentes o reformularse como **objetivo o hipótesis no validada**.

---

### A5. Falta un estado del arte

**Prioridad:** alta · **Esfuerzo:** medio

La introducción presenta el problema y pasa directamente a la solución (`01-introduccion.tex:14-57`).

Faltaría comparar:

- Herramientas digitales STOPP/START existentes
- Calculadoras clínicas
- Sistemas de apoyo a la decisión
- Evaluación manual mediante PDF
- Otros motores de reglas clínicas
- Ventajas y limitaciones frente a estas alternativas

El índice inicial ya contemplaba este apartado (`indice-propuesto.md:14-21`). La memoria aceptada incluye un estado del arte breve, aunque esto **no demuestra** que sea normativamente obligatorio.

---

### A6. Falta trazabilidad entre requisitos y pruebas

**Prioridad:** alta · **Esfuerzo:** medio

Se definen 15 RF y 5 RNF en `07-requisitos.tex`, pero el capítulo de pruebas se organiza por módulos y niveles.

La tabla OE–aportaciones de `12-aportaciones.tex:17-60` **no sustituye** una matriz de verificación de requisitos.

**Mejora recomendada:**

| Requisito | Evidencia | Caso de prueba | Resultado |
|-----------|-----------|----------------|-----------|
| RF01 | Selección de medicamentos | Spec del componente | Superado |
| RF04 | Reevaluación automática | Spec motor + componente | Superado |
| RNF02 | Tiempo de respuesta | Medición en entorno definido | Resultado |
| … | … | … | … |

---

### A7. Requisitos no funcionales poco verificables

**Prioridad:** alta · **Esfuerzo:** medio

`07-requisitos.tex:119-155` evita expresamente establecer umbrales.

Problemas:

- **RNF01** no fija tiempo máximo ni procedimiento de evaluación.
- **RNF02** no mide latencia.
- **RNF03** reduce accesibilidad a disponer de tres tamaños de fuente.
- **RNF05** constata que no hay servidor, pero no cubre riesgos locales.

Sería conveniente especificar:

- Latencia máxima en un equipo de referencia
- Navegadores y resoluciones comprobados
- Navegación por teclado
- Foco visible
- Contraste
- Criterios WCAG seleccionados
- Comportamiento ante `localStorage` corrupto
- Borrado y retención del caso
- Guardas automáticas que acrediten mantenibilidad

---

### A8. El análisis de privacidad es bueno, pero incompleto

**Prioridad:** alta · **Esfuerzo:** medio

`09-gestion-datos.tex:204-227` identifica correctamente:

- Datos de salud
- Ausencia de backend
- Persistencia local
- Falta de cifrado
- Riesgo de equipos compartidos

Sin embargo, falta analizar:

- Manipulación de `localStorage`
- Rehidratación sin validación Zod (`09-gestion-datos.tex:200-202`)
- Corrupción del estado
- Retención
- Copias del perfil del navegador
- Borrado verificable
- Advertencia sobre el uso de datos reales

«Sin backend» reduce riesgos, pero **no equivale a privacidad garantizada**.

---

### A9. El manual no muestra suficientemente el producto final

**Prioridad:** alta · **Esfuerzo:** medio

El manual contiene requisitos, instalación y uso, pero:

- Solo explica `ng serve`, que es desarrollo (`11-manual-usuario.tex:29-58`).
- No proporciona URL o despliegue final.
- Emplea wireframes, no capturas (`11-manual-usuario.tex:60-67`).
- No incluye un caso completo reproducible.
- No muestra un PDF o JSON generado.
- No incluye resolución de errores.
- Declara compatibilidad responsive sin aportar evidencia (`11-manual-usuario.tex:10-31`).

La memoria aceptada incluye capturas reales del flujo principal.

---

## 6. Repeticiones detectadas

Reducir estas repeticiones permitiría añadir estado del arte y evidencia sin incrementar la extensión.

### PatientCase

Aparece explicado en requisitos (`07-requisitos.tex:241-258`), diseño (`08-diseno.tex:19-102`) y datos (`09-gestion-datos.tex:15-78`).

| Capítulo | Debe cubrir |
|----------|-------------|
| Requisitos | Concepto y entradas necesarias |
| Diseño | Tipos, relaciones y cardinalidades |
| Datos | Serialización, persistencia y privacidad |

### SPA sin backend y localStorage

Se repite en arquitectura, tecnologías, gestión de datos, manual, aportaciones y conclusiones.

| Capítulo | Debe cubrir |
|----------|-------------|
| Arquitectura | Decisión y consecuencias |
| Tecnologías | Soporte proporcionado por Angular |
| Datos | Claves, persistencia y riesgos |
| Manual | Dónde se guarda el caso |
| Conclusiones | Aprendizaje, sin reexplicar el mecanismo |

### Reglas JSON y recuento 190/218

Se repite en planificación, arquitectura, diseño, gestión de datos, pruebas, anexos y conclusiones.

| Capítulo | Debe cubrir |
|----------|-------------|
| Arquitectura | Por qué se eligieron reglas declarativas |
| Diseño | Estructura del tipo `Crit` |
| Datos | Esquema de `criteria.json` |
| Pruebas | Conformidad y cobertura |
| Anexos | Matriz completa y recuentos |

### PDF, JSON y texto

Se explica en arquitectura, diseño, datos y manual.

| Capítulo | Debe cubrir |
|----------|-------------|
| Arquitectura | Responsabilidades |
| Diseño | Secuencia de generación |
| Datos | Formato y contenido |
| Manual | Acción del usuario |

---

## 7. Otros problemas concretos

### Cardinalidad incoherente

- `07-requisitos.tex:282-285` permite múltiples medicaciones **sin mínimo**.
- `08-diseno.tex:87-90` representa `PatientCase → Med` como `1..*`.

Un caso recién iniciado puede tener cero medicamentos. Probablemente debería ser `0..*`.

### Diagrama arquitectónico incompleto

En `05-arquitectura.tex:80-95`, el bloque «Navegador: localStorage + HTTP» no tiene conexiones, aunque la leyenda afirma que sostiene persistencia y carga de activos.

### Bibliografía insuficiente

Las 16 entradas actuales están bien estructuradas, pero faltan fuentes sobre:

- Sistemas de apoyo a la decisión clínica
- Herramientas STOPP/START existentes
- Usabilidad clínica
- Accesibilidad
- Seguridad del almacenamiento local
- SNOMED CT
- Licencias concretas de dependencias

`06-tecnologias.tex:128-160` atribuye licencias a varios productos usando únicamente una cita asociada a RxJS.

También conviene revisar si ISO/IEC 25010:2011 debe complementarse o sustituirse por la edición de 2023.

### Extensión

La compilación registrada indica:

| Magnitud | Valor |
|----------|------:|
| PDF completo | 64 páginas |
| Referencias desde | p. 52 |
| Cuerpo aproximado | 51 páginas |

El límite de 50 páginas **no aparece** en los reglamentos aportados. Solo figura en comentarios internos de la plantilla, por lo que debe verificarse en las normas de presentación.

### Maquetación

`main.log` contiene 29 avisos `Overfull \hbox`, algunos superiores a 50 puntos.

Zonas especialmente problemáticas: `main.log:1606-1613`, `:1763`, `:2338`, `:2723`, `:2863`.

Deben revisarse tablas, listados, diagramas e identificadores largos.

### Terminología y ortografía

Cambios recomendados:

| Actual | Corrección |
|--------|------------|
| Stopp/start | STOPP/START |
| Ingenieria Informatica | Ingeniería Informática |
| multiclasse | multiclase |
| familia mutex | familia mutuamente excluyente |
| se curaron en profundidad | se modelaron / se depuraron en profundidad |

También conviene unificar:

- activar / disparar / saltar / resultar aplicable
- profesional sanitario / clínico / usuario

---

## 8. Comparación con la memoria aceptada

La memoria actual **mejora** al documento aceptado en:

- Planificación y desviaciones
- Decisiones arquitectónicas
- Privacidad
- Fuera de alcance
- Trazabilidad OE–aportaciones
- Conclusiones personales
- Descripción de errores encontrados

Aspectos útiles de la memoria aceptada:

- Capturas reales
- Requisitos con criterio de aceptación
- Resultados cuantitativos visibles
- Comparación estimado–real
- Diagramas extensos en anexos

Defectos de la memoria aceptada que **no deben copiarse**:

- Referencia «Figuras 5 y ??»
- Mezcla de castellano y gallego
- Citas con doble corchete
- Notas al pie dañadas
- Diagramas redundantes
- Pruebas sin evidencia de ejecución
- Bibliografía tecnológica excesivamente genérica

Que esa memoria fuese aceptada solo demuestra que su formato resultó admisible en aquel caso.

---

## 9. Mejoras opcionales

No son obligaciones demostradas con los dos reglamentos:

- Resumen y abstract
- Palabras clave
- Lista de siglas
- Tabla de competencias del grado
- Registro resumido de decisiones arquitectónicas
- Sección explícita de amenazas a la validez

La lista de siglas sería útil por la cantidad de abreviaturas: STOPP, START, SPA, HCE, TDD, TFGe, RGPD, RNF y SNOMED CT.

---

## 10. Orden recomendado de trabajo

| Orden | Acción | Impacto | Esfuerzo |
|------:|--------|---------|----------|
| 1 | Completar portada, agradecimientos, cronograma y anexos | Muy alto | Bajo |
| 2 | Ejecutar la suite y documentar resultados reales | Muy alto | Bajo/medio |
| 3 | Crear la matriz de cobertura de los 190 criterios | Muy alto | Alto |
| 4 | Acotar objetivos y aportaciones al alcance real | Muy alto | Medio |
| 5 | Renombrar la validación clínica | Alto | Bajo |
| 6 | Añadir trazabilidad requisitos–pruebas | Alto | Medio |
| 7 | Hacer medibles los RNF | Alto | Medio |
| 8 | Corregir «contraindicación» y terminología | Alto | Bajo |
| 9 | Añadir estado del arte y nuevas fuentes | Alto | Medio |
| 10 | Completar privacidad y manual | Alto | Medio |
| 11 | Eliminar repeticiones | Medio | Medio |
| 12 | Corregir diagramas, cardinalidades y maquetación | Medio | Medio |

---

## 11. Lista de comprobación final

- [ ] Título y metadatos definitivos
- [ ] Nombre completo de la cotutora
- [ ] Número oficial del TFG
- [ ] Agradecimientos completados o eliminados
- [ ] Cronograma cerrado
- [ ] Anexo gráfico completado o eliminado
- [ ] Suite final ejecutada
- [ ] Recuento de pruebas coincidente con la ejecución
- [ ] Correspondencia de los 190 criterios acreditada
- [ ] Criterios no evaluables identificados
- [ ] Objetivos coherentes con la UI
- [ ] Matriz requisitos–pruebas
- [ ] RNF verificables
- [ ] «Validación clínica» corregida
- [ ] Terminología STOPP precisa
- [ ] Afirmaciones de utilidad citadas o reformuladas
- [ ] Estado del arte incorporado
- [ ] Capturas reales y caso completo en el manual
- [ ] Ejemplo de PDF y JSON
- [ ] Riesgos de `localStorage` documentados
- [ ] Repeticiones reducidas
- [ ] Desbordamientos corregidos
- [ ] Revisión ortotipográfica
- [ ] Normas de presentación y rúbrica comprobadas

---

## 12. Documentos necesarios para cerrar la revisión normativa

Para una validación formal definitiva faltan:

1. Normas de presentación aprobadas por la Junta de Centro.
2. Guía docente del TFG 2025/2026.
3. Rúbrica oficial del TFG Tipo I.
4. Plantilla oficial de portada, si existe.
5. Instrucciones de depósito de la convocatoria.

Hasta disponer de ellos, las observaciones sobre páginas, portada, resumen, formato y estructura deben considerarse **recomendaciones**, no incumplimientos normativos.
