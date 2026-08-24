"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getGameById, updateGame, getOpponentsList } from "@/app/actions";
import Toast from "@/components/ui/Toast";

export default function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opponents, setOpponents] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    date: "",
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

  useEffect(() => {
    async function init() {
      try {
        const [game, opps] = await Promise.all([
          getGameById(id),
          getOpponentsList(),
        ]);
        setOpponents(opps);
        setFormData({
          date: game.date,
          opponentName: game.opponentName,
          location: game.location as "home" | "away",
          teamScore: game.teamScore.toString(),
          opponentScore: game.opponentScore.toString(),
          playerPoints: game.playerPoints?.toString() ?? "",
          rebounds: game.rebounds?.toString() ?? "",
          assists: game.assists?.toString() ?? "",
          steals: game.steals?.toString() ?? "",
          turnovers: game.turnovers?.toString() ?? "",
          threePointers: game.threePointers?.toString() ?? "",
          twoPointers: game.twoPointers?.toString() ?? "",
          freeThrows: game.freeThrows?.toString() ?? "",
          notes: game.notes ?? "",
        });
      } catch (err: any) {
        setToast({ message: "Error al cargar el partido", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.opponentName ||
      !formData.teamScore ||
      !formData.opponentScore
    ) {
      setToast({ message: "Completa los campos requeridos.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await updateGame(id, {
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

      setToast({ message: "Partido actualizado con éxito", type: "success" });
      setTimeout(() => router.back(), 1000);
    } catch (err: any) {
      setToast({ message: "Error al guardar los cambios", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center text-xs text-gray-400">
        Cargando datos del partido...
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Editar Partido</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Cancelar
        </button>
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
              className="w-full p-2.5 border rounded-xl text-sm"
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
              className="w-full p-2.5 border rounded-xl text-sm bg-white"
            >
              <option value="home">🏠 Local</option>
              <option value="away">✈️ Visitante</option>
            </select>
          </div>
        </div>

        {/* Rival */}
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
            className="w-full p-2.5 border rounded-xl text-sm"
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
            value={formData.playerPoints}
            onChange={(e) =>
              setFormData({ ...formData, playerPoints: e.target.value })
            }
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        {/* Estadísticas Avanzadas */}
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            {showAdvanced
              ? "▲ Ocultar Estadísticas Avanzadas"
              : "▼ + Ver Estadísticas Avanzadas"}
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
                  className="w-full p-2 border rounded-lg text-sm"
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
            className="w-full p-2 border rounded-xl text-sm resize-none"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-orange-700 transition disabled:opacity-50 mt-4 text-sm"
        >
          {submitting ? "Guardando Cambios..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
