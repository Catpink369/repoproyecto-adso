-- CreateTable
CREATE TABLE `categoria` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_c` ENUM('Sabanas', 'Cubrelechos', 'Amigurumis', 'Llaveros') NOT NULL,
    `descripcion` VARCHAR(60) NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clasificacion` (
    `id_clasificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_clas` ENUM('Sin clasificar', 'En oferta', 'Mas vendidos', 'Nuevos', 'Ultimas unidades') NOT NULL,

    PRIMARY KEY (`id_clasificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_pedido_personalizado` (
    `id_detalle` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ped_personal` INTEGER NOT NULL,
    `id_material` INTEGER NOT NULL,
    `id_color` INTEGER NULL,
    `id_diseno` INTEGER NULL,
    `cantidad` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `concepto` VARCHAR(40) NULL,

    INDEX `fk_det_pers_material`(`id_material`),
    INDEX `fk_det_pers_pedido`(`id_ped_personal`),
    INDEX `fk_detpp_color`(`id_color`),
    INDEX `fk_detpp_diseno`(`id_diseno`),
    PRIMARY KEY (`id_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalles_pedido` (
    `id_detalles` INTEGER NOT NULL AUTO_INCREMENT,
    `descrip_detalles` VARCHAR(100) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `id_pedido` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,

    INDEX `fk_detalles_pedido`(`id_pedido`),
    INDEX `fk_detalles_producto`(`id_producto`),
    PRIMARY KEY (`id_detalles`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado_pago` (
    `id_estado` ENUM('E-pt', 'E-pd', 'E-f', 'E-e') NOT NULL,
    `nom_metodo` ENUM('Pendiente', 'Pagado', 'finalizado', 'entregado') NOT NULL,

    PRIMARY KEY (`id_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material` (
    `id_material` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NOT NULL,
    `tipo` ENUM('Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio') NOT NULL,
    `unidad` ENUM('metro', 'unidad') NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `stock_actual` INTEGER NOT NULL DEFAULT 0,
    `stock_minimo` INTEGER NOT NULL DEFAULT 5,
    `ruta_imagen` VARCHAR(255) NULL,
    `estado` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id_material`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_color` (
    `id_color` INTEGER NOT NULL AUTO_INCREMENT,
    `id_material` INTEGER NOT NULL,
    `nombre` VARCHAR(40) NOT NULL,
    `codigo_hex` VARCHAR(7) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,

    INDEX `fk_color_material`(`id_material`),
    PRIMARY KEY (`id_color`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_diseno` (
    `id_diseno` INTEGER NOT NULL AUTO_INCREMENT,
    `id_material` INTEGER NOT NULL,
    `nombre` VARCHAR(60) NOT NULL,
    `ruta_imagen` VARCHAR(255) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,

    INDEX `fk_diseno_material`(`id_material`),
    PRIMARY KEY (`id_diseno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodo_pago` (
    `id_met_pago` ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') NOT NULL,
    `nom_metodo` ENUM('Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Por definir') NOT NULL,

    PRIMARY KEY (`id_met_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimiento` (
    `id_movimiento` INTEGER NOT NULL AUTO_INCREMENT,
    `Cantidad_m` INTEGER NOT NULL,
    `fecha_m` DATETIME(0) NULL,
    `observaciones` VARCHAR(80) NULL,
    `id_m` ENUM('M-E', 'M-S') NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `id_usuario` VARCHAR(15) NOT NULL,
    `id_material` INTEGER NULL,

    INDEX `fk_movimiento_material`(`id_material`),
    INDEX `fk_movimiento_producto`(`id_producto`),
    INDEX `fk_movimiento_tipo`(`id_m`),
    INDEX `fk_movimiento_usuario`(`id_usuario`),
    PRIMARY KEY (`id_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimiento_material` (
    `id_movimiento_material` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad_m` DECIMAL(10, 2) NOT NULL,
    `fecha_m` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `observaciones` VARCHAR(80) NULL,
    `id_m` ENUM('M-E', 'M-S') NOT NULL,
    `id_material` INTEGER NOT NULL,
    `id_usuario` VARCHAR(15) NOT NULL,
    `id_ped_personal` INTEGER NULL,

    INDEX `fk_movmat_material`(`id_material`),
    INDEX `fk_movmat_tipo`(`id_m`),
    INDEX `fk_movmat_usuario`(`id_usuario`),
    INDEX `fk_movmat_pedido`(`id_ped_personal`),
    PRIMARY KEY (`id_movimiento_material`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacion` (
    `id_notificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` VARCHAR(15) NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensaje` VARCHAR(500) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL DEFAULT 'general',
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `fecha` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_notificacion_usuario_leida`(`id_usuario`, `leida`),
    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(0) NOT NULL,
    `estado` VARCHAR(20) NOT NULL,
    `id_usuario` VARCHAR(15) NOT NULL,
    `id_tipo` ENUM('P-P', 'P-E') NOT NULL,

    INDEX `fk_pedido_tipo`(`id_tipo`),
    INDEX `fk_pedido_usuario`(`id_usuario`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_personalizado` (
    `id_ped_personal` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `tipo_producto` ENUM('Sabana', 'Cubrelecho') NOT NULL,
    `tamanio` VARCHAR(30) NOT NULL,
    `precio_total` DECIMAL(10, 2) NOT NULL,

    INDEX `fk_personalizado_pedido`(`id_pedido`),
    PRIMARY KEY (`id_ped_personal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_producto` VARCHAR(60) NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `stock_actual` INTEGER NOT NULL,
    `stock_minimo` INTEGER NOT NULL,
    `ultima_actualiz` DATETIME(0) NOT NULL,
    `color` VARCHAR(20) NULL,
    `talla` VARCHAR(20) NULL,
    `tamaño` VARCHAR(20) NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `id_categoria` INTEGER NOT NULL,
    `id_clasificacion` INTEGER NOT NULL,
    `ruta_imagen` VARCHAR(255) NULL,
    `estado` BOOLEAN NULL DEFAULT true,

    INDEX `fk_producto_categoria`(`id_categoria`),
    INDEX `fk_producto_clasificacion`(`id_clasificacion`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol_usuario` (
    `id_rol_usuario` VARCHAR(20) NOT NULL,
    `nombre_rol` VARCHAR(25) NOT NULL,

    PRIMARY KEY (`id_rol_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_compra` (
    `id_ticket_c` INTEGER NOT NULL AUTO_INCREMENT,
    `num_ticket` INTEGER NOT NULL,
    `fecha_emision` DATETIME(0) NOT NULL,
    `sub_total` DECIMAL(10, 0) NOT NULL,
    `total_ticket` DECIMAL(10, 0) NOT NULL,
    `id_pedido` INTEGER NOT NULL,
    `id_estado` ENUM('E-pt', 'E-pd', 'E-f', 'E-e') NOT NULL,
    `id_met_pago` ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') NOT NULL,

    UNIQUE INDEX `num_ticket`(`num_ticket`),
    UNIQUE INDEX `id_pedido`(`id_pedido`),
    INDEX `fk_ticket_estado`(`id_estado`),
    INDEX `fk_ticket_metodo`(`id_met_pago`),
    PRIMARY KEY (`id_ticket_c`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_documento` (
    `t_doc` ENUM('CC', 'CE', 'TI') NOT NULL,
    `desc_doc` ENUM('Cédula de ciudadanía', 'Cédula de extranjería', 'Tarjeta de identidad') NOT NULL,

    PRIMARY KEY (`t_doc`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_movimiento` (
    `id_m` ENUM('M-E', 'M-S') NOT NULL,
    `nom_movimiento` ENUM('Entrada', 'Salida') NOT NULL,

    PRIMARY KEY (`id_m`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_pedido` (
    `id_tipo` ENUM('P-P', 'P-E') NOT NULL,
    `tipo_pedido` ENUM('Personalizado', 'Estandar') NOT NULL,

    PRIMARY KEY (`id_tipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` VARCHAR(15) NOT NULL,
    `nom_1` VARCHAR(50) NOT NULL,
    `nom_2` VARCHAR(50) NULL,
    `ape_1` VARCHAR(50) NOT NULL,
    `ape_2` VARCHAR(50) NULL,
    `correo` VARCHAR(40) NOT NULL,
    `telefono` BIGINT NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `codigo` VARCHAR(255) NULL,
    `id_rol_usuario` VARCHAR(20) NOT NULL,
    `t_doc` ENUM('CC', 'CE', 'TI') NOT NULL,
    `img_perfil` VARCHAR(255) NULL,
    `codigo_visible` VARCHAR(20) NULL,
    `reset_codigo` VARCHAR(255) NULL,
    `reset_expira` DATETIME(0) NULL,
    `estado` INTEGER NOT NULL DEFAULT 1,
    `fcm_token` VARCHAR(255) NULL,
    `bloqueado_hasta` DATETIME(3) NULL,
    `intentos_fallidos` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `codigo`(`codigo`),
    INDEX `id_rol_usuario`(`id_rol_usuario`),
    INDEX `t_doc`(`t_doc`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detalle_pedido_personalizado` ADD CONSTRAINT `detalle_pedido_personalizado_id_ped_personal_fkey` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado`(`id_ped_personal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido_personalizado` ADD CONSTRAINT `detalle_pedido_personalizado_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material`(`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido_personalizado` ADD CONSTRAINT `detalle_pedido_personalizado_id_color_fkey` FOREIGN KEY (`id_color`) REFERENCES `material_color`(`id_color`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido_personalizado` ADD CONSTRAINT `detalle_pedido_personalizado_id_diseno_fkey` FOREIGN KEY (`id_diseno`) REFERENCES `material_diseno`(`id_diseno`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_color` ADD CONSTRAINT `material_color_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material`(`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_diseno` ADD CONSTRAINT `material_diseno_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material`(`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_m_fkey` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento`(`id_m`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material`(`id_material`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento_material` ADD CONSTRAINT `movimiento_material_id_m_fkey` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento`(`id_m`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento_material` ADD CONSTRAINT `movimiento_material_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material`(`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento_material` ADD CONSTRAINT `movimiento_material_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento_material` ADD CONSTRAINT `movimiento_material_id_ped_personal_fkey` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado`(`id_ped_personal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_id_tipo_fkey` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_pedido`(`id_tipo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_personalizado` ADD CONSTRAINT `pedido_personalizado_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_id_clasificacion_fkey` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion`(`id_clasificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_compra` ADD CONSTRAINT `ticket_compra_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_compra` ADD CONSTRAINT `ticket_compra_id_estado_fkey` FOREIGN KEY (`id_estado`) REFERENCES `estado_pago`(`id_estado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_compra` ADD CONSTRAINT `ticket_compra_id_met_pago_fkey` FOREIGN KEY (`id_met_pago`) REFERENCES `metodo_pago`(`id_met_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_id_rol_usuario_fkey` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario`(`id_rol_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_t_doc_fkey` FOREIGN KEY (`t_doc`) REFERENCES `tipo_documento`(`t_doc`) ON DELETE RESTRICT ON UPDATE CASCADE;

