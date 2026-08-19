import React from "react";
import { Files, FileCheck, Clock, MessageSquare, UploadCloud, MessageSquareQuote, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { MedicalReport, TabType } from "../types";

interface DashboardSectionProps {
  reports: MedicalReport[];
  activeReport: MedicalReport | null;
  totalChatCount: number;
  onSelectReport: (reportId: string) => void;
  onNavigate: (tab: TabType) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  reports,
  activeReport,
  totalChatCount,
  onSelectReport,
  onNavigate,
}) => {
  const lastReport = reports.length > 0 ? reports[reports.length - 1] : null;
  const lastUploadStr = lastReport
    ? new Date(lastReport.uploadedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No uploads yet";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clinical Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Overview of processed medical reports, vector database indexes, and chat sessions
          </p>
        </div>

        <button
          onClick={() => onNavigate("upload")}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Report</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</span>
            <Files className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{reports.length}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">Indexed in FAISS</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Document</span>
            <FileCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-sky-950 truncate" title={activeReport?.filename || "None"}>
            {activeReport ? activeReport.filename : "None Selected"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeReport ? `${activeReport.totalChunks} chunks active` : "Select a document below"}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Upload</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-800">{lastUploadStr}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lastReport ? lastReport.filename : "Awaiting first PDF"}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chat History</span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalChatCount}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">Verified Q&A turns</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate("upload")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-teal-50/50 border border-teal-200/80 hover:border-teal-300 rounded-xl text-teal-900 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <UploadCloud className="w-4 h-4 text-teal-600" />
          <span>Upload PDF or Load Sample</span>
        </button>

        <button
          onClick={() => onNavigate("chat")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-sky-50/50 border border-sky-200/80 hover:border-sky-300 rounded-xl text-sky-900 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <MessageSquareQuote className="w-4 h-4 text-sky-600" />
          <span>Open Medical Chatbot</span>
        </button>

        <button
          onClick={() => onNavigate("summary")}
          className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-teal-50/50 border border-teal-200/80 hover:border-teal-300 rounded-xl text-teal-900 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          <span>View Report Summary & Tables</span>
        </button>
      </div>

      {/* Tabular Overview (Pandas DataFrame Style) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Document Registry</h3>
            <p className="text-xs text-slate-500">
              Active index selection dictates the exact context for LangChain & Gemini retrieval
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md">
            {reports.length} Records
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Files className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-600">No medical reports in your session.</p>
            <button
              onClick={() => onNavigate("upload")}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Click here to upload your first medical PDF
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">RAG Status</th>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">FAISS Chunks</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => {
                  const isActive = activeReport?.id === report.id;
                  return (
                    <tr
                      key={report.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isActive ? "bg-teal-50/40 font-medium" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active Context
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-slate-500 bg-slate-100">
                            Standby
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[240px] truncate">
                        {report.filename}
                      </td>
                      <td className="py-3 px-4">{report.totalPages} page(s)</td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200 text-[10px]">
                          {report.totalChunks} vectors
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(report.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isActive ? (
                          <button
                            onClick={() => onSelectReport(report.id)}
                            className="bg-white hover:bg-teal-50 text-teal-700 border border-teal-300 font-semibold px-2.5 py-1 rounded-md text-[11px] transition-all"
                          >
                            Set Active
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate("chat")}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] shadow-2xs transition-all"
                          >
                            Chat Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
