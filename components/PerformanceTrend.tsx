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
import { formatShortDate } from "@/utils/formDate";
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

const SECONDARY_METRICS = ALL_METRICS.filter((m) => m.key !== "points");
const MAX_SELECTED_METRICS = 2;

type PeriodKey = "last5" | "last10" | "last20" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "last5", label: "Últimos 5" },
  { key: "last10", label: "Últimos 10" },
  { key: "last20", label: "Últimos 20" },
  { key: "all", label: "Temporada" },
];

function getMetricValue(game: GameWithOpponent, metric: MetricKey): number {
  if (metric === "rating") return calculateRating(game);
  if (metric === "points") return game.playerPoints ?? 0;
  return game[metric] ?? 0;
}

function sliceGamesByPeriod(
  games: GameWithOpponent[],
  period: PeriodKey,
): GameWithOpponent[] {
  switch (period) {
    case "last5":
      return games.slice(0, 5);
    case "last10":
      return games.slice(0, 10);
    case "last20":
      return games.slice(0, 20);
    case "all":
      return games;
  }
}

export default function PerformanceTrend({ games }: PerformanceTrendProps) {
  // 1. Estados del Gráfico
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "rating",
  ]);
  const [chartPeriod, setChartPeriod] = useState<PeriodKey>("last5");

  // 2. Estado del filtro para la 3ra Sección (Promedios y Tendencia)
  const [summaryPeriod, setSummaryPeriod] = useState<PeriodKey>("all");

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= MAX_SELECTED_METRICS) return [prev[1], key];
      return [...prev, key];
    });
  };

  // Datos para el gráfico
  const chartGames = useMemo(
    () => sliceGamesByPeriod(games, chartPeriod),
    [games, chartPeriod],
  );

  const chartData = useMemo(() => {
    const chronological = [...chartGames].reverse();
    return chronological.map((g) => {
      const row: Record<string, string | number> = {
        label: formatShortDate(g.date),
        opponent: g.opponent?.name ?? "Rival",
      };
      for (const m of ALL_METRICS) {
        row[m.key] = getMetricValue(g, m.key);
      }
      return row;
    });
  }, [chartGames]);

  // SECCIÓN 2: Cards Partido a Partido (Último vs. Anteúltimo)
  const lastGameCards = useMemo(() => {
    const latest = games[0];
    const previous = games[1];

    return SECONDARY_METRICS.map((m) => {
      const current = latest ? getMetricValue(latest, m.key) : null;
      const prev = previous ? getMetricValue(previous, m.key) : null;
      const delta = current !== null && prev !== null ? current - prev : null;

      return {
        ...m,
        current,
        delta,
      };
    });
  }, [games]);

  // SECCIÓN 3: Promedios y Análisis de Tendencia según filtro elegido
  const summaryData = useMemo(() => {
    const targetGames = sliceGamesByPeriod(games, summaryPeriod);
    if (targetGames.length === 0) return [];

    return ALL_METRICS.map((m) => {
      // Promedio general del bloque
      const total = targetGames.reduce(
        (acc, g) => acc + getMetricValue(g, m.key),
        0,
      );
      const average = (total / targetGames.length).toFixed(1);

      // Análisis de tendencia: dividimos la muestra en 2 mitades (recientes vs anteriores)
      let trend: "up" | "down" | "neutral" = "neutral";

      if (targetGames.length >= 2) {
        const mid = Math.floor(targetGames.length / 2);
        const recentHalf = targetGames.slice(0, mid);
        const olderHalf = targetGames.slice(mid);

        const recentAvg =
          recentHalf.reduce((acc, g) => acc + getMetricValue(g, m.key), 0) /
          recentHalf.length;
        const olderAvg =
          olderHalf.reduce((acc, g) => acc + getMetricValue(g, m.key), 0) /
          olderHalf.length;

        const diff = recentAvg - olderAvg;

        if (diff > 0.3) trend = "up";
        else if (diff < -0.3) trend = "down";
      }

      return {
        ...m,
        average,
        trend,
      };
    });
  }, [games, summaryPeriod]);

  if (games.length === 0) {
    return (
      <div className="bg-[#DAD0C7]/40 p-6 rounded-3xl border border-dashed border-[#DAD0C7] text-center text-xs text-[#372D2E]/70 font-medium">
        Todavía no hay partidos cargados para mostrar una tendencia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. GRÁFICO TENDENCIA */}
      <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bebas text-md text-[#372D2E] tracking-wider uppercase">
            Evolución Gráfica
          </span>
          <span className="text-[10px] font-bold text-[#372D2E]/60">
            {selectedMetrics.length}/{MAX_SELECTED_METRICS} métricas
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setChartPeriod(p.key)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                chartPeriod === p.key
                  ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                  : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {ALL_METRICS.map((m) => {
            const isSelected = selectedMetrics.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                  isSelected
                    ? "text-[#F5F1F0] border-transparent shadow-sm"
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

        <div className="h-52 pt-2">
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
      </div>

      {/* 2. PARTIDO A PARTIDO (ÚLTIMO VS ANTEÚLTIMO) */}
      <div className="space-y-2">
        <h3 className="font-bebas text-md text-[#372D2E] tracking-wider uppercase px-0.5">
          Último Partido vs. Anterior
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {lastGameCards.map((card) => (
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
      </div>

      {/* 3. PROMEDIOS Y ANÁLISIS DE TENDENCIA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-bebas text-md text-[#372D2E] tracking-wider uppercase">
            Promedios y Tendencia
          </h3>
        </div>

        {/* Filtro para promedios */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSummaryPeriod(p.key)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                summaryPeriod === p.key
                  ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                  : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cards de promedios con indicador de tendencia */}
        <div className="grid grid-cols-3 gap-2">
          {summaryData.map((item) => (
            <div
              key={item.key}
              className="bg-[#DFD6CD]/60 p-2.5 rounded-2xl border border-[#DAD0C7] flex flex-col justify-between"
            >
              <div className="text-[9px] text-[#372D2E]/60 font-bold uppercase truncate mb-1">
                {item.label}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-bebas text-2xl text-[#372D2E] leading-none">
                  {item.average}
                </span>

                {item.trend === "up" && (
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                  </span>
                )}
                {item.trend === "down" && (
                  <span className="text-[10px] font-bold text-red-800 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                  </span>
                )}
                {item.trend === "neutral" && (
                  <span className="text-[10px] font-bold text-[#372D2E]/40 flex items-center gap-0.5">
                    <Minus className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
