"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getOpponentsList,
  createOpponent,
  updateOpponent,
  deleteOpponent,
} from "@/app/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { Users, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";

interface Opponent {
  id: string;
  name: string;
}

export default function OpponentsPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  // Alta
  const [newOpponentName, setNewOpponentName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edición inline
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(
    null,
  );
  const [editName, setEditName] = useState("");

  // Modal & Toast
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadOpponents = async () => {
    try {
      const list = await getOpponentsList();
      setOpponents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpponents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponentName.trim()) return;

    setCreating(true);
    try {
      await createOpponent(newOpponentName);
      setNewOpponentName("");
      setToast({ message: "Rival agregado con éxito", type: "success" });
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al agregar rival",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingOpponent || !editName.trim()) return;

    setActionLoading(true);
    try {
      await updateOpponent(editingOpponent.id, editName);
      setEditingOpponent(null);
      setEditName("");
      setToast({ message: "Rival actualizado con éxito", type: "success" });
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al actualizar rival",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setActionLoading(true);
    try {
      await deleteOpponent(deletingId);
      setToast({ message: "Rival eliminado con éxito", type: "success" });
      setDeletingId(null);
      await loadOpponents();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al eliminar rival",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Eliminar Rival"
        message="¿Estás seguro de que deseas eliminar este rival? Esta acción no se puede deshacer. No se podrá eliminar si tiene partidos registrados."
        confirmText="Eliminar"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <div>
        <h1 className="text-xl font-black text-gray-900">Rivales</h1>
        <p className="text-xs text-gray-500">
          Clubes enfrentados en la temporada
        </p>
      </div>

      {/* Alta rápida de rival */}
      <form
        onSubmit={handleCreate}
        className="flex gap-2 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm"
      >
        <input
          type="text"
          placeholder="Nombre del nuevo rival..."
          value={newOpponentName}
          onChange={(e) => setNewOpponentName(e.target.value)}
          className="flex-1 p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={creating || !newOpponentName.trim()}
          className="bg-orange-600 text-white px-3 rounded-xl font-semibold text-xs flex items-center gap-1 hover:bg-orange-700 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </form>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-400">
          Cargando rivales...
        </div>
      ) : opponents.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">
            Aún no hay rivales registrados.
          </p>
          <p className="text-xs text-gray-400">
            Agregalo arriba, o se creará automáticamente al cargar un
            partido.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {opponents.map((opp) => (
            <div
              key={opp.id}
              className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm"
            >
              {editingOpponent?.id === opp.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 p-1.5 border rounded-lg text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingOpponent(null)}
                    disabled={actionLoading}
                    className="bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link
                    href={`/opponents/${opp.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700 text-sm shrink-0">
                      🆚
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {opp.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Ver historial de partidos
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingOpponent(opp);
                        setEditName(opp.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(opp.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/opponents/${opp.id}`}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
