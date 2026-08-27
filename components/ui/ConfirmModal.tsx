"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372D2E]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5F1F0] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#DAD0C7] space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border ${
                isDanger
                  ? "bg-red-500/10 border-red-500/20 text-red-600"
                  : "bg-[#DFD6CD] border-[#DAD0C7] text-[#372D2E]"
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bebas tracking-wider text-[#372D2E] leading-none uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[#372D2E]/50 hover:text-[#372D2E] p-1 rounded-xl transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-xs font-medium text-[#372D2E]/80 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-3 bg-[#DFD6CD]/50 border border-[#DAD0C7] hover:bg-[#DAD0C7] text-[#372D2E] rounded-2xl text-xs font-bold tracking-wider uppercase transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold tracking-wider text-[#F5F1F0] transition disabled:opacity-50 uppercase shadow-sm ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#372D2E] hover:opacity-90"
            }`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
