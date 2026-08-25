"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGame, getOpponentsList } from "@/app/actions";
import Toast from "@/components/ui/Toast";
import { ArrowLeft, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface OpponentOption {
  id: string;
  name: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [opponents, setOpponents] = useState<OpponentOption[]>([]);
  const [rawText, setRawText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    opponentName: "",
    location: "home" as "home" | "away",
    teamScore: "",
    opponentScore: "",
    playerPoints: "",
    rebounds: "",
    assists: "",
    steals: "",
    turnovers: "",
    threePointers: "",
    twoPointers: "",
    freeThrows: "",
    notes: "",
  });

  // Cargar lista de rivales para autocompletado
  useEffect(() => {
    getOpponentsList().then(setOpponents);
  }, []);

  // Smart Parser (Estilo WhatsApp)
  const parseWhatsAppMessage = (text: string) => {
    setRawText(text);
    if (!text.trim()) return;

    const lower = text.toLowerCase();
    const updates: Partial<typeof formData> = {};

    // 1. Extraer Marcador (ej: 72-65 o 72 - 65)
    const scoreMatch = text.match(/(\d{2,3})\s*[-aA]\s*(\d{2,3})/);
    if (scoreMatch) {
      const score1 = parseInt(scoreMatch[1]);
      const score2 = parseInt(scoreMatch[2]);

      if (lower.includes("perdimos") || lower.includes("derrota")) {
        updates.teamScore = Math.min(score1, score2).toString();
        updates.opponentScore = Math.max(score1, score2).toString();
      } else {
        updates.teamScore = Math.max(score1, score2).toString();
        updates.opponentScore = Math.min(score1, score2).toString();
      }
    }

    // 2. Extraer Puntos de Nara
    const ptsMatch =
      lower.match(/(?:nara\s*(?:hizo|anotó)?\s*)?(\d{1,2})\s*(?:pts|puntos)/) ||
      lower.match(/hizo\s*(\d{1,2})/);
    if (ptsMatch) {
      updates.playerPoints = ptsMatch[1];
    }

    // 3. Extraer Rebotes
    const rebMatch = lower.match(/(\d{1,2})\s*(?:reb|rebotes)/);
    if (rebMatch) updates.rebounds = rebMatch[1];

    // 4. Extraer Asistencias
    const astMatch = lower.match(/(\d{1,2})\s*(?:ast|asistencias)/);
    if (astMatch) updates.assists = astMatch[1];

    // 5. Extraer Triples
    const triMatch = lower.match(/(\d{1,2})\s*(?:triples|3pt|3p)/);
    if (triMatch) updates.threePointers = triMatch[1];

    // 6. Detectar Rival
    const vsMatch = text.match(
      /(?:contra|vs\.?|vsl)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:,|\.|$|\d)/i,
    );
    if (vsMatch) {
      const detectedName = vsMatch[1].trim();
      if (detectedName.length > 2) {
        updates.opponentName = detectedName;
      }
    }

    // 7. Detectar Localía
    if (lower.includes("visitante") || lower.includes("de visitante")) {
      updates.location = "away";
    } else if (lower.includes("local") || lower.includes("de local")) {
      updates.location = "home";
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.opponentName ||
      !formData.teamScore ||
      !formData.opponentScore
    ) {
      setToast({
        message: "Completa los campos requeridos: Rival y Marcador.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await createGame({
        opponentName: formData.opponentName,
        date: formData.date,
        location: formData.location,
        teamScore: parseInt(formData.teamScore),
        opponentScore: parseInt(formData.opponentScore),
        playerPoints: formData.playerPoints
          ? parseInt(formData.playerPoints)
          : null,
        rebounds: formData.rebounds ? parseInt(formData.rebounds) : null,
        assists: formData.assists ? parseInt(formData.assists) : null,
        steals: formData.steals ? parseInt(formData.steals) : null,
        turnovers: formData.turnovers ? parseInt(formData.turnovers) : null,
        threePointers: formData.threePointers
          ? parseInt(formData.threePointers)
          : null,
        twoPointers: formData.twoPointers
          ? parseInt(formData.twoPointers)
          : null,
        freeThrows: formData.freeThrows ? parseInt(formData.freeThrows) : null,
        notes: formData.notes || null,
      });

      setToast({ message: "Partido guardado con éxito", type: "success" });
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      console.error(err);
      setToast({ message: "Error al guardar el partido", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-24">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-3 bg-[#DFD6CD]/60 hover:bg-[#DFD6CD] rounded-2xl border border-[#DAD0C7] text-[#372D2E] transition flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block">
            Nuevo partido
          </span>
          <h1 className="text-3xl font-bebas tracking-wider text-[#372D2E] leading-none uppercase">
            REGISTRAR PARTIDO
          </h1>
        </div>
      </div>

      {/* Box Smart Parser */}
      <div className="bg-[#DFD6CD]/60 p-5 rounded-3xl border border-[#DAD0C7]">
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#372D2E]/70 uppercase tracking-wider mb-2">
          <Zap className="w-4 h-4 text-[#372D2E]" /> Carga Rápida (Pegar texto
          de WhatsApp)
        </label>
        <textarea
          value={rawText}
          onChange={(e) => parseWhatsAppMessage(e.target.value)}
          placeholder='Ej: "Ganamos 72-65 contra Lanús, Nara hizo 14 pts, 7 rebotes y 2 triples"'
          className="w-full text-sm p-3 bg-[#DFD6CD] border border-[#DAD0C7] rounded-2xl text-[#372D2E] placeholder-[#372D2E]/40 focus:outline-none focus:ring-2 focus:ring-[#372D2E] resize-none"
          rows={2}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha y Condición */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#DFD6CD]/60 p-3.5 rounded-2xl border border-[#DAD0C7]">
            <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full bg-[#DFD6CD] border border-[#DAD0C7] text-[#372D2E] text-xs font-bold p-2 rounded-xl focus:outline-none"
              required
            />
          </div>

          <div className="bg-[#DFD6CD]/60 p-3.5 rounded-2xl border border-[#DAD0C7]">
            <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
              Condición
            </label>
            <select
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value as "home" | "away",
                })
              }
              className="w-full bg-[#DFD6CD] border border-[#DAD0C7] text-[#372D2E] text-xs font-bold p-2 rounded-xl focus:outline-none"
            >
              <option value="home">🏠 Local</option>
              <option value="away">✈️ Visitante</option>
            </select>
          </div>
        </div>

        {/* Rival */}
        <div className="bg-[#DFD6CD]/60 p-3.5 rounded-2xl border border-[#DAD0C7]">
          <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
            Rival *
          </label>
          <input
            type="text"
            list="opponents-list"
            value={formData.opponentName}
            onChange={(e) =>
              setFormData({ ...formData, opponentName: e.target.value })
            }
            placeholder="Ej: Lanús, Obras, Gimnasia"
            className="w-full bg-[#DFD6CD] border border-[#DAD0C7] text-[#372D2E] text-sm font-bold p-2.5 rounded-xl focus:outline-none placeholder-[#372D2E]/40"
            required
          />
          <datalist id="opponents-list">
            {opponents.map((opp) => (
              <option key={opp.id} value={opp.name} />
            ))}
          </datalist>
        </div>

        {/* Marcador Colectivo */}
        <div className="bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7]">
          <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block mb-2">
            Resultado del Partido
          </span>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#DFD6CD] p-3 rounded-2xl border border-[#DAD0C7]">
              <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
                Platense
              </label>
              <input
                type="number"
                min="0"
                placeholder="72"
                value={formData.teamScore}
                onChange={(e) =>
                  setFormData({ ...formData, teamScore: e.target.value })
                }
                className="w-full bg-transparent text-center font-bebas text-3xl text-[#372D2E] focus:outline-none"
                required
              />
            </div>

            <div className="bg-[#DFD6CD] p-3 rounded-2xl border border-[#DAD0C7]">
              <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
                Rival
              </label>
              <input
                type="number"
                min="0"
                placeholder="65"
                value={formData.opponentScore}
                onChange={(e) =>
                  setFormData({ ...formData, opponentScore: e.target.value })
                }
                className="w-full bg-transparent text-center font-bebas text-3xl text-[#372D2E] focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Puntos de Nara */}
        <div className="bg-[#372D2E] text-[#F5F1F0] p-4 rounded-3xl shadow-sm">
          <label className="block text-xs font-bold text-[#DFD6CD]/80 uppercase tracking-wider mb-2">
            🏀 Puntos de Nara
          </label>
          <input
            type="number"
            min="0"
            placeholder="14"
            value={formData.playerPoints}
            onChange={(e) =>
              setFormData({ ...formData, playerPoints: e.target.value })
            }
            className="w-full bg-[#DFD6CD]/10 border border-[#DFD6CD]/20 text-center font-bebas text-3xl text-[#DFD6CD] p-2 rounded-2xl focus:outline-none placeholder-[#DFD6CD]/30"
          />
        </div>

        {/* Toggle Estadísticas Avanzadas */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#372D2E] bg-[#DFD6CD]/60 hover:bg-[#DFD6CD] p-3.5 rounded-2xl border border-[#DAD0C7] transition uppercase tracking-wider"
          >
            <span>
              {showAdvanced
                ? "Ocultar Métrica Avanzada"
                : "+ Agregar Rebotes, Asistencias, Triples..."}
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-[#372D2E]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#372D2E]" />
            )}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-2.5 mt-3 bg-[#DFD6CD]/60 p-4 rounded-3xl border border-[#DAD0C7]">
              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Rebotes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rebounds}
                  onChange={(e) =>
                    setFormData({ ...formData, rebounds: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Asistencias
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(e) =>
                    setFormData({ ...formData, assists: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Robos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.steals}
                  onChange={(e) =>
                    setFormData({ ...formData, steals: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Pérdidas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.turnovers}
                  onChange={(e) =>
                    setFormData({ ...formData, turnovers: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Triples
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.threePointers}
                  onChange={(e) =>
                    setFormData({ ...formData, threePointers: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Dobles
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.twoPointers}
                  onChange={(e) =>
                    setFormData({ ...formData, twoPointers: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>

              <div className="bg-[#DFD6CD] p-2.5 rounded-2xl border border-[#DAD0C7] col-span-2">
                <label className="block text-[9px] font-bold text-[#372D2E]/70 uppercase mb-0.5">
                  Tiros Libres
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeThrows}
                  onChange={(e) =>
                    setFormData({ ...formData, freeThrows: e.target.value })
                  }
                  className="w-full bg-transparent font-bebas text-xl text-[#372D2E] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="bg-[#DFD6CD]/60 p-3.5 rounded-2xl border border-[#DAD0C7]">
          <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ej: Jugó con molestia en el tobillo, gran último cuarto..."
            className="w-full bg-[#DFD6CD] border border-[#DAD0C7] text-[#372D2E] text-xs p-2.5 rounded-xl focus:outline-none resize-none placeholder-[#372D2E]/40"
            rows={2}
          />
        </div>

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#372D2E] text-[#F5F1F0] font-bebas text-xl tracking-wider py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition disabled:opacity-50 uppercase"
        >
          {loading ? "GUARDANDO..." : "GUARDAR PARTIDO"}
        </button>
      </form>
    </div>
  );
}
