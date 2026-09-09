-- CreateEnum
CREATE TYPE "estado_pago_id_estado" AS ENUM ('E-pt', 'E-pd', 'E-f', 'E-e');

-- CreateEnum
CREATE TYPE "metodo_pago_id_met_pago" AS ENUM ('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD');

-- CreateEnum
CREATE TYPE "tipo_documento_t_doc" AS ENUM ('CC', 'CE', 'TI');

-- CreateEnum
CREATE TYPE "tipo_movimiento_id_m" AS ENUM ('M-E', 'M-S');

-- CreateEnum
CREATE TYPE "tipo_pedido_id_tipo" AS ENUM ('P-P', 'P-E');

-- CreateEnum
CREATE TYPE "categoria_nombre_c" AS ENUM ('Sabanas', 'Cubrelechos', 'Amigurumis', 'Llaveros');

-- CreateEnum
CREATE TYPE "clasificacion_nombre_clas" AS ENUM ('Sin clasificar', 'En oferta', 'Mas vendidos', 'Nuevos', 'Ultimas unidades');

-- CreateEnum
CREATE TYPE "estado_pago_nom_metodo" AS ENUM ('Pendiente', 'Pagado', 'finalizado', 'entregado');

-- CreateEnum
CREATE TYPE "metodo_pago_nom_metodo" AS ENUM ('Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Por definir');

-- CreateEnum
CREATE TYPE "tipo_documento_desc_doc" AS ENUM ('Cédula de ciudadanía', 'Cédula de extranjería', 'Tarjeta de identidad');

-- CreateEnum
CREATE TYPE "tipo_movimiento_nom_movimiento" AS ENUM ('Entrada', 'Salida');

-- CreateEnum
CREATE TYPE "tipo_pedido_tipo_pedido" AS ENUM ('Personalizado', 'Estandar');

-- CreateEnum
CREATE TYPE "material_tipo" AS ENUM ('Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio');

-- CreateEnum
CREATE TYPE "pedido_personalizado_tipo_producto" AS ENUM ('Sabana', 'Cubrelecho');

-- CreateEnum
CREATE TYPE "material_unidad" AS ENUM ('metro', 'unidad');

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_c" "categoria_nombre_c" NOT NULL,
    "descripcion" VARCHAR(60),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "clasificacion" (
    "id_clasificacion" SERIAL NOT NULL,
    "nombre_clas" "clasificacion_nombre_clas" NOT NULL,

    CONSTRAINT "clasificacion_pkey" PRIMARY KEY ("id_clasificacion")
);

-- CreateTable
CREATE TABLE "detalle_pedido_personalizado" (
    "id_detalle" SERIAL NOT NULL,
    "id_ped_personal" INTEGER NOT NULL,
    "id_material" INTEGER NOT NULL,
    "id_color" INTEGER,
    "id_diseno" INTEGER,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "concepto" VARCHAR(40),

    CONSTRAINT "detalle_pedido_personalizado_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "detalles_pedido" (
    "id_detalles" SERIAL NOT NULL,
    "descrip_detalles" VARCHAR(100) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,

    CONSTRAINT "detalles_pedido_pkey" PRIMARY KEY ("id_detalles")
);

-- CreateTable
CREATE TABLE "estado_pago" (
    "id_estado" "estado_pago_id_estado" NOT NULL,
    "nom_metodo" "estado_pago_nom_metodo" NOT NULL,

    CONSTRAINT "estado_pago_pkey" PRIMARY KEY ("id_estado")
);

-- CreateTable
CREATE TABLE "material" (
    "id_material" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "tipo" "material_tipo" NOT NULL,
    "unidad" "material_unidad" NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "ruta_imagen" VARCHAR(255),
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "material_pkey" PRIMARY KEY ("id_material")
);

-- CreateTable
CREATE TABLE "material_color" (
    "id_color" SERIAL NOT NULL,
    "id_material" INTEGER NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "codigo_hex" VARCHAR(7),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "material_color_pkey" PRIMARY KEY ("id_color")
);

-- CreateTable
CREATE TABLE "material_diseno" (
    "id_diseno" SERIAL NOT NULL,
    "id_material" INTEGER NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "ruta_imagen" VARCHAR(255),
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "material_diseno_pkey" PRIMARY KEY ("id_diseno")
);

-- CreateTable
CREATE TABLE "metodo_pago" (
    "id_met_pago" "metodo_pago_id_met_pago" NOT NULL,
    "nom_metodo" "metodo_pago_nom_metodo" NOT NULL,

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("id_met_pago")
);

