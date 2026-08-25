"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
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

  // Temporadas (años) disponibles, de más reciente a más vieja
  const seasons = useMemo(() => {
    const years = new Set<number>();
    for (const g of gamesList) years.add(new Date(g.date).getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [gamesList]);

  const filteredGames = useMemo(() => {
    if (selectedYear === "all") return gamesList;
    return gamesList.filter(
      (g) => new Date(g.date).getFullYear() === selectedYear,
    );
  }, [gamesList, selectedYear]);

  // Agrupar los partidos filtrados por temporada, manteniendo el orden desc por fecha dentro de cada grupo
  const groupedBySeason = useMemo(() => {
    const groups = new Map<number, typeof filteredGames>();
    for (const g of filteredGames) {
      const year = new Date(g.date).getFullYear();
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(g);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [filteredGames]);

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

      {/* Header Soft-Brutalist */}
      <div className="flex items-center justify-between bg-[#372D2E] text-[#F5F1F0] p-5 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#DFD6CD] text-[#372D2E] rounded-full flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-bebas tracking-wider text-[#F5F1F0] leading-none uppercase">
              Partidos
            </h1>
            <p className="text-xs text-[#DFD6CD]/80 font-medium mt-0.5">
              Historial de la temporada activa
            </p>
          </div>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2">
          <span className="bg-[#DFD6CD]/20 text-[#DFD6CD] border border-[#DFD6CD]/30 text-xs font-bold px-3 p-2.5 rounded-2xl uppercase tracking-wider">
            {filteredGames.length} PJ
          </span>
          <Link
            href="/new-game"
            className="p-2.5 bg-[#DFD6CD] text-[#372D2E] rounded-2xl hover:bg-[#F5F1F0] transition flex items-center justify-center shadow-sm"
            title="Nuevo Partido"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Filtro de temporada */}
      {seasons.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <button
            onClick={() => setSelectedYear("all")}
            className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
              selectedYear === "all"
                ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
            }`}
          >
            Todas las temporadas
          </button>
          {seasons.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                selectedYear === year
                  ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                  : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

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
            href="/new-game"
            className="inline-block bg-[#372D2E] text-[#F5F1F0] text-xs font-bebas tracking-wider px-4 py-2 rounded-xl uppercase"
          >
            Cargar Primer Partido
          </Link>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-[#DFD6CD]/40 border border-[#DAD0C7] p-8 rounded-3xl text-center">
          <p className="text-xs font-bold text-[#372D2E]/60 uppercase tracking-wider">
            No hay partidos en esta temporada.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedBySeason.map(([year, seasonGames]) => (
            <div key={year} className="space-y-3">
              {/* Corte visual por temporada */}
              <div className="flex items-center gap-3 px-0.5">
                <h2 className="font-bebas text-2xl tracking-wide text-[#372D2E] uppercase leading-none">
                  Temporada {year}
                </h2>
                <span className="flex-1 h-px bg-[#DAD0C7]" />
                <span className="text-[10px] font-bold text-[#372D2E]/50 uppercase tracking-wider shrink-0">
                  {seasonGames.length} PJ
                </span>
              </div>

              <div className="space-y-3">
                {seasonGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onDeleteRequest={(id) => setDeletingId(id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
