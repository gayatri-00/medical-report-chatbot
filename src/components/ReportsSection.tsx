import React from "react";
import { Files, FileText, CheckCircle2, Trash2, MessageSquareQuote, UploadCloud, ArrowRight, Eye } from "lucide-react";
import { MedicalReport, TabType } from "../types";

interface ReportsSectionProps {
  reports: MedicalReport[];
  activeReport: MedicalReport | null;
  onSelectReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onNavigate: (tab: TabType) => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  reports,
  activeReport,
  onSelectReport,
  onDeleteReport,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medical Reports Manager</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Switch between patient documents or delete reports to update the active RAG vector context
          </p>
        </div>

        <button
          onClick={() => onNavigate("upload")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Another Report</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <Files className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Reports Available</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You haven't uploaded or selected any medical reports yet. Click below to load a sample or upload a PDF.
          </p>
          <button
            onClick={() => onNavigate("upload")}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <span>Upload or Pick Sample</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {reports.map((rep) => {
            const isActive = activeReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive ? "border-teal-400 ring-2 ring-teal-500/10 bg-teal-50/20" : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active Vector Context
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Standby
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(rep.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    {rep.filename}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {rep.totalPages} page(s) • {rep.totalChunks} chunks in FAISS • {rep.detectedSections.length} detected panels
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isActive ? (
                    <button
                      onClick={() => onSelectReport(rep.id)}
                      className="bg-white hover:bg-teal-50 text-teal-700 border border-teal-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Set as Active
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate("chat")}
                      className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all"
                    >
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectReport(rep.id);
                      onNavigate("summary");
                    }}
                    title="View Clinical Summary"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteReport(rep.id)}
                    title="Delete Report"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
