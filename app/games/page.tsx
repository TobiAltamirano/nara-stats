"use client";

import { useState, useEffect } from "react";
import { getGamesList, deleteGame } from "@/app/actions";
import GameCard from "@/components/GameCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default function GamesPage() {
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadGames = async () => {
    try {
      const data = await getGamesList();
      setGamesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await deleteGame(deletingId);
      setToast({ message: "Partido eliminado con éxito", type: "success" });
      setDeletingId(null);
      await loadGames();
    } catch (err: any) {
      setToast({ message: "Error al eliminar partido", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-24">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Eliminar Partido"
        message="¿Estás seguro de que deseas eliminar este partido de las estadísticas? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block">
            Temporada Activa
          </span>
          <h1 className="text-3xl font-bebas tracking-wider text-[#372D2E] leading-none uppercase">
            HISTORIAL DE PARTIDOS
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#DFD6CD]/60 border border-[#DAD0C7] text-[#372D2E] text-xs font-bold px-3 py-1.5 rounded-2xl uppercase tracking-wider">
            {gamesList.length} {gamesList.length === 1 ? "PJ" : "PJ"}
          </span>
          <Link
            href="/new-game"
            className="p-2.5 bg-[#372D2E] text-[#F5F1F0] rounded-2xl hover:opacity-90 transition flex items-center justify-center shadow-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#DFD6CD]/40 border border-[#DAD0C7] rounded-3xl p-8 text-center text-xs font-bold text-[#372D2E]/50 uppercase tracking-wider">
          Cargando partidos...
        </div>
      ) : gamesList.length === 0 ? (
        <div className="bg-[#DFD6CD]/40 border border-[#DAD0C7] p-8 rounded-3xl text-center space-y-3">
          <Calendar className="w-8 h-8 text-[#372D2E]/40 mx-auto" />
          <p className="text-xs font-bold text-[#372D2E]/60 uppercase tracking-wider">
            Aún no hay partidos registrados.
          </p>
          <Link
            href="/games/new"
            className="inline-block bg-[#372D2E] text-[#F5F1F0] text-xs font-bebas tracking-wider px-4 py-2 rounded-xl uppercase"
          >
            Cargar Primer Partido
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {gamesList.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onDeleteRequest={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
