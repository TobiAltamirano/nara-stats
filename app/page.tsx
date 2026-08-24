import Link from "next/link";
import { getDashboardData } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import DashboardStats from "@/components/DashboardStats";
import { Calendar, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const { player, recentGames, allGames } = await getDashboardData();

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

      {/* BLOQUES 1-3: Resumen, Performance y Local/Visitante — con filtro de tendencia */}
      <DashboardStats games={allGames} />

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
