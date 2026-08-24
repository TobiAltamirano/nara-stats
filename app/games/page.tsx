"use client";

import { useState, useEffect } from "react";
import { getGamesList, deleteGame } from "@/app/actions";
import GameCard from "@/components/GameCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";

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
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
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

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Historial de Partidos
        </h1>
        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
          {gamesList.length} partidos
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-400">
          Cargando partidos...
        </div>
      ) : gamesList.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-gray-400 text-xs">
          Aún no hay partidos registrados.
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
