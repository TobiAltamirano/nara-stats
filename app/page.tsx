import Link from "next/link";
import { getDashboardData } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import {
  Trophy,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  MapPin,
} from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const { player, stats, recentGames } = await getDashboardData();

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Header */}
      <div className="flex items-center justify-between bg-zinc-900 text-white p-4 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-600 px-2 py-0.5 rounded text-white">
              Temporada 2026
            </span>
            <span className="text-xs text-zinc-400">Platense Básquet</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            {player.name}
          </h1>
        </div>
        <div className="w-11 h-11 bg-orange-600/20 text-orange-500 rounded-xl flex items-center justify-center font-bold text-xl border border-orange-500/30">
          🏀
        </div>
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

      {/* BLOQUE 4: Últimos Partidos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange-600" /> Últimos
            Partidos
          </h2>
          <Link
            href="/games"
            className="text-xs text-orange-600 font-semibold flex items-center gap-0.5 hover:underline"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {recentGames.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-3">
              No hay partidos registrados aún.
            </p>
            <Link
              href="/new-game"
              className="inline-block bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
            >
              + Cargar Primer Partido
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentGames.map((game) => {
              const isWin = game.teamScore > game.opponentScore;
              const val = calculateRating(game);

              return (
                <div
                  key={game.id}
                  className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{isWin ? "🟢" : "🔴"}</span>
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {game.location === "home" ? "vs" : "@"}{" "}
                        {game.opponent?.name || "Rival"}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Platense {game.teamScore} - {game.opponentScore}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-gray-900">
                      {game.playerPoints ?? 0} pts
                    </div>
                    <div className="text-[10px] text-orange-600 font-medium">
                      {val} VAL
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
