import Link from "next/link";
import { getDashboardData } from "@/app/actions";
import { calculateRating } from "@/lib/stats";
import { Calendar, Plus } from "lucide-react";

export const revalidate = 0;

export default async function GamesPage() {
  const { recentGames } = await getDashboardData(); // Reutilizamos la consulta

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Historial de Partidos
          </h1>
          <p className="text-xs text-gray-500">
            Todos los encuentros registrados
          </p>
        </div>
        <Link
          href="/new-game"
          className="bg-orange-600 text-white p-2 rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Cargar
        </Link>
      </div>

      {recentGames.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">
            No hay partidos en el historial.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentGames.map((game) => {
            const isWin = game.teamScore > game.opponentScore;
            const val = calculateRating(game);

            return (
              <div
                key={game.id}
                className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{isWin ? "🟢" : "🔴"}</span>
                    <span className="text-xs font-bold text-gray-900">
                      {game.location === "home" ? "vs" : "@"}{" "}
                      {game.opponent?.name || "Rival"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(game.date).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-base font-black text-gray-900">
                      Platense {game.teamScore} - {game.opponentScore}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {game.location === "home"
                        ? "Condición: Local"
                        : "Condición: Visitante"}
                    </div>
                  </div>

                  <div className="text-right bg-orange-50 px-3 py-1.5 rounded-xl">
                    <div className="text-xs font-black text-orange-900">
                      {game.playerPoints ?? 0} PTS
                    </div>
                    <div className="text-[10px] font-bold text-orange-600">
                      {val} VAL
                    </div>
                  </div>
                </div>

                {game.notes && (
                  <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg mt-1">
                    "{game.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
