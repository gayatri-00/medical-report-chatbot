import React from "react";
import { Home, LayoutDashboard, UploadCloud, FileSpreadsheet, MessageSquareQuote, Files, Code2 } from "lucide-react";
import { TabType } from "../types";

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  reportCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  reportCount,
}) => {
  const tabs = [
    { id: "home" as TabType, label: "Home", icon: Home },
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "upload" as TabType, label: "Upload Report", icon: UploadCloud },
    { id: "summary" as TabType, label: "Report Summary", icon: FileSpreadsheet },
    { id: "chat" as TabType, label: "Medical Chat", icon: MessageSquareQuote },
    { id: "reports" as TabType, label: `My Reports (${reportCount})`, icon: Files },
    { id: "code" as TabType, label: "Python & GitHub Code", icon: Code2 },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xs border-b border-slate-200/80 sticky top-[77px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-xs shadow-teal-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
