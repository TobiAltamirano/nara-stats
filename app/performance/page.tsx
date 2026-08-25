import { getDashboardData } from "@/app/actions";
import PerformanceTrend from "@/components/PerformanceTrend";
import { TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function PerformancePage() {
  const { allGames } = await getDashboardData();

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-6">
      {/* Header Soft-Brutalist */}
      <div className="flex items-center gap-3 bg-[#372D2E] text-[#F5F1F0] p-5 rounded-[32px] shadow-sm">
        <div className="w-12 h-12 bg-[#DFD6CD] text-[#372D2E] rounded-full flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-bebas tracking-wider text-[#F5F1F0] leading-none uppercase">
            Desempeño
          </h1>
          <p className="text-xs text-[#DFD6CD]/80 font-medium mt-0.5">
            Evolución de las estadísticas de Nara, partido a partido
          </p>
        </div>
      </div>

      {/* Componente de Tendencia */}
      <PerformanceTrend games={allGames} />
    </div>
  );
}
