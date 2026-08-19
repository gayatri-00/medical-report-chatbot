import React from "react";
import { FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, Calendar, MessageSquareQuote, ArrowRight } from "lucide-react";
import { MedicalReport, TabType } from "../types";

interface SummarySectionProps {
  report: MedicalReport | null;
  onNavigate: (tab: TabType) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-2xl mx-auto animate-fadeIn">
        <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Medical Report Selected</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload or select a medical report to review its structured findings, lab values, and clinical sections.
        </p>
        <button
          onClick={() => onNavigate("upload")}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          <span>Upload or Select a Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Parse lines to detect flagged test values (High/Low)
  const lines = report.fullText.split("\n");
  const extractedLabRows = lines
    .filter((line) => line.includes("HIGH") || line.includes("LOW") || (line.includes("mg/dL") || line.includes("g/dL") || line.includes("uIU/mL") || line.includes("mmol/L")))
    .slice(0, 15);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white border border-teal-100 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Extracted Clinical Summary
            </span>
            <span className="text-xs text-slate-400">
              {new Date(report.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            {report.filename}
          </h2>
          <p className="text-xs text-slate-500">
            {report.totalPages} page(s) • {report.totalChunks} indexed vector chunks • {report.wordCount} words
          </p>
        </div>

        <button
          onClick={() => onNavigate("chat")}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all"
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Ask Chatbot</span>
        </button>
      </div>

      {/* Detected Clinical Sections */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          Detected Clinical Sections & Panels
        </h3>

        <div className="flex flex-wrap gap-2">
          {report.detectedSections.map((section, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200/80 px-3 py-1 rounded-lg"
            >
              {section}
            </span>
          ))}
        </div>
      </div>

      {/* Key Extracted Findings / Lab Values Table */}
      {extractedLabRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identified Laboratory & Diagnostic Indicators
            </h3>
            <span className="text-[11px] text-slate-400">Strictly extracted from document text</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {extractedLabRows.join("\n")}
            </pre>
          </div>
        </div>
      )}

      {/* Raw Extracted Document Text */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Extracted Document Text</h3>
          <span className="text-[11px] text-slate-400">Verbatim content used for RAG grounding</span>
        </div>

        <div className="max-h-72 overflow-y-auto bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
          {report.fullText}
        </div>
      </div>
    </div>
  );
};
