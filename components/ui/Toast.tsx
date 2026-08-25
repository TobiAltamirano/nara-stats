"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce-short">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl shadow-xl border text-xs font-semibold ${
          type === "success"
            ? "bg-[#372D2E] text-[#F5F1F0] border-[#DAD0C7]"
            : "bg-red-700 text-[#F5F1F0] border-red-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-200 stroke-[2.5]" />
          )}
          <span className="tracking-wide">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 opacity-70 hover:opacity-100 transition"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
