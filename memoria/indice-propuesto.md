# Índice propuesto — Memoria TFG (stopp-start-app)

> Basado en la estructura de 16 secciones del PDF de referencia (`Documentación.pdf`,
> memoria ESEI de Nicolás Filloy — "SHIELD"), adaptado al dominio y arquitectura
> reales de este proyecto: SPA Angular 20 sin backend, motor de evaluación de
> criterios clínicos STOPP/START (json-logic sobre `criteria.json`, 215 criterios /
> 13 sistemas), captura de medicación/diagnósticos en dos pasos, generación de
> informe PDF y exportación/importación de casos en JSON.
>
> Nota: esta misma estructura de 16 secciones ya se usó una vez (`memoria/main-esei.tex`,
> julio 2026), pero la carpeta `memoria/` no está versionada en git y ya no existe en
> este checkout. Este índice la retoma desde cero, ajustada al estado actual del código.

1. **Introducción**
   1.1. Contextualización del problema (polimedicación inapropiada en personas
        mayores, prescripción potencialmente inadecuada)
   1.2. Estado del arte (criterios STOPP/START, herramientas de soporte a la
        decisión clínica existentes, digitalización de guías clínicas)
   1.3. Justificación de la solución propuesta
   1.4. Integración académica (competencias del grado aplicadas)
   1.5. Integración de trabajos previos

2. **Objetivos**
   2.1. Objetivo principal
   2.2. Objetivos específicos (técnicos)
   2.3. Notas

3. **Resumen de la solución propuesta**
   3.1. Patrón arquitectónico general (SPA sin backend, todo el estado en
        cliente, persistencia en `localStorage`)
   3.2. Vista global de navegación (flujo guiado en dos pasos: medicación →
        diagnósticos → resultado)
   3.3. Stack tecnológico completo
   3.4. Flujo de datos a través del sistema (selección → evaluación de
        criterios → relevancia por sistema → informe)
   3.5. Fases de desarrollo y metodología (TDD estricto, patrón "Linked
        Chunks" doc↔código)
   3.6. Decisiones arquitectónicas clave (sin backend, reglas declarativas
        en JSON vs. código, signals para estado reactivo)

4. **Planificación y seguimiento**
   4.1. Metodología y cronograma general
   4.2. Diagrama de Gantt del proyecto
   4.3. Análisis de desviaciones

5. **Arquitectura**
   5.1. Estructura del directorio
   5.2. Análisis modular
        5.2.1. Módulo de dominio clínico (`case-store`, `types.ts`)
        5.2.2. Módulo de catálogo clínico (`core/data/`: medicamentos,
               diagnósticos, taxonomías, dependencias, variantes)
        5.2.3. Módulo del motor de criterios (`criteria-engine.service.ts`,
               operadores custom sobre json-logic)
        5.2.4. Módulo de flujo de pasos (`steps/meds-step`,
               `steps/diagnosis-step`)
        5.2.5. Módulo de informes y exportación (`report.service.ts`,
               `case-io.service.ts`)
   5.3. Diagrama de dependencias entre módulos
   5.4. Flujo de datos: pipeline de evaluación de criterios

6. **Tecnologías e integración de productos de terceros**
   6.1. Stack tecnológico y dependencias (Angular 20, Angular Material,
        json-logic-js, pdfmake, zod, RxJS, signals)
   6.2. Análisis de integración por módulo (motor de reglas, UI, generación
        de PDF, validación de esquemas)
   6.3. Gestión de dependencias y arquitectura

7. **Especificación y análisis de requisitos**
   7.1. Identificación de roles (personal clínico/geriatra usuario final)
   7.2. Requisitos funcionales
   7.3. Requisitos no funcionales
   7.4. Diagrama de casos de uso
   7.5. Entradas y controles de usuario (selección de medicación,
        diagnósticos, analítica/constantes)
   7.6. Visualización de resultados (criterios STOPP/START activados,
        agrupación por sistema, relevancia cruzada entre pestañas)
   7.7. Validación y manejo de errores
   7.8. Optimización del rendimiento
   7.9. Diseño y experiencia de usuario (UX): accesibilidad, escala de
        fuente, guía rápida integrada

8. **Diseño del software (estático y dinámico)**
   8.1. Diagramas estáticos complementarios
   8.2. Arquitectura de estado (diseño estático): `CaseStoreService`,
        signals, ciclo de persistencia/rehidratación en `localStorage`
   8.3. Flujo de evaluación de criterios (diseño dinámico): carga de
        `criteria.json` → `evaluate()` → exclusión proactiva de medicación →
        índice de relevancia por pestaña
   8.4. Diagramas dinámicos complementarios (secuencia selección →
        evaluación → actualización de UI)
   8.5. Subsistema de informes y exportación (PDF con pdfmake, JSON
        versionado, texto plano para portapapeles)
   8.6. Estrategias de robustez y optimización

9. **Gestión de datos e información**
   9.1. Catálogo clínico estático (medicamentos, diagnósticos, taxonomías,
        `criteria.json`)
   9.2. Modelo de dominio del caso clínico (paciente, medicaciones,
        diagnósticos, analítica)
   9.3. Gestión de caché y estado reactivo (signals, efectos)
   9.4. Pipeline de transformación de datos (normalización, agrupación por
        sistema/tab)
   9.5. Estructura de ficheros y ubicaciones
   9.6. Persistencia en `localStorage` (sin base de datos ni backend)

10. **Pruebas llevadas a cabo**
    10.1. Estrategia de testing (TDD, Karma + Jasmine, suite de specs)
    10.2. Cobertura por módulo (motor de criterios, catálogo, flujo de
          pasos, informes)
    10.3. Auditoría de consistencia del catálogo clínico
          (`scripts/audit-criteria.cjs`)
    10.4. Validación con casos clínicos reales / dudas resueltas con la
          tutora
    10.5. Mecanismos de defensa y manejo de errores
    10.6. Suite de pruebas automatizadas (script de verificación e2e del
          PDF, `check-links.sh`)

11. **Manual de usuario**
    11.1. Requisitos del entorno
    11.2. Gestión de dependencias
    11.3. Ejecución del sistema
    11.4. Flujo guiado de uso de la interfaz (capturas)
    11.5. Generación y exportación del informe

12. **Principales aportaciones**

13. **Conclusiones**

14. **Vías de trabajo futuro**

15. **Referencias**

16. **Anexos**
    16.1. Anexo A: diagrama de flujo base del sistema
    16.2. Anexo B: diagramas de secuencia específicos (reserva documental)
    16.3. Anexo C: listado/resumen de criterios STOPP/START implementados
          (215 criterios, 13 sistemas)
    16.4. Anexo D: comandos de operación
