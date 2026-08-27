import Link from "next/link";
import { getDashboardData } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import DashboardStats from "@/components/DashboardStats";
import { Calendar, ChevronRight, Plus } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const { player, recentGames, allGames } = await getDashboardData();
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-6">
      {/* Hero Card estilo Brutalista Oscuro */}
      <div className="bg-[#372D2E] text-[#F5F1F0] p-6 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#DFD6CD]/20 px-3 py-1 rounded-full text-[11px] font-semibold text-[#DFD6CD] tracking-wide">
              <span>TEMPORADA {currentYear}</span>
              <span>•</span>
              <span>PLATENSE</span>
            </div>
            <h1 className="text-4xl font-bebas tracking-wider text-[#F5F1F0] leading-none pt-2 uppercase">
              {player.name}
            </h1>
          </div>

          <div className="w-12 h-12 bg-[#DFD6CD] text-[#372D2E] rounded-full flex items-center justify-center font-bebas text-2xl shadow-inner font-bold">
            #7
          </div>
        </div>
      </div>

      {/* BLOQUES DE ESTADÍSTICAS */}
      <DashboardStats games={allGames} />

      {/* ÚLTIMOS PARTIDOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bebas text-xl text-[#372D2E] tracking-wider uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#372D2E]" /> Últimos Partidos
          </h2>
          <Link
            href="/games"
            className="text-xs text-[#372D2E] font-bold flex items-center gap-0.5 hover:opacity-75 transition"
          >
            VER TODOS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentGames.length === 0 ? (
          <div className="bg-[#DAD0C7]/40 p-8 rounded-[32px] border border-[#DAD0C7] text-center space-y-3">
            <p className="text-xs text-[#372D2E]/70 font-medium">
              No hay partidos registrados aún.
            </p>
            <Link
              href="/new-game"
              className="inline-flex items-center gap-1.5 bg-[#372D2E] text-[#F5F1F0] text-xs font-bold px-5 py-3 rounded-full shadow-sm hover:bg-[#372D2E]/90 transition"
            >
              <Plus className="w-4 h-4" /> Cargar Primer Partido
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentGames.map((game) => {
              const isWin = game.teamScore > game.opponentScore;
              const val = calculateRating(game);

              return (
                <div
                  key={game.id}
                  className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] flex items-center justify-between transition hover:bg-[#DFD6CD]/90"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-[#F5F1F0] ${
                        isWin ? "bg-emerald-700" : "bg-red-700"
                      }`}
                    >
                      {isWin ? "VIC" : "DER"}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#372D2E]">
                        {game.location === "home" ? "🏠" : "✈️"}{" "}
                        {game.opponent?.name || "Rival"}
                      </div>
                      <div className="text-[11px] text-[#372D2E]/70 font-medium">
                        Platense {game.teamScore} - {game.opponentScore}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bebas text-2xl text-[#372D2E] leading-none">
                      {game.playerPoints ?? 0}{" "}
                      <span className="text-xs font-sans text-[#372D2E]/70">
                        PTS
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-[#372D2E]/60 uppercase tracking-wider">
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
