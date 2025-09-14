import { Request, Response } from 'express';
import usuarioService from '../services/usuario.service';
import usuarioRepository from '../repositories/usuario.repository';

export const getUsuarios = async (req: Request, res: Response) => {
    const desde = Number(req.query.desde) || 0;
    try {
        const result = await usuarioService.getPaginatedUsers(desde);
        res.json(result);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};

export const getAllUsuarios = async (req: Request, res: Response) => {
    try {
        const pacientes = await usuarioService.getAllPatients();
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};

export const CrearUsuario = async (req: Request, res: Response) => {
    console.log("ENTRO EN CREAR USUARIO");
    try {
        const user = await usuarioService.createUser(req.body);
        res.json({
            ok: true,
            usuario: user
        });

        console.log("Usuario creado");
    } catch (error: any) {
        res.status(400).json({
            ok: false,
            msg: error.message
        });
    }
};

export const getUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};

export const putUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await usuarioService.updateUser(id, req.body);
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }
        res.json({ usuario });
    } catch (error: any) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

export const deleteUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await usuarioService.deleteUser(id);
        res.json({ msg: 'Usuario eliminado correctamente' });
    } catch (error: any) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

export const cambiarPassword = async (req: Request, res: Response) => {
    const { rut, password, newPassword } = req.body;
    try {
        await usuarioService.changePassword(rut, password, newPassword);
        res.json({ ok: true, msg: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
        res.status(400).json({ ok: false, msg: error.message });
    }
};

export const getPacientesConCitasPagadasYEnCurso = async (req: Request, res: Response) => {
    const { rut_medico } = req.params;
    
    try {
        const pacientes = await usuarioService.getPatientsWithAppointments(
            rut_medico, 
            ['en_curso', 'pagado', 'terminado']
        );
        
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};

export const getPacientesConCitasPagadasYEnCursoYterminado = async (req: Request, res: Response) => {
    const { rut_medico } = req.params;
    
    try {
        const pacientes = await usuarioService.getPatientsWithAppointments(
            rut_medico, 
            ['en_curso', 'pagado', 'terminado']
        );
        
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};
// Controladores para las consultas específicas de pacientes...