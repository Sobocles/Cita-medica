// models/usuario.ts
import { DataTypes, Model } from 'sequelize';
import db from '../db/connection';
import Rol from './rol';

class Usuario extends Model {
    public rut!: string;
    public nombre!: string;
    public apellidos!: string;
    public email!: string;
    public password!: string;
    public fecha_nacimiento!: string;
    public telefono!: string;
    public direccion!: string;
    public rolId!: number; // Campo real en la base de datos
    public rol?: any; // Propiedad virtual para el objeto rol relacionado o código de rol
    public estado!: string;
    
    // Método para obtener el código del rol de manera segura
    public getRolCodigo(): string {
        // Si rol es un objeto con propiedad codigo (relación cargada)
        if (this.rol && typeof this.rol === 'object' && this.rol.codigo) {
            return this.rol.codigo;
        }
        // Si rol es directamente una cadena (compatibilidad con código anterior)
        if (this.rol && typeof this.rol === 'string') {
            return this.rol;
        }
        // Valor por defecto
        return 'USER_ROLE';
    }
}

Usuario.init(
    {
        rut: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellidos: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rolId: { // Campo real en la base de datos
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Rol,
                key: 'id'
            },
            defaultValue: 3 // Por defecto, ID del rol 'Usuario' (USER_ROLE)
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'activo'
        },
    },
    {
        sequelize: db,
        modelName: 'Usuario',
        tableName: 'usuarios',
    }
);

export default Usuario;