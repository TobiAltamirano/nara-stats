import Link from "next/link";
import { getOpponentsList } from "@/app/actions";
import { Users, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function OpponentsPage() {
  const opponents = await getOpponentsList();

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Rivales</h1>
        <p className="text-xs text-gray-500">
          Clubes enfrentados en la temporada
        </p>
      </div>

      {opponents.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">
            Aún no hay rivales registrados.
          </p>
          <p className="text-xs text-gray-400">
            Se crearán automáticamente cuando cargues un partido.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {opponents.map((opp) => (
            <Link
              key={opp.id}
              href={`/opponents/${opp.id}`}
              className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-orange-200 transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700 text-sm">
                  🆚
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {opp.name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Ver historial de partidos
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
