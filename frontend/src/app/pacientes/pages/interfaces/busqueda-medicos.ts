export interface Bloque {
    rutMedico: string;
    medicoNombre: string;
    hora_inicio: string;
    hora_fin: string;
    precio: number; // Precio base (para backwards compatibility)
    especialidad: string;
    imagenUrl?: string; // URL firmada de la imagen del médico

    // Precios diferenciados por tipo de previsión
    precio_fonasa?: number;
    precio_isapre?: number;
    precio_particular?: number;
}

export interface BloquesResponse {
    ok: boolean;
    bloques: Bloque[];
}
