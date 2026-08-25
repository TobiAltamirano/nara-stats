"use client";

import { useMemo, useState } from "react";
import { calculateStats, type Game } from "@/lib/stats";
import { Trophy, Award, MapPin } from "lucide-react";

type GameWithOpponent = Game & { opponent: { id: string; name: string } };

interface DashboardStatsProps {
  games: GameWithOpponent[];
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

  const stats = useMemo(() => calculateStats(filteredGames), [filteredGames]);

  return (
    <div className="space-y-6">
      {/* Filtro de tendencia estilo píldora */}
      <div className="flex gap-1.5 bg-[#DAD0C7]/50 p-1.5 rounded-full border border-[#DAD0C7]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 text-[11px] font-bold py-2 rounded-full transition ${
              filter === f.value
                ? "bg-[#372D2E] text-[#F5F1F0] shadow-sm"
                : "text-[#372D2E]/70 hover:text-[#372D2E]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* BLOQUE 1: Resumen General del Equipo */}
      <div className="space-y-2">
        <h2 className="font-bebas text-xl text-[#372D2E] tracking-wider uppercase flex items-center gap-1.5 px-1">
          <Trophy className="w-4 h-4 text-[#372D2E]" /> Resumen del Equipo
        </h2>
        <div className="grid grid-cols-4 gap-2 bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] text-center">
          <div>
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              PJ
            </span>
            <span className="font-bebas text-2xl text-[#372D2E] leading-tight">
              {stats.gamesPlayed}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              G
            </span>
            <span className="font-bebas text-2xl text-emerald-800 leading-tight">
              {stats.wins}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              P
            </span>
            <span className="font-bebas text-2xl text-rose-800 leading-tight">
              {stats.losses}
            </span>
          </div>
          <div className="bg-[#372D2E] text-[#F5F1F0] rounded-2xl py-1 flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
              Win %
            </span>
            <span className="font-bebas text-xl text-[#DFD6CD] leading-none">
              {stats.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: Performance de Nara */}
      <div className="space-y-2">
        <h2 className="font-bebas text-xl text-[#372D2E] tracking-wider uppercase flex items-center gap-1.5 px-1">
          <Award className="w-4 h-4 text-[#372D2E]" /> Performance de Nara
        </h2>

        {/* Promedios clave (Tarjeta Oscura Hero) */}
        <div className="grid grid-cols-4 gap-2 bg-[#372D2E] text-[#F5F1F0] p-4 rounded-3xl text-center shadow-sm">
          <div>
            <div className="font-bebas text-3xl text-[#DFD6CD] leading-none">
              {stats.averages.points}
            </div>
            <div className="text-[9px] text-[#F5F1F0]/70 font-bold uppercase mt-1">
              PTS /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-3xl text-[#F5F1F0] leading-none">
              {stats.averages.rebounds}
            </div>
            <div className="text-[9px] text-[#F5F1F0]/70 font-bold uppercase mt-1">
              REB /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-3xl text-[#F5F1F0] leading-none">
              {stats.averages.assists}
            </div>
            <div className="text-[9px] text-[#F5F1F0]/70 font-bold uppercase mt-1">
              AST /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-3xl text-[#DFD6CD] leading-none">
              {stats.averages.rating}
            </div>
            <div className="text-[9px] text-[#F5F1F0]/70 font-bold uppercase mt-1">
              VAL /PJ
            </div>
          </div>
        </div>

        {/* Promedios secundarios */}
        <div className="grid grid-cols-4 gap-2 bg-[#DFD6CD]/60 p-3.5 rounded-3xl border border-[#DAD0C7] text-center">
          <div>
            <div className="font-bebas text-xl text-[#372D2E]">
              {stats.averages.steals}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 font-bold uppercase">
              ROB /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-xl text-[#372D2E]">
              {stats.averages.turnovers}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 font-bold uppercase">
              PÉRD /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-xl text-[#372D2E]">
              {stats.averages.twoPointers}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 font-bold uppercase">
              2PT /PJ
            </div>
          </div>
          <div>
            <div className="font-bebas text-xl text-[#372D2E]">
              {stats.averages.freeThrows}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 font-bold uppercase">
              TL /PJ
            </div>
          </div>
        </div>

        {/* Totales y Récords secundarios */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#DAD0C7]/50 p-3 rounded-2xl border border-[#DAD0C7] text-center">
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              Máx. Puntos
            </span>
            <span className="font-bebas text-xl text-[#372D2E]">
              {stats.records.maxPoints}{" "}
              <span className="text-xs font-sans">PTS</span>
            </span>
          </div>
          <div className="bg-[#DAD0C7]/50 p-3 rounded-2xl border border-[#DAD0C7] text-center">
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              Triples Totales
            </span>
            <span className="font-bebas text-xl text-[#372D2E]">
              {stats.totals.threePointers} 🎯
            </span>
          </div>
          <div className="bg-[#DAD0C7]/50 p-3 rounded-2xl border border-[#DAD0C7] text-center">
            <span className="text-[10px] text-[#372D2E]/70 font-bold block uppercase">
              Total Puntos
            </span>
            <span className="font-bebas text-xl text-[#372D2E]">
              {stats.totals.points}{" "}
              <span className="text-xs font-sans">PTS</span>
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: Local vs. Visitante */}
      <div className="space-y-2">
        <h2 className="font-bebas text-xl text-[#372D2E] tracking-wider uppercase flex items-center gap-1.5 px-1">
          <MapPin className="w-4 h-4 text-[#372D2E]" /> Local vs. Visitante
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#372D2E]">🏠 Local</span>
              <span className="font-bebas text-xl text-[#372D2E]">
                {stats.homeStats.winRate}%
              </span>
            </div>
            <div className="text-[11px] text-[#372D2E]/70 font-medium">
              {stats.homeStats.games} PJ ({stats.homeStats.wins}G -{" "}
              {stats.homeStats.losses}P)
            </div>
          </div>

          <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#372D2E]">
                ✈️ Visitante
              </span>
              <span className="font-bebas text-xl text-[#372D2E]">
                {stats.awayStats.winRate}%
              </span>
            </div>
            <div className="text-[11px] text-[#372D2E]/70 font-medium">
              {stats.awayStats.games} PJ ({stats.awayStats.wins}G -{" "}
              {stats.awayStats.losses}P)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
