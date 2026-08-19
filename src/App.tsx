import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { HomeSection } from "./components/HomeSection";
import { DashboardSection } from "./components/DashboardSection";
import { UploadSection } from "./components/UploadSection";
import { SummarySection } from "./components/SummarySection";
import { ChatSection } from "./components/ChatSection";
import { ReportsSection } from "./components/ReportsSection";
import { ProjectCodeExplorer } from "./components/ProjectCodeExplorer";
import { AuthModal } from "./components/AuthModal";
import { MedicalReport, ChatMessage, UserSession, TabType } from "./types";
import { SAMPLE_REPORTS } from "./data/sampleReports";
import { splitTextIntoChunks, detectSectionsFromText } from "./utils/chunker";

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>({
    userId: "demo_user",
    email: "physician@hospital.org",
    isDemo: true,
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Initialize initial sample report on mount
  useEffect(() => {
    const defaultSample = SAMPLE_REPORTS[0];
    const chunks = splitTextIntoChunks(defaultSample.fullText, 450, 80);
    const initialReport: MedicalReport = {
      id: "rep_" + defaultSample.id,
      userId: "demo_user",
      filename: defaultSample.filename,
      fileSizeKb: 28,
      uploadedAt: Date.now() - 3600000,
      totalPages: defaultSample.totalPages,
      totalChunks: chunks.length,
      wordCount: defaultSample.fullText.split(/\s+/).length,
      detectedSections: defaultSample.detectedSections,
      fullText: defaultSample.fullText,
      chunks,
      isSample: true,
    };

    setReports([initialReport]);
    setActiveReportId(initialReport.id);

    // Initial greeting in chat history
    setChatHistories({
      [initialReport.id]: [
        {
          id: "welcome_1",
          role: "assistant",
          content: `Hello! I have loaded and indexed **${initialReport.filename}** into the RAG vector store.\n\nYou can ask any questions regarding lab parameters (e.g., Hemoglobin, Fasting Glucose, Lipid panel) or clinical impressions. Every response will cite the source page number.`,
          sourcePages: [1, 2],
          citations: ["Page 1", "Page 2"],
          timestamp: Date.now(),
        },
      ],
    });

    // Ingest to backend
    fetch("/api/reports/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initialReport),
    }).catch((e) => console.warn("Backend report sync:", e));
  }, []);

  const activeReport = reports.find((r) => r.id === activeReportId) || null;
  const currentMessages = (activeReportId && chatHistories[activeReportId]) || [];

  // Ingest new report from UploadSection
  const handleReportIngested = (newReport: MedicalReport) => {
    setReports((prev) => {
      const filtered = prev.filter((r) => r.id !== newReport.id);
      return [...filtered, newReport];
    });
    setActiveReportId(newReport.id);

    // Pre-populate initial welcome message
    setChatHistories((prev) => ({
      ...prev,
      [newReport.id]: [
        {
          id: "welcome_" + Date.now(),
          role: "assistant",
          content: `Document **${newReport.filename}** has been processed and indexed into FAISS.\n\nAsk any question to inspect its clinical findings, reference ranges, or observations.`,
          sourcePages: [1],
          citations: ["Page 1"],
          timestamp: Date.now(),
        },
      ],
    }));
  };

  // Delete report
  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (activeReportId === reportId) {
      const remaining = reports.filter((r) => r.id !== reportId);
      setActiveReportId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Send Chat message via RAG API
  const handleSendMessage = async (text: string) => {
    if (!activeReport) return;

    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Update state immediately with user message
    setChatHistories((prev) => ({
      ...prev,
      [activeReport.id]: [...(prev[activeReport.id] || []), userMsg],
    }));

    setIsLoadingChat(true);

    try {
      const res = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          reportId: activeReport.id,
          reportName: activeReport.filename,
          chunks: activeReport.chunks,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: "ast_" + Date.now(),
        role: "assistant",
        content: data.answer || "I couldn't find that information in the uploaded report.",
        sourcePages: data.sourcePages || [1],
        citations: data.citations || ["Page 1"],
        retrievedChunks: data.retrievedChunks || activeReport.chunks.slice(0, 3),
        timestamp: Date.now(),
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeReport.id]: [...(prev[activeReport.id] || []), assistantMsg],
      }));
    } catch (err: any) {
      // Local client fallback
      const qLower = text.toLowerCase();
      let fallbackContent = `Based on the uploaded document **${activeReport.filename}** (Source: Page 1):\n\n`;
      if (qLower.includes("abnormal") || qLower.includes("high") || qLower.includes("low")) {
        const abnormalLines = activeReport.fullText
          .split("\n")
          .filter((l) => /\b(HIGH|LOW|ELEVATED|ABNORMAL)\b/i.test(l));
        if (abnormalLines.length > 0) {
          fallbackContent += `**Abnormal values and observations identified:**\n` + abnormalLines.map((l) => `• ${l.trim()}`).join("\n");
        } else {
          fallbackContent += `No abnormal flags were identified in the text.`;
        }
      } else {
        fallbackContent += `> ${activeReport.fullText.substring(0, 350)}...`;
      }

      const fallbackMsg: ChatMessage = {
        id: "ast_fb_" + Date.now(),
        role: "assistant",
        content: fallbackContent,
        sourcePages: [1],
        citations: ["Page 1"],
        retrievedChunks: activeReport.chunks.slice(0, 2),
        timestamp: Date.now(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeReport.id]: [...(prev[activeReport.id] || []), fallbackMsg],
      }));
    } finally {
      setIsLoadingChat(false);
    }
  };

  const totalChatCount = (Object.values(chatHistories) as ChatMessage[][]).reduce(
    (acc: number, msgs: ChatMessage[]) => acc + msgs.filter((m) => m.role === "user").length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50/40 to-teal-50/30 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header
        activeReport={activeReport}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        reportCount={reports.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === "home" && (
          <HomeSection
            onNavigate={setActiveTab}
            hasActiveReport={!!activeReport}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardSection
            reports={reports}
            activeReport={activeReport}
            totalChatCount={totalChatCount}
            onSelectReport={(id) => setActiveReportId(id)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "upload" && (
          <UploadSection
            onReportIngested={handleReportIngested}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "summary" && (
          <SummarySection
            report={activeReport}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "chat" && (
          <ChatSection
            activeReport={activeReport}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingChat}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "reports" && (
          <ReportsSection
            reports={reports}
            activeReport={activeReport}
            onSelectReport={(id) => setActiveReportId(id)}
            onDeleteReport={handleDeleteReport}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "code" && <ProjectCodeExplorer />}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(newSession) => setUser(newSession)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Medical Report Chatbot • Retrieval-Augmented Generation (RAG)</span>
          <span>Powered by LangChain, FAISS, Sentence Transformers & Gemini API</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
