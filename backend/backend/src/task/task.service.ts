// task/task.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TaskService {

    private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    });

    async enviarCodigoReset(correo: string, codigo: string) {
        await this.transporter.sendMail({
            from: `"Gurama Online" <${process.env.MAIL_USER}>`,
            to: correo,
            subject: 'Recuperación de contraseña - Gurama Online',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #c5749d;">Gurama Online</h2>
                <p>Hola, recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Tu código de verificación es:</p>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #5a3d54; letter-spacing: 8px; font-size: 36px;">${codigo}</h1>
                </div>
                <p style="color: #666;">Este código expira en <strong>15 minutos</strong>.</p>
                <p style="color: #666;">Si no solicitaste esto, ignora este correo.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Gurama Online — Productos Artesanales</p>
                </div>
            `,
            });
        }

    // ── Correo de cambio de estado de pedido ────────────────────────────
    async enviarCambioEstadoPedido(params: {
        correo: string;
        nombreCliente: string;
        idPedido: number;
        estado: string;
        numTicket?: string | null;
        totalTicket?: number | null;
    }) {
        const { correo, nombreCliente, idPedido, estado, numTicket, totalTicket } = params;

        const mensajesPredefinidos: Record<string, string> = {
            'Pendiente': 'Tu pedido está pendiente de confirmación.',
            'Pagado': 'Tu pago fue confirmado. Pronto empezaremos a preparar tu pedido.',
            'En preparación': 'Tu pedido está siendo preparado con mucho amor. Te avisaremos cuando esté listo.',
            'Entregado': 'Tu pedido fue entregado. ¡Esperamos que lo disfrutes!',
            'Finalizado': 'Tu pedido ha sido finalizado. ¡Gracias por tu compra!',
            'Anulado': 'Tu pedido fue anulado. Si tienes dudas, contáctanos.',
        };
        const mensaje = mensajesPredefinidos[estado] ?? `El estado de tu pedido cambió a: ${estado}`;

        await this.transporter.sendMail({
            from: `"Gurama Online" <${process.env.MAIL_USER}>`,
            to: correo,
            subject: `Actualización de tu pedido #${idPedido}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #c5749d;">Gurama Online</h2>
                <p>Hola ${nombreCliente},</p>
                <p>${mensaje}</p>
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin:4px 0;"><strong>Pedido #:</strong> ${idPedido}</p>
                    ${numTicket ? `<p style="margin:4px 0;"><strong>Ticket:</strong> ${numTicket}</p>` : ''}
                    ${totalTicket != null ? `<p style="margin:4px 0;"><strong>Total:</strong> $${totalTicket}</p>` : ''}
                    <p style="margin:4px 0;"><strong>Estado actual:</strong> ${estado}</p>
                </div>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Gurama Online — Productos Artesanales</p>
                </div>
            `,
        });
    }
}