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
  games: GameWithOpponent[]; // ordenados desc por fecha (más reciente primero)
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
  { key: "rating", label: "Valoración", color: "#16a34a" },
  { key: "points", label: "Puntos", color: "#ea580c" },
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

  // El gráfico necesita orden cronológico ascendente (más viejo -> más nuevo)
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

  // Promedio de la primera mitad vs segunda mitad para dar contexto de tendencia
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
      <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
        Todavía no hay partidos cargados para mostrar una tendencia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector de métrica */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              metric === m.key
                ? "text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:text-gray-700"
            }`}
            style={metric === m.key ? { backgroundColor: m.color } : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
                labelFormatter={(label, payload) => {
                  const opp = payload?.[0]?.payload?.opponent;
                  return opp ? `${label} — vs ${opp}` : label;
                }}
                formatter={(value) => [String(value), activeMetric.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={activeMetric.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: activeMetric.color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contexto de tendencia: primera mitad vs segunda mitad */}
      {trendHint && (
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-xs">
          <div className="text-gray-500">
            Primera mitad:{" "}
            <span className="font-bold text-gray-800">
              {trendHint.firstAvg.toFixed(1)}
            </span>{" "}
            → Segunda mitad:{" "}
            <span className="font-bold text-gray-800">
              {trendHint.secondAvg.toFixed(1)}
            </span>
          </div>
          <span
            className={`font-black px-2 py-0.5 rounded-md ${
              trendHint.delta > 0
                ? "bg-green-50 text-green-600"
                : trendHint.delta < 0
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-500"
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
