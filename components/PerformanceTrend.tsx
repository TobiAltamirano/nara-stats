"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calculateRating, type Game } from "@/lib/stats";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type GameWithOpponent = Game & { opponent: { id: string; name: string } };

interface PerformanceTrendProps {
  games: GameWithOpponent[]; // ordenados desc por fecha (más reciente primero)
}

type MetricKey =
  | "rating"
  | "points"
  | "rebounds"
  | "assists"
  | "steals"
  | "turnovers"
  | "threePointers"
  | "twoPointers"
  | "freeThrows";

// Todas las métricas disponibles para el gráfico, cada una con su color propio
const ALL_METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: "rating", label: "Valoración", color: "#372D2E" },
  { key: "points", label: "Puntos", color: "#A8763E" },
  { key: "rebounds", label: "Rebotes", color: "#4A6FA5" },
  { key: "assists", label: "Asistencias", color: "#7B5EA7" },
  { key: "steals", label: "Robos", color: "#2F8F82" },
  { key: "turnovers", label: "Pérdidas", color: "#B3402F" },
  { key: "threePointers", label: "Triples", color: "#C08A2E" },
  { key: "twoPointers", label: "Dobles", color: "#5B8C3A" },
  { key: "freeThrows", label: "T. Libres", color: "#B15A8C" },
];

// Las mismas métricas (menos Puntos, que ya tiene protagonismo propio en el gráfico) para las cards de variación
const SECONDARY_METRICS = ALL_METRICS.filter((m) => m.key !== "points");

const MAX_SELECTED_METRICS = 4; // tope para que el gráfico no se vuelva ilegible en mobile

type PeriodKey = "last5" | "last10" | "month" | "year" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "last5", label: "Últimos 5" },
  { key: "last10", label: "Últimos 10" },
  { key: "month", label: "Este mes" },
  { key: "year", label: "Este año" },
  { key: "all", label: "Todos" },
];

function getMetricValue(game: GameWithOpponent, metric: MetricKey): number {
  if (metric === "rating") return calculateRating(game);
  if (metric === "points") return game.playerPoints ?? 0;
  return game[metric] ?? 0;
}

function filterByPeriod(
  games: GameWithOpponent[],
  period: PeriodKey,
): GameWithOpponent[] {
  const now = new Date();
  switch (period) {
    case "last5":
      return games.slice(0, 5);
    case "last10":
      return games.slice(0, 10);
    case "month":
      return games.filter((g) => {
        const d = new Date(g.date);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      });
    case "year":
      return games.filter(
        (g) => new Date(g.date).getFullYear() === now.getFullYear(),
      );
    case "all":
      return games;
  }
}

