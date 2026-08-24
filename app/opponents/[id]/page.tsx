import { getOpponentDetail } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import { Trophy, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function OpponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // 👈 Actualizado a Promise
}) {
  const { id } = await params; // 👈 Hacemos await de params
  const { opponent, stats, games } = await getOpponentDetail(id);

  return (
    <div className="space-y-5 pb-6">
      {/* Header Rival */}
      <div className="flex items-center gap-3">
        <Link
          href="/opponents"
          className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Histórico VS
          </span>
          <h1 className="text-2xl font-black text-gray-900">
            🆚 {opponent.name}
          </h1>
        </div>
      </div>

      {/* Récord del Equipo contra este rival */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5 text-orange-600" /> Record Colectivo
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-xs text-gray-400 block">Partidos</span>
            <span className="text-xl font-black text-gray-900">
              {stats.gamesPlayed} PJ
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Balance</span>
            <span className="text-xl font-black text-gray-900">
              <span className="text-green-600">{stats.wins}G</span> -{" "}
              <span className="text-red-500">{stats.losses}P</span>
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Win Rate</span>
            <span className="text-xl font-black text-orange-600">
              {stats.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Promedios de Nara contra este rival */}
      <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5 text-orange-500" /> Promedios de Nara vs{" "}
          {opponent.name}
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-orange-400">
              {stats.averages.points}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-medium">
              PTS / Partido
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-green-400">
              {stats.averages.rating}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-medium">
              VAL / Partido
            </div>
          </div>
        </div>
      </div>

      {/* Enfrentamientos Directos */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Enfrentamientos Directos
        </h2>
        <div className="space-y-2">
          {games.map((g) => {
            const isWin = g.teamScore > g.opponentScore;
            const val = calculateRating(g);

            return (
              <div
                key={g.id}
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(g.date).toLocaleDateString("es-AR")} —{" "}
                    {g.location === "home" ? "Local" : "Visitante"}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {isWin ? "🟢" : "🔴"} Platense {g.teamScore} -{" "}
                    {g.opponentScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-gray-900">
                    Nara: {g.playerPoints ?? 0} pts
                  </div>
                  <div className="text-[10px] text-orange-600 font-bold">
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
