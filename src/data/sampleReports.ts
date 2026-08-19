export interface SampleReportTemplate {
  id: string;
  filename: string;
  title: string;
  description: string;
  category: string;
  totalPages: number;
  fullText: string;
  detectedSections: string[];
}

export const SAMPLE_REPORTS: SampleReportTemplate[] = [
  {
    id: "sample_cbc_lipid",
    filename: "Complete_Blood_Count_&_Lipid_Panel.pdf",
    title: "Complete Blood Count (CBC) & Fasting Lipid Panel",
    description: "Eleanor Vance (Age 52) - Anemia (Low Hb 11.2), High Total Cholesterol (238), Elevated LDL (156), Impaired Fasting Glucose (104).",
    category: "Hematology & Biochemistry",
    totalPages: 2,
    detectedSections: ["Patient Demographics", "Complete Blood Count (CBC)", "Differential Count", "Fasting Lipid Panel", "Clinical Impressions & Observations", "Physician Recommendations"],
    fullText: `METROPOLITAN GENERAL HOSPITAL & CLINICAL LABORATORY
100 Healthcare Parkway, Medical Plaza Suite 400
Accreditation: CLIA #99D0876543 | CAP #1234567

PATIENT INFORMATION:
Patient Name: Eleanor Vance
Patient ID / MRN: MRN-8849201
Age: 52 Years | Gender: Female | DOB: 1974-03-12
Date of Specimen Collection: October 14, 2025 (08:30 AM Fasting)
Ordering Physician: Dr. Marcus Reed, MD (Internal Medicine)
Report Status: Final Verified

----------------------------------------------------------------------
PANEL 1: COMPLETE BLOOD COUNT (CBC) WITH DIFFERENTIAL
----------------------------------------------------------------------
Test Name                  Result    Units        Reference Range    Flag
Hemoglobin (Hb)            11.2      g/dL         12.0 - 15.5        LOW
Hematocrit (Hct)           34.1      %            36.0 - 46.0        LOW
RBC Count                  3.85      x10^6/uL     4.00 - 5.20        LOW
MCV                        88.6      fL           80.0 - 100.0       NORMAL
MCH                        29.1      pg           27.0 - 33.0        NORMAL
MCHC                       32.8      g/dL         32.0 - 36.0        NORMAL
RDW                        13.4      %            11.5 - 14.5        NORMAL
White Blood Cell (WBC)     6.8       x10^3/uL     4.5 - 11.0         NORMAL
Platelet Count             245       x10^3/uL     150 - 450          NORMAL

Differential:
Neutrophils (%)            58.2      %            40.0 - 70.0        NORMAL
Lymphocytes (%)            31.4      %            20.0 - 40.0        NORMAL
Monocytes (%)              6.9       %            2.0 - 8.0          NORMAL
Eosinophils (%)            2.8       %            1.0 - 4.0          NORMAL
Basophils (%)              0.7       %            0.0 - 2.0          NORMAL

----------------------------------------------------------------------
PANEL 2: FASTING LIPID & GLUCOSE PANEL
----------------------------------------------------------------------
Test Name                  Result    Units        Reference Range    Flag
Fasting Blood Glucose      104       mg/dL        70 - 99            HIGH (Impaired Fasting Glucose)
Total Cholesterol          238       mg/dL        < 200              HIGH
Triglycerides              192       mg/dL        < 150              HIGH
HDL Cholesterol            44        mg/dL        > 50 (Female)      LOW
LDL Cholesterol (Calc)     156       mg/dL        < 100              HIGH
Non-HDL Cholesterol        194       mg/dL        < 130              HIGH
Cholesterol / HDL Ratio    5.41                   < 4.5              HIGH

----------------------------------------------------------------------
CLINICAL IMPRESSIONS & OBSERVATIONS:
----------------------------------------------------------------------
1. Mild normocytic, normochromic anemia (Hemoglobin 11.2 g/dL, Hematocrit 34.1%).
2. Dyslipidemia characterized by elevated Total Cholesterol (238 mg/dL), elevated LDL (156 mg/dL), mild hypertriglyceridemia (192 mg/dL), and reduced HDL (44 mg/dL).
3. Borderline fasting blood glucose of 104 mg/dL suggesting early impaired fasting glucose tolerance.

RECOMMENDATIONS:
- Dietary lifestyle modifications and recheck fasting lipid profile in 3 months.
- Consider evaluation of iron studies (Serum Ferritin, Transferrin Saturation) and Vitamin B12 / Folate levels.
- Hemoglobin A1c test recommended to assess glycemic control over past 90 days.

Electronically signed by:
Dr. Marcus Reed, MD
Specialist in Internal Medicine
Medical License: #MD-7729104`,
  },
  {
    id: "sample_radiology_ct",
    filename: "Thoracic_CT_Radiology_Report.pdf",
    title: "Thoracic High-Resolution CT Radiology Report",
    description: "Robert Chen (Age 56) - Solitary 3.2mm pulmonary nodule in right middle lobe, bilateral bronchial wall thickening.",
    category: "Diagnostic Radiology",
    totalPages: 1,
    detectedSections: ["Clinical Indication", "Technique & Protocol", "Comparison", "Detailed Anatomical Findings", "Radiologist Impression"],
    fullText: `ST. JUDE REGIONAL MEDICAL CENTER - DEPARTMENT OF RADIOLOGY
850 Lincoln Boulevard, Suite 200
Department Phone: (555) 019-8234 | PACS Ref # RAD-2025-99214

PATIENT DIAGNOSTIC RADIOLOGY REPORT
Patient Name: Robert Chen
DOB: 1968-11-04 (Age: 56) | Sex: Male
Examination Date: November 12, 2025 (14:15 EST)
Referring Physician: Dr. Sarah Jenkins, MD (Pulmonary Medicine)
Exam: CT Chest without Intravenous Contrast
Accession Number: ACC-883910

CLINICAL INDICATION:
56-year-old male with persistent dry cough for 6 weeks, mild dyspnea on moderate exertion, and 20 pack-year smoking history. Rule out focal pulmonary lesion, infection, or interstitial lung changes.

TECHNIQUE:
Contiguous volumetric axial helical computed tomography (CT) images obtained from the thoracic inlet through the adrenal glands without intravenous contrast administration. Multiplanar coronal and sagittal reconstructions were reformatted.

COMPARISON:
No prior chest computed tomography available for comparison. PA and lateral chest radiographs dated August 10, 2024.

FINDINGS:
1. Trachea and Airways: Trachea and central bronchi are widely patent without endobronchial lesion. Mild bronchial wall thickening noted bilaterally consistent with chronic airway irritation.
2. Lungs and Pleura:
   - Left Upper Lobe: Clear. No consolidation or mass.
   - Right Middle Lobe: A tiny 3.2 mm well-circumscribed non-calcified solid subpleural pulmonary nodule in the right middle lobe (Series 3, Image 42).
   - Basilar Segments: Mild dependent atelectasis noted in bilateral lung bases. No evidence of honeycombing, ground-glass opacities, or acute airspace consolidation.
   - Pleura: No pleural effusion or pneumothorax identified.
3. Mediastinum and Hila: Heart size is normal. Thoracic aorta is normal in caliber without aneurysm. No evidence of mediastinal or hilar lymphadenopathy by size criteria.
4. Chest Wall and Bones: Visualized osseous structures are intact without aggressive lytic or blastic lesions. Mild degenerative changes along the mid-thoracic spine.
5. Upper Abdomen: Visualized upper abdominal organs, including liver and adrenal glands, are unremarkable within non-contrast limitations.

IMPRESSION:
1. Solitary 3.2 mm non-calcified solid nodule in the right middle lobe. Per Fleischner Society 2017 Guidelines for low-to-intermediate risk category with nodule < 6 mm, routine CT follow-up is optional or may be considered in 12 months.
2. Mild diffuse bronchial wall thickening without acute pneumonia or airspace consolidation.
3. No mediastinal or hilar lymphadenopathy. No pleural effusion.

Interpreting Radiologist:
Dr. Elena Rostova, MD
Board Certified Diagnostic Radiologist
St. Jude Medical Center`,
  },
  {
    id: "sample_metabolic_thyroid",
    filename: "Metabolic_&_Thyroid_Panel.pdf",
    title: "Comprehensive Metabolic Panel & Thyroid Function",
    description: "James Henderson (Age 47) - Subclinical Hypothyroidism with elevated TSH (5.85), normal renal & liver enzymes.",
    category: "Endocrinology & Biochemistry",
    totalPages: 2,
    detectedSections: ["Comprehensive Metabolic Panel (CMP-14)", "Thyroid Function Panel", "Clinical Observations", "Recommendations"],
    fullText: `COMMUNITY HEALTH DIAGNOSTIC LABORATORIES
Clinical Biochemistry & Endocrinology Section

PATIENT LABORATORY ANALYSIS REPORT
Patient: James Henderson | Age: 47 | Sex: M
Specimen ID: LAB-2025-449102
Collection Date: September 28, 2025
Physician: Dr. Anita Patel, MD

----------------------------------------------------------------------
COMPREHENSIVE METABOLIC PANEL (CMP-14)
----------------------------------------------------------------------
Analyte                    Value     Units      Reference Range    Status
Sodium                     141       mmol/L     135 - 145          NORMAL
Potassium                  4.3       mmol/L     3.5 - 5.0          NORMAL
Chloride                   102       mmol/L     96 - 106           NORMAL
Carbon Dioxide (CO2)       25        mmol/L     22 - 29            NORMAL
Blood Urea Nitrogen (BUN)  16        mg/dL      7 - 20             NORMAL
Serum Creatinine           0.95      mg/dL      0.70 - 1.30        NORMAL
eGFR (CKD-EPI)             98        mL/min/1.73m2  > 60           NORMAL
BUN/Creatinine Ratio       16.8                 10.0 - 20.0        NORMAL
Calcium                    9.4       mg/dL      8.6 - 10.2         NORMAL
Total Protein              7.1       g/dL       6.0 - 8.3          NORMAL
Albumin                    4.5       g/dL       3.5 - 5.0          NORMAL
Total Bilirubin            0.7       mg/dL      0.2 - 1.2          NORMAL
Alkaline Phosphatase (ALP) 68        U/L        44 - 121           NORMAL
AST (SGOT)                 24        U/L        10 - 40            NORMAL
ALT (SGPT)                 28        U/L        7 - 56             NORMAL

----------------------------------------------------------------------
THYROID FUNCTION PANEL
----------------------------------------------------------------------
Analyte                    Value     Units      Reference Range    Status
Thyroid Stimulating Horm.  5.85      uIU/mL     0.45 - 4.50        HIGH (Subclinical Hypothyroidism)
Free T4 (Thyroxine)        1.12      ng/dL      0.82 - 1.77        NORMAL
Free T3 (Triiodothyronine) 3.1       pg/mL      2.0 - 4.4          NORMAL

OBSERVATIONS:
1. Renal and hepatic biochemistry profiles are completely unremarkable. Normal eGFR of 98 mL/min/1.73m2.
2. Mild elevated TSH (5.85 uIU/mL) with normal Free T4 (1.12 ng/dL), compatible with mild subclinical hypothyroidism.

RECOMMENDATIONS:
- Repeat TSH and Free T4 in 6 to 8 weeks with Thyroid Peroxidase (TPO) antibodies.
- Evaluate clinical symptoms (fatigue, cold intolerance, dry skin).

Reported by: Dr. Anita Patel, MD`,
  },
];
