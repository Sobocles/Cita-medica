export interface Usuario {
    rut: string;
    nombre: string;
    apellidos: string;
    email: string;
    fecha_nacimiento: string;
    telefono: string;
    direccion: string;

    // Campos de previsión de salud
    tipo_prevision?: 'Fonasa' | 'Isapre' | 'Particular';
    nombre_isapre?: string;
    tramo_fonasa?: 'A' | 'B' | 'C' | 'D';
}

export interface UsuariosResponse {
    usuarios: Usuario[];
}