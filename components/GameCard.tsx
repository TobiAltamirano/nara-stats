"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateRating } from "@/lib/stats";
import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    date: string;
    location: "home" | "away";
    teamScore: number;
    opponentScore: number;
    opponentName: string;
    playerPoints?: number | null;
    rebounds?: number | null;
    assists?: number | null;
    steals?: number | null;
    turnovers?: number | null;
    threePointers?: number | null;
    twoPointers?: number | null;
    freeThrows?: number | null;
    notes?: string | null;
  };
  onDeleteRequest: (id: string) => void;
}

export default function GameCard({ game, onDeleteRequest }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isWin = game.teamScore > game.opponentScore;
  const rating = calculateRating(game);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition">
      {/* Cabecera Principal */}
      <div className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
            <span>{new Date(game.date).toLocaleDateString("es-AR")}</span>
            <span>•</span>
            <span className="uppercase font-bold text-gray-500">
              {game.location === "home" ? "🏠 Local" : "✈️ Visitante"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                isWin ? "text-green-600 font-bold" : "text-red-500 font-bold"
              }
            >
              {isWin ? "🟢 VICTORIA" : "🔴 DERROTA"}
            </span>
            <span className="text-sm font-black text-gray-900">
              vs {game.opponentName} ({game.teamScore} - {game.opponentScore})
            </span>
          </div>
        </div>

        {/* Resumen Nara + Botón Desplegar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-base font-black text-gray-900">
              {game.playerPoints ?? 0}{" "}
              <span className="text-xs font-normal text-gray-500">pts</span>
            </div>
            <div className="text-[10px] font-bold text-orange-600">
              {rating} VAL
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Detalles Desplegables */}
      {expanded && (
        <div className="bg-gray-50/80 border-t border-gray-100 p-4 space-y-3 text-xs animate-fade-in">
          {/* Métricas Avanzadas */}
          <div className="grid grid-cols-4 gap-2 text-center bg-white p-2.5 rounded-xl border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Reb
              </span>
              <span className="font-bold text-gray-800">
                {game.rebounds ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Ast
              </span>
              <span className="font-bold text-gray-800">
                {game.assists ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Rob
              </span>
              <span className="font-bold text-gray-800">
                {game.steals ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Pérd
              </span>
              <span className="font-bold text-gray-800">
                {game.turnovers ?? 0}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-xl border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Triples
              </span>
              <span className="font-bold text-gray-800">
                {game.threePointers ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Dobles
              </span>
              <span className="font-bold text-gray-800">
                {game.twoPointers ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                T. Libres
              </span>
              <span className="font-bold text-gray-800">
                {game.freeThrows ?? 0}
              </span>
            </div>
          </div>

          {/* Observaciones */}
          {game.notes && (
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 italic text-gray-600 text-[11px]">
              "{game.notes}"
            </div>
          )}

          {/* Acciones Editar y Eliminar */}
          <div className="flex justify-end items-center gap-2 pt-1 border-t border-gray-200/60">
            <Link
              href={`/games/${game.id}/edit`}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </Link>
            <button
              onClick={() => onDeleteRequest(game.id)}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-2xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
