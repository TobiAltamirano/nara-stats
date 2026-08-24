"use client";

import { useMemo, useState } from "react";
import { calculateStats, type Game } from "@/lib/stats";
import { Trophy, Award, MapPin } from "lucide-react";

type GameWithOpponent = Game & { opponent: { id: string; name: string } };

interface DashboardStatsProps {
  games: GameWithOpponent[]; // ordenados desc por fecha (más reciente primero)
}

type FilterOption = "5" | "10" | "all";

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "5", label: "Últimos 5" },
  { value: "10", label: "Últimos 10" },
  { value: "all", label: "Toda la temporada" },
];

export default function DashboardStats({ games }: DashboardStatsProps) {
  const [filter, setFilter] = useState<FilterOption>("all");

  const filteredGames = useMemo(() => {
    if (filter === "all") return games;
    return games.slice(0, Number(filter));
  }, [games, filter]);

  const stats = useMemo(
    () => calculateStats(filteredGames),
    [filteredGames],
  );

  return (
    <div className="space-y-5">
      {/* Filtro de tendencia */}
      <div className="flex gap-1.5 bg-gray-200/70 p-1 rounded-xl">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition ${
              filter === f.value
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* BLOQUE 1: Resumen General del Equipo */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-orange-600" /> Resumen del Equipo
        </h2>
        <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block">
              PJ
            </span>
            <span className="text-lg font-black text-gray-900">
              {stats.gamesPlayed}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block">
              G
            </span>
            <span className="text-lg font-black text-green-600">
              {stats.wins}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block">
              P
            </span>
            <span className="text-lg font-black text-red-500">
              {stats.losses}
            </span>
          </div>
          <div className="bg-orange-50 rounded-xl py-0.5">
            <span className="text-[9px] text-orange-800 font-bold block uppercase">
              Win Rate
            </span>
            <span className="text-lg font-black text-orange-600">
              {stats.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: Performance de Nara */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-orange-600" /> Performance de Nara
        </h2>

        {/* Promedios clave */}
        <div className="grid grid-cols-4 gap-2 bg-gray-900 text-white p-3.5 rounded-2xl shadow-sm text-center">
          <div>
            <div className="text-lg font-black text-orange-400">
              {stats.averages.points}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium uppercase">
              PTS /PJ
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-white">
              {stats.averages.rebounds}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium uppercase">
              REB /PJ
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-white">
              {stats.averages.assists}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium uppercase">
              AST /PJ
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-green-400">
              {stats.averages.rating}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium uppercase">
              VAL /PJ
            </div>
          </div>
        </div>

        {/* Promedios secundarios (antes faltantes) */}
        <div className="grid grid-cols-4 gap-2 mt-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div>
            <div className="text-sm font-black text-gray-800">
              {stats.averages.steals}
            </div>
            <div className="text-[9px] text-gray-400 font-medium uppercase">
              ROB /PJ
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-gray-800">
              {stats.averages.turnovers}
            </div>
            <div className="text-[9px] text-gray-400 font-medium uppercase">
              PÉRD /PJ
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-gray-800">
              {stats.averages.twoPointers}
            </div>
            <div className="text-[9px] text-gray-400 font-medium uppercase">
              2PT /PJ
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-gray-800">
              {stats.averages.freeThrows}
            </div>
            <div className="text-[9px] text-gray-400 font-medium uppercase">
              TL /PJ
            </div>
          </div>
        </div>

        {/* Totales y Récords secundarios */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] text-gray-400 font-medium block">
              Máx. Puntos
            </span>
            <span className="text-sm font-black text-gray-800">
              {stats.records.maxPoints} pts
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] text-gray-400 font-medium block">
              Triples Totales
            </span>
            <span className="text-sm font-black text-gray-800">
              {stats.totals.threePointers} 🎯
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] text-gray-400 font-medium block">
              Total Puntos
            </span>
            <span className="text-sm font-black text-gray-800">
              {stats.totals.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: Local vs. Visitante */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-orange-600" /> Local vs. Visitante
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-800">🏠 Local</span>
              <span className="text-xs font-black text-orange-600">
                {stats.homeStats.winRate}%
              </span>
            </div>
            <div className="text-[11px] text-gray-500">
              {stats.homeStats.games} PJ ({stats.homeStats.wins}G -{" "}
              {stats.homeStats.losses}P)
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-800">
                ✈️ Visitante
              </span>
              <span className="text-xs font-black text-orange-600">
                {stats.awayStats.winRate}%
              </span>
            </div>
            <div className="text-[11px] text-gray-500">
              {stats.awayStats.games} PJ ({stats.awayStats.wins}G -{" "}
              {stats.awayStats.losses}P)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
