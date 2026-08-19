import React, { useState, useRef, useEffect } from "react";
import { Send, Stethoscope, User, FileText, Sparkles, AlertCircle, ShieldAlert, BookOpen, Layers, CheckCircle2, ChevronRight, X } from "lucide-react";
import { MedicalReport, ChatMessage, DocumentChunk, TabType } from "../types";

interface ChatSectionProps {
  activeReport: MedicalReport | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onNavigate: (tab: TabType) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  activeReport,
  messages,
  onSendMessage,
  isLoading,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedCitationChunks, setSelectedCitationChunks] = useState<DocumentChunk[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What is this report about?",
    "Summarize this report.",
    "What are the main findings?",
    "Explain this report in simple words.",
    "What abnormal values are mentioned?",
    "What tests are included?",
    "What are the important observations?",
    "Which part of the report mentions this result?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText("");
    await onSendMessage(text);
  };

  const handleQuickQuestion = async (q: string) => {
    if (isLoading) return;
    await onSendMessage(q);
  };

  if (!activeReport) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-2xl mx-auto animate-fadeIn">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Active Report Selected</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Please upload a new medical PDF or select an existing document from the Dashboard to begin chatting.
        </p>
        <button
          onClick={() => onNavigate("upload")}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          <span>Select or Upload Medical Report</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn flex flex-col h-[calc(100vh-210px)] min-h-[560px]">
      {/* Active Report Banner */}
      <div className="bg-white border border-teal-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Report:</div>
            <div className="text-xs sm:text-sm font-bold text-teal-950 flex items-center gap-1.5">
              <span>{activeReport.filename}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
            {activeReport.totalChunks} FAISS Vectors
          </span>
          <button
            onClick={() => onNavigate("reports")}
            className="text-[11px] font-medium text-teal-700 hover:underline"
          >
            Switch Report
          </button>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="shrink-0 space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Quick Prompts:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleQuickQuestion(q)}
              className="text-[11px] font-medium bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg px-2.5 py-1 whitespace-nowrap shadow-2xs transition-all disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 overflow-y-auto shadow-xs space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <h4 className="text-sm font-bold text-slate-800">
                Ask anything about {activeReport.filename}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                The chatbot uses <strong>Retrieval-Augmented Generation (RAG)</strong> to answer questions strictly based on the extracted text and values of your document.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isUser
                      ? "bg-slate-800 text-white"
                      : "bg-teal-600 text-white shadow-xs shadow-teal-600/20"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-xs"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Verified Source Citations */}
                  {!isUser && msg.sourcePages && msg.sourcePages.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Grounding:
                      </span>
                      {msg.sourcePages.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            if (msg.retrievedChunks && msg.retrievedChunks.length > 0) {
                              setSelectedCitationChunks(msg.retrievedChunks);
                            }
                          }}
                          className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-semibold transition-all"
                        >
                          <BookOpen className="w-3 h-3 text-sky-600" />
                          <span>Source: Page {pageNum}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>Retrieving relevant chunks & consulting Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Form */}
      <form onSubmit={handleSubmit} className="shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about ${activeReport.filename}... (e.g. 'What abnormal values are listed?')`}
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-xs"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Citation Inspector Modal */}
      {selectedCitationChunks && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl border border-teal-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">Retrieved Grounding Chunks (FAISS)</h4>
              </div>
              <button
                onClick={() => setSelectedCitationChunks(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {selectedCitationChunks.map((chunk, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Snippet {i + 1} • Page {chunk.pageNumber}
                    </span>
                    <span className="text-slate-400">{chunk.charCount} characters</span>
                  </div>
                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                    {chunk.text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
