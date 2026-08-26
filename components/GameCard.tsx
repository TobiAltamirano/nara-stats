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
    <div className="bg-[#DFD6CD]/60 rounded-3xl border border-[#DAD0C7] overflow-hidden transition">
      {/* Cabecera Principal */}
      <div className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-[#372D2E]/70 font-semibold tracking-wide">
            <span>{new Date(game.date).toLocaleDateString("es-AR")}</span>
            <span>•</span>
            <span className="uppercase font-bold">
              {game.location === "home" ? "🏠 Local" : "✈️ Visitante"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-[#F5F1F0] ${
                isWin ? "bg-emerald-700" : "bg-red-700"
              }`}
            >
              {isWin ? "VIC" : "DER"}
            </span>
            <span className="text-sm font-bold text-[#372D2E]">
              vs {game.opponentName} ({game.teamScore} - {game.opponentScore})
            </span>
          </div>
        </div>

        {/* Resumen Nara + Botón Desplegar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bebas text-2xl text-[#372D2E] leading-none">
              {game.playerPoints ?? 0}{" "}
              <span className="text-xs font-sans text-[#372D2E]/70">pts</span>
            </div>
            <div className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider">
              {rating} VAL
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-[#372D2E] hover:bg-[#DAD0C7]/60 rounded-full transition"
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
        <div className="bg-[#DAD0C7]/40 border-t border-[#DAD0C7] p-4 space-y-3 text-xs animate-fade-in">
          {/* Métricas Avanzadas */}
          <div className="grid grid-cols-4 gap-2 text-center bg-[#E8E0DB] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Reb
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.rebounds ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Ast
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.assists ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Rob
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.steals ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Pérd
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.turnovers ?? 0}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-[#E8E0DB] p-2.5 rounded-2xl border border-[#DAD0C7]">
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Triples
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.threePointers ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                Dobles
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.twoPointers ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#372D2E]/70 block uppercase font-bold">
                T. Libres
              </span>
              <span className="font-bebas text-lg text-[#372D2E]">
                {game.freeThrows ?? 0}
              </span>
            </div>
          </div>

          {/* Observaciones */}
          {game.notes && (
            <div className="bg-[#E8E0DB] p-3 rounded-2xl border border-[#DAD0C7] italic text-[#372D2E]/80 text-[11px]">
              "{game.notes}"
            </div>
          )}

          {/* Acciones Editar y Eliminar */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#DAD0C7]">
            <Link
              href={`/games/${game.id}/edit`}
              className="flex items-center gap-1 text-[11px] font-bold text-[#372D2E] bg-[#E8E0DB] hover:bg-[#E8E0DB]/80 px-3.5 py-1.5 rounded-full border border-[#DAD0C7] transition"
            >
              <Edit2 className="w-3 h-3" /> Editar
            </Link>
            <button
              onClick={() => onDeleteRequest(game.id)}
              className="flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100/60 hover:bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 transition"
            >
              <Trash2 className="w-3 h-3" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