-- CreateTable
CREATE TABLE "movimiento" (
    "id_movimiento" SERIAL NOT NULL,
    "Cantidad_m" INTEGER NOT NULL,
    "fecha_m" TIMESTAMP(0),
    "observaciones" VARCHAR(80),
    "id_m" "tipo_movimiento_id_m" NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" VARCHAR(15) NOT NULL,
    "id_material" INTEGER,

    CONSTRAINT "movimiento_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "movimiento_material" (
    "id_movimiento_material" SERIAL NOT NULL,
    "cantidad_m" DECIMAL(10,2) NOT NULL,
    "fecha_m" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" VARCHAR(80),
    "id_m" "tipo_movimiento_id_m" NOT NULL,
    "id_material" INTEGER NOT NULL,
    "id_usuario" VARCHAR(15) NOT NULL,
    "id_ped_personal" INTEGER,

    CONSTRAINT "movimiento_material_pkey" PRIMARY KEY ("id_movimiento_material")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" VARCHAR(15) NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "mensaje" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'general',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" SERIAL NOT NULL,
    "fecha" TIMESTAMP(0) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "id_usuario" VARCHAR(15) NOT NULL,
    "id_tipo" "tipo_pedido_id_tipo" NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "pedido_personalizado" (
    "id_ped_personal" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "tipo_producto" "pedido_personalizado_tipo_producto" NOT NULL,
    "tamanio" VARCHAR(30) NOT NULL,
    "precio_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_personalizado_pkey" PRIMARY KEY ("id_ped_personal")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "nom_producto" VARCHAR(60) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "ultima_actualiz" TIMESTAMP(0) NOT NULL,
    "color" VARCHAR(20),
    "talla" VARCHAR(20),
    "tamaño" VARCHAR(20),
    "descripcion" VARCHAR(255) NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "id_clasificacion" INTEGER NOT NULL,
    "ruta_imagen" VARCHAR(255),
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "rol_usuario" (
    "id_rol_usuario" VARCHAR(20) NOT NULL,
    "nombre_rol" VARCHAR(25) NOT NULL,

    CONSTRAINT "rol_usuario_pkey" PRIMARY KEY ("id_rol_usuario")
);

-- CreateTable
CREATE TABLE "ticket_compra" (
    "id_ticket_c" SERIAL NOT NULL,
    "num_ticket" INTEGER NOT NULL,
    "fecha_emision" TIMESTAMP(0) NOT NULL,
    "sub_total" DECIMAL(10,0) NOT NULL,
    "total_ticket" DECIMAL(10,0) NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_estado" "estado_pago_id_estado" NOT NULL,
    "id_met_pago" "metodo_pago_id_met_pago" NOT NULL,

    CONSTRAINT "ticket_compra_pkey" PRIMARY KEY ("id_ticket_c")
);

-- CreateTable
CREATE TABLE "tipo_documento" (
    "t_doc" "tipo_documento_t_doc" NOT NULL,
    "desc_doc" "tipo_documento_desc_doc" NOT NULL,

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("t_doc")
);

-- CreateTable
CREATE TABLE "tipo_movimiento" (
    "id_m" "tipo_movimiento_id_m" NOT NULL,
    "nom_movimiento" "tipo_movimiento_nom_movimiento" NOT NULL,

    CONSTRAINT "tipo_movimiento_pkey" PRIMARY KEY ("id_m")
);

-- CreateTable
CREATE TABLE "tipo_pedido" (
    "id_tipo" "tipo_pedido_id_tipo" NOT NULL,
    "tipo_pedido" "tipo_pedido_tipo_pedido" NOT NULL,

    CONSTRAINT "tipo_pedido_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" VARCHAR(15) NOT NULL,
    "nom_1" VARCHAR(50) NOT NULL,
    "nom_2" VARCHAR(50),
    "ape_1" VARCHAR(50) NOT NULL,
    "ape_2" VARCHAR(50),
    "correo" VARCHAR(40) NOT NULL,
    "telefono" BIGINT NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(255),
    "id_rol_usuario" VARCHAR(20) NOT NULL,
    "t_doc" "tipo_documento_t_doc" NOT NULL,
    "img_perfil" VARCHAR(255),
    "codigo_visible" VARCHAR(20),
    "reset_codigo" VARCHAR(255),
    "reset_expira" TIMESTAMP(0),
    "estado" INTEGER NOT NULL DEFAULT 1,
    "fcm_token" VARCHAR(255),
    "bloqueado_hasta" TIMESTAMP(3),
    "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE INDEX "fk_det_pers_material" ON "detalle_pedido_personalizado"("id_material");

-- CreateIndex
CREATE INDEX "fk_det_pers_pedido" ON "detalle_pedido_personalizado"("id_ped_personal");

-- CreateIndex
CREATE INDEX "fk_detpp_color" ON "detalle_pedido_personalizado"("id_color");

-- CreateIndex
CREATE INDEX "fk_detpp_diseno" ON "detalle_pedido_personalizado"("id_diseno");

-- CreateIndex
CREATE INDEX "fk_detalles_pedido" ON "detalles_pedido"("id_pedido");

-- CreateIndex
CREATE INDEX "fk_detalles_producto" ON "detalles_pedido"("id_producto");

-- CreateIndex
CREATE INDEX "fk_color_material" ON "material_color"("id_material");

-- CreateIndex
CREATE INDEX "fk_diseno_material" ON "material_diseno"("id_material");

-- CreateIndex
CREATE INDEX "fk_movimiento_material" ON "movimiento"("id_material");

-- CreateIndex
CREATE INDEX "fk_movimiento_producto" ON "movimiento"("id_producto");

-- CreateIndex
CREATE INDEX "fk_movimiento_tipo" ON "movimiento"("id_m");

-- CreateIndex
CREATE INDEX "fk_movimiento_usuario" ON "movimiento"("id_usuario");

-- CreateIndex
CREATE INDEX "fk_movmat_material" ON "movimiento_material"("id_material");

-- CreateIndex
CREATE INDEX "fk_movmat_tipo" ON "movimiento_material"("id_m");

-- CreateIndex
CREATE INDEX "fk_movmat_usuario" ON "movimiento_material"("id_usuario");

-- CreateIndex
CREATE INDEX "fk_movmat_pedido" ON "movimiento_material"("id_ped_personal");

-- CreateIndex
CREATE INDEX "idx_notificacion_usuario_leida" ON "notificacion"("id_usuario", "leida");

-- CreateIndex
CREATE INDEX "fk_pedido_tipo" ON "pedido"("id_tipo");

-- CreateIndex
CREATE INDEX "fk_pedido_usuario" ON "pedido"("id_usuario");

-- CreateIndex
CREATE INDEX "fk_personalizado_pedido" ON "pedido_personalizado"("id_pedido");

-- CreateIndex
CREATE INDEX "fk_producto_categoria" ON "producto"("id_categoria");

-- CreateIndex
CREATE INDEX "fk_producto_clasificacion" ON "producto"("id_clasificacion");

-- CreateIndex
CREATE UNIQUE INDEX "num_ticket" ON "ticket_compra"("num_ticket");

-- CreateIndex
CREATE UNIQUE INDEX "id_pedido" ON "ticket_compra"("id_pedido");

-- CreateIndex
CREATE INDEX "fk_ticket_estado" ON "ticket_compra"("id_estado");

-- CreateIndex
CREATE INDEX "fk_ticket_metodo" ON "ticket_compra"("id_met_pago");

-- CreateIndex
CREATE UNIQUE INDEX "codigo" ON "usuario"("codigo");

-- CreateIndex
CREATE INDEX "id_rol_usuario" ON "usuario"("id_rol_usuario");

-- CreateIndex
CREATE INDEX "t_doc" ON "usuario"("t_doc");

-- AddForeignKey
ALTER TABLE "detalle_pedido_personalizado" ADD CONSTRAINT "detalle_pedido_personalizado_id_ped_personal_fkey" FOREIGN KEY ("id_ped_personal") REFERENCES "pedido_personalizado"("id_ped_personal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido_personalizado" ADD CONSTRAINT "detalle_pedido_personalizado_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "material"("id_material") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido_personalizado" ADD CONSTRAINT "detalle_pedido_personalizado_id_color_fkey" FOREIGN KEY ("id_color") REFERENCES "material_color"("id_color") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido_personalizado" ADD CONSTRAINT "detalle_pedido_personalizado_id_diseno_fkey" FOREIGN KEY ("id_diseno") REFERENCES "material_diseno"("id_diseno") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_color" ADD CONSTRAINT "material_color_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "material"("id_material") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_diseno" ADD CONSTRAINT "material_diseno_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "material"("id_material") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_id_m_fkey" FOREIGN KEY ("id_m") REFERENCES "tipo_movimiento"("id_m") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "material"("id_material") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_material" ADD CONSTRAINT "movimiento_material_id_m_fkey" FOREIGN KEY ("id_m") REFERENCES "tipo_movimiento"("id_m") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_material" ADD CONSTRAINT "movimiento_material_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "material"("id_material") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_material" ADD CONSTRAINT "movimiento_material_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_material" ADD CONSTRAINT "movimiento_material_id_ped_personal_fkey" FOREIGN KEY ("id_ped_personal") REFERENCES "pedido_personalizado"("id_ped_personal") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "tipo_pedido"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_personalizado" ADD CONSTRAINT "pedido_personalizado_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_clasificacion_fkey" FOREIGN KEY ("id_clasificacion") REFERENCES "clasificacion"("id_clasificacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_compra" ADD CONSTRAINT "ticket_compra_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_compra" ADD CONSTRAINT "ticket_compra_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "estado_pago"("id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_compra" ADD CONSTRAINT "ticket_compra_id_met_pago_fkey" FOREIGN KEY ("id_met_pago") REFERENCES "metodo_pago"("id_met_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_usuario_fkey" FOREIGN KEY ("id_rol_usuario") REFERENCES "rol_usuario"("id_rol_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_t_doc_fkey" FOREIGN KEY ("t_doc") REFERENCES "tipo_documento"("t_doc") ON DELETE RESTRICT ON UPDATE CASCADE;
