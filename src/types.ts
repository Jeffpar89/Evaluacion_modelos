export type Score = 1 | 2 | 3 | 4 | 5 | 'N/A';

export interface AuditCriterion {
  id: string;
  label: string;
  score: Score;
  observations: string;
}

export interface AuditSection {
  title: string;
  description: string;
  criteria: AuditCriterion[];
}

export interface AuditData {
  header: {
    date: string;
    modelName: string;
    auditorName: string;
    monitorName: string;
    period: string;
  };
  sections: {
    ecosystem: AuditSection;
    performance: AuditSection;
    strategy: AuditSection;
    professionalism: AuditSection;
  };
  results: {
    strengths: string;
    improvementAreas: string;
    agreements: string;
  };
}

export const INITIAL_AUDIT_DATA: AuditData = {
  header: {
    date: new Date().toISOString().split('T')[0],
    modelName: '',
    auditorName: '',
    monitorName: '',
    period: '',
  },
  sections: {
    ecosystem: {
      title: 'SECCIÓN 1: AUTOGESTIÓN Y PREPARACIÓN DEL SET (El Ecosistema)',
      description: 'Evalúa la capacidad de la modelo para preparar su espacio sin depender de soporte.',
      criteria: [
        { id: 'e1', label: 'Encuadre y Calidad Visual: Cámara bien posicionada, enfocada, e iluminación sin sombras fuertes.', score: 5, observations: '' },
        { id: 'e2', label: 'Estética del Set: Fondo limpio, ordenado y visualmente atractivo.', score: 5, observations: '' },
        { id: 'e3', label: 'Imagen Personal: Maquillaje, peinado y vestuario cumplen con el estándar de alta calidad.', score: 5, observations: '' },
        { id: 'e4', label: 'Configuración Técnica: Topic, Goals, Menú de propinas y Bots redactados sin errores.', score: 5, observations: '' },
      ],
    },
    performance: {
      title: 'SECCIÓN 2: DESEMPEÑO EN SALA (Retención de Tráfico)',
      description: 'Evalúa la actitud y cómo la modelo maneja su audiencia en la sala pública (Free Chat).',
      criteria: [
        { id: 'p1', label: 'Actitud y Energía: Postura seductora, sonríe constantemente y no se muestra distraída.', score: 5, observations: '' },
        { id: 'p2', label: 'Interacción y Bienvenida: Saluda a los usuarios, interactúa con el chat y fomenta conversación.', score: 5, observations: '' },
        { id: 'p3', label: 'Uso de Dinámicas: Implementa juegos, juguetes interactivos o shows escalonados.', score: 5, observations: '' },
        { id: 'p4', label: 'Manejo del Silencio: Sabe qué hacer cuando baja el tráfico en lugar de usar el celular.', score: 5, observations: '' },
      ],
    },
    strategy: {
      title: 'SECCIÓN 3: ESTRATEGIA DE VENTAS Y CONVERSIÓN',
      description: 'Evalúa la capacidad comercial de la modelo para monetizar su tráfico.',
      criteria: [
        { id: 's1', label: 'Incitación al Gasto: Invita verbalmente y por texto a cumplir metas o comprar del menú.', score: 5, observations: '' },
        { id: 's2', label: 'Cierre en Privados: Logra llevar a los usuarios a shows privados y mantenerlos.', score: 5, observations: '' },
        { id: 's3', label: 'Venta Cruzada (Upselling): Promueve contenido adicional (fotos, videos, Fanclub).', score: 5, observations: '' },
        { id: 's4', label: 'Fidelización: Reconoce a usuarios frecuentes y les da trato preferencial.', score: 5, observations: '' },
      ],
    },
    professionalism: {
      title: 'SECCIÓN 4: PROFESIONALISMO, ACTITUD Y CUMPLIMIENTO',
      description: 'Evalúa la ética de trabajo y la inteligencia emocional dentro del estudio.',
      criteria: [
        { id: 'pr1', label: 'Límites Profesionales: Distingue lo laboral de lo personal. Evita que problemas externos afecten.', score: 5, observations: '' },
        { id: 'pr2', label: 'Puntualidad: Inicia su transmisión exactamente a la hora programada con todo listo.', score: 5, observations: '' },
        { id: 'pr3', label: 'Cumplimiento de Horas: Cumple con la intensidad horaria asignada sin desconexiones.', score: 5, observations: '' },
        { id: 'pr4', label: 'Receptividad al Feedback: Buena actitud frente a correcciones y las aplica rápidamente.', score: 5, observations: '' },
      ],
    },
  },
  results: {
    strengths: '',
    improvementAreas: '',
    agreements: '',
  },
};
