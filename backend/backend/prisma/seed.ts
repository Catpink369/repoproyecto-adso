import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Seed PostgreSQL para GuramaOnline.
 * Idempotente: se puede re-ejecutar sin duplicar catálogos ni usuarios fijos.
 *
 * Usuarios alineados con cypress.env.json:
 *   Admin:      valruiz@gmail.com / vale123 / código 12345
 *   Trabajador: harry@gmail.com / 123456 / código 36910
 *   Cliente:    zahorycardenas9@gmail.com / 07212728
 *   Bloqueo:    cliente.bloqueo@example.com / 123456
 *
 * Productos y materiales con stock suficiente para flujos de catálogo,
 * carrito, pedidos e inventario en Cypress.
 */
async function main() {
  // ─── ROLES ───────────────────────────────────────────────────────────────
  for (const r of [
    { id_rol_usuario: '1', nombre_rol: 'Administrador' },
    { id_rol_usuario: '2', nombre_rol: 'Cliente' },
    { id_rol_usuario: '3', nombre_rol: 'Trabajador' },
  ]) {
    await prisma.rol_usuario.upsert({
      where: { id_rol_usuario: r.id_rol_usuario },
      update: { nombre_rol: r.nombre_rol },
      create: r,
    })
  }

  // ─── TIPOS DE DOCUMENTO ──────────────────────────────────────────────────
  const tiposDoc = [
    { t_doc: 'CC' as const, desc_doc: 'C_dula_de_ciudadan_a' as const },
    { t_doc: 'CE' as const, desc_doc: 'C_dula_de_extranjer_a' as const },
    { t_doc: 'PASS' as const, desc_doc: 'Pasaporte' as const },
  ]
  for (const td of tiposDoc) {
    await prisma.tipo_documento.upsert({
      where: { t_doc: td.t_doc },
      update: {},
      create: td,
    })
  }

  // ─── CATEGORÍAS (enum nombre_c) ──────────────────────────────────────────
  const nombresCat = ['Sabanas', 'Cubrelechos', 'Amigurumis', 'Llaveros'] as const
  for (const nombre_c of nombresCat) {
    const existe = await prisma.categoria.findFirst({ where: { nombre_c } })
    if (!existe) {
      await prisma.categoria.create({
        data: {
          nombre_c,
          descripcion:
            nombre_c === 'Sabanas'
              ? 'Sabanas con encaje en todos los tamaños'
              : nombre_c === 'Cubrelechos'
                ? 'Cubrelechos con diseños'
                : nombre_c === 'Amigurumis'
                  ? 'Muñecos tejidos'
                  : 'Llaveros tejidos a mano',
        },
      })
    }
  }

  // ─── CLASIFICACIONES ─────────────────────────────────────────────────────
  const nombresClas = [
    'Sin_clasificar',
    'En_oferta',
    'Mas_vendidos',
    'Nuevos',
    'Ultimas_unidades',
  ] as const
  for (const nombre_clas of nombresClas) {
    const existe = await prisma.clasificacion.findFirst({ where: { nombre_clas } })
    if (!existe) {
      await prisma.clasificacion.create({ data: { nombre_clas } })
    }
  }

  // ─── ESTADOS DE PAGO ─────────────────────────────────────────────────────
  for (const e of [
    { id_estado: 'E_pt' as const, nom_metodo: 'Pendiente' as const },
    { id_estado: 'E_pd' as const, nom_metodo: 'Pagado' as const },
    { id_estado: 'E_f' as const, nom_metodo: 'finalizado' as const },
    { id_estado: 'E_e' as const, nom_metodo: 'entregado' as const },
  ]) {
    await prisma.estado_pago.upsert({
      where: { id_estado: e.id_estado },
      update: {},
      create: e,
    })
  }

  // ─── MÉTODOS DE PAGO ─────────────────────────────────────────────────────
  for (const mp of [
    { id_met_pago: 'Mtd_EF' as const, nom_metodo: 'Efectivo' as const },
    { id_met_pago: 'Mtd_NQ' as const, nom_metodo: 'Nequi' as const },
    { id_met_pago: 'Mtd_DP' as const, nom_metodo: 'Daviplata' as const },
    { id_met_pago: 'Mtd_TJ' as const, nom_metodo: 'Tarjeta' as const },
    { id_met_pago: 'Mtd_PD' as const, nom_metodo: 'Por_definir' as const },
  ]) {
    await prisma.metodo_pago.upsert({
      where: { id_met_pago: mp.id_met_pago },
      update: {},
      create: mp,
    })
  }

  // ─── TIPOS MOVIMIENTO / PEDIDO ───────────────────────────────────────────
  await prisma.tipo_movimiento.upsert({
    where: { id_m: 'M_E' },
    update: {},
    create: { id_m: 'M_E', nom_movimiento: 'Entrada' },
  })
  await prisma.tipo_movimiento.upsert({
    where: { id_m: 'M_S' },
    update: {},
    create: { id_m: 'M_S', nom_movimiento: 'Salida' },
  })
  await prisma.tipo_pedido.upsert({
    where: { id_tipo: 'P_P' },
    update: {},
    create: { id_tipo: 'P_P', tipo_pedido: 'Personalizado' },
  })
  await prisma.tipo_pedido.upsert({
    where: { id_tipo: 'P_E' },
    update: {},
    create: { id_tipo: 'P_E', tipo_pedido: 'Estandar' },
  })

  // ─── USUARIOS (Cypress + admin inicial) ───────────────────────────────────
  // Hashes en runtime con el mismo bcrypt del backend (evita desajustes)
  const HASH_VALE123 = await bcrypt.hash('vale123', 10)
  const HASH_07212728 = await bcrypt.hash('07212728', 10)
  const HASH_123456 = await bcrypt.hash('123456', 10)
  const HASH_CODIGO_12345 = await bcrypt.hash('12345', 10)
  const HASH_CODIGO_36910 = await bcrypt.hash('36910', 10)

  // Admin
  await prisma.usuario.upsert({
    where: { id_usuario: 'Adm-01' },
    update: {
      correo: 'valruiz@gmail.com',
      contrasena: HASH_VALE123,
      codigo: HASH_CODIGO_12345,
      codigo_visible: '12345',
      id_rol_usuario: '1',
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    },
    create: {
      id_usuario: 'Adm-01',
      nom_1: 'Valentina',
      ape_1: 'Ruiz',
      ape_2: 'Castro',
      correo: 'valruiz@gmail.com',
      telefono: 3123456789n,
      contrasena: HASH_VALE123,
      codigo: HASH_CODIGO_12345,
      codigo_visible: '12345',
      id_rol_usuario: '1',
      t_doc: 'CC',
      estado: 1,
    },
  })

  // Trabajador (Cypress) — id fijo que usa administrador.cy.ts (Paso 12/15)
  // Si quedó un Trab-01 antiguo con el mismo correo, se elimina para evitar conflicto UNIQUE.
  const harryViejo = await prisma.usuario.findFirst({
    where: {
      OR: [{ id_usuario: 'Trab-01' }, { correo: 'harry@gmail.com' }],
      NOT: { id_usuario: '123412332' },
    },
  })
  if (harryViejo) {
    await prisma.usuario.delete({ where: { id_usuario: harryViejo.id_usuario } }).catch(() => {})
  }

  await prisma.usuario.upsert({
    where: { id_usuario: '123412332' },
    update: {
      correo: 'harry@gmail.com',
      contrasena: HASH_123456,
      codigo: HASH_CODIGO_36910,
      codigo_visible: '36910',
      id_rol_usuario: '3',
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      nom_1: 'Harry',
      ape_1: 'Potter',
    },
    create: {
      id_usuario: '123412332',
      nom_1: 'Harry',
      ape_1: 'Potter',
      correo: 'harry@gmail.com',
      telefono: 3001112233n,
      contrasena: HASH_123456,
      codigo: HASH_CODIGO_36910,
      codigo_visible: '36910',
      id_rol_usuario: '3',
      t_doc: 'CC',
      estado: 1,
    },
  })

  // Cliente principal (Cypress)
  await prisma.usuario.upsert({
    where: { id_usuario: '1012345678' },
    update: {
      correo: 'zahorycardenas9@gmail.com',
      contrasena: HASH_07212728,
      id_rol_usuario: '2',
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      codigo: null,
      codigo_visible: null,
    },
    create: {
      id_usuario: '1012345678',
      nom_1: 'Zahory',
      ape_1: 'Cardenas',
      correo: 'zahorycardenas9@gmail.com',
      telefono: 3115502424n,
      contrasena: HASH_07212728,
      id_rol_usuario: '2',
      t_doc: 'CC',
      estado: 1,
    },
  })

  // Cliente para pruebas de bloqueo por intentos fallidos
  await prisma.usuario.upsert({
    where: { id_usuario: '1099988877' },
    update: {
      correo: 'cliente.bloqueo@example.com',
      contrasena: HASH_123456,
      id_rol_usuario: '2',
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    },
    create: {
      id_usuario: '1099988877',
      nom_1: 'Cliente',
      ape_1: 'Bloqueo',
      correo: 'cliente.bloqueo@example.com',
      telefono: 3009998877n,
      contrasena: HASH_123456,
      id_rol_usuario: '2',
      t_doc: 'CC',
      estado: 1,
    },
  })

  // ─── MATERIALES ──────────────────────────────────────────────────────────
  const materiales = [
    { id_material: 1, nombre: 'Algodón liso', tipo: 'Tela' as const, unidad: 'metro' as const, precio_unitario: 8000, stock_actual: 200, stock_minimo: 10 },
    { id_material: 4, nombre: 'Algodón estampado', tipo: 'Tela' as const, unidad: 'metro' as const, precio_unitario: 9000, stock_actual: 200, stock_minimo: 10 },
    { id_material: 5, nombre: 'Microfibra', tipo: 'Tela' as const, unidad: 'metro' as const, precio_unitario: 7000, stock_actual: 200, stock_minimo: 10 },
    { id_material: 6, nombre: 'Ovejero', tipo: 'Tela' as const, unidad: 'metro' as const, precio_unitario: 12000, stock_actual: 150, stock_minimo: 10 },
    { id_material: 7, nombre: 'Conejo', tipo: 'Tela' as const, unidad: 'metro' as const, precio_unitario: 15000, stock_actual: 150, stock_minimo: 10 },
    { id_material: 8, nombre: 'Hilo bordado', tipo: 'Bordado' as const, unidad: 'unidad' as const, precio_unitario: 2500, stock_actual: 300, stock_minimo: 20 },
    { id_material: 9, nombre: 'Relleno sintético', tipo: 'Relleno' as const, unidad: 'unidad' as const, precio_unitario: 5000, stock_actual: 100, stock_minimo: 15 },
    { id_material: 10, nombre: 'Botón madera', tipo: 'Accesorio' as const, unidad: 'unidad' as const, precio_unitario: 800, stock_actual: 500, stock_minimo: 50 },
  ]
  for (const m of materiales) {
    await prisma.material.upsert({
      where: { id_material: m.id_material },
      update: {
        nombre: m.nombre,
        tipo: m.tipo,
        unidad: m.unidad,
        precio_unitario: m.precio_unitario,
        // No bajar stock en re-seed si ya hay menos: solo asegurar mínimo útil
        stock_actual: m.stock_actual,
        stock_minimo: m.stock_minimo,
        estado: true,
      },
      create: { ...m, estado: true },
    })
  }

  // ─── COLORES (solo si el material aún no tiene) ──────────────────────────
  const coloresSeed = [
    { id_material: 1, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
    { id_material: 1, nombre: 'Negro', codigo_hex: '#1A1A1A' },
    { id_material: 1, nombre: 'Azul cielo', codigo_hex: '#87CEEB' },
    { id_material: 1, nombre: 'Rosa palo', codigo_hex: '#FFB6C1' },
    { id_material: 1, nombre: 'Verde menta', codigo_hex: '#98FF98' },
    { id_material: 1, nombre: 'Gris perla', codigo_hex: '#D3D3D3' },
    { id_material: 5, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
    { id_material: 5, nombre: 'Beige', codigo_hex: '#F5F0DC' },
    { id_material: 5, nombre: 'Gris oscuro', codigo_hex: '#4A4A4A' },
    { id_material: 5, nombre: 'Azul marino', codigo_hex: '#001F5B' },
    { id_material: 6, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
    { id_material: 6, nombre: 'Gris', codigo_hex: '#808080' },
    { id_material: 6, nombre: 'Crema', codigo_hex: '#FFFDD0' },
    { id_material: 7, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
    { id_material: 7, nombre: 'Gris claro', codigo_hex: '#C0C0C0' },
    { id_material: 7, nombre: 'Rosado', codigo_hex: '#FFC0CB' },
  ]
  for (const c of coloresSeed) {
    const existe = await prisma.material_color.findFirst({
      where: { id_material: c.id_material, nombre: c.nombre },
    })
    if (!existe) {
      await prisma.material_color.create({ data: { ...c, estado: true } })
    }
  }

  // ─── DISEÑOS (algodón estampado id 4) ────────────────────────────────────
  const disenosSeed = [
    { id_material: 4, nombre: 'Flores pequeñas' },
    { id_material: 4, nombre: 'Rayas horizontales' },
    { id_material: 4, nombre: 'Puntos' },
    { id_material: 4, nombre: 'Cuadros escoceses' },
    { id_material: 4, nombre: 'Animales cartoon' },
    { id_material: 4, nombre: 'Geométrico' },
  ]
  for (const d of disenosSeed) {
    const existe = await prisma.material_diseno.findFirst({
      where: { id_material: d.id_material, nombre: d.nombre },
    })
    if (!existe) {
      await prisma.material_diseno.create({
        data: { ...d, ruta_imagen: null, estado: true },
      })
    }
  }

  // ─── PRODUCTOS (necesarios para catálogo, carrito, movimientos) ──────────
  const catSabanas = await prisma.categoria.findFirst({ where: { nombre_c: 'Sabanas' } })
  const catCubre = await prisma.categoria.findFirst({ where: { nombre_c: 'Cubrelechos' } })
  const catAmi = await prisma.categoria.findFirst({ where: { nombre_c: 'Amigurumis' } })
  const catLlav = await prisma.categoria.findFirst({ where: { nombre_c: 'Llaveros' } })
  const clasSin = await prisma.clasificacion.findFirst({ where: { nombre_clas: 'Sin_clasificar' } })
  const clasNuevos = await prisma.clasificacion.findFirst({ where: { nombre_clas: 'Nuevos' } })
  const clasOferta = await prisma.clasificacion.findFirst({ where: { nombre_clas: 'En_oferta' } })
  const clasVendidos = await prisma.clasificacion.findFirst({ where: { nombre_clas: 'Mas_vendidos' } })

  if (!catSabanas || !catCubre || !catAmi || !catLlav || !clasSin || !clasNuevos) {
    throw new Error('Faltan categorías o clasificaciones tras el seed de catálogos')
  }

  const ahora = new Date()
  const productosSeed = [
    {
      nom_producto: 'Sábana king algodón blanco',
      precio_unitario: 95000,
      stock_actual: 50,
      stock_minimo: 5,
      descripcion: 'Sábana king size de algodón 100%, color blanco.',
      id_categoria: catSabanas.id_categoria,
      id_clasificacion: clasNuevos.id_clasificacion,
      color: 'Blanco',
      tama_o: 'King',
    },
    {
      nom_producto: 'Sábana queen rosa',
      precio_unitario: 78000,
      stock_actual: 40,
      stock_minimo: 5,
      descripcion: 'Sábana queen rosa pastel con bordado ligero.',
      id_categoria: catSabanas.id_categoria,
      id_clasificacion: clasSin.id_clasificacion,
      color: 'Rosa',
      tama_o: 'Queen',
    },
    {
      nom_producto: 'Cubrelecho doble estampado',
      precio_unitario: 120000,
      stock_actual: 30,
      stock_minimo: 3,
      descripcion: 'Cubrelecho doble con estampado floral.',
      id_categoria: catCubre.id_categoria,
      id_clasificacion: (clasOferta ?? clasSin).id_clasificacion,
      color: 'Multicolor',
      tama_o: 'Doble',
    },
    {
      nom_producto: 'Cubrelecho queen microfibra',
      precio_unitario: 110000,
      stock_actual: 25,
      stock_minimo: 3,
      descripcion: 'Cubrelecho queen en microfibra suave.',
      id_categoria: catCubre.id_categoria,
      id_clasificacion: clasSin.id_clasificacion,
      color: 'Beige',
      tama_o: 'Queen',
    },
    {
      nom_producto: 'Amigurumi oso café',
      precio_unitario: 35000,
      stock_actual: 60,
      stock_minimo: 8,
      descripcion: 'Oso tejido a mano, tamaño mediano.',
      id_categoria: catAmi.id_categoria,
      id_clasificacion: (clasVendidos ?? clasSin).id_clasificacion,
      color: 'Café',
    },
    {
      nom_producto: 'Amigurumi conejo blanco',
      precio_unitario: 32000,
      stock_actual: 45,
      stock_minimo: 8,
      descripcion: 'Conejo amigurumi blanco con moño.',
      id_categoria: catAmi.id_categoria,
      id_clasificacion: clasNuevos.id_clasificacion,
      color: 'Blanco',
    },
    // Segundo amigurumi "Nuevos" — Cypress Cliente filtra Amigurumis + Nuevos y agrega 2
    {
      nom_producto: 'Amigurumi gatito gris',
      precio_unitario: 28000,
      stock_actual: 50,
      stock_minimo: 8,
      descripcion: 'Gatito amigurumi gris, tamaño pequeño.',
      id_categoria: catAmi.id_categoria,
      id_clasificacion: clasNuevos.id_clasificacion,
      color: 'Gris',
    },
    {
      nom_producto: 'Amigurumi panda nuevo',
      precio_unitario: 38000,
      stock_actual: 40,
      stock_minimo: 5,
      descripcion: 'Panda amigurumi colección nuevos.',
      id_categoria: catAmi.id_categoria,
      id_clasificacion: clasNuevos.id_clasificacion,
      color: 'Blanco',
    },
    {
      nom_producto: 'Llavero corazón tejido',
      precio_unitario: 12000,
      stock_actual: 100,
      stock_minimo: 15,
      descripcion: 'Llavero en forma de corazón tejido a mano.',
      id_categoria: catLlav.id_categoria,
      id_clasificacion: clasSin.id_clasificacion,
      color: 'Rojo',
    },
    {
      nom_producto: 'Llavero estrella',
      precio_unitario: 10000,
      stock_actual: 80,
      stock_minimo: 15,
      descripcion: 'Llavero estrella en hilo de algodón.',
      id_categoria: catLlav.id_categoria,
      id_clasificacion: clasNuevos.id_clasificacion,
      color: 'Amarillo',
    },
    // Producto con poco stock para alertas / últimas unidades
    {
      nom_producto: 'Sábana sencilla prueba stock bajo',
      precio_unitario: 45000,
      stock_actual: 2,
      stock_minimo: 5,
      descripcion: 'Producto de prueba con stock bajo para notificaciones.',
      id_categoria: catSabanas.id_categoria,
      id_clasificacion: clasSin.id_clasificacion,
      color: 'Gris',
      tama_o: 'Sencilla',
    },
  ]

  // Placeholder para que el catálogo del frontend (filtra sin imagen) muestre productos
  const IMG_PLACEHOLDER =
    'https://res.cloudinary.com/demo/image/upload/sample.jpg'

  for (const p of productosSeed) {
    const existe = await prisma.producto.findFirst({
      where: { nom_producto: p.nom_producto },
    })
    if (!existe) {
      await prisma.producto.create({
        data: {
          ...p,
          ultima_actualiz: ahora,
          estado: true,
          ruta_imagen: IMG_PLACEHOLDER,
        },
      })
    } else {
      // Reponer stock si se re-ejecuta el seed (útil para Cypress)
      await prisma.producto.update({
        where: { id_producto: existe.id_producto },
        data: {
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          precio_unitario: p.precio_unitario,
          estado: true,
          ultima_actualiz: ahora,
          // Si no tenía imagen, poner placeholder para que aparezca en catálogo
          ruta_imagen: existe.ruta_imagen || IMG_PLACEHOLDER,
        },
      })
    }
  }

  // ─── SINCRONIZAR SECUENCIAS PostgreSQL ───────────────────────────────────
  const secuencias = [
    'material',
    'material_color',
    'material_diseno',
    'producto',
    'categoria',
    'clasificacion',
  ]
  for (const tabla of secuencias) {
    const col =
      tabla === 'material'
        ? 'id_material'
        : tabla === 'material_color'
          ? 'id_color'
          : tabla === 'material_diseno'
            ? 'id_diseno'
            : tabla === 'producto'
              ? 'id_producto'
              : tabla === 'categoria'
                ? 'id_categoria'
                : 'id_clasificacion'
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${tabla}"', '${col}'),
          COALESCE((SELECT MAX("${col}") FROM "${tabla}"), 1)
        );
      `)
    } catch (e) {
      // Algunas instalaciones no usan comillas en nombres; intentar sin ellas
      try {
        await prisma.$executeRawUnsafe(`
          SELECT setval(
            pg_get_serial_sequence('${tabla}', '${col}'),
            COALESCE((SELECT MAX(${col}) FROM ${tabla}), 1)
          );
        `)
      } catch {
        console.warn(`No se pudo sincronizar secuencia de ${tabla}.${col}`)
      }
    }
  }

  const nProd = await prisma.producto.count()
  const nMat = await prisma.material.count()
  const nUsr = await prisma.usuario.count()
  console.log(
    `Seed OK — usuarios: ${nUsr}, productos: ${nProd}, materiales: ${nMat}`,
  )
  console.log(
    'Seed aplicado sobre DATABASE_URL actual (gurama_test o guramaonline).',
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
