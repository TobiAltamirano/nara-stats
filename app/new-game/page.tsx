"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGame, getOpponentsList } from "@/app/actions";
import Toast from "@/components/ui/Toast";

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
    date: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
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

      // Si el texto indica "perdimos" o "derrota", asignamos correctamente
      if (lower.includes("perdimos") || lower.includes("derrota")) {
        updates.teamScore = Math.min(score1, score2).toString();
        updates.opponentScore = Math.max(score1, score2).toString();
      } else {
        // Por defecto asumimos victoria
        updates.teamScore = Math.max(score1, score2).toString();
        updates.opponentScore = Math.min(score1, score2).toString();
      }
    }

    // 2. Extraer Puntos de Nara (ej: "nara hizo 14", "14 pts", "14 puntos")
    const ptsMatch =
      lower.match(/(?:nara\s*(?:hizo|anotó)?\s*)?(\d{1,2})\s*(?:pts|puntos)/) ||
      lower.match(/hizo\s*(\d{1,2})/);
    if (ptsMatch) {
      updates.playerPoints = ptsMatch[1];
    }

    // 3. Extraer Rebotes (ej: "7 reb", "7 rebotes")
    const rebMatch = lower.match(/(\d{1,2})\s*(?:reb|rebotes)/);
    if (rebMatch) updates.rebounds = rebMatch[1];

    // 4. Extraer Asistencias (ej: "3 ast", "3 asistencias")
    const astMatch = lower.match(/(\d{1,2})\s*(?:ast|asistencias)/);
    if (astMatch) updates.assists = astMatch[1];

    // 5. Extraer Triples (ej: "2 triples", "2 3pt")
    const triMatch = lower.match(/(\d{1,2})\s*(?:triples|3pt|3p)/);
    if (triMatch) updates.threePointers = triMatch[1];

    // 6. Detectar Rival (ej: "contra Lanús", "vs Obras")
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
    <div className="max-w-xl mx-auto p-4 pb-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registrar Partido</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>

      {/* Box de Smart Parser (Efecto WhatsApp) */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <label className="block text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1">
          ⚡ Carga Rápida (Pegar texto de WhatsApp)
        </label>
        <textarea
          value={rawText}
          onChange={(e) => parseWhatsAppMessage(e.target.value)}
          placeholder='Ej: "Ganamos 72-65 contra Lanús, Nara hizo 14 pts, 7 rebotes y 2 triples"'
          className="w-full text-sm p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white resize-none"
          rows={2}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha y Localía */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full p-2 border rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full p-2 border rounded-lg text-sm bg-white"
            >
              <option value="home">🏠 Local</option>
              <option value="away">✈️ Visitante</option>
            </select>
          </div>
        </div>

        {/* Rival (Con Datalist autocompletado) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
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
            className="w-full p-2 border rounded-lg text-sm"
            required
          />
          <datalist id="opponents-list">
            {opponents.map((opp) => (
              <option key={opp.id} value={opp.name} />
            ))}
          </datalist>
        </div>

        {/* Marcador */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full p-2 border rounded-lg text-lg font-bold text-center"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full p-2 border rounded-lg text-lg font-bold text-center"
              required
            />
          </div>
        </div>

        {/* Puntos de Nara */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Puntos de Nara
          </label>
          <input
            type="number"
            min="0"
            placeholder="14"
            value={formData.playerPoints}
            onChange={(e) =>
              setFormData({ ...formData, playerPoints: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>

        {/* Desplegable Estadísticas Avanzadas */}
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            {showAdvanced
              ? "▲ Ocultar Estadísticas Avanzadas"
              : "▼ + Agregar Rebotes, Asistencias, Triples..."}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 mt-3 bg-gray-50 p-3 rounded-xl border">
              <div>
                <label className="block text-xs text-gray-600">Rebotes</label>
                <input
                  type="number"
                  min="0"
                  value={formData.rebounds}
                  onChange={(e) =>
                    setFormData({ ...formData, rebounds: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">
                  Asistencias
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(e) =>
                    setFormData({ ...formData, assists: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Robos</label>
                <input
                  type="number"
                  min="0"
                  value={formData.steals}
                  onChange={(e) =>
                    setFormData({ ...formData, steals: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Pérdidas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.turnovers}
                  onChange={(e) =>
                    setFormData({ ...formData, turnovers: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">
                  Triples Convertidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.threePointers}
                  onChange={(e) =>
                    setFormData({ ...formData, threePointers: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">
                  Dobles Convertidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.twoPointers}
                  onChange={(e) =>
                    setFormData({ ...formData, twoPointers: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">
                  Tiros Libres
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeThrows}
                  onChange={(e) =>
                    setFormData({ ...formData, freeThrows: e.target.value })
                  }
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ej: Jugó con molestia en el tobillo, gran último cuarto..."
            className="w-full p-2 border rounded-lg text-sm resize-none"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-orange-700 transition disabled:opacity-50 mt-4"
        >
          {loading ? "Guardando..." : "Guardar Partido"}
        </button>
      </form>
    </div>
  );
}
