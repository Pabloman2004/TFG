import { Med } from '../types';

export const MEDICATIONS: Med[] = [

  // -------- AINEs (NSAIDs) --------
  { id: "Ibuprofeno", drugClasses: ["AINE"] },
  { id: "Naproxeno", drugClasses: ["AINE"] },
  { id: "Diclofenaco", drugClasses: ["AINE"] },
  { id: "Indometacina", drugClasses: ["AINE"] },
  { id: "Piroxicam", drugClasses: ["AINE"] },
  { id: "Celecoxib", drugClasses: ["AINE", "AINE_COX2"] },

  // -------- CORTICOIDES --------
  { id: "Prednisona", drugClasses: ["CORTICOIDE", "CORTICOIDE_SISTEMICO"] },
  { id: "Metilprednisolona", drugClasses: ["CORTICOIDE", "CORTICOIDE_SISTEMICO"] },
  { id: "Dexametasona", drugClasses: ["CORTICOIDE", "CORTICOIDE_SISTEMICO"] },
  { id: "Hidrocortisona", drugClasses: ["CORTICOIDE", "CORTICOIDE_SISTEMICO"] },

  // -------- ISRS --------
  { id: "Sertralina", drugClasses: ["ISRS"] },
  { id: "Fluoxetina", drugClasses: ["ISRS"] },

  // -------- DIURÉTICOS DE ASA --------
  { id: "Furosemida", drugClasses: ["DIURETICO_ASA"] },
  { id: "Torasemida", drugClasses: ["DIURETICO_ASA"] },

  // -------- DIURÉTICOS TIAZÍDICOS --------
  { id: "Hidroclorotiazida", drugClasses: ["DIURETICO_TIAZIDICO"] },
  { id: "Clortalidona", drugClasses: ["DIURETICO_TIAZIDICO"] },
  { id: "Indapamida", drugClasses: ["DIURETICO_TIAZIDICO"] },

  // -------- IECA --------
  { id: "Enalapril", drugClasses: ["IECA"] },
  { id: "Ramipril", drugClasses: ["IECA"] },

  // -------- ARA-II (Antagonistas de Receptores de Angiotensina II) --------
  { id: "Valsartán", drugClasses: ["ARA2"] },
  { id: "Candesartán", drugClasses: ["ARA2"] },
  { id: "Losartán", drugClasses: ["ARA2"] },

  // -------- ANTAGONISTAS DE ALDOSTERONA --------
  { id: "Espironolactona", drugClasses: ["ANTAGONISTA_ALDOSTERONA"] },
  { id: "Eplerenona", drugClasses: ["ANTAGONISTA_ALDOSTERONA"] },

  // -------- DIURÉTICOS AHORRADORES DE POTASIO (otros) --------
  { id: "Amilorida", drugClasses: ["DIURETICO_AHORRADOR_POTASIO"] },
  { id: "Triamtereno", drugClasses: ["DIURETICO_AHORRADOR_POTASIO"] },

  // -------- INHIBIDORES FOSFODIESTERASA 5 (PDE5) --------
  { id: "Sildenafilo", drugClasses: ["INHIBIDOR_PDE5"] },
  { id: "Tadalafilo", drugClasses: ["INHIBIDOR_PDE5"] },
  { id: "Vardenafilo", drugClasses: ["INHIBIDOR_PDE5"] },

  // -------- NITRATOS (Antianginosos) --------
  { id: "Isosorbide", drugClasses: ["NITRATO"] },
  { id: "Nitroglicerina", drugClasses: ["NITRATO"] },
  { id: "Mononitrato de isosorbide", drugClasses: ["NITRATO"] },

  // -------- QUINOLONAS (Antibióticos) --------
  { id: "Ciprofloxacino", drugClasses: ["QUINOLONA", "PROLONGADOR_QTC", "ANTIBIOTICO"] },
  { id: "Levofloxacino", drugClasses: ["QUINOLONA", "PROLONGADOR_QTC", "ANTIBIOTICO"] },
  { id: "Moxifloxacino", drugClasses: ["QUINOLONA", "PROLONGADOR_QTC", "ANTIBIOTICO"] },

  // -------- MACRÓLIDOS (Antibióticos) --------
  { id: "Azitromicina", drugClasses: ["MACROLIDO", "PROLONGADOR_QTC", "INHIBIDOR_GLUCOPROTEINA_P", "ANTIBIOTICO"] },
  { id: "Claritromicina", drugClasses: ["MACROLIDO", "PROLONGADOR_QTC", "INHIBIDOR_GLUCOPROTEINA_P", "ANTIBIOTICO"] },
  { id: "Eritromicina", drugClasses: ["MACROLIDO", "PROLONGADOR_QTC", "INHIBIDOR_GLUCOPROTEINA_P", "ANTIBIOTICO"] },

  // -------- ANTIEMÉTICOS --------
  { id: "Ondansetrón", drugClasses: ["ANTIEMETICO_5HT3", "PROLONGADOR_QTC"] },

  // -------- ANTIDEPRESIVOS ISRS --------
  { id: "Citalopram", drugClasses: ["ISRS", "ANTIDEPRESIVO_ISRS", "PROLONGADOR_QTC"] },
  { id: "Escitalopram", drugClasses: ["ISRS", "ANTIDEPRESIVO_ISRS", "PROLONGADOR_QTC"] },

  // -------- ANTIDEPRESIVOS IRSN (Inhibidores duales) --------
  { id: "Venlafaxina", drugClasses: ["ISRN"] },
  { id: "Duloxetina", drugClasses: ["ISRN"] },

  // -------- ANTIDEPRESIVOS TRICÍCLICOS (ATCs) --------
  { id: "Amitriptilina", drugClasses: ["ANTIDEPRESIVO_TRICICLICO", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },
  { id: "Nortriptilina", drugClasses: ["ANTIDEPRESIVO_TRICICLICO", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },
  { id: "Imipramina", drugClasses: ["ANTIDEPRESIVO_TRICICLICO", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },
  { id: "Clomipramina", drugClasses: ["ANTIDEPRESIVO_TRICICLICO", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },
  { id: "Doxepina", drugClasses: ["ANTIDEPRESIVO_TRICICLICO", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },

  // -------- ESTABILIZADORES DEL ÁNIMO --------
  { id: "Litio", drugClasses: ["ESTABILIZADOR_ANIMO", "PSICOTROPICO", "PROLONGADOR_QTC"] },

  // -------- NEUROLÉPTICOS / ANTIPSICÓTICOS --------
  { id: "Haloperidol", drugClasses: ["NEUROLEPTICO", "ANTIPSICOTICO_TIPICO", "PSICOTROPICO", "PROLONGADOR_QTC"] },

  // -------- FENOTIAZINAS (Antipsicóticos típicos) --------
  { id: "Clorpromazina", drugClasses: ["FENOTIAZINA", "NEUROLEPTICO", "ANTIPSICOTICO_TIPICO", "ANTICOLINERGICO", "PSICOTROPICO", "PROLONGADOR_QTC"] },
  { id: "Levomepromazina", drugClasses: ["FENOTIAZINA", "NEUROLEPTICO", "ANTIPSICOTICO_TIPICO", "ANTICOLINERGICO", "PSICOTROPICO", "PROLONGADOR_QTC"] },
  { id: "Tioridazina", drugClasses: ["FENOTIAZINA", "NEUROLEPTICO", "ANTIPSICOTICO_TIPICO", "ANTICOLINERGICO", "PSICOTROPICO", "PROLONGADOR_QTC"] },
  { id: "Proclorperazina", drugClasses: ["FENOTIAZINA", "NEUROLEPTICO", "ANTIPSICOTICO_TIPICO", "ANTICOLINERGICO", "PSICOTROPICO", "PROCINETICO"] },

  // -------- ANTIARRÍTMICOS --------
  { id: "Amiodarona", drugClasses: ["ANTIARITMICO", "ANTIARITMICO_CLASE_III", "PROLONGADOR_QTC", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Flecainida", drugClasses: ["ANTIARITMICO", "ANTIARITMICO_CLASE_IC"] },
  { id: "Digoxina", drugClasses: ["GLUCOSIDO_CARDIACO", "DIGOXINA", "CONTROL_FRECUENCIA_FA"] },

  // -------- RELAJANTES MUSCULARES --------
  { id: "Tizanidina", drugClasses: ["RELAJANTE_MUSCULAR", "ANTICOLINERGICO", "PROLONGADOR_QTC"] },

  // -------- ANTIHISTAMÍNICOS --------
  { id: "Astemizol", drugClasses: ["ANTIHISTAMINICO", "ANTIHISTAMINICO_H1", "ANTIHISTAMINICO_1GEN", "PROLONGADOR_QTC"] },

  // -------- ANTIHISTAMÍNICOS 1ª GENERACIÓN --------
  { id: "Difenhidramina", drugClasses: ["ANTIHISTAMINICO_1GEN", "ANTICOLINERGICO"] },
  { id: "Clorfeniramina", drugClasses: ["ANTIHISTAMINICO_1GEN", "ANTICOLINERGICO"] },
  { id: "Dexclorfeniramina", drugClasses: ["ANTIHISTAMINICO_1GEN", "ANTICOLINERGICO"] },

  // -------- TRATAMIENTO VEJIGA HIPERACTIVA --------
  { id: "Mirabegrón", drugClasses: ["AGONISTA_BETA3", "AGONISTA_BETA3_URINARIO", "PROLONGADOR_QTC"] },

  // -------- ANTIHIPERTENSIVOS DE ACCIÓN CENTRAL (α2-agonistas) --------
  { id: "Metildopa", drugClasses: ["ANTIHIPERTENSIVO_CENTRAL"] },
  { id: "Clonidina", drugClasses: ["ANTIHIPERTENSIVO_CENTRAL"] },
  { id: "Moxonidina", drugClasses: ["ANTIHIPERTENSIVO_CENTRAL"] },
  { id: "Rilmenidina", drugClasses: ["ANTIHIPERTENSIVO_CENTRAL"] },
  { id: "Guanfacina", drugClasses: ["ANTIHIPERTENSIVO_CENTRAL"] },

  // -------- ANTICOAGULANTES --------
  // Antivitamina K
  { id: "Warfarina", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_AVK"] },
  { id: "Acenocumarol", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_AVK"] },

  // Anticoagulantes Orales Directos (AODs/DOACs)
  { id: "Apixaban", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_DIRECTO"] },
  { id: "Dabigatrán", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_DIRECTO", "INHIBIDOR_DIRECTO_TROMBINA"] },
  { id: "Edoxaban", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_DIRECTO"] },
  { id: "Rivaroxaban", drugClasses: ["ANTICOAGULANTE", "ANTICOAGULANTE_DIRECTO"] },

  // -------- OPIOIDES --------
  { id: "Morfina", drugClasses: ["OPIOIDE", "OPIOIDE_RAPIDO"] },
  { id: "Morfina LP", drugClasses: ["OPIOIDE", "OPIOIDE_LP"] },
  { id: "Fentanilo", drugClasses: ["OPIOIDE", "OPIOIDE_LP"] },
  { id: "Oxicodona", drugClasses: ["OPIOIDE", "OPIOIDE_RAPIDO"] },
  { id: "Oxicodona LP", drugClasses: ["OPIOIDE", "OPIOIDE_LP"] },
  { id: "Buprenorfina parche", drugClasses: ["OPIOIDE", "OPIOIDE_LP"] },
  { id: "Tramadol", drugClasses: ["OPIOIDE"] },
  { id: "Metadona", drugClasses: ["OPIOIDE"] },
  { id: "Petidina", drugClasses: ["OPIOIDE"] },

  // -------- BENZODIACEPINAS --------
  { id: "Diazepam", drugClasses: ["BENZODIACEPINA"] },
  { id: "Lorazepam", drugClasses: ["BENZODIACEPINA"] },
  { id: "Alprazolam", drugClasses: ["BENZODIACEPINA"] },
  { id: "Clonazepam", drugClasses: ["BENZODIACEPINA"] },
  { id: "Midazolam", drugClasses: ["BENZODIACEPINA"] },

  // -------- HIPNÓTICOS Z --------
  { id: "Zolpidem", drugClasses: ["HIPNOTICO_Z"] },
  { id: "Zopiclona", drugClasses: ["HIPNOTICO_Z"] },
  { id: "Zaleplon", drugClasses: ["HIPNOTICO_Z"] },

  // -------- ESTATINAS --------
  { id: "Atorvastatina", drugClasses: ["ESTATINA"] },
  { id: "Simvastatina", drugClasses: ["ESTATINA"] },
  { id: "Rosuvastatina", drugClasses: ["ESTATINA"] },
  { id: "Pravastatina", drugClasses: ["ESTATINA"] },

  // -------- ANTIGOTOSOS --------
  { id: "Colchicina", drugClasses: ["ANTIGOTOSO", "COLCHICINA"] },

  // -------- ANTIBIÓTICOS URINARIOS --------
  { id: "Nitrofurantoína", drugClasses: ["ANTIBIOTICO_URINARIO", "ANTIBIOTICO", "NITROFURANTOINA"] },

  // -------- BIFOSFONATOS --------
  { id: "Alendronato", drugClasses: ["BIFOSFONATO", "ANTIRRESORTIVO"] },
  { id: "Risedronato", drugClasses: ["BIFOSFONATO", "ANTIRRESORTIVO"] },
  { id: "Ibandronato", drugClasses: ["BIFOSFONATO", "ANTIRRESORTIVO"] },
  { id: "Zoledronato", drugClasses: ["BIFOSFONATO", "ANTIRRESORTIVO"] },

  // -------- ANTIMETABOLITOS / INMUNOSUPRESORES --------
  { id: "Metotrexato", drugClasses: ["ANTIMETABOLITO", "INMUNOSUPRESOR", "FAME"] },

  // -------- PROCINÉTICOS --------
  { id: "Metoclopramida", drugClasses: ["PROCINETICO"] },

  // -------- HIERRO ORAL --------
  { id: "Sulfato ferroso", drugClasses: ["HIERRO_ORAL"] },
  { id: "Fumarato ferroso", drugClasses: ["HIERRO_ORAL"] },
  { id: "Gluconato ferroso", drugClasses: ["HIERRO_ORAL"] },

  // -------- OREXÍGENOS --------
  { id: "Acetato de megestrol", drugClasses: ["OREXICO"] },

  // -------- METILXANTINAS --------
  { id: "Teofilina", drugClasses: ["METILXANTINA"] },

  // -------- LAMA (antimuscarínicos de acción larga inhalados) --------
  { id: "Tiotropio", drugClasses: ["LAMA"] },
  { id: "Aclidinio", drugClasses: ["LAMA"] },
  { id: "Umeclidinio", drugClasses: ["LAMA"] },
  { id: "Glicopirronio", drugClasses: ["LAMA"] },

  // -------- ANTIEPILÉPTICOS --------
  { id: "Carbamazepina", drugClasses: ["ANTIEPILÉPTICO"] },
  { id: "Valproato", drugClasses: ["ANTIEPILÉPTICO"] },
  { id: "Levetiracetam", drugClasses: ["ANTIEPILÉPTICO"] },
  { id: "Fenitoína", drugClasses: ["ANTIEPILÉPTICO"] },
  { id: "Lamotrigina", drugClasses: ["ANTIEPILÉPTICO"] },

  // -------- ALFABLOQUEANTES (para criterios I5, K9, K10; NO Silodosina) --------
  { id: "Alfuzosina", drugClasses: ["ALFABLOQUEANTE"] },
  { id: "Doxazosina", drugClasses: ["ALFABLOQUEANTE"] },
  { id: "Prazosina", drugClasses: ["ALFABLOQUEANTE"] },
  { id: "Indoramina", drugClasses: ["ALFABLOQUEANTE"] },
  { id: "Tamsulosina", drugClasses: ["ALFABLOQUEANTE"] },
  { id: "Terazosina", drugClasses: ["ALFABLOQUEANTE"] },

  // -------- iSGLT2 --------
  { id: "Canagliflozina", drugClasses: ["ISGLT2"] },
  { id: "Dapagliflozina", drugClasses: ["ISGLT2"] },
  { id: "Empagliflozina", drugClasses: ["ISGLT2"] },
  { id: "Ertugliflozina", drugClasses: ["ISGLT2"] },

  // -------- SULFONILUREAS --------
  { id: "Glibenclamida", drugClasses: ["SULFONILUREA"] },
  { id: "Glimepirida", drugClasses: ["SULFONILUREA"] },
  { id: "Clorpropamida", drugClasses: ["SULFONILUREA"] },

  // -------- TIAZOLIDINDIONAS --------
  { id: "Rosiglitazona", drugClasses: ["TIAZOLIDINDIONA"] },
  { id: "Pioglitazona", drugClasses: ["TIAZOLIDINDIONA"] },

  // -------- HORMONAS TIROIDEAS --------
  { id: "Levotiroxina", drugClasses: ["HORMONA_TIROIDEA"] },

  // -------- ANÁLOGOS DE VASOPRESINA --------
  { id: "Desmopresina", drugClasses: ["ANALOGO_VASOPRESINA"] },
  { id: "Vasopresina", drugClasses: ["ANALOGO_VASOPRESINA"] },

  // -------- ANTIPARKINSONIANOS ANTICOLINÉRGICOS --------
  { id: "Biperideno", drugClasses: ["ANTIPARKINSONIAN_ANTICOLINERGICO", "ANTICOLINERGICO"] },
  { id: "Orfenadrina", drugClasses: ["ANTIPARKINSONIAN_ANTICOLINERGICO", "ANTICOLINERGICO"] },
  { id: "Prociclidina", drugClasses: ["ANTIPARKINSONIAN_ANTICOLINERGICO", "ANTICOLINERGICO"] },
  { id: "Trihexifenidilo", drugClasses: ["ANTIPARKINSONIAN_ANTICOLINERGICO", "ANTICOLINERGICO"] },

  // -------- ANTIDEMENCIA --------
  { id: "Memantina", drugClasses: ["ANTIDEMENCIA", "ANTAGONISTA_NMDA"] },

  // -------- AGONISTAS DOPAMINÉRGICOS --------
  { id: "Pramipexol", drugClasses: ["AGONISTA_DOPAMINERGICO"] },
  { id: "Ropinirol", drugClasses: ["AGONISTA_DOPAMINERGICO"] },
  { id: "Rotigotina", drugClasses: ["AGONISTA_DOPAMINERGICO"] },

  // -------- DOPAMINÉRGICOS (Levodopa) --------
  { id: "Levodopa/Carbidopa", drugClasses: ["DOPAMINERGICO"] },

  // -------- GABAPENTINOIDES --------
  { id: "Gabapentina", drugClasses: ["GABAPENTINOIDE"] },
  { id: "Pregabalina", drugClasses: ["GABAPENTINOIDE"] },

  // -------- ANALGÉSICOS SIMPLES --------
  { id: "Paracetamol", drugClasses: ["ANALGESICO_SIMPLE"] },

  // -------- LAXANTES --------
  { id: "Lactulosa", drugClasses: ["LAXANTE"] },
  { id: "Macrogol", drugClasses: ["LAXANTE"] },
  { id: "Bisacodilo", drugClasses: ["LAXANTE"] },
  { id: "Senósidos", drugClasses: ["LAXANTE"] },

  // -------- IBP --------
  { id: "Omeprazol", drugClasses: ["IBP"] },
  { id: "Pantoprazol", drugClasses: ["IBP"] },
  { id: "Lansoprazol", drugClasses: ["IBP"] },
  { id: "Esomeprazol", drugClasses: ["IBP"] },
  { id: "Rabeprazol", drugClasses: ["IBP"] },

  // -------- NOOTRÓPICOS --------
  { id: "Ginkgo biloba", drugClasses: ["NOOTROPICO"] },
  { id: "Piracetam", drugClasses: ["NOOTROPICO"] },
  { id: "Citicolina", drugClasses: ["NOOTROPICO"] },

  // -------- ANESTÉSICO TÓPICO --------
  { id: "Lidocaína parche", drugClasses: ["ANESTESICO_TOPICO"] },

  // -------- OTROS --------
  { id: "Metformina", drugClasses: ["BIGUANIDA"] },
  { id: "Ácido acetilsalicílico", drugClasses: ["ANTIAGREGANTE", "AAS"] },
  { id: "Clopidogrel", drugClasses: ["ANTIAGREGANTE"] },
  { id: "Ticlopidina", drugClasses: ["ANTIAGREGANTE", "TICLOPIDINA"] },
  { id: "Prasugrel", drugClasses: ["ANTIAGREGANTE"] },
  { id: "Ticagrelor", drugClasses: ["ANTIAGREGANTE", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Verapamilo", drugClasses: ["CALCIOANTAGONISTA_NO_DHP", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Diltiazem", drugClasses: ["CALCIOANTAGONISTA_NO_DHP"] },
  { id: "Dronedarona", drugClasses: ["ANTIARITMICO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] },
  { id: "Ciclosporina", drugClasses: ["INMUNOSUPRESOR", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Itraconazol", drugClasses: ["ANTIFUNGICO", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Ketoconazol", drugClasses: ["ANTIFUNGICO", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Quinina", drugClasses: ["ANTIPALUDICO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] },
  { id: "Ranolazina", drugClasses: ["ANTIANGINOSO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] },
  { id: "Tamoxifeno", drugClasses: ["ANTINEOPLASICO", "INHIBIDOR_GLUCOPROTEINA_P", "PROLONGADOR_QTC"] },

  // -------- CALCIOANTAGONISTAS DIHIDROPIRIDÍNICOS (DHP) --------
  { id: "Amlodipino", drugClasses: ["CALCIOANTAGONISTA_DHP"] },
  { id: "Nifedipino", drugClasses: ["CALCIOANTAGONISTA_DHP"] },
  { id: "Lercanidipino", drugClasses: ["CALCIOANTAGONISTA_DHP"] },
  { id: "Nitrendipino", drugClasses: ["CALCIOANTAGONISTA_DHP"] },
  { id: "Felodipino", drugClasses: ["CALCIOANTAGONISTA_DHP"] },

  // -------- BETABLOQUEANTES --------
  // Cardioselectivos (β1-selectivos)
  { id: "Metoprolol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_CARDIOSELECTIVO"] },
  { id: "Bisoprolol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_CARDIOSELECTIVO"] },
  { id: "Atenolol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_CARDIOSELECTIVO"] },
  { id: "Nebivolol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_CARDIOSELECTIVO"] },

  // No cardioselectivos (β1 + β2)
  { id: "Carvedilol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_NO_CARDIOSELECTIVO", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Propranolol", drugClasses: ["BETABLOQUEANTE", "BETABLOQUEANTE_NO_CARDIOSELECTIVO"] },

  // -------- INHIBIDORES DE ACETILCOLINESTERASA --------
  { id: "Donepezilo", drugClasses: ["INHIBIDOR_ACETILCOLINESTERASA"] },
  { id: "Rivastigmina", drugClasses: ["INHIBIDOR_ACETILCOLINESTERASA"] },
  { id: "Galantamina", drugClasses: ["INHIBIDOR_ACETILCOLINESTERASA"] },

  // -------- ANTIPSICÓTICOS ATÍPICOS --------
  { id: "Risperidona", drugClasses: ["NEUROLEPTICO", "NEUROLEPTICO_ATIPICO"] },
  { id: "Olanzapina", drugClasses: ["NEUROLEPTICO", "NEUROLEPTICO_ATIPICO", "ANTICOLINERGICO"] },
  { id: "Quetiapina", drugClasses: ["NEUROLEPTICO", "NEUROLEPTICO_ATIPICO", "ANTICOLINERGICO"] },
  { id: "Aripiprazol", drugClasses: ["NEUROLEPTICO", "NEUROLEPTICO_ATIPICO"] },
  { id: "Clozapina", drugClasses: ["NEUROLEPTICO", "NEUROLEPTICO_ATIPICO", "ANTICOLINERGICO"] },

  // -------- OTROS ANTICOLINÉRGICOS --------
  { id: "Atropina", drugClasses: ["ANTICOLINERGICO"] },
  { id: "Oxibutinina", drugClasses: ["ANTICOLINERGICO", "ANTIESPASMÓDICO_URINARIO"] },
  { id: "Tolterodina", drugClasses: ["ANTICOLINERGICO", "ANTIESPASMÓDICO_URINARIO"] },
  { id: "Solifenacina", drugClasses: ["ANTICOLINERGICO", "ANTIESPASMÓDICO_URINARIO"] },
  { id: "Hioscina", drugClasses: ["ANTICOLINERGICO", "ANTIESPASMÓDICO"] },

  // -------- ESTRÓGENOS --------
  { id: "Estrógenos conjugados", drugClasses: ["ESTROGENO", "INHIBIDOR_GLUCOPROTEINA_P"] },
  { id: "Estradiol", drugClasses: ["ESTROGENO", "INHIBIDOR_GLUCOPROTEINA_P"] },

  // -------- ANDRÓGENOS --------
  { id: "Testosterona", drugClasses: ["ANDROGENO", "INHIBIDOR_GLUCOPROTEINA_P"] },

  // -------- LABA (agonistas beta-2 de acción larga inhalados) --------
  { id: "Formoterol", drugClasses: ["LABA"] },
  { id: "Salmeterol", drugClasses: ["LABA"] },
  { id: "Indacaterol", drugClasses: ["LABA"] },
  { id: "Olodaterol", drugClasses: ["LABA"] },

  // -------- CORTICOIDES INHALADOS --------
  { id: "Beclometasona inhalada", drugClasses: ["CORTICOIDE_INHALADO"] },
  { id: "Budesonida inhalada", drugClasses: ["CORTICOIDE_INHALADO"] },
  { id: "Fluticasona inhalada", drugClasses: ["CORTICOIDE_INHALADO"] },
  { id: "Mometasona inhalada", drugClasses: ["CORTICOIDE_INHALADO"] },

  // -------- FAME (Fármacos Antirreumáticos Modificadores de la Enfermedad) --------
  { id: "Leflunomida", drugClasses: ["FAME", "INMUNOSUPRESOR"] },
  { id: "Sulfasalazina", drugClasses: ["FAME"] },
  { id: "Hidroxicloroquina", drugClasses: ["FAME"] },

  // -------- VITAMINA D --------
  { id: "Colecalciferol", drugClasses: ["VITAMINA_D"] },
  { id: "Calcifediol", drugClasses: ["VITAMINA_D"] },
  { id: "Calcitriol", drugClasses: ["VITAMINA_D"] },

  // -------- CALCIO --------
  { id: "Carbonato cálcico", drugClasses: ["CALCIO"] },
  { id: "Citrato cálcico", drugClasses: ["CALCIO"] },

  // -------- ANTIRRESORTIVOS --------
  { id: "Denosumab", drugClasses: ["ANTIRRESORTIVO"] },

  // -------- ANABOLIZANTES ÓSEOS --------
  { id: "Teriparatida", drugClasses: ["ANABOLIZANTE_OSEO"] },

  // -------- ÁCIDO FÓLICO --------
  { id: "Ácido fólico", drugClasses: ["ACIDO_FOLICO"] },

  // -------- INHIBIDORES 5-ALFA REDUCTASA --------
  { id: "Finasterida", drugClasses: ["INHIBIDOR_5ALFA_REDUCTASA"] },
  { id: "Dutasterida", drugClasses: ["INHIBIDOR_5ALFA_REDUCTASA"] },

  // -------- ESTRÓGENOS TÓPICOS VAGINALES --------
  { id: "Estriol vaginal", drugClasses: ["ESTROGENO_TOPICO"] },
  { id: "Promestrieno", drugClasses: ["ESTROGENO_TOPICO"] },

  // -------- SACUBITRILO/VALSARTÁN --------
  { id: "Sacubitrilo/Valsartán", drugClasses: ["SACUBITRILO_VALSARTAN"] },

  // -------- HIERRO IV --------
  { id: "Hierro carboximaltosa IV", drugClasses: ["HIERRO_IV"] },
  { id: "Hierro sacarosa IV", drugClasses: ["HIERRO_IV"] },

  // -------- QUELANTES DE FÓSFORO --------
  { id: "Sevelámero", drugClasses: ["QUELANTE_FOSFORO"] },
  { id: "Carbonato de lantano", drugClasses: ["QUELANTE_FOSFORO"] },

  // -------- ERITROPOYETINA --------
  { id: "Eritropoyetina alfa", drugClasses: ["EPO"] },
  { id: "Darbepoetina alfa", drugClasses: ["EPO"] },

  // -------- PROBIÓTICOS --------
  { id: "Saccharomyces boulardii", drugClasses: ["PROBIOTICO"] },
  { id: "Lactobacillus acidophilus", drugClasses: ["PROBIOTICO"] },

  // -------- SUPLEMENTOS DE FIBRA --------
  { id: "Plantago ovata (ispaghula)", drugClasses: ["FIBRA"] },
  { id: "Metilcelulosa", drugClasses: ["FIBRA"] },

  // -------- INHIBIDORES DE XANTINA OXIDASA --------
  { id: "Alopurinol", drugClasses: ["INHIBIDOR_XANTINA_OXIDASA"] },
  { id: "Febuxostat", drugClasses: ["INHIBIDOR_XANTINA_OXIDASA"] },

  // -------- SILODOSINA (alfabloqueante prostático selectivo; excluido de ALFABLOQUEANTE por seguridad en caídas) --------
  { id: "Silodosina", drugClasses: ["ALFABLOQUEANTE_PROSTATICO"] },

  // -------- ANTIBIÓTICOS GENERALES --------
  { id: "Amoxicilina", drugClasses: ["ANTIBIOTICO"] },
  { id: "Amoxicilina/Clavulánico", drugClasses: ["ANTIBIOTICO"] },
  { id: "Cefalexina", drugClasses: ["ANTIBIOTICO"] },
  { id: "Doxiciclina", drugClasses: ["ANTIBIOTICO"] },
  { id: "Trimetoprim/Sulfametoxazol", drugClasses: ["ANTIBIOTICO"] },

];

// Para autocomplete
export const MED_NAMES = MEDICATIONS.map(m => m.id);
