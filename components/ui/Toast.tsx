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
            ? "bg-gray-900 text-white border-zinc-800"
            : "bg-red-600 text-white border-red-500"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="p-1 opacity-70 hover:opacity-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