export default function PerformanceTrend({ games }: PerformanceTrendProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "rating",
  ]);
  const [period, setPeriod] = useState<PeriodKey>("last5");

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // siempre queda al menos 1 seleccionada
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= MAX_SELECTED_METRICS) return prev; // tope alcanzado
      return [...prev, key];
    });
  };

  const periodGames = useMemo(
    () => filterByPeriod(games, period),
    [games, period],
  );

  // El gráfico necesita orden cronológico ascendente (más viejo -> más nuevo).
  // Cada fila trae el valor de TODAS las métricas; el gráfico solo dibuja las líneas seleccionadas.
  const chartData = useMemo(() => {
    const chronological = [...periodGames].reverse();
    return chronological.map((g) => {
      const row: Record<string, string | number> = {
        label: new Date(g.date).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        }),
        opponent: g.opponent?.name ?? "Rival",
      };
      for (const m of ALL_METRICS) {
        row[m.key] = getMetricValue(g, m.key);
      }
      return row;
    });
  }, [periodGames]);

  // Delta del último partido vs. el anteúltimo (siempre sobre el historial completo,
  // independiente del filtro de período, para que las cards reflejen la variación más reciente)
  const latestGame = games[0];
  const previousGame = games[1];

  const secondaryCards = useMemo(() => {
    return SECONDARY_METRICS.map((m) => {
      const current = latestGame ? getMetricValue(latestGame, m.key) : null;
      const previous = previousGame
        ? getMetricValue(previousGame, m.key)
        : null;
      const delta =
        current !== null && previous !== null ? current - previous : null;
      return { ...m, current, delta };
    });
  }, [latestGame, previousGame]);

  if (games.length === 0) {
    return (
      <div className="bg-[#DAD0C7]/40 p-6 rounded-3xl border border-dashed border-[#DAD0C7] text-center text-xs text-[#372D2E]/70 font-medium">
        Todavía no hay partidos cargados para mostrar una tendencia.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de período */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
              period === p.key
                ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Gráfico principal (multi-métrica, hasta 4 en simultáneo) */}
      <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold text-[#372D2E]/60 uppercase tracking-wider">
            Elegí hasta {MAX_SELECTED_METRICS} estadísticas
          </span>
          <span className="text-[10px] font-bold text-[#372D2E]/60">
            {selectedMetrics.length}/{MAX_SELECTED_METRICS}
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {ALL_METRICS.map((m) => {
            const isSelected = selectedMetrics.includes(m.key);
            const isDisabled =
              !isSelected && selectedMetrics.length >= MAX_SELECTED_METRICS;
            return (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                disabled={isDisabled}
                className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                  isSelected
                    ? "text-[#F5F1F0] border-transparent shadow-sm"
                    : isDisabled
                      ? "bg-[#DFD6CD]/30 text-[#372D2E]/30 border-[#DAD0C7]/50 cursor-not-allowed"
                      : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
                }`}
                style={isSelected ? { backgroundColor: m.color } : undefined}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: isSelected ? "#F5F1F0" : m.color,
                  }}
                />
                {m.label}
              </button>
            );
          })}
        </div>

        {chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-[#372D2E]/60 font-medium">
            No hay partidos en este período.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DAD0C7" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#372D2E" }}
                  tickLine={false}
                  axisLine={{ stroke: "#DAD0C7" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#372D2E" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#372D2E",
                    color: "#F5F1F0",
                    fontSize: 12,
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#DFD6CD" }}
                  labelStyle={{ color: "#F5F1F0", fontWeight: "bold" }}
                  labelFormatter={(label, payload) => {
                    const opp = payload?.[0]?.payload?.opponent;
                    return opp ? `${label} — vs ${opp}` : label;
                  }}
                  formatter={(value, name) => {
                    const metricInfo = ALL_METRICS.find((m) => m.key === name);
                    return [String(value), metricInfo?.label ?? String(name)];
                  }}
                />
                {selectedMetrics.map((key) => {
                  const metricInfo = ALL_METRICS.find((m) => m.key === key)!;
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={metricInfo.color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: metricInfo.color }}
                      activeDot={{
                        r: 5,
                        fill: metricInfo.color,
                        stroke: "#F5F1F0",
                        strokeWidth: 2,
                      }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Cards secundarias: valor del último partido + variación vs. el anteúltimo */}
      <div>
        <h3 className="text-[10px] font-bold text-[#372D2E]/60 uppercase tracking-wider mb-2 px-0.5">
          Último partido vs. anterior
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {secondaryCards.map((card) => (
            <div
              key={card.key}
              className="bg-[#DFD6CD]/60 p-3 rounded-2xl border border-[#DAD0C7] flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] text-[#372D2E]/60 font-semibold uppercase mb-0.5">
                  {card.label}
                </div>
                <div className="font-bebas text-2xl text-[#372D2E] leading-none">
                  {card.current ?? "—"}
                </div>
              </div>

              {card.delta !== null && card.delta !== 0 && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-1 rounded-full ${
                    card.delta > 0
                      ? "bg-emerald-800 text-[#F5F1F0]"
                      : "bg-red-800 text-[#F5F1F0]"
                  }`}
                >
                  {card.delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.delta > 0 ? "+" : ""}
                  {card.delta}
                </div>
              )}
              {card.delta === 0 && (
                <div className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-1 rounded-full bg-[#372D2E]/10 text-[#372D2E]/60">
                  <Minus className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
        {!previousGame && (
          <p className="text-[10px] text-[#372D2E]/50 mt-2 px-0.5">
            Se necesitan al menos 2 partidos cargados para mostrar la variación.
          </p>
        )}
      </div>
    </div>
  );
}
