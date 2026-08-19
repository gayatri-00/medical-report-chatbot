import React from "react";
import { UploadCloud, MessageSquareQuote, ShieldAlert, Cpu, Database, Search, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { TabType } from "../types";

interface HomeSectionProps {
  onNavigate: (tab: TabType) => void;
  hasActiveReport: boolean;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, hasActiveReport }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Card */}
      <div className="bg-white border border-teal-100 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Healthcare RAG System
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Medical Report Chatbot
          </h2>

          <p className="text-base sm:text-lg text-teal-700 font-medium">
            AI-powered medical report understanding using Retrieval-Augmented Generation (RAG)
          </p>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Upload your laboratory blood tests, radiology scans, or metabolic profiles. Our specialized RAG pipeline reads and indexes your PDF, ensuring that all answers are <strong>strictly grounded in your medical report</strong> without hallucinated diagnoses or unauthorized prescriptions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("upload")}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-98"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Medical Report</span>
            </button>

            <button
              onClick={() => onNavigate("chat")}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <MessageSquareQuote className="w-4 h-4 text-teal-600" />
              <span>{hasActiveReport ? "Start Medical Chat" : "Open Chatbot"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="hidden lg:block absolute -right-6 -bottom-6 w-64 h-64 opacity-5 pointer-events-none text-teal-900">
          <Database className="w-full h-full" />
        </div>
      </div>

      {/* Medical Safety Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-semibold block mb-0.5">Important Clinical Disclaimer</strong>
          This application provides educational information based on the uploaded report and is not a replacement for professional medical advice, diagnosis, or clinical consultation. Never adjust dosages or start/stop medications without guidance from a licensed healthcare provider.
        </div>
      </div>

      {/* RAG Workflow Visualizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-xl font-bold text-slate-900">How Retrieval-Augmented Generation (RAG) Works</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Understanding why RAG makes medical document explanations safe and verifiable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">1. PDF Ingestion</h4>
            <p className="text-[11px] text-slate-500 leading-tight">Extracts text page-by-page preserving lab tables & metadata.</p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">2. Text Chunking</h4>
            <p className="text-[11px] text-slate-500 leading-tight">LangChain Recursive Splitter creates contextual chunks with overlap.</p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">3. FAISS Vector Store</h4>
            <p className="text-[11px] text-slate-500 leading-tight">Sentence Transformers (384-dim) vectorizes each segment for fast search.</p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">4. Context Retrieval</h4>
            <p className="text-[11px] text-slate-500 leading-tight">Searches FAISS for top-k matching snippets when user asks a question.</p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">5. Grounded Output</h4>
            <p className="text-[11px] text-slate-500 leading-tight">Gemini explains findings strictly citing source page numbers.</p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h4 className="text-sm font-bold text-slate-900">Zero Medical Hallucination</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict system instructions forbid fabricating values or speculating beyond what is clearly stated in the document.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h4 className="text-sm font-bold text-slate-900">Verified Page Citations</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every answer includes <span className="text-sky-700 font-semibold bg-sky-50 px-1 py-0.5 rounded">Source: Page X</span> tags so you can cross-reference with the original document.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h4 className="text-sm font-bold text-slate-900">Multi-Report Context Switching</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Easily upload and toggle between multiple patient records with isolated vector indexes for zero cross-document contamination.
          </p>
        </div>
      </div>
    </div>
  );
};
