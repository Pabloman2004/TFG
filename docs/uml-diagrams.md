# Diagramas UML — STOPP/START v3 (`stopp-start-app`)

Aplicación Angular de apoyo a la decisión clínica que evalúa criterios **STOPP** (prescripciones potencialmente inapropiadas) y **START** (tratamientos indicados omitidos) según STOPP/START v3, mediante reglas JSON Logic en `criteria.json`.

Los diagramas reflejan la implementación actual (wizard de 2 pasos: medicaciones → diagnósticos).

---

## 1. Diagrama de clases

Dominio, servicios core, componentes del wizard y catálogos estáticos. Las flechas de dependencia (`-->`) indican inyección o uso en tiempo de ejecución.

```mermaid
classDiagram
    direction TB

    %% --- Dominio ---
    class PatientInfo {
        <<interface>>
        +name: string | null
        +age: number | null
        +sex: Sex | null
        +mrn?: string | null
        +weightKg?: number | null
        +heightCm?: number | null
        +notes?: string | null
    }

    class Med {
        <<interface>>
        +id: string
        +drugClasses: string[]
        +doseMcgDay?: number
        +durationDays?: number
    }

    class Labs {
        <<interface>>
        +egfr_ml_min_173: number | null
        +potasio_mmol_l: number | null
        +pas_mmhg: number | null
        +qtc_ms: number | null
        +...
    }

    class Crit {
        <<interface>>
        +id: string
        +type: STOPP | START
        +system: string
        +summary: string
        +logic?: JsonLogicRule
        +excludes?: Excludes
    }

    class PatientCase {
        <<interface>>
        +info: PatientInfo | null
        +diagnoses: string[]
        +medications: Med[]
        +labs: Labs | null
        +reviewedMedTabs?: string[]
        +reviewedDxTabs?: string[]
    }

    class SavedCase {
        <<interface>>
        +id: string
        +savedAt: string
        +patientCase: PatientCase
    }

    class CaseExport {
        <<interface>>
        +version: string
        +exportedAt: string
        +patientCase: PatientCase
    }

    PatientCase *-- PatientInfo : info
    PatientCase *-- Med : medications
    PatientCase *-- Labs : labs
    SavedCase *-- PatientCase
    CaseExport *-- PatientCase

    %% --- Servicios ---
    class CaseStoreService {
        <<Injectable>>
        +patient: Signal~PatientInfo~
        +diagnoses: Signal~string[]~
        +meds: Signal~Med[]~
        +labs: Signal~Labs~
        +results: Signal~Crit[]~
        +history: Signal~SavedCase[]~
        +patientCase: PatientCase
        +setResults(list)
        +reset()
        +loadCase(case)
        +saveToHistory()
        +toggleMedTabReviewed(tabId)
        +toggleDxTabReviewed(tabId)
    }

    class CriteriaEngineService {
        <<Injectable>>
        +relevance: Signal~Relevance~
        +loadCriteria() Promise~Crit[]~
        +evaluate(patient, criteria) Crit[]
        +getExcludedMedications(patient, criteria) Map
        -normalizeCase(input)
        -evaluateCriterion(c, patient) boolean
        -registerCustomOperators()
    }

    class CaseIoService {
        <<Injectable>>
        +exportCase() void
        +importFile(file) Promise~void~
    }

    class ReportService {
        <<Injectable>>
        +exportCase(options) void
    }

    class JsonLogic {
        <<library>>
        +apply(rule, data) unknown
    }

    class CriteriaJson {
        <<asset>>
        criteria: Crit[]
    }

    %% --- Componentes UI ---
    class AppComponent {
        <<Component>>
        +onImportFile(file)
    }

    class MedsStepComponent {
        <<Component>>
        +toggleDrug(name)
        +updateExclusions()
        +navigateNext()
        +onExportPdf()
        +copyCriteria()
        +applicableCriteria: Computed~Crit[]~
    }

    class DiagnosisStepComponent {
        <<Component>>
        +toggleDiagnosis(name)
        +isDxEnabled(name) boolean
        +navigateBack()
        +onExportPdf()
        +applicableCriteria: Computed~Crit[]~
    }

    class HistorialComponent {
        <<Component>>
        +load(entry)
        +delete(id)
    }

    %% --- Módulos de datos (estáticos) ---
    class MedicationsCatalog {
        <<module>>
        MEDICATIONS: Med[]
    }

    class DiagnosesCatalog {
        <<module>>
        DIAGNOSIS_GROUPS
        +normalizeDiagnosis(name)
    }

    class SystemRelevance {
        <<module>>
        +buildRelevance(criteria, tabIds) Relevance
    }

    class CardiovascularDxDeps {
        <<module>>
        +isDiagnosisEnabled(dx, selected) boolean
    }

    %% --- Relaciones ---
    CaseStoreService ..> PatientCase : agrega
    CaseStoreService ..> SavedCase : historial
    CaseIoService --> CaseStoreService : inject
    CriteriaEngineService --> HttpClient : inject
    CriteriaEngineService ..> PatientCase : evalúa
    CriteriaEngineService ..> Crit : filtra
    CriteriaEngineService ..> JsonLogic : apply
    CriteriaEngineService ..> CriteriaJson : loadCriteria
    CriteriaEngineService ..> SystemRelevance : buildRelevance

    MedsStepComponent --> CaseStoreService
    MedsStepComponent --> CriteriaEngineService
    MedsStepComponent --> ReportService
    MedsStepComponent --> CaseIoService
    MedsStepComponent ..> MedicationsCatalog

    DiagnosisStepComponent --> CaseStoreService
    DiagnosisStepComponent --> CriteriaEngineService
    DiagnosisStepComponent --> ReportService
    DiagnosisStepComponent ..> DiagnosesCatalog
    DiagnosisStepComponent ..> CardiovascularDxDeps

    AppComponent --> CaseStoreService
    AppComponent --> CaseIoService
    HistorialComponent --> CaseStoreService

    ReportService ..> PatientCase : informe PDF
```

