export class PedidoPersonalizado {
    id_ped_personal: number;
    id_pedido: number;
    tipo_producto: string;
    tamanio: string;
    precio_total: number;
}

export class Material {
    id_material: number;
    nombre: string;
    tipo: string;
    unidad: string;
    precio_unitario: number;
    stock_actual: number;
    stock_minimo: number;
    ruta_imagen?: string;
    estado?: boolean;
}