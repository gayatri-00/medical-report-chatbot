import React, { useState } from "react";
import { X, Lock, Mail, UserCheck, ShieldCheck, Sparkles } from "lucide-react";
import { UserSession } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const userId = "usr_" + Math.random().toString(36).slice(2, 9);
    const session: UserSession = {
      userId,
      email: email.trim().toLowerCase(),
      isDemo: false,
    };

    onLoginSuccess(session);
    onClose();
  };

  const handleDemoLogin = () => {
    const session: UserSession = {
      userId: "demo_dr_reed",
      email: "demo.doctor@hospital.org",
      isDemo: true,
    };
    onLoginSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 space-y-5 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              {mode === "login" ? "Firebase Sign In" : "Create Account"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "login" ? "bg-white text-teal-700 shadow-2xs" : "text-slate-500"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "signup" ? "bg-white text-teal-700 shadow-2xs" : "text-slate-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all"
          >
            {mode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-semibold hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Use One-Click Demo Physician Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