---

## 2. Diagrama de casos de uso

**Actor principal:** clínico o farmacéutico que introduce el caso y consulta recomendaciones STOPP/START.

**Actores secundarios:** navegador (persistencia `localStorage`, descarga de archivos) y motor de criterios (evaluación automática vía JSON Logic).

```mermaid
useCaseDiagram
    left to right direction

    actor Clinico as "Clínico / farmacéutico"
    actor Navegador as "Navegador (localStorage)"
    actor Motor as "Motor de criterios"

    rectangle "STOPP/START v3 — Asistente clínico" {
        usecase UC01 as "Seleccionar medicaciones\npor sistema/tab"
        usecase UC02 as "Marcar pestaña revisada\n(sin selección)"
        usecase UC03 as "Navegar wizard\n(medicaciones ↔ diagnósticos)"
        usecase UC04 as "Seleccionar diagnósticos\n(con dependencias CV)"
        usecase UC05 as "Ver criterios STOPP/START\nen tiempo real"
        usecase UC06 as "Ver medicaciones excluidas\npor criterio cumplido"
        usecase UC07 as "Copiar texto de criterios\nal portapapeles"
        usecase UC08 as "Exportar informe PDF"
        usecase UC09 as "Exportar / importar\ncaso JSON"
        usecase UC10 as "Reiniciar caso"
        usecase UC11 as "Ajustar tamaño de fuente"
        usecase UC12 as "Consultar guía rápida"

        usecase UC_Eval as "Evaluar criterios\n(JSON Logic)"
        usecase UC_Persist as "Persistir estado\ndel caso"
        usecase UC_Load as "Cargar reglas\ncriteria.json"

        usecase UC13 as "Gestionar historial\nde casos"
        usecase UC14 as "Introducir paciente\ny analíticas"
    }

    Clinico --> UC01
    Clinico --> UC02
    Clinico --> UC03
    Clinico --> UC04
    Clinico --> UC05
    Clinico --> UC06
    Clinico --> UC07
    Clinico --> UC08
    Clinico --> UC09
    Clinico --> UC10
    Clinico --> UC11
    Clinico --> UC12

    UC05 ..> UC_Eval : «include»
    UC06 ..> UC_Eval : «include»
    UC08 ..> UC_Eval : «include»

    UC_Eval --> Motor
    UC_Load --> Motor

    UC01 --> UC_Persist
    UC04 --> UC_Persist
    UC09 --> UC_Persist
    UC_Persist --> Navegador

    UC09 ..> UC_Persist : «include»

    note right of UC13
        HistorialComponent implementado;
        sin ruta activa en app.routes
    end note

    note right of UC14
        PatientInfo y Labs en el modelo;
        sin paso dedicado en UI
    end note
```

### Resumen de casos de uso

