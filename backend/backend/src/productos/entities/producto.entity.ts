export class Producto {
    id_producto: number;
    nom_producto: string;
    precio_unitario: number;
    stock_actual: number;
    stock_minimo: number;
    ultima_actualiz: Date;
    color?: string;
    talla?: string;
    tamaño?: string;
    descripcion: string;
    id_categoria: number;
    id_clasificacion: number;
    ruta_imagen?: string;
    estado?: boolean;
}