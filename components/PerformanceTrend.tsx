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

type GameWithOpponent = Game & { opponent: { id: string; name: string } };

interface PerformanceTrendProps {
  games: GameWithOpponent[];
}

type MetricKey =
  | "points"
  | "rebounds"
  | "assists"
  | "steals"
  | "turnovers"
  | "threePointers"
  | "twoPointers"
  | "freeThrows"
  | "rating";

const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: "rating", label: "Valoración", color: "#372D2E" },
  { key: "points", label: "Puntos", color: "#16a34a" },
  { key: "rebounds", label: "Rebotes", color: "#2563eb" },
  { key: "assists", label: "Asistencias", color: "#9333ea" },
  { key: "steals", label: "Robos", color: "#0891b2" },
  { key: "turnovers", label: "Pérdidas", color: "#dc2626" },
  { key: "threePointers", label: "Triples", color: "#ca8a04" },
  { key: "twoPointers", label: "Dobles", color: "#65a30d" },
  { key: "freeThrows", label: "T. Libres", color: "#db2777" },
];

function getMetricValue(game: GameWithOpponent, metric: MetricKey): number {
  if (metric === "rating") return calculateRating(game);
  if (metric === "points") return game.playerPoints ?? 0;
  return game[metric] ?? 0;
}

export default function PerformanceTrend({ games }: PerformanceTrendProps) {
  const [metric, setMetric] = useState<MetricKey>("rating");

  const activeMetric = METRICS.find((m) => m.key === metric)!;

  const chartData = useMemo(() => {
    const chronological = [...games].reverse();
    return chronological.map((g, i) => ({
      index: i + 1,
      label: new Date(g.date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      }),
      opponent: g.opponent?.name ?? "Rival",
      value: getMetricValue(g, metric),
    }));
  }, [games, metric]);

  const trendHint = useMemo(() => {
    if (chartData.length < 4) return null;
    const mid = Math.floor(chartData.length / 2);
    const first = chartData.slice(0, mid);
    const second = chartData.slice(mid);
    const avg = (arr: typeof chartData) =>
      arr.reduce((s, d) => s + d.value, 0) / arr.length;
    const firstAvg = avg(first);
    const secondAvg = avg(second);
    const delta = secondAvg - firstAvg;
    return { firstAvg, secondAvg, delta };
  }, [chartData]);

  if (games.length === 0) {
    return (
      <div className="bg-[#DAD0C7]/40 p-6 rounded-3xl border border-dashed border-[#DAD0C7] text-center text-xs text-[#372D2E]/70 font-medium">
        Todavía no hay partidos cargados para mostrar una tendencia.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de métrica */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {METRICS.map((m) => {
          const isSelected = metric === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                isSelected
                  ? "bg-[#372D2E] text-[#F5F1F0] border-[#372D2E] shadow-sm"
                  : "bg-[#DFD6CD]/60 text-[#372D2E]/80 border-[#DAD0C7] hover:bg-[#DFD6CD]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7]">
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
                formatter={(value) => [String(value), activeMetric.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  activeMetric.color === "#372D2E"
                    ? "#372D2E"
                    : activeMetric.color
                }
                strokeWidth={3}
                dot={{ r: 4, fill: "#372D2E" }}
                activeDot={{
                  r: 6,
                  fill: "#DFD6CD",
                  stroke: "#372D2E",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contexto de tendencia */}
      {trendHint && (
        <div className="bg-[#DFD6CD]/60 p-3.5 rounded-2xl border border-[#DAD0C7] flex items-center justify-between text-xs">
          <div className="text-[#372D2E]/80 font-medium">
            1ª mitad:{" "}
            <span className="font-bebas text-lg text-[#372D2E]">
              {trendHint.firstAvg.toFixed(1)}
            </span>{" "}
            → 2ª mitad:{" "}
            <span className="font-bebas text-lg text-[#372D2E]">
              {trendHint.secondAvg.toFixed(1)}
            </span>
          </div>
          <span
            className={`font-bebas text-lg px-2.5 py-0.5 rounded-full ${
              trendHint.delta > 0
                ? "bg-emerald-800 text-[#F5F1F0]"
                : trendHint.delta < 0
                  ? "bg-rose-800 text-[#F5F1F0]"
                  : "bg-[#372D2E] text-[#F5F1F0]"
            }`}
          >
            {trendHint.delta > 0 ? "+" : ""}
            {trendHint.delta.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
