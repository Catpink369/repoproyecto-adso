import { BadRequestException } from '@nestjs/common';

/**
 * Valor canónico de negocio para el tipo de movimiento.
 * 'M-E' = Entrada de inventario | 'M-S' = Salida de inventario.
 * Este es el formato que usan las consultas $queryRaw (coincide con el
 * ENUM('M-E','M-S') de la tabla `movimiento` en la base de datos).
 */
export type TipoMovimiento = 'M-E' | 'M-S';

const VALORES_ACEPTADOS = ['M-E', 'M-S', 'M_E', 'M_S'];

/**
 * Normaliza el tipo de movimiento recibido desde el DTO o desde un parámetro
 * de ruta (acepta guion "M-E"/"M-S" o guion bajo "M_E"/"M_S") al formato
 * canónico con guion.
 *
 * FIX: antes de esta función, `movimientos.service.ts -> create()` hacía
 * `dto.id_m === 'M-E'` de forma literal. El DTO sí aceptaba 'M_E' (con
 * guion bajo) como valor válido, pero como esa comparación nunca daba
 * `true` para 'M_E', el movimiento terminaba guardándose como SALIDA
 * ('M-S') en lugar de ENTRADA, descontando stock que en realidad debía
 * sumarse. Toda entrada de inventario enviada como 'M_E' quedaba invertida.
 */
export function normalizarTipoMovimiento(valor: unknown): TipoMovimiento {
    if (typeof valor !== 'string' || valor.trim() === '') {
        throw new BadRequestException(
        `El campo "id_m" (tipo de movimiento) es obligatorio y debe ser un texto. ` +
            `Valores permitidos: ${VALORES_ACEPTADOS.join(', ')}.`,
        );
    }

    const normalizado = valor.trim().toUpperCase().replace('_', '-');

    if (normalizado !== 'M-E' && normalizado !== 'M-S') {
        throw new BadRequestException(
        `El campo "id_m" (tipo de movimiento) tiene un valor inválido: "${valor}". ` +
            `Valores permitidos: ${VALORES_ACEPTADOS.join(', ')} (M-E = entrada, M-S = salida).`,
        );
    }

    return normalizado;
}

/**
 * Convierte el valor canónico ('M-E' | 'M-S') al identificador del enum de
 * Prisma ('M_E' | 'M_S'), usado en llamadas tipadas como
 * `prisma.movimiento.create` o `prisma.movimiento.findMany`. Los guiones no
 * son válidos como nombre de miembro de un enum de Prisma, por eso el
 * schema mapea `M_E @map("M-E")` / `M_S @map("M-S")` hacia la base de datos.
 * Las consultas $queryRaw, en cambio, deben seguir usando el valor con
 * guion ('M-E'/'M-S'), que es el que existe físicamente en la columna.
 */
export function aTipoMovimientoPrisma(tipo: TipoMovimiento): 'M_E' | 'M_S' {
    return tipo === 'M-E' ? 'M_E' : 'M_S';
}