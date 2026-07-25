/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ClipboardCheck, 
  User as UserIcon, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  MessageSquare, 
  Save, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  LayoutDashboard, 
  FileDown,
  LogOut,
  Sparkles,
  Database,
  Cloud
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { AuditData, INITIAL_AUDIT_DATA, Score, AuditCriterion, ModelItem } from './types';
import { MODELS } from './constants';
import { auth, db, logoutGoogle, handleFirestoreError, OperationType, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { LoginScreen } from './components/LoginScreen';
import { ModelManager } from './components/ModelManager';

interface PrintViewProps {
  audit: AuditData;
  stats: any;
  onBack?: () => void;
  calculateAverage: (criteria: AuditCriterion[]) => string;
}

const PrintView = React.forwardRef<HTMLDivElement, PrintViewProps>(({ audit, stats, onBack, calculateAverage }, ref) => (
  <div 
    ref={ref} 
    className="bg-white p-8 text-zinc-900 w-[760px] mx-auto print:p-0 h-auto shadow-none font-sans"
    style={{ colorScheme: 'light', background: '#ffffff' }}
  >
    <div className="flex justify-between items-start mb-6 border-b-2 border-zinc-900 pb-4">
      <div className="flex items-center gap-4">
        <img 
          src="https://i.ibb.co/svnGzx0f/IN-SYSTEM-09-red.png" 
          alt="Logo" 
          className="h-16 w-auto object-contain" 
        />
        <div>
          <p className="text-xs font-mono uppercase tracking-widest opacity-60">Evaluación de Desempeño y Calidad - Modelos</p>
        </div>
      </div>
      <div className="flex items-start gap-6">
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Score Total</span>
          <span className="text-4xl font-black italic tracking-tighter leading-none text-zinc-900">{stats.overallAvg}</span>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="print:hidden bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            Volver a Editar
          </button>
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase text-zinc-400">Fecha de Evaluación</p>
        <p className="text-xs font-semibold">{audit.header.date}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase text-zinc-400">Periodo Evaluado</p>
        <p className="text-xs font-semibold">{audit.header.period || 'N/A'}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase text-zinc-400">Auditor(a)</p>
        <p className="text-xs font-semibold">{audit.header.auditorName || 'N/A'}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase text-zinc-400">Modelo Evaluada</p>
        <p className="text-xs font-semibold">{audit.header.modelName || 'N/A'}</p>
      </div>
      <div className="col-span-2 space-y-1">
        <p className="text-[10px] font-bold uppercase text-zinc-400">Monitor(a) en Turno</p>
        <p className="text-xs font-semibold">{audit.header.monitorName || 'N/A'}</p>
      </div>
    </div>

    {(Object.keys(audit.sections) as Array<keyof AuditData['sections']>).map((key) => {
      const section = audit.sections[key];
      return (
        <div key={key} className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div className="flex justify-between items-end mb-3 border-b border-zinc-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-zinc-900">{section.title}</h2>
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Promedio</span>
              <span className="text-lg font-black italic text-zinc-900">
                {calculateAverage(section.criteria)}
              </span>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-zinc-200 bg-zinc-50">
                <th className="py-2 px-2 font-bold uppercase text-[9px] text-zinc-500 w-1/2">Criterio</th>
                <th className="py-2 px-2 font-bold uppercase text-[9px] text-zinc-500 text-center w-16">Cal.</th>
                <th className="py-2 px-2 font-bold uppercase text-[9px] text-zinc-500">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {section.criteria.map(c => (
                <tr key={c.id} className="border-b border-zinc-100">
                  <td className="py-2 px-2 leading-tight font-medium text-zinc-800">{c.label}</td>
                  <td className="py-2 px-2 text-center font-bold text-zinc-900">{c.score}</td>
                  <td className="py-2 px-2 italic text-zinc-600">{c.observations || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    })}

    <div className="space-y-4 mt-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <div className="p-5 bg-zinc-900 text-white rounded-2xl">
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60 text-slate-300">RESUMEN DE LA EVALUACIÓN Y PLAN DE ACCIÓN</h3>
        <div className="space-y-3">
          <div>
            <span className="text-[9px] font-bold uppercase opacity-50 block text-slate-400">Fortalezas:</span>
            <p className="text-xs mt-0.5 text-slate-200">{audit.results.strengths || 'Sin observaciones.'}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase opacity-50 block text-slate-400">Áreas de Mejora:</span>
            <p className="text-xs mt-0.5 text-slate-200">{audit.results.improvementAreas || 'Sin observaciones.'}</p>
          </div>
          <div className="pt-3 border-t border-white/10">
            <span className="text-[9px] font-bold uppercase opacity-50 block text-slate-400">Acuerdos y Compromisos:</span>
            <p className="text-xs italic mt-0.5 text-slate-300">{audit.results.agreements || 'Ninguno.'}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12 flex justify-between items-center pt-6 border-t border-zinc-200" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <div className="text-center w-44">
        <div className="border-b border-zinc-900 mb-1"></div>
        <p className="text-[9px] font-bold uppercase text-zinc-600">Firma Auditor(a)</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase opacity-40 text-zinc-500">
          IN SYSTEM - EVALUACIÓN DE DESEMPEÑO {new Date().getFullYear()}
        </p>
      </div>
      <div className="text-center w-44">
        <div className="border-b border-zinc-900 mb-1"></div>
        <p className="text-[9px] font-bold uppercase text-zinc-600">Firma Modelo</p>
      </div>
    </div>
  </div>
));

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore Realtime state for modelos
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [audit, setAudit] = useState<AuditData>(INITIAL_AUDIT_DATA);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // 1. Escuchar estado de autenticación con Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && user.displayName) {
        setAudit(prev => ({
          ...prev,
          header: {
            ...prev.header,
            auditorName: prev.header.auditorName || user.displayName || user.email || ''
          }
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Listener en Tiempo Real (onSnapshot) para la colección 'modelos' en Firestore
  useEffect(() => {
    if (!currentUser) return;

    const path = 'modelos';
    const modelosRef = collection(db, path);

    const unsubscribe = onSnapshot(modelosRef, (snapshot) => {
      const fetchedModels: ModelItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        notes: doc.data().notes || '',
        status: doc.data().status || 'active',
        createdAt: doc.data().createdAt
      }));

      // Ordenar por nombre
      fetchedModels.sort((a, b) => a.name.localeCompare(b.name));
      setModels(fetchedModels);
    }, (error) => {
      console.error("Error en listener en tiempo real de Firestore (modelos):", error);
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleHeaderChange = (field: keyof AuditData['header'], value: string) => {
    setAudit(prev => ({
      ...prev,
      header: { ...prev.header, [field]: value }
    }));
  };

  const handleCriterionChange = (
    sectionKey: keyof AuditData['sections'],
    id: string,
    field: 'score' | 'observations',
    value: any
  ) => {
    setAudit(prev => {
      const section = prev.sections[sectionKey];
      const newCriteria = section.criteria.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      );
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionKey]: { ...section, criteria: newCriteria }
        }
      };
    });
  };

  const handleResultChange = (field: keyof AuditData['results'], value: string) => {
    setAudit(prev => ({
      ...prev,
      results: { ...prev.results, [field]: value }
    }));
  };

  const calculateAverage = (criteria: AuditCriterion[]): string => {
    const validScores: number[] = [];
    criteria.forEach(c => {
      if (typeof c.score === 'number') {
        validScores.push(c.score);
      }
    });
    
    if (validScores.length === 0) return "0.00";
    const sum = validScores.reduce((a, b) => a + b, 0);
    return (sum / validScores.length).toFixed(2);
  };

  const stats = useMemo(() => {
    const ecoAvg = calculateAverage(audit.sections.ecosystem.criteria);
    const perfAvg = calculateAverage(audit.sections.performance.criteria);
    const stratAvg = calculateAverage(audit.sections.strategy.criteria);
    const profAvg = calculateAverage(audit.sections.professionalism.criteria);
    
    const overallAvg = ((parseFloat(ecoAvg) + parseFloat(perfAvg) + parseFloat(stratAvg) + parseFloat(profAvg)) / 4).toFixed(2);
    
    return { ecoAvg, perfAvg, stratAvg, profAvg, overallAvg };
  }, [audit]);

  // Guardar evaluación en Firestore colección 'evaluaciones'
  const handleSaveAuditToFirestore = async () => {
    if (!audit.header.modelName) {
      alert('Por favor selecciona una Modelo antes de guardar la evaluación.');
      return;
    }

    setSaveLoading(true);
    setSaveSuccessMsg(null);

    const path = 'evaluaciones';
    try {
      await addDoc(collection(db, path), {
        ...audit,
        overallScore: stats.overallAvg,
        createdBy: currentUser?.email || currentUser?.uid || 'Anónimo',
        createdAt: serverTimestamp()
      });
      setSaveSuccessMsg(`¡Evaluación de "${audit.header.modelName}" guardada con éxito en Firestore!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error al guardar evaluación en Firestore:', err);
      alert('Error al guardar en Firestore. Verifica que las credenciales de Firebase estén configuradas.');
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (e) {
        // Logged
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const exportToPdf = () => {
    setIsGeneratingPdf(true);

    setTimeout(async () => {
      const element = pdfRef.current;
      if (!element) {
        alert('Error: No se encontró el elemento para generar el PDF');
        setIsGeneratingPdf(false);
        return;
      }

      try {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `Evaluacion_${audit.header.modelName || 'Modelo'}_${audit.header.date || 'Fecha'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true, 
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 800
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Hubo un problema al generar el PDF.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 200);
  };

  // State 1: Cargando Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // State 2: REQUISITO CLAVE - Si el usuario no ha iniciado sesión, la pantalla principal se oculta
  // y se muestra ÚNICAMENTE el botón/pantalla de Iniciar sesión con Google.
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Lista combinada de modelos (modelos reales de Firestore + fallback de constantes)
  const availableModelsList = models.length > 0 
    ? models.map(m => m.name)
    : MODELS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-black text-slate-100 font-sans selection:bg-cyan-600 selection:text-white pb-24 relative">
      
      {/* Modal de gestión de modelos en Firestore */}
      <ModelManager 
        models={models}
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
      />

      {isPrintMode ? (
        <div className="relative z-[100] bg-white text-zinc-900 min-h-screen p-6">
          <PrintView 
            audit={audit} 
            stats={stats} 
            onBack={() => setIsPrintMode(false)} 
            calculateAverage={calculateAverage}
          />
          <div className="fixed bottom-8 right-8 print:hidden flex gap-4">
            <button 
              onClick={() => window.print()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border border-cyan-400/30"
              title="Imprimir o Guardar como PDF"
            >
              <Printer size={24} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header con Perfil de Usuario y Gestión Firestore */}
          <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              
              <div className="flex items-center gap-3">
                <img 
                  src="https://i.ibb.co/svnGzx0f/IN-SYSTEM-09-red.png" 
                  alt="Logo" 
                  className="h-18 md:h-20 w-auto object-contain" 
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Cloud size={12} className="text-cyan-400" />
                    Firestore Live Sync Active
                  </p>
                </div>
              </div>

              {/* Central/Right Action Controls */}
              <div className="flex items-center gap-3 flex-wrap justify-end">
                
                {/* Botón Administrar Modelos Firestore */}
                <button
                  onClick={() => setIsModelManagerOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                >
                  <Users size={16} className="text-cyan-400" />
                  <span>Modelos Firestore ({models.length})</span>
                </button>

                <div className="hidden lg:block text-right px-3 border-l border-r border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Promedio General</p>
                  <p className="text-2xl font-black italic leading-none text-white">{stats.overallAvg}</p>
                </div>

                <button 
                  onClick={() => setIsPrintMode(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-md"
                >
                  <Printer size={16} />
                  <span>Vista Previa</span>
                </button>

                {/* Perfil de Google Auth y Logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'Usuario'} 
                      className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center font-bold text-xs">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-slate-100 leading-tight truncate max-w-[120px]">
                      {currentUser.displayName || 'Auditor'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {currentUser.email}
                    </p>
                  </div>

                  <button
                    onClick={logoutGoogle}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all duration-300"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={18} />
                  </button>
                </div>

              </div>
            </div>
          </header>

          {/* Banner de Aviso si las credenciales de Firebase no han sido pegadas aún */}
          {!isFirebaseConfigured() && (
            <div className="bg-amber-950/60 border-b border-amber-500/30 text-amber-200 px-6 py-2.5 text-xs font-bold text-center tracking-wide flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>
                Recordatorio: Configuración de Firebase requerida en <code className="bg-amber-900/80 px-1.5 py-0.5 rounded">src/firebase.ts</code>.
              </span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="max-w-7xl mx-auto px-6 mt-4">
              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-6 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg animate-fade-in">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Form Side */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* Header Info */}
                <section className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="text-cyan-400" size={20} />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Información General</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModelManagerOpen(true)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider transition-colors duration-300"
                    >
                      <Database size={14} />
                      <span>Gestionar Modelos ({models.length})</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Fecha de Evaluación</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="date" 
                          value={audit.header.date}
                          onChange={(e) => handleHeaderChange('date', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800/80 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Periodo Evaluado</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Ej. Primera quincena de Marzo"
                          value={audit.header.period}
                          onChange={(e) => handleHeaderChange('period', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800/80 text-white placeholder-slate-500 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Auditor(a)</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Nombre del Auditor"
                          value={audit.header.auditorName}
                          onChange={(e) => handleHeaderChange('auditorName', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800/80 text-white placeholder-slate-500 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>

                    {/* Modelo Evaluada - Sincronizada en tiempo real desde Firestore 'modelos' */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                          Modelo Evaluada (Firestore)
                        </label>
                      </div>
                      <div className="relative">
                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select 
                          value={audit.header.modelName}
                          onChange={(e) => handleHeaderChange('modelName', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800/80 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-medium appearance-none"
                        >
                          <option value="" className="bg-slate-900 text-slate-300">Seleccionar Modelo</option>
                          {availableModelsList.map(model => (
                            <option key={model} value={model} className="bg-slate-900 text-white">{model}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Monitor(a) en Turno</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Nombre del Monitor a cargo"
                          value={audit.header.monitorName}
                          onChange={(e) => handleHeaderChange('monitorName', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800/80 text-white placeholder-slate-500 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sections */}
                {(Object.keys(audit.sections) as Array<keyof AuditData['sections']>).map((key) => {
                  const section = audit.sections[key];
                  return (
                    <section key={key} className="space-y-6">
                      <div className="flex items-end justify-between px-2">
                        <div>
                          <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-white">{section.title}</h2>
                          <p className="text-xs text-slate-400 mt-2 max-w-md">{section.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg</span>
                          <span className="text-3xl font-black italic text-cyan-400">{calculateAverage(section.criteria)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {section.criteria.map(c => (
                          <div key={c.id} className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <p className="font-bold text-slate-100 mb-4 group-hover:text-white transition-colors">{c.label}</p>
                                <div className="flex flex-wrap gap-2">
                                  {([1, 2, 3, 4, 5, 'N/A'] as Score[]).map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => handleCriterionChange(key, c.id, 'score', v)}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                        c.score === v 
                                          ? 'bg-cyan-600 text-white scale-105 shadow-lg shadow-cyan-950/50 border border-cyan-400/50' 
                                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                                      }`}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="md:w-1/3">
                                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 mb-2 block">Observaciones / Hallazgos</label>
                                <textarea 
                                  value={c.observations}
                                  onChange={(e) => handleCriterionChange(key, c.id, 'observations', e.target.value)}
                                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 min-h-[100px] resize-none"
                                  placeholder="Escribe aquí..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}

                {/* Results Section */}
                <section className="space-y-8">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter px-2 text-white">RESUMEN DE LA EVALUACIÓN Y PLAN DE ACCIÓN</h2>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-slate-900/80 backdrop-blur-md text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
                      <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="text-cyan-400" size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">Fortalezas</h3>
                      </div>
                      <textarea 
                        value={audit.results.strengths}
                        onChange={(e) => handleResultChange('strengths', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 text-sm text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 min-h-[120px] placeholder:text-slate-600"
                        placeholder="Describe los puntos fuertes de la modelo..."
                      />
                      
                      <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="text-amber-400" size={20} />
                          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">Áreas de Mejora</h3>
                        </div>
                        <textarea 
                          value={audit.results.improvementAreas}
                          onChange={(e) => handleResultChange('improvementAreas', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 text-sm text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 min-h-[120px] placeholder:text-slate-600"
                          placeholder="Identifica los aspectos a corregir..."
                        />
                      </div>

                      <div className="mt-8">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 mb-2 block">Acuerdos y Compromisos</label>
                        <input 
                          type="text"
                          value={audit.results.agreements}
                          onChange={(e) => handleResultChange('agreements', e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 placeholder:text-slate-600"
                          placeholder="Define los compromisos acordados..."
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-4">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-slate-900/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 text-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-slate-200">Resumen de Evaluación</h3>
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Ecosistema</span>
                          <span className="text-lg font-black italic text-cyan-400">{stats.ecoAvg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Desempeño</span>
                          <span className="text-lg font-black italic text-cyan-400">{stats.perfAvg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Estrategia</span>
                          <span className="text-lg font-black italic text-cyan-400">{stats.stratAvg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Profesionalismo</span>
                          <span className="text-lg font-black italic text-cyan-400">{stats.profAvg}</span>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Score Total</span>
                            <span className="text-5xl font-black italic tracking-tighter leading-none text-white">{stats.overallAvg}</span>
                          </div>
                          <div className="text-right">
                            {parseFloat(stats.overallAvg) >= 4 ? (
                              <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs uppercase">
                                <CheckCircle2 size={14} />
                                Óptimo
                              </div>
                            ) : parseFloat(stats.overallAvg) >= 3 ? (
                              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs uppercase">
                                <AlertCircle size={14} />
                                Regular
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs uppercase">
                                <AlertCircle size={14} />
                                Crítico
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-10">
                        {/* Botón de Guardar en Firestore */}
                        <button 
                          onClick={handleSaveAuditToFirestore}
                          disabled={saveLoading}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-[2rem] font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/40 border border-cyan-400/30 disabled:opacity-50"
                        >
                          {saveLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Guardando en Firestore...</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Guardar en Firestore
                            </>
                          )}
                        </button>

                        <button 
                          onClick={() => setIsPrintMode(true)}
                          className="w-full bg-slate-800/80 text-slate-200 py-3.5 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700"
                        >
                          <Printer size={16} />
                          Vista Previa e Impresión
                        </button>

                        <button 
                          onClick={exportToPdf}
                          disabled={isGeneratingPdf}
                          className={`w-full py-4 rounded-[2rem] font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                            isGeneratingPdf 
                              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 shadow-cyan-950/40'
                          }`}
                        >
                          {isGeneratingPdf ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <FileDown size={18} />
                              Descargar PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem] text-slate-200">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-slate-400">Instrucciones de Calificación</h4>
                    <ul className="space-y-3 text-[11px] font-medium text-slate-300">
                      <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400">5</span> Excelente (Dominio total)</li>
                      <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400">4</span> Bueno (Cumple el estándar)</li>
                      <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400">3</span> Regular (Requiere mejora)</li>
                      <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400">2</span> Deficiente (Afecta ingresos)</li>
                      <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400">1</span> Crítico (Falta grave)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {/* Indicator de carga al generar PDF */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-center text-white shadow-2xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-200">Generando documento PDF...</p>
          </div>
        </div>
      )}

      {/* Offscreen PDF Source element - Always rendered in DOM with clean dimensions */}
      <div 
        id="pdf-export-container"
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '0', 
          width: '800px',
          background: '#ffffff',
          zIndex: -100
        }}
      >
        <PrintView 
          ref={pdfRef}
          audit={audit} 
          stats={stats} 
          calculateAverage={calculateAverage}
        />
      </div>

      {/* Footer Branding */}
      {!isPrintMode && (
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/svnGzx0f/IN-SYSTEM-09-red.png" alt="Logo" className="h-12 w-auto object-contain opacity-80" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            © {new Date().getFullYear()} Conectado a Firestore & Firebase Auth.
          </p>
        </footer>
      )}
    </div>
  );
}