| ID | Caso de uso | Componente principal |
|----|-------------|----------------------|
| UC01 | Seleccionar medicaciones | `MedsStepComponent` |
| UC02 | Marcar tab revisado | `CaseStoreService.toggle*TabReviewed` |
| UC03 | Navegar wizard | `Router` + pasos |
| UC04 | Seleccionar diagnósticos | `DiagnosisStepComponent` |
| UC05 | Ver criterios en vivo | `applicableCriteria` (computed) |
| UC06 | Ver exclusiones | `getExcludedMedications` |
| UC07 | Copiar criterios | `buildCriteriaText` |
| UC08 | Exportar PDF | `ReportService` |
| UC09 | Exportar/importar JSON | `CaseIoService` |
| UC10 | Reiniciar caso | `ConfirmResetDialog` → `reset()` |
| UC11–UC12 | Accesibilidad / ayuda | toolbar del paso |
| UC13–UC14 | Planificados / parciales | historial, datos paciente |

---

## 3. Diagrama de secuencia

Flujo crítico: el clínico activa o desactiva una medicación y la interfaz recalcula criterios aplicables y exclusiones de forma reactiva.

```mermaid
sequenceDiagram
    autonumber
    actor Clinico as Clínico
    participant UI as MedsStepComponent
    participant Store as CaseStoreService
    participant Engine as CriteriaEngineService
    participant JSON as json-logic-js
    participant Asset as criteria.json

    Note over UI,Asset: Arranque (ngOnInit) — solo primera vez
    UI->>Engine: loadCriteria()
    Engine->>Asset: HttpClient.get(assets/data/criteria.json)
    Asset-->>Engine: CriteriaFile { criteria[] }
    Engine->>Engine: buildRelevance(criteria, tabIds)
    Engine-->>UI: Crit[]
    UI->>UI: criteria.set(loaded)
    UI->>Engine: getExcludedMedications(patientCase, criteria)
    Engine->>JSON: apply(logic) por criterio con excludes
    JSON-->>Engine: boolean
    Engine-->>UI: Map~medId, Crit~
    UI->>UI: exclusions.set(map)

    Note over Clinico,JSON: Interacción — toggle medicación
    Clinico->>UI: click medicación
    UI->>UI: toggleDrug(name)
    alt ya seleccionada
        UI->>Store: meds.set(filter sin name)
    else nueva selección
        UI->>UI: MEDICATIONS.find(name)
        UI->>Store: meds.set([...current, med])
    end
    Store-->>UI: signal meds actualizado

    Note over UI,JSON: effect() reacciona a meds/diagnoses/labs
    UI->>UI: updateExclusions()
    UI->>Engine: getExcludedMedications(patientCase, criteria)
    loop por cada Crit con excludes
        Engine->>Engine: normalizeCase(patient)
        Engine->>Engine: evaluateCriterion(probePatient)
        Engine->>JSON: apply(crit.logic, patient)
        JSON-->>Engine: true/false
    end
    Engine-->>UI: Map exclusiones
    UI->>UI: exclusions.set(map)

    Note over UI,JSON: computed applicableCriteria se invalida
    UI->>Engine: evaluate(patientCase, criteria)
    Engine->>Engine: normalizeCase(patient)
    loop por cada Crit
        Engine->>Engine: normalizeCriterion(c)
        Engine->>Engine: evaluateCriterion(c, patient)
        Engine->>JSON: apply(c.logic, patient)
        JSON-->>Engine: boolean
    end
    Engine-->>UI: Crit[] aplicables (STOPP + START)
    UI->>UI: re-render paneles, resaltar último criterio
    UI-->>Clinico: UI actualizada
```

### Variante: exportar PDF

```mermaid
sequenceDiagram
    autonumber
    actor Clinico as Clínico
    participant UI as MedsStepComponent
    participant Store as CaseStoreService
    participant Engine as CriteriaEngineService
    participant Report as ReportService

    Clinico->>UI: Exportar PDF
    UI->>Engine: evaluate(patientCase, criteria)
    Engine-->>UI: Crit[] resultados
    UI->>Report: exportCase({ patient, diagnoses, meds, results })
    Report->>Report: pdfmake — generar documento
    Report-->>Clinico: descarga PDF
```

---

## Cómo visualizar

- **GitHub / GitLab:** los bloques `mermaid` se renderizan en el visor Markdown.
- **VS Code / Cursor:** extensión *Markdown Preview Mermaid Support*.
- **Exportar a imagen:** [Mermaid Live Editor](https://mermaid.live) — pegar cada bloque y exportar PNG/SVG para la memoria del TFG.

## Rutas y flujo de navegación (contexto)

```
/  →  /medicaciones  (MedsStepComponent)
/medicaciones  →  /diagnosticos  (DiagnosisStepComponent)
```
