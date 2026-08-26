"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getOpponentsWithRecord,
  createOpponent,
  updateOpponent,
  deleteOpponent,
} from "@/app/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { Users, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";

interface Opponent {
  id: string;
  name: string;
  wins: number;
  losses: number;
  diff: number;
}

export default function OpponentsPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  // Alta
  const [newOpponentName, setNewOpponentName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edición inline
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const [editName, setEditName] = useState("");

  // Modal & Toast
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadOpponents = async () => {
    try {
      const list = await getOpponentsWithRecord();
      setOpponents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpponents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponentName.trim()) return;

    setCreating(true);
    try {
      await createOpponent(newOpponentName);
      setNewOpponentName("");
      setToast({ message: "Rival agregado con éxito", type: "success" });
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al agregar rival",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingOpponent || !editName.trim()) return;

    setActionLoading(true);
    try {
      await updateOpponent(editingOpponent.id, editName);
      setEditingOpponent(null);
      setEditName("");
      setToast({ message: "Rival actualizado con éxito", type: "success" });
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al actualizar rival",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setActionLoading(true);
    try {
      await deleteOpponent(deletingId);
      setToast({ message: "Rival eliminado con éxito", type: "success" });
      setDeletingId(null);
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al eliminar rival",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Eliminar Rival"
        message="¿Estás seguro de que deseas eliminar este rival? Esta acción no se puede deshacer. No se podrá eliminar si tiene partidos registrados."
        confirmText="Eliminar"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Header Soft-Brutalist */}
      <div className="flex items-center gap-3 bg-[#372D2E] text-[#F5F1F0] p-5 rounded-[32px] shadow-sm">
        <div className="w-12 h-12 bg-[#DFD6CD] text-[#372D2E] rounded-full flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-bebas tracking-wider text-[#F5F1F0] leading-none uppercase">
            Rivales
          </h1>
          <p className="text-xs text-[#DFD6CD]/80 font-medium mt-0.5">
            Clubes enfrentados en la temporada
          </p>
        </div>
      </div>

      {/* Alta rápida de rival */}
      <form
        onSubmit={handleCreate}
        className="flex gap-2 bg-[#DFD6CD]/60 p-2.5 rounded-3xl border border-[#DAD0C7]"
      >
        <input
          type="text"
          placeholder="Nombre del nuevo rival..."
          value={newOpponentName}
          onChange={(e) => setNewOpponentName(e.target.value)}
          className="flex-1 bg-[#F5F1F0] px-4 py-2 rounded-2xl border border-[#DAD0C7] text-sm text-[#372D2E] placeholder-[#372D2E]/40 focus:outline-none focus:ring-2 focus:ring-[#372D2E]"
        />
        <button
          type="submit"
          disabled={creating || !newOpponentName.trim()}
          className="bg-[#372D2E] text-[#F5F1F0] px-4 rounded-2xl font-bold text-xs flex items-center gap-1.5 hover:bg-[#372D2E]/90 transition disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </form>

      {/* Listado de rivales */}
      {loading ? (
        <div className="text-center py-10 text-xs text-[#372D2E]/60 font-medium">
          Cargando rivales...
        </div>
      ) : opponents.length === 0 ? (
        <div className="bg-[#DAD0C7]/40 p-8 rounded-3xl border border-dashed border-[#DAD0C7] text-center space-y-2">
          <Users className="w-8 h-8 text-[#372D2E]/40 mx-auto" />
          <p className="text-sm font-bold text-[#372D2E]">
            Aún no hay rivales registrados.
          </p>
          <p className="text-xs text-[#372D2E]/60">
            Agregalo arriba, o se creará automáticamente al cargar un partido.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {opponents.map((opp) => (
            <div
              key={opp.id}
              className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] transition"
            >
              {editingOpponent?.id === opp.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-[#F5F1F0] p-2 rounded-xl border border-[#DAD0C7] text-sm text-[#372D2E] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={actionLoading}
                    className="bg-emerald-700 text-[#F5F1F0] px-3 py-2 rounded-xl text-xs font-bold transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingOpponent(null)}
                    disabled={actionLoading}
                    className="bg-[#DAD0C7] text-[#372D2E] px-3 py-2 rounded-xl text-xs font-bold transition hover:bg-[#DAD0C7]/80"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link
                    href={`/opponents/${opp.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 bg-[#DAD0C7] rounded-2xl flex items-center justify-center text-base shrink-0 border border-[#DAD0C7]/80">
                      🆚
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#372D2E] truncate">
                          {opp.name}
                        </span>
                        {opp.wins + opp.losses > 0 && (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 text-[#F5F1F0] ${
                              opp.diff > 0
                                ? "bg-emerald-700"
                                : opp.diff < 0
                                  ? "bg-[#AF0203]"
                                  : "bg-[#372D2E]/70"
                            }`}
                          >
                            {opp.diff > 0 ? `+${opp.diff}` : opp.diff}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-[#372D2E]/60">
                        {opp.wins + opp.losses > 0
                          ? `${opp.wins}G - ${opp.losses}P`
                          : "Ver historial de partidos"}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingOpponent(opp);
                        setEditName(opp.name);
                      }}
                      className="p-2 text-[#372D2E]/70 hover:text-[#372D2E] hover:bg-[#DAD0C7]/50 rounded-full transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(opp.id)}
                      className="p-2 text-[#AF0203] hover:text-[#AF0203]/70 hover:bg-[#AF0203] rounded-full transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/opponents/${opp.id}`}
                      className="p-2 text-[#372D2E]/70 hover:text-[#372D2E] hover:bg-[#DAD0C7]/50 rounded-full transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
