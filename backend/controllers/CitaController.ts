import { Request, Response } from 'express';
import citaService from '../services/Cita.service';

export default class CitaController {
    async getCitas(req: Request, res: Response) {
        try {
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const resultado = await citaService.getCitas(desde, limite);

            res.json({
                ok: true,
                citas: resultado.citas,
                total: resultado.total
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCitasMedico(req: Request, res: Response) {
        try {
            const { rut_medico } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const { count, citas } = await citaService.getCitasMedico(rut_medico, desde, limite);
            
            if (!citas.length) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No se encontraron citas activas para este médico',
                });
            }

            res.json({
                ok: true,
                citas,
                total: count
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCitasPaciente(req: Request, res: Response) {
        try {
            const { rut_paciente } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const { count, citas } = await citaService.getCitasPaciente(rut_paciente, desde, limite);
            
            if (!citas.length) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No se encontraron citas activas para este paciente',
                });
            }

            res.json({
                ok: true,
                citas,
                total: count
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCitaFactura(req: Request, res: Response) {
        try {
            const idCita = parseInt(req.params.idCita);
            if (!idCita) return res.status(400).json({ error: 'ID inválido' });

            const cita = await citaService.getCitaFactura(idCita);
            if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

            res.json({
                ok: true,
                cita
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async crearCita(req: Request, res: Response) {
        try {
            const cita = await citaService.crearCita(req.body);
            res.status(201).json({
                ok: true,
                cita
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async crearCitaPaciente(req: Request, res: Response) {
        try {
            const cita = await citaService.crearCitaPaciente(req.body);
            res.status(201).json({
                ok: true,
                cita: { idCita: cita.idCita }
            });
        } catch (error: any) {
            res.status(400).json({
                ok: false,
                mensaje: error.message
            });
        }
    }

    async putCita(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cita = await citaService.actualizarCita(id, req.body);
            
            res.json({
                ok: true,
                msg: 'Cita actualizada correctamente',
                cita
            });
        } catch (error: any) {
            const status = error.message === 'Cita no encontrada' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async deleteCita(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await citaService.eliminarCita(id);
            
            res.json({ msg: 'Cita actualizada a inactivo correctamente' });
        } catch (error: any) {
            const status = error.message === 'Cita no encontrada' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }
}

export const citaController = new CitaController();