import React from "react";
import { Stethoscope, ShieldAlert, FileText, UserCheck, LogIn, LogOut } from "lucide-react";
import { MedicalReport, UserSession } from "../types";

interface HeaderProps {
  activeReport: MedicalReport | null;
  user: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeReport,
  user,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-30 transition-all">
      {/* Top Banner / Disclaimer */}
      <div className="bg-gradient-to-r from-teal-800 to-sky-800 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <ShieldAlert className="w-4 h-4 text-teal-300 shrink-0" />
          <span className="truncate">
            <strong>Medical Disclaimer:</strong> This application provides educational information based on the uploaded report and is not a replacement for professional medical advice.
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-sky-600 flex items-center justify-center shadow-sm shadow-teal-500/20 text-white">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Medical Report Chatbot
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                RAG Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              AI-powered medical report understanding using RAG
            </p>
          </div>
        </div>

        {/* Right Info: Active Report Pill & Auth */}
        <div className="flex items-center gap-3">
          {activeReport ? (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-900 px-3 py-1.5 rounded-lg text-xs font-medium max-w-xs sm:max-w-md shadow-xs">
              <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 text-[11px] shrink-0">Current Report:</span>
              <span className="truncate font-semibold text-sky-950">{activeReport.filename}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Index Loaded" />
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              No report selected
            </div>
          )}

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-teal-50/60 border border-teal-200/80 px-2.5 py-1.5 rounded-lg">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
