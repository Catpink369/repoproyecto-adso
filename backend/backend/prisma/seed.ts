import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // ROLES
  const roles = [
    { id_rol_usuario: '1', nombre_rol: 'Administrador' },
    { id_rol_usuario: '2', nombre_rol: 'Cliente' },
    { id_rol_usuario: '3', nombre_rol: 'Trabajador' },
  ]
  for (const r of roles) {
    await prisma.rol_usuario.upsert({ where: { id_rol_usuario: r.id_rol_usuario }, update: {}, create: r })
  }

  // TIPOS DE DOCUMENTO
  await prisma.tipo_documento.upsert({
    where: { t_doc: 'CC' },
    update: {},
    create: { t_doc: 'CC', desc_doc: 'C_dula_de_ciudadan_a' }
  })

  // CATEGORÍAS
  const categorias = [
    { nombre_c: 'Sabanas' as any },
    { nombre_c: 'Cubrelechos' as any },
    { nombre_c: 'Amigurumis' as any },
    { nombre_c: 'Llaveros' as any },
  ]
  for (const c of categorias) {
    await prisma.categoria.create({ data: c })
  }

  // ESTADOS DE PAGO
  const estados = [
    { id_estado: 'E_pt' as any, nom_metodo: 'Pendiente' as any },
    { id_estado: 'E_pd' as any, nom_metodo: 'Pagado' as any },
    { id_estado: 'E_f' as any, nom_metodo: 'finalizado' as any },
    { id_estado: 'E_e' as any, nom_metodo: 'entregado' as any },
  ]
  for (const e of estados) {
    await prisma.estado_pago.upsert({ where: { id_estado: e.id_estado }, update: {}, create: e })
  }

  // USUARIO ADMIN INICIAL
  await prisma.usuario.upsert({
    where: { id_usuario: 'Adm-01' },
    update: {},
    create: {
      id_usuario: 'Adm-01',
      nom_1: 'Valentina',
      ape_1: 'Ruiz',
      correo: 'valruiz@gmail.com',
      telefono: 3123456789,
      contrasena: '$2b$10$ZpYbdvjxoxOFc9H1WE.9v.sSNaEvHqRHlThGiMvDAYy/StkwtxK6a',
      id_rol_usuario: '1',
      t_doc: 'CC',
      codigo_visible: '12345'
    }
  })

  // MATERIALES BASE
  const materiales = [
    { id_material: 1, nombre: 'Algodón liso', tipo: 'Tela' as any, unidad: 'metro' as any, precio_unitario: 8000, stock_actual: 100, stock_minimo: 10 },
    { id_material: 4, nombre: 'Algodón estampado', tipo: 'Tela' as any, unidad: 'metro' as any, precio_unitario: 9000, stock_actual: 100, stock_minimo: 10 },
    { id_material: 5, nombre: 'Microfibra', tipo: 'Tela' as any, unidad: 'metro' as any, precio_unitario: 7000, stock_actual: 100, stock_minimo: 10 },
    { id_material: 6, nombre: 'Ovejero', tipo: 'Tela' as any, unidad: 'metro' as any, precio_unitario: 12000, stock_actual: 100, stock_minimo: 10 },
    { id_material: 7, nombre: 'Conejo', tipo: 'Tela' as any, unidad: 'metro' as any, precio_unitario: 15000, stock_actual: 100, stock_minimo: 10 },
  ]
  for (const m of materiales) {
    await prisma.material.upsert({ where: { id_material: m.id_material }, update: {}, create: m })
  }

  // MÉTODOS DE PAGO
  const metodosPago = [
    { id_met_pago: 'Mtd_EF' as any, nom_metodo: 'Efectivo' as any },
    { id_met_pago: 'Mtd_NQ' as any, nom_metodo: 'Nequi' as any },
    { id_met_pago: 'Mtd_DP' as any, nom_metodo: 'Daviplata' as any },
    { id_met_pago: 'Mtd_TJ' as any, nom_metodo: 'Tarjeta' as any },
    { id_met_pago: 'Mtd_PD' as any, nom_metodo: 'Por_definir' as any },
  ]
  for (const mp of metodosPago) {
    await prisma.metodo_pago.upsert({ where: { id_met_pago: mp.id_met_pago }, update: {}, create: mp })
  }

  // CLASIFICACIONES
  const clasificaciones = [
    { nombre_clas: 'Sin_clasificar' as any },
    { nombre_clas: 'En_oferta' as any },
    { nombre_clas: 'Mas_vendidos' as any },
    { nombre_clas: 'Nuevos' as any },
    { nombre_clas: 'Ultimas_unidades' as any },
  ]
  for (const cl of clasificaciones) {
    await prisma.clasificacion.create({ data: cl })
  }

  // TIPOS DE MOVIMIENTO Y DE PEDIDO
  await prisma.tipo_movimiento.upsert({ where: { id_m: 'M_E' as any }, update: {}, create: { id_m: 'M_E' as any, nom_movimiento: 'Entrada' as any } })
  await prisma.tipo_movimiento.upsert({ where: { id_m: 'M_S' as any }, update: {}, create: { id_m: 'M_S' as any, nom_movimiento: 'Salida' as any } })
  await prisma.tipo_pedido.upsert({ where: { id_tipo: 'P_P' as any }, update: {}, create: { id_tipo: 'P_P' as any, tipo_pedido: 'Personalizado' as any } })
  await prisma.tipo_pedido.upsert({ where: { id_tipo: 'P_E' as any }, update: {}, create: { id_tipo: 'P_E' as any, tipo_pedido: 'Estandar' as any } })

  // COLORES POR MATERIAL (id 1 = Algodón liso, 5 = Microfibra, 6 = Ovejero, 7 = Conejo)
  const colores = [
    { id_material: 1, nombre: 'Blanco',       codigo_hex: '#FFFFFF' },
    { id_material: 1, nombre: 'Negro',         codigo_hex: '#1A1A1A' },
    { id_material: 1, nombre: 'Azul cielo',    codigo_hex: '#87CEEB' },
    { id_material: 1, nombre: 'Rosa palo',     codigo_hex: '#FFB6C1' },
    { id_material: 1, nombre: 'Verde menta',   codigo_hex: '#98FF98' },
    { id_material: 1, nombre: 'Gris perla',    codigo_hex: '#D3D3D3' },
    { id_material: 5, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 5, nombre: 'Beige',         codigo_hex: '#F5F0DC' },
    { id_material: 5, nombre: 'Gris oscuro',   codigo_hex: '#4A4A4A' },
    { id_material: 5, nombre: 'Azul marino',   codigo_hex: '#001F5B' },
    { id_material: 6, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 6, nombre: 'Gris',          codigo_hex: '#808080' },
    { id_material: 6, nombre: 'Crema',         codigo_hex: '#FFFDD0' },
    { id_material: 7, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 7, nombre: 'Gris claro',    codigo_hex: '#C0C0C0' },
    { id_material: 7, nombre: 'Rosado',        codigo_hex: '#FFC0CB' },
  ]
  for (const c of colores) {
    await prisma.material_color.create({ data: c })
  }

  // DISEÑOS POR MATERIAL (solo Algodón estampado, id 4, tiene diseños)
  const disenos = [
    { id_material: 4, nombre: 'Flores pequeñas',  ruta_imagen: null },
    { id_material: 4, nombre: 'Rayas horizontales', ruta_imagen: null },
    { id_material: 4, nombre: 'Puntos',            ruta_imagen: null },
    { id_material: 4, nombre: 'Cuadros escoceses', ruta_imagen: null },
    { id_material: 4, nombre: 'Animales cartoon',  ruta_imagen: null },
    { id_material: 4, nombre: 'Geométrico',        ruta_imagen: null },
  ]
  for (const d of disenos) {
    await prisma.material_diseno.create({ data: d })
  }

  // Sincronizar secuencias tras inserts con IDs fijos
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('material', 'id_material'),
      COALESCE((SELECT MAX(id_material) FROM material), 1));
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('material_color', 'id_color'),
      COALESCE((SELECT MAX(id_color) FROM material_color), 1));
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('material_diseno', 'id_diseno'),
      COALESCE((SELECT MAX(id_diseno) FROM material_diseno), 1));
  `);

  console.log('Base de datos GuramaOnline poblada con éxito.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })