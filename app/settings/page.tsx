"use client";

import { useState, useEffect } from "react";
import {
  getOpponentsList,
  createOpponent,
  updateOpponent,
  deleteOpponent,
} from "@/app/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { Plus, Edit2, Trash2, Shield, Settings } from "lucide-react";

interface Opponent {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newOpponentName, setNewOpponentName] = useState("");
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const [editName, setEditName] = useState("");

  // Modal & Toast states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponentName.trim()) return;

    setActionLoading(true);
    try {
      await createOpponent(newOpponentName);
      setNewOpponentName("");
      setToast({ message: "Rival agregado con éxito", type: "success" });
      await loadData();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al agregar rival",
        type: "error",
      });
    } finally {
      setActionLoading(false);
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
      await loadData();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al actualizar",
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
      setDeletingId(null);
      setToast({ message: "Rival eliminado con éxito", type: "success" });
      await loadData();
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
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      {/* Toast Notificación */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Eliminar Rival"
        message="¿Estás seguro de que deseas eliminar este rival? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-6 h-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      {/* Sección ABM Rivales */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Shield className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Gestión de Oponentes ({opponents.length})
          </h2>
        </div>

        {/* Formulario Crear */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del nuevo rival..."
            value={newOpponentName}
            onChange={(e) => setNewOpponentName(e.target.value)}
            className="flex-1 p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={actionLoading || !newOpponentName.trim()}
            className="bg-orange-600 text-white p-2.5 rounded-xl font-semibold text-xs flex items-center gap-1 hover:bg-orange-700 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </form>

        {/* Lista de Rivales */}
        {loading ? (
          <div className="text-center py-6 text-xs text-gray-400">
            Cargando rivales...
          </div>
        ) : (
          <div className="divide-y max-h-80 overflow-y-auto pr-1">
            {opponents.map((opp) => (
              <div
                key={opp.id}
                className="py-3 flex items-center justify-between gap-2"
              >
                {editingOpponent?.id === opp.id ? (
                  <div className="flex items-center gap-2 flex-1">
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
                      className="bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingOpponent(null)}
                      className="bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-gray-800">
                      {opp.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOpponent(opp);
                          setEditName(opp.name);
                        }}
                        className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(opp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
