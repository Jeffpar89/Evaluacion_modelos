/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  ClipboardCheck, 
  User, 
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
  FileDown 
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { AuditData, INITIAL_AUDIT_DATA, Score, AuditCriterion } from './types';
import { MODELS } from './constants';

interface PrintViewProps {
  audit: AuditData;
  stats: any;
  onBack?: () => void;
  calculateAverage: (criteria: AuditCriterion[]) => string;
}

const PrintView = React.forwardRef<HTMLDivElement, PrintViewProps>(({ audit, stats, onBack, calculateAverage }, ref) => (
  <div 
    ref={ref} 
    className="bg-white p-8 text-zinc-900 max-w-4xl mx-auto print:p-0 h-auto shadow-none"
    style={{ colorScheme: 'light' }}
  >
    <div className="flex justify-between items-start mb-8 border-b-2 border-zinc-900 pb-4">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">
          <span className="text-rose-600">Tribu</span> <span className="text-zinc-900">1126</span> <span className="text-zinc-900">Models</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest opacity-60">Evaluación de Desempeño y Calidad - Modelos</p>
      </div>
      <div className="flex items-start gap-6">
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Score Total</span>
          <span className="text-5xl font-black italic tracking-tighter leading-none">{stats.overallAvg}</span>
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

    <div className="grid grid-cols-2 gap-6 mb-8 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-zinc-400">Fecha de Evaluación</p>
        <p className="font-medium">{audit.header.date}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-zinc-400">Periodo Evaluado</p>
        <p className="font-medium">{audit.header.period || 'N/A'}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-zinc-400">Auditor(a)</p>
        <p className="font-medium">{audit.header.auditorName || 'N/A'}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-zinc-400">Modelo Evaluada</p>
        <p className="font-medium">{audit.header.modelName || 'N/A'}</p>
      </div>
      <div className="col-span-2 space-y-2">
        <p className="text-xs font-bold uppercase text-zinc-400">Monitor(a) en Turno</p>
        <p className="font-medium">{audit.header.monitorName || 'N/A'}</p>
      </div>
    </div>

    {(Object.keys(audit.sections) as Array<keyof AuditData['sections']>).map((key) => {
      const section = audit.sections[key];
      return (
        <div key={key} className="mb-10">
          <div className="flex justify-between items-end mb-4 border-b border-zinc-200 pb-2">
            <h2 className="text-lg font-bold uppercase tracking-tight">{section.title}</h2>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Promedio Sección</span>
              <span className="text-xl font-black italic">
                {calculateAverage(section.criteria)}
              </span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                <th className="py-2 font-bold uppercase text-[10px] text-zinc-400 w-1/2">Criterio</th>
                <th className="py-2 font-bold uppercase text-[10px] text-zinc-400 text-center w-16">Cal.</th>
                <th className="py-2 font-bold uppercase text-[10px] text-zinc-400">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {section.criteria.map(c => (
                <tr key={c.id} className="border-b border-zinc-50">
                  <td className="py-3 pr-4 leading-tight">{c.label}</td>
                  <td className="py-3 text-center font-bold">{c.score}</td>
                  <td className="py-3 italic text-zinc-600">{c.observations || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    })}

    <div className="space-y-6 mt-12">
      <div className="p-6 bg-zinc-900 text-white rounded-3xl">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">RESUMEN DE LA EVALUACIÓN Y PLAN DE ACCIÓN</h3>
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase opacity-50">Fortalezas:</span>
            <p className="text-sm mt-1">{audit.results.strengths || 'Sin observaciones.'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase opacity-50">Áreas de Mejora:</span>
            <p className="text-sm mt-1">{audit.results.improvementAreas || 'Sin observaciones.'}</p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase opacity-50">Acuerdos y Compromisos:</span>
            <p className="text-sm italic mt-1">{audit.results.agreements || 'Ninguno.'}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-16 flex justify-between items-center pt-8 border-t border-zinc-200">
      <div className="text-center w-48">
        <div className="border-b border-zinc-900 mb-2"></div>
        <p className="text-[10px] font-bold uppercase">Firma Auditor(a)</p>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase opacity-30">
          <span className="text-rose-600">Tribu</span> <span className="text-zinc-900">1126</span> Models - {new Date().getFullYear()}
        </p>
      </div>
      <div className="text-center w-48">
        <div className="border-b border-zinc-900 mb-2"></div>
        <p className="text-[10px] font-bold uppercase">Firma Modelo</p>
      </div>
    </div>
  </div>
));

export default function App() {
  const [audit, setAudit] = useState<AuditData>(INITIAL_AUDIT_DATA);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  const exportToPdf = () => {
    const element = pdfRef.current;
    if (!element) {
      alert('Error: No se encontró el elemento para generar el PDF');
      return;
    }

    setIsGeneratingPdf(true);
    window.scrollTo(0, 0);

    // Give the UI a moment to show the loading state
    setTimeout(async () => {
      try {
        const opt = {
          margin: [10, 10],
          filename: `Retroalimentacion_${audit.header.modelName || 'Modelo'}_${audit.header.date || 'Fecha'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
            removeContainer: true,
            // @ts-ignore
            onclone: (clonedDoc) => {
              // THE NUCLEAR OPTION: Remove all existing stylesheets to prevent html2canvas 
              // from trying to parse Tailwind 4's oklch/oklab colors which it doesn't understand.
              const styleSheets = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
              styleSheets.forEach((s: any) => s.remove());

              // Inject a completely safe, HEX-only stylesheet for the PDF
              const safeStyle = clonedDoc.createElement('style');
              safeStyle.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                * { 
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact;
                }
                
                body, html { 
                  margin: 0; 
                  padding: 0; 
                  background: #ffffff;
                  font-family: 'Inter', sans-serif;
                  font-size: 11px;
                }

                #pdf-export-container {
                  width: 750px !important;
                  margin: 0 auto !important;
                  background: #ffffff !important;
                  color: #18181b !important;
                  display: block !important;
                  position: relative !important;
                }

                .bg-white { background-color: #ffffff !important; }
                .bg-zinc-50 { background-color: #fafafa !important; }
                .bg-zinc-900 { background-color: #18181b !important; }
                
                .text-zinc-900 { color: #18181b !important; }
                .text-zinc-600 { color: #52525b !important; }
                .text-zinc-400 { color: #a1a1aa !important; }
                .text-white { color: #ffffff !important; }
                .text-rose-600 { color: #e11d48 !important; }
                
                .border-zinc-900 { border-color: #18181b !important; }
                .border-zinc-200 { border-color: #e4e4e7 !important; }
                .border-zinc-100 { border-color: #f4f4f5 !important; }
                .border-zinc-50 { border-color: #fafafa !important; }
                .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1) !important; }
                
                .font-black { font-weight: 900 !important; }
                .font-bold { font-weight: 700 !important; }
                .font-medium { font-weight: 500 !important; }
                .italic { font-style: italic !important; }
                .uppercase { text-transform: uppercase !important; }
                .tracking-tighter { letter-spacing: -0.05em !important; }
                .tracking-tight { letter-spacing: -0.025em !important; }
                .tracking-widest { letter-spacing: 0.1em !important; }
                
                .text-3xl { font-size: 1.5rem !important; }
                .text-5xl { font-size: 2.5rem !important; }
                .leading-none { line-height: 1 !important; }
                .text-2xl { font-size: 1.25rem !important; }
                .text-xl { font-size: 1.1rem !important; }
                .text-lg { font-size: 1rem !important; }
                .text-sm { font-size: 0.75rem !important; }
                .text-xs { font-size: 0.65rem !important; }
                .text-\\[10px\\] { font-size: 9px !important; }
                
                .p-8 { padding: 1.25rem !important; }
                .p-6 { padding: 1rem !important; }
                .pb-4 { padding-bottom: 0.75rem !important; }
                .pb-2 { padding-bottom: 0.35rem !important; }
                .pt-4 { padding-top: 0.75rem !important; }
                .pt-8 { padding-top: 1.25rem !important; }
                .py-2 { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
                .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                .pr-4 { padding-right: 0.75rem !important; }
                
                .mb-8 { margin-bottom: 1rem !important; }
                .mb-10 { margin-bottom: 1.25rem !important; }
                .mb-4 { margin-bottom: 0.5rem !important; }
                .mb-2 { margin-bottom: 0.25rem !important; }
                .mt-1 { margin-top: 0.15rem !important; }
                .mt-12 { margin-top: 1.5rem !important; }
                .mt-16 { margin-top: 2rem !important; }
                
                .grid { display: grid !important; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                .gap-6 { gap: 1rem !important; }
                
                .flex { display: flex !important; }
                .justify-between { justify-content: space-between !important; }
                .items-start { align-items: flex-start !important; }
                .items-end { align-items: flex-end !important; }
                .items-center { align-items: center !important; }
                
                .border-b-2 { border-bottom-width: 2px !important; }
                .border-b { border-bottom-width: 1px !important; }
                .border-t { border-top-width: 1px !important; }
                .border { border-width: 1px !important; }
                
                .rounded-2xl { border-radius: 0.75rem !important; }
                .rounded-3xl { border-radius: 1rem !important; }
                
                .w-full { width: 100% !important; }
                .w-48 { width: 10rem !important; }
                .max-w-4xl { max-width: 50rem !important; }
                
                table { width: 100% !important; border-collapse: collapse !important; }
                .opacity-60 { opacity: 0.6 !important; }
                .opacity-50 { opacity: 0.5 !important; }
                .opacity-30 { opacity: 0.3 !important; }
                
                .space-y-2 > * + * { margin-top: 0.35rem !important; }
                .space-y-4 > * + * { margin-top: 0.75rem !important; }
                .space-y-6 > * + * { margin-top: 1rem !important; }
                
                /* Hide elements that shouldn't be in PDF */
                .print\\:hidden { display: none !important; }
              `;
              clonedDoc.head.appendChild(safeStyle);

              // Ensure the container is visible and correctly sized
              const container = clonedDoc.getElementById('pdf-export-container');
              if (container) {
                container.style.position = 'relative';
                container.style.left = '0';
                container.style.top = '0';
                container.style.display = 'block';
                container.style.visibility = 'visible';
              }
            }
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        };

        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Hubo un error al generar el PDF. Por favor, usa el botón "Vista Previa e Impresión" y elige "Guardar como PDF" en el menú de impresión de tu navegador.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white pb-24">
      {isPrintMode ? (
        <div className="relative z-[100] bg-white">
          <PrintView 
            audit={audit} 
            stats={stats} 
            onBack={() => setIsPrintMode(false)} 
            calculateAverage={calculateAverage}
          />
          <div className="fixed bottom-8 right-8 print:hidden flex gap-4">
            <button 
              onClick={() => window.print()}
              className="bg-zinc-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
              title="Imprimir o Guardar como PDF"
            >
              <Printer size={24} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-2 rounded-xl">
              <ClipboardCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">
                <span className="text-rose-600">Tribu</span> <span className="text-zinc-900">1126</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Audit System v1.0</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-zinc-400">Promedio General</p>
              <p className="text-2xl font-black italic leading-none">{stats.overallAvg}</p>
            </div>
            <button 
              onClick={() => setIsPrintMode(true)}
              className="bg-zinc-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shadow-zinc-200"
            >
              <Printer size={16} />
              Vista Previa e Impresión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Form Side */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header Info */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-200">
              <div className="flex items-center gap-3 mb-8">
                <LayoutDashboard className="text-zinc-400" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest">Información General</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Fecha de Evaluación</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input 
                      type="date" 
                      value={audit.header.date}
                      onChange={(e) => handleHeaderChange('date', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Periodo Evaluado</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Ej. Primera quincena de Marzo"
                      value={audit.header.period}
                      onChange={(e) => handleHeaderChange('period', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Auditor(a)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nombre del Auditor"
                      value={audit.header.auditorName}
                      onChange={(e) => handleHeaderChange('auditorName', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Modelo Evaluada</label>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <select 
                      value={audit.header.modelName}
                      onChange={(e) => handleHeaderChange('modelName', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zinc-900 transition-all font-medium appearance-none"
                    >
                      <option value="">Seleccionar Modelo</option>
                      {MODELS.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Monitor(a) en Turno</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nombre del Monitor a cargo"
                      value={audit.header.monitorName}
                      onChange={(e) => handleHeaderChange('monitorName', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
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
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{section.title}</h2>
                      <p className="text-xs text-zinc-400 mt-2 max-w-md">{section.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block">Avg</span>
                      <span className="text-3xl font-black italic">{calculateAverage(section.criteria)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.criteria.map(c => (
                      <div key={c.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 hover:border-zinc-300 transition-all group">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <p className="font-bold text-zinc-800 mb-4 group-hover:text-zinc-900 transition-colors">{c.label}</p>
                            <div className="flex flex-wrap gap-2">
                              {([1, 2, 3, 4, 5, 'N/A'] as Score[]).map(v => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => handleCriterionChange(key, c.id, 'score', v)}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                                    c.score === v 
                                      ? 'bg-zinc-900 text-white scale-110 shadow-lg' 
                                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                  }`}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="md:w-1/3">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 mb-2 block">Observaciones / Hallazgos</label>
                            <textarea 
                              value={c.observations}
                              onChange={(e) => handleCriterionChange(key, c.id, 'observations', e.target.value)}
                              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-zinc-900 transition-all min-h-[100px] resize-none"
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
              <h2 className="text-2xl font-black italic uppercase tracking-tighter px-2">RESUMEN DE LA EVALUACIÓN Y PLAN DE ACCIÓN</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-zinc-900 text-white p-8 rounded-[3rem] shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-white/40" size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Fortalezas</h3>
                  </div>
                  <textarea 
                    value={audit.results.strengths}
                    onChange={(e) => handleResultChange('strengths', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-white/20 transition-all min-h-[120px] placeholder:text-white/20"
                    placeholder="Describe los puntos fuertes de la modelo..."
                  />
                  
                  <div className="mt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="text-white/40" size={20} />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Áreas de Mejora</h3>
                    </div>
                    <textarea 
                      value={audit.results.improvementAreas}
                      onChange={(e) => handleResultChange('improvementAreas', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-white/20 transition-all min-h-[120px] placeholder:text-white/20"
                      placeholder="Identifica los aspectos a corregir..."
                    />
                  </div>

                  <div className="mt-8">
                    <label className="text-[10px] font-bold uppercase text-white/40 ml-1 mb-2 block">Acuerdos y Compromisos</label>
                    <input 
                      type="text"
                      value={audit.results.agreements}
                      onChange={(e) => handleResultChange('agreements', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-white/20 transition-all"
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
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-zinc-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 z-0"></div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Resumen de Evaluación</h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Ecosistema</span>
                      <span className="text-lg font-black italic">{stats.ecoAvg}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Desempeño</span>
                      <span className="text-lg font-black italic">{stats.perfAvg}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Estrategia</span>
                      <span className="text-lg font-black italic">{stats.stratAvg}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Profesionalismo</span>
                      <span className="text-lg font-black italic">{stats.profAvg}</span>
                    </div>
                    
                    <div className="pt-6 border-t border-zinc-100 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Score Total</span>
                        <span className="text-5xl font-black italic tracking-tighter leading-none">{stats.overallAvg}</span>
                      </div>
                      <div className="text-right">
                        {parseFloat(stats.overallAvg) >= 4 ? (
                          <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs uppercase">
                            <CheckCircle2 size={14} />
                            Óptimo
                          </div>
                        ) : parseFloat(stats.overallAvg) >= 3 ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs uppercase">
                            <AlertCircle size={14} />
                            Regular
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-500 font-bold text-xs uppercase">
                            <AlertCircle size={14} />
                            Crítico
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-10">
                    <button 
                      onClick={() => {
                        alert('Retroalimentación guardada localmente (Simulación)');
                      }}
                      className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-zinc-200"
                    >
                      <Save size={18} />
                      Guardar Retroalimentación
                    </button>

                    <button 
                      onClick={() => setIsPrintMode(true)}
                      className="w-full bg-zinc-100 text-zinc-900 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 border border-zinc-200"
                    >
                      <Printer size={16} />
                      Vista Previa e Impresión
                    </button>

                    <button 
                      onClick={exportToPdf}
                      disabled={isGeneratingPdf}
                      className={`w-full py-5 rounded-[2rem] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${
                        isGeneratingPdf 
                          ? 'bg-zinc-400 cursor-not-allowed' 
                          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
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

              <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Instrucciones de Calificación</h4>
                <ul className="space-y-3 text-[11px] font-medium opacity-80">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-bold">5</span> Excelente (Dominio total)</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-bold">4</span> Bueno (Cumple el estándar)</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-bold">3</span> Regular (Requiere mejora)</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-bold">2</span> Deficiente (Afecta ingresos)</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-bold">1</span> Crítico (Falta grave)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
        </>
      )}

      {/* Hidden PDF Source - Optimized for html2canvas */}
      <div 
        id="pdf-export-container"
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '0', 
          width: '1024px', // Standard desktop width for better layout
          background: 'white',
          zIndex: -1
        }}
      >
        <div className="p-10">
          <PrintView 
            ref={pdfRef}
            audit={audit} 
            stats={stats} 
            calculateAverage={calculateAverage}
          />
        </div>
      </div>

      {/* Footer Branding */}
      {!isPrintMode && (
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-30">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg"></div>
            <span className="font-black italic uppercase tracking-tighter">
              <span className="text-rose-600">Tribu</span> <span className="text-zinc-900">1126</span>
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">© {new Date().getFullYear()} TRIBU 1126 MODELS. Todos los derechos reservados.</p>
        </footer>
      )}
    </div>
  );
}
