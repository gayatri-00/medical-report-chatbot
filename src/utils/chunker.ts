import { DocumentChunk } from "../types";

export function splitTextIntoChunks(
  fullText: string,
  chunkSize: number = 450,
  chunkOverlap: number = 80
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Split on double newlines or pages
  const paragraphs = fullText.split(/\n\s*\n/);
  let currentChunk = "";
  let currentChunkId = 0;
  let estimatedPage = 1;

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    // Check for page markers
    if (/page\s*\d+/i.test(cleanPara) || cleanPara.includes("---") && cleanPara.length < 50) {
      estimatedPage += 1;
    }

    if ((currentChunk + "\n\n" + cleanPara).length <= chunkSize) {
      currentChunk = currentChunk ? currentChunk + "\n\n" + cleanPara : cleanPara;
    } else {
      if (currentChunk.trim().length > 20) {
        chunks.push({
          chunkId: currentChunkId++,
          pageNumber: estimatedPage,
          text: currentChunk.trim(),
          charCount: currentChunk.trim().length,
        });
      }
      
      // Handle overlap
      if (currentChunk.length > chunkOverlap) {
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + " " + cleanPara;
      } else {
        currentChunk = cleanPara;
      }
    }
  }

  if (currentChunk.trim().length > 15) {
    chunks.push({
      chunkId: currentChunkId++,
      pageNumber: estimatedPage,
      text: currentChunk.trim(),
      charCount: currentChunk.trim().length,
    });
  }

  return chunks;
}

export function detectSectionsFromText(text: string): string[] {
  const sections: string[] = [];
  const textLower = text.toLowerCase();

  const commonSections: [string, string[]][] = [
    ["Patient Demographics", ["patient name", "age", "gender", "dob", "mrn", "id:"]],
    ["Clinical Indication & History", ["clinical indication", "history", "chief complaint", "reason for exam"]],
    ["Complete Blood Count (CBC)", ["complete blood count", "cbc", "hemoglobin", "wbc", "platelet count"]],
    ["Metabolic & Renal Panel", ["metabolic panel", "glucose", "creatinine", "bun", "sodium", "potassium"]],
    ["Lipid Profile", ["lipid panel", "cholesterol", "triglycerides", "hdl", "ldl"]],
    ["Thyroid Function Panel", ["thyroid panel", "tsh", "free t4", "free t3"]],
    ["Diagnostic Imaging Findings", ["technique", "findings", "impression", "lungs", "mediastinum"]],
    ["Clinical Impressions & Observations", ["impression", "observations", "conclusion"]],
    ["Physician Recommendations", ["recommendations", "follow-up", "advise", "plan"]]
  ];

  for (const [name, keywords] of commonSections) {
    if (keywords.some((kw) => textLower.includes(kw))) {
      sections.push(name);
    }
  }

  return sections.length > 0 ? sections : ["General Medical Report", "Clinical Observations"];
}
