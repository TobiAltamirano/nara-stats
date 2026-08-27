import { getOpponentDetail } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import { Trophy, Award, ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function OpponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { opponent, stats, games } = await getOpponentDetail(id);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-6">
      {/* Header Rival */}
      <div className="flex items-center gap-3">
        <Link
          href="/opponents"
          className="p-3 bg-[#DFD6CD]/60 hover:bg-[#DFD6CD] rounded-2xl border border-[#DAD0C7] text-[#372D2E] transition flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>

        {/* Escudo Grande */}
        <div className="w-12 h-12 bg-[#DFD6CD]/60 rounded-2xl border border-[#DAD0C7] flex items-center justify-center p-1 shrink-0 overflow-hidden">
          {opponent.logoUrl ? (
            <img
              src={opponent.logoUrl}
              alt={opponent.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xl">🆚</span>
          )}
        </div>

        <div className="min-w-0">
          <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block">
            Histórico VS
          </span>
          <h1 className="text-3xl font-bebas tracking-wider text-[#372D2E] leading-none truncate uppercase">
            {opponent.name}
          </h1>
        </div>
      </div>

      {/* Récord del Equipo contra este rival */}
      <div className="bg-[#DFD6CD]/60 p-5 rounded-3xl border border-[#DAD0C7]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#372D2E]/70 uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4 text-[#372D2E]" /> Record Colectivo
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#DFD6CD] p-3 rounded-2xl border border-[#DAD0C7]">
            <span className="text-[10px] font-bold text-[#372D2E]/70 block uppercase">
              Partidos
            </span>
            <span className="text-2xl font-bebas text-[#372D2E] leading-none">
              {stats.gamesPlayed} PJ
            </span>
          </div>
          <div className="bg-[#DFD6CD] p-3 rounded-2xl border border-[#DAD0C7]">
            <span className="text-[10px] font-bold text-[#372D2E]/70 block uppercase">
              Balance
            </span>
            <span className="text-2xl font-bebas text-[#372D2E] leading-none">
              <span className="text-emerald-700">{stats.wins}G</span> -{" "}
              <span className="text-red-700">{stats.losses}P</span>
            </span>
          </div>
          <div className="bg-[#DFD6CD] p-3 rounded-2xl border border-[#DAD0C7]">
            <span className="text-[10px] font-bold text-[#372D2E]/70 block uppercase">
              Win Rate
            </span>
            <span className="text-2xl font-bebas text-[#372D2E] leading-none">
              {stats.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Promedios de Nara contra este rival */}
      <div className="bg-[#372D2E] text-[#F5F1F0] p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#DFD6CD]/80 uppercase tracking-wider mb-3">
          <Award className="w-4 h-4 text-[#DFD6CD]" /> Promedios de Nara vs{" "}
          {opponent.name}
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#DFD6CD]/10 p-3 rounded-2xl border border-[#DFD6CD]/20">
            <div className="text-3xl font-bebas text-[#DFD6CD] leading-none">
              {stats.averages.points}
            </div>
            <div className="text-[10px] text-[#DFD6CD]/70 uppercase font-bold mt-1">
              PTS / Partido
            </div>
          </div>
          <div className="bg-[#DFD6CD]/10 p-3 rounded-2xl border border-[#DFD6CD]/20">
            <div className="text-3xl font-bebas text-emerald-400 leading-none">
              {stats.averages.rating}
            </div>
            <div className="text-[10px] text-[#DFD6CD]/70 uppercase font-bold mt-1">
              VAL / Partido
            </div>
          </div>
        </div>
      </div>

      {/* Totales Históricos de Nara vs este rival */}
      <div className="bg-[#DFD6CD]/60 p-5 rounded-3xl border border-[#DAD0C7]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#372D2E]/70 uppercase tracking-wider mb-3">
          <BarChart3 className="w-4 h-4 text-[#372D2E]" /> Totales Históricos vs{" "}
          {opponent.name}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.points}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Puntos
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.rebounds}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Rebotes
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.assists}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Asist.
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.steals}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Robos
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.turnovers}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Pérd.
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.threePointers}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Triples
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.twoPointers}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              Dobles
            </div>
          </div>
          <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div className="text-xl font-bebas text-[#372D2E] leading-none">
              {stats.totals.freeThrows}
            </div>
            <div className="text-[9px] text-[#372D2E]/70 uppercase font-bold">
              T. Libres
            </div>
          </div>
        </div>
      </div>

      {/* Enfrentamientos Directos */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#372D2E]/70 uppercase tracking-wider">
          Enfrentamientos Directos
        </h2>
        <div className="space-y-2.5">
          {games.map((g) => {
            const isWin = g.teamScore > g.opponentScore;
            const val = calculateRating(g);

            return (
              <div
                key={g.id}
                className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wide">
                    {new Date(g.date).toLocaleDateString("es-AR")} —{" "}
                    {g.location === "home" ? "🏠 Local" : "✈️ Visitante"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-[#F5F1F0] ${
                        isWin ? "bg-emerald-700" : "bg-red-700"
                      }`}
                    >
                      {isWin ? "VIC" : "DER"}
                    </span>
                    <span className="text-sm font-bold text-[#372D2E]">
                      Platense {g.teamScore} - {g.opponentScore}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bebas text-2xl text-[#372D2E] leading-none">
                    {g.playerPoints ?? 0}{" "}
                    <span className="text-xs font-sans text-[#372D2E]/70">
                      pts
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider">
                    {val} VAL
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
