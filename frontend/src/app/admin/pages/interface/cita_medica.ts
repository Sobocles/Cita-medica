export interface CitaMedica {
    idCita: number;
    motivo: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
    paciente: {
      nombre: string;
      apellidos: string;
      rut?: string;
      tipo_prevision?: 'Fonasa' | 'Isapre' | 'Particular';
    };
    medico: {
      nombre: string;
      apellidos: string;
    };
    tipoCita: {
      especialidad_medica: string;
      precio?: number;
      precio_fonasa?: number;
      precio_isapre?: number;
      precio_particular?: number;
    };

    // Campos de precios y descuentos
    precio_original?: number;
    precio_final?: number;
    tipo_prevision_aplicada?: 'Fonasa' | 'Isapre' | 'Particular';
    descuento_aplicado?: number;
    porcentaje_descuento?: number;

    // Campos de validación de previsión
    requiere_validacion_prevision?: boolean;
    prevision_validada?: boolean;
    diferencia_pagada_efectivo?: number;
    observaciones_validacion?: string;
  }
  
  export interface CitasResponse {
    ok: boolean;
    citas: CitaMedica[];
    total?: number; // La propiedad total es opcional porque solo aparece en una de las respuestas
  }
  