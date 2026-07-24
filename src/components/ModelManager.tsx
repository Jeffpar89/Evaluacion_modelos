import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Users, Sparkles, AlertCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ModelItem } from '../types';

interface ModelManagerProps {
  models: ModelItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({ models, isOpen, onClose }) => {
  const [newModelName, setNewModelName] = useState('');
  const [newModelNotes, setNewModelNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await addDoc(collection(db, 'modelos'), {
        name: newModelName.trim(),
        notes: newModelNotes.trim(),
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewModelName('');
      setNewModelNotes('');
    } catch (err) {
      console.error('Error adding model to Firestore:', err);
      setErrorMsg('No se pudo agregar la modelo. Verifique los permisos o credenciales.');
      try {
        handleFirestoreError(err, OperationType.CREATE, 'modelos');
      } catch (e) {
        // Logged by handleFirestoreError
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (model: ModelItem) => {
    setEditingId(model.id);
    setEditName(model.name);
    setEditNotes(model.notes || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const modelRef = doc(db, 'modelos', id);
      await updateDoc(modelRef, {
        name: editName.trim(),
        notes: editNotes.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error updating model in Firestore:', err);
      setErrorMsg('No se pudo actualizar la modelo.');
      try {
        handleFirestoreError(err, OperationType.UPDATE, `modelos/${id}`);
      } catch (e) {
        // Logged
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a la modelo "${name}" de Firestore?`)) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await deleteDoc(doc(db, 'modelos', id));
    } catch (err) {
      console.error('Error deleting model from Firestore:', err);
      setErrorMsg('No se pudo eliminar la modelo.');
      try {
        handleFirestoreError(err, OperationType.DELETE, `modelos/${id}`);
      } catch (e) {
        // Logged
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-3 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                Gestión de Modelos en Firestore
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Colección real en tiempo real: <span className="text-cyan-400 font-mono">modelos</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-amber-200 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Add Model Form */}
        <form onSubmit={handleAddModel} className="mt-6 bg-slate-950/60 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            Agregar Nueva Modelo a Firestore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Nombre de la Modelo (ej. Camila Velez)"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              required
              className="bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium transition-all duration-300"
            />
            <input 
              type="text" 
              placeholder="Notas u Observaciones (opcional)"
              value={newModelNotes}
              onChange={(e) => setNewModelNotes(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newModelName.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 border border-cyan-400/30 shadow-lg shadow-cyan-950/30"
          >
            <Plus size={16} />
            Crear Modelo en Firestore
          </button>
        </form>

        {/* List of Models from Firestore */}
        <div className="mt-6 flex-1 overflow-y-auto pr-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
            Modelos Sincronizadas ({models.length})
          </h3>

          {models.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800">
              <Users size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-bold uppercase text-slate-400">No hay modelos registradas en Firestore</p>
              <p className="text-[11px] text-slate-500 mt-1">Agrega una nueva modelo arriba para comenzar la sincronización.</p>
            </div>
          ) : (
            models.map((model) => (
              <div 
                key={model.id}
                className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-4 hover:border-slate-600 transition-all duration-300 shadow-sm"
              >
                {editingId === model.id ? (
                  <div className="flex-1 flex flex-col md:flex-row gap-2 items-center">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold flex-1"
                    />
                    <input 
                      type="text" 
                      value={editNotes}
                      placeholder="Notas"
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs flex-1"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSaveEdit(model.id)}
                        disabled={loading}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all duration-300"
                        title="Guardar"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-300"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-bold text-white text-sm">{model.name}</h4>
                      {model.notes && (
                        <p className="text-xs text-slate-400 mt-0.5">{model.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStartEdit(model)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300"
                        title="Editar modelo"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteModel(model.id, model.name)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 rounded-xl transition-all duration-300"
                        title="Eliminar modelo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-800 text-slate-200 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all duration-300 border border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
