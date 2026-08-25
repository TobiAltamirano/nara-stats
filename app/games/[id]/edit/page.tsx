"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getGameById, updateGame, getOpponentsList } from "@/app/actions";
import Toast from "@/components/ui/Toast";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

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
      <div className="max-w-xl mx-auto p-8 text-center bg-[#DFD6CD]/40 border border-[#DAD0C7] rounded-3xl mt-4 text-xs font-bold text-[#372D2E]/50 uppercase tracking-wider">
        Cargando datos del partido...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 bg-[#DFD6CD]/50 border border-[#DAD0C7] text-[#372D2E] rounded-2xl hover:bg-[#DAD0C7] transition"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block">
              Edición de Registro
            </span>
            <h1 className="text-3xl font-bebas tracking-wider text-[#372D2E] leading-none uppercase">
              EDITAR PARTIDO
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha y Localía */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#DFD6CD]/30 border border-[#DAD0C7] p-3 rounded-2xl">
            <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
              required
            />
          </div>
          <div className="bg-[#DFD6CD]/30 border border-[#DAD0C7] p-3 rounded-2xl">
            <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
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
              className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none cursor-pointer"
            >
              <option value="home">Local</option>
              <option value="away">Visitante</option>
            </select>
          </div>
        </div>

        {/* Rival */}
        <div className="bg-[#DFD6CD]/30 border border-[#DAD0C7] p-3 rounded-2xl">
          <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
            Rival *
          </label>
          <input
            type="text"
            list="opponents-list"
            placeholder="Nombre del rival"
            value={formData.opponentName}
            onChange={(e) =>
              setFormData({ ...formData, opponentName: e.target.value })
            }
            className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none placeholder:text-[#372D2E]/40"
            required
          />
          <datalist id="opponents-list">
            {opponents.map((opp) => (
              <option key={opp.id} value={opp.name} />
            ))}
          </datalist>
        </div>

        {/* Marcador */}
        <div className="bg-[#DFD6CD]/40 border border-[#DAD0C7] p-4 rounded-3xl space-y-2">
          <span className="text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider block text-center">
            Resultado Final
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F1F0] p-3 rounded-2xl border border-[#DAD0C7] text-center">
              <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
                Platense
              </label>
              <input
                type="number"
                min="0"
                value={formData.teamScore}
                onChange={(e) =>
                  setFormData({ ...formData, teamScore: e.target.value })
                }
                className="w-full bg-transparent border-none p-0 text-3xl font-bebas text-center text-[#372D2E] focus:ring-0 outline-none"
                required
              />
            </div>
            <div className="bg-[#F5F1F0] p-3 rounded-2xl border border-[#DAD0C7] text-center">
              <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
                Rival
              </label>
              <input
                type="number"
                min="0"
                value={formData.opponentScore}
                onChange={(e) =>
                  setFormData({ ...formData, opponentScore: e.target.value })
                }
                className="w-full bg-transparent border-none p-0 text-3xl font-bebas text-center text-[#372D2E] focus:ring-0 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Puntos de Nara */}
        <div className="bg-[#EAE4DC] border border-[#DAD0C7] p-4 rounded-3xl">
          <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
            Puntos Individuales (Nara)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={formData.playerPoints}
            onChange={(e) =>
              setFormData({ ...formData, playerPoints: e.target.value })
            }
            className="w-full bg-transparent border-none p-0 text-2xl font-bebas text-[#372D2E] focus:ring-0 outline-none placeholder:text-[#372D2E]/30"
          />
        </div>

        {/* Estadísticas Avanzadas */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-[#DFD6CD]/50 border border-[#DAD0C7] py-2.5 px-4 rounded-2xl text-xs font-bold text-[#372D2E] tracking-wider uppercase flex items-center justify-between hover:bg-[#DAD0C7] transition"
          >
            <span>Estadísticas Avanzadas</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 bg-[#DFD6CD]/30 border border-[#DAD0C7] p-4 rounded-3xl">
              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Rebotes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rebounds}
                  onChange={(e) =>
                    setFormData({ ...formData, rebounds: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Asistencias
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(e) =>
                    setFormData({ ...formData, assists: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Robos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.steals}
                  onChange={(e) =>
                    setFormData({ ...formData, steals: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Pérdidas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.turnovers}
                  onChange={(e) =>
                    setFormData({ ...formData, turnovers: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Triples Convertidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.threePointers}
                  onChange={(e) =>
                    setFormData({ ...formData, threePointers: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7]">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Dobles Convertidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.twoPointers}
                  onChange={(e) =>
                    setFormData({ ...formData, twoPointers: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>

              <div className="bg-[#F5F1F0] p-2.5 rounded-2xl border border-[#DAD0C7] col-span-2">
                <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-0.5">
                  Tiros Libres
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeThrows}
                  onChange={(e) =>
                    setFormData({ ...formData, freeThrows: e.target.value })
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#372D2E] focus:ring-0 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="bg-[#DFD6CD]/30 border border-[#DAD0C7] p-3 rounded-2xl">
          <label className="block text-[10px] font-bold text-[#372D2E]/70 uppercase tracking-wider mb-1">
            Notas / Observaciones
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#372D2E] focus:ring-0 outline-none resize-none placeholder:text-[#372D2E]/40"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#372D2E] text-[#F5F1F0] font-bebas text-lg tracking-wider py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition disabled:opacity-50 uppercase mt-4"
        >
          {submitting ? "Guardando Cambios..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
