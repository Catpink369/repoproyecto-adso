import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. ROLES
  const roles = [
    { id_rol_usuario: '1', nombre_rol: 'Administrador' },
    { id_rol_usuario: '2', nombre_rol: 'Cliente' },
    { id_rol_usuario: '3', nombre_rol: 'Trabajador' },
  ]
  for (const r of roles) {
    await prisma.rol_usuario.upsert({ where: { id_rol_usuario: r.id_rol_usuario }, update: {}, create: r })
  }

  // 2. TIPOS DE DOCUMENTO
  await prisma.tipo_documento.upsert({
    where: { t_doc: 'CC' },
    update: {},
    create: { t_doc: 'CC', desc_doc: 'C_dula_de_ciudadan_a' } // Nombre según tu Enum
  })

  // 3. CATEGORÍAS
  const categorias = [
    { nombre_c: 'Sabanas' as any },
    { nombre_c: 'Cubrelechos' as any },
    { nombre_c: 'Amigurumis' as any },
    { nombre_c: 'Llaveros' as any },
  ]
  for (const c of categorias) {
    await prisma.categoria.create({ data: c })
  }

  // 4. ESTADOS DE PAGO (Usando los IDs de tu Enum: E_pt, E_pd, etc.)
  const estados = [
    { id_estado: 'E_pt' as any, nom_metodo: 'Pendiente' as any },
    { id_estado: 'E_pd' as any, nom_metodo: 'Pagado' as any },
  ]
  for (const e of estados) {
    await prisma.estado_pago.upsert({ where: { id_estado: e.id_estado }, update: {}, create: e })
  }

  // 5. USUARIO ADMIN INICIAL (Para que siempre puedas entrar)
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

  // ─── Agregar dentro de la función main() del seed.ts ─────────────────────────
// Pégalo después del bloque de categorías o al final, antes del console.log

  // COLORES POR MATERIAL
  // id_material 1 = Algodón liso, 4 = Algodón estampado, 5 = Microfibra, 6 = Ovejero, 7 = Conejo
  const colores = [
    // Algodón liso (id=1)
    { id_material: 1, nombre: 'Blanco',       codigo_hex: '#FFFFFF' },
    { id_material: 1, nombre: 'Negro',         codigo_hex: '#1A1A1A' },
    { id_material: 1, nombre: 'Azul cielo',    codigo_hex: '#87CEEB' },
    { id_material: 1, nombre: 'Rosa palo',     codigo_hex: '#FFB6C1' },
    { id_material: 1, nombre: 'Verde menta',   codigo_hex: '#98FF98' },
    { id_material: 1, nombre: 'Gris perla',    codigo_hex: '#D3D3D3' },
    // Microfibra (id=5)
    { id_material: 5, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 5, nombre: 'Beige',         codigo_hex: '#F5F0DC' },
    { id_material: 5, nombre: 'Gris oscuro',   codigo_hex: '#4A4A4A' },
    { id_material: 5, nombre: 'Azul marino',   codigo_hex: '#001F5B' },
    // Ovejero (id=6)
    { id_material: 6, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 6, nombre: 'Gris',          codigo_hex: '#808080' },
    { id_material: 6, nombre: 'Crema',         codigo_hex: '#FFFDD0' },
    // Conejo (id=7)
    { id_material: 7, nombre: 'Blanco',        codigo_hex: '#FFFFFF' },
    { id_material: 7, nombre: 'Gris claro',    codigo_hex: '#C0C0C0' },
    { id_material: 7, nombre: 'Rosado',        codigo_hex: '#FFC0CB' },
  ]

  for (const c of colores) {
    await prisma.material_color.create({ data: c })
  }

  // DISEÑOS POR MATERIAL
  // Solo Algodón estampado (id=4) tiene diseños/estampados
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
  
  console.log('Base de datos GuramaOnline poblada con éxito.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })