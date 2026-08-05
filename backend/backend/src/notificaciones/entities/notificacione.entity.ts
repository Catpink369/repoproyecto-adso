export class NotificacionEntity {
    tipo: string;
    id_notificacion: string;
    id_producto: number;
    nom_producto: string;
    stock_actual: number | null;
    stock_minimo: number | null;
    fecha: Date;
    mensaje: string;
    detalles: string;
    ruta_destino: string;
    clase_boton: string;
}