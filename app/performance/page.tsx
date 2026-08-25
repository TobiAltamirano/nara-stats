import { getDashboardData } from "@/app/actions";
import PerformanceTrend from "@/components/PerformanceTrend";
import { TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function PerformancePage() {
  const { allGames } = await getDashboardData();

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Desempeño</h1>
          <p className="text-xs text-gray-500">
            Evolución de las estadísticas de Nara, partido a partido
          </p>
        </div>
      </div>

      <PerformanceTrend games={allGames} />
    </div>
  );
}
