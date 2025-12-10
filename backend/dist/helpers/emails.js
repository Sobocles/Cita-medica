"use strict";
// helpers/email.helper.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class Email {
    static get instance() {
        return this._instance || (this._instance = new Email());
    }
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'smoralespincheira@gmail.com',
                pass: 'jmfw qohp okfp nrfe'
            }
        });
    }
    verificarEmail() {
        this.transporter.verify().then(() => {
            console.log('Listo para enviar email');
        });
    }
    //email donde se quiere enviar el correo, el nombre del usuario que quiere recuperar el email, y se le envia el password nuevo (se le envia la contraseña nueva para que pueda recuperar su sesion)
    enviarEmail(email, nombre, passwordNew) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transporter.sendMail({
                from: '"Recuperacion de contraseña" <smoralespincheira@gmail.com>',
                to: email,
                subject: 'Recuperacion de contraseña',
                html: `<b>Su nombre es: ${nombre} y su nueva contraseña es: ${passwordNew}. Por favor cambie su contraseña una vez que ingrese.</b>` //se le envia la contraseña nueva
            });
        });
    }
    enviarConfirmacionCita(detallesCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha, hora_inicio, medicoNombre, especialidad, pacienteNombre, emailPaciente, tipoPrevision, precioOriginal, precioFinal, descuentoAplicado, requiereValidacion } = detallesCita;
            // Construir sección de advertencia según el tipo de previsión
            let advertenciaHTML = '';
            if (requiereValidacion) {
                const diferencia = precioOriginal - precioFinal;
                const documentos = tipoPrevision === 'Fonasa'
                    ? `
                    <li>✓ Carnet Fonasa vigente</li>
                    <li>✓ Cédula de identidad</li>
                `
                    : `
                    <li>✓ Credencial de Isapre vigente</li>
                    <li>✓ Cédula de identidad</li>
                `;
                advertenciaHTML = `
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <h2 style="color: #856404; margin-top: 0;">⚠️ MUY IMPORTANTE - LEA CON ATENCIÓN</h2>
                    <p style="color: #856404; font-size: 16px; font-weight: bold;">
                        Ha seleccionado pago con ${tipoPrevision.toUpperCase()}.
                    </p>
                    <p style="color: #856404; font-size: 14px;">
                        <strong>DEBE TRAER A LA CITA:</strong>
                    </p>
                    <ul style="color: #856404; font-size: 14px;">
                        ${documentos}
                    </ul>
                    <p style="color: #d9534f; font-size: 14px; font-weight: bold; background-color: #f2dede; padding: 10px; border-radius: 4px;">
                        Si no presenta estos documentos, deberá pagar la diferencia de
                        <span style="font-size: 18px;">$${diferencia.toLocaleString('es-CL')}</span>
                        en efectivo en la clínica.
                    </p>
                </div>
            `;
            }
            // Construir sección de resumen de pago
            let resumenPagoHTML = '';
            if (descuentoAplicado > 0) {
                resumenPagoHTML = `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Resumen de Pago</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px;">Precio normal:</td>
                            <td style="padding: 8px; text-decoration: line-through; color: #6c757d;">$${precioOriginal.toLocaleString('es-CL')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Descuento ${tipoPrevision}:</td>
                            <td style="padding: 8px; color: #28a745; font-weight: bold;">-$${descuentoAplicado.toLocaleString('es-CL')}</td>
                        </tr>
                        <tr style="border-top: 2px solid #dee2e6;">
                            <td style="padding: 8px; font-weight: bold;">Total pagado:</td>
                            <td style="padding: 8px; font-size: 18px; color: #28a745; font-weight: bold;">$${precioFinal.toLocaleString('es-CL')}</td>
                        </tr>
                    </table>
                </div>
            `;
            }
            return yield this.transporter.sendMail({
                from: '"Confirmación de Cita Médica" <smoralespincheira@gmail.com>',
                to: emailPaciente,
                subject: requiereValidacion
                    ? `✅ Cita confirmada - RECUERDA TRAER CARNET ${tipoPrevision.toUpperCase()}`
                    : 'Confirmación de su cita médica',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #007bff;">✅ Confirmación de Cita Médica</h1>
                    <p>Estimado/a ${pacienteNombre},</p>
                    <p>Le confirmamos que su cita está programada:</p>

                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fecha}</p>
                        <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${hora_inicio}</p>
                        <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${medicoNombre}</p>
                        <p style="margin: 5px 0;"><strong>🏥 Especialidad:</strong> ${especialidad}</p>
                    </div>

                    ${resumenPagoHTML}

                    ${advertenciaHTML}

                    <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;">📍 Por favor, llegue 10 minutos antes de su hora programada.</p>
                        ${!requiereValidacion ? '<p style="margin: 5px 0;">💳 Su cita ya está pagada.</p>' : ''}
                    </div>

                    <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
                    <br>
                    <p>Saludos cordiales,</p>
                    <p><strong>El equipo de su centro médico</strong></p>
                </div>
            `
            });
        });
    }
}
exports.default = Email;
//# sourceMappingURL=emails.js.map