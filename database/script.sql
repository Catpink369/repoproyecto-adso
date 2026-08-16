CREATE DATABASE IF NOT EXISTS `guramaonline` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `guramaonline`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `notificacion`;
DROP TABLE IF EXISTS `detalle_pedido_personalizado`;
DROP TABLE IF EXISTS `pedido_personalizado`;
DROP TABLE IF EXISTS `material_diseno`;
DROP TABLE IF EXISTS `material_color`;
DROP TABLE IF EXISTS `material`;
DROP TABLE IF EXISTS `movimiento`;
DROP TABLE IF EXISTS `ticket_compra`;
DROP TABLE IF EXISTS `detalles_pedido`;
DROP TABLE IF EXISTS `producto`;
DROP TABLE IF EXISTS `pedido`;
DROP TABLE IF EXISTS `tipo_pedido`;
DROP TABLE IF EXISTS `tipo_movimiento`;
DROP TABLE IF EXISTS `metodo_pago`;
DROP TABLE IF EXISTS `estado_pago`;
DROP TABLE IF EXISTS `clasificacion`;
DROP TABLE IF EXISTS `categoria`;
DROP TABLE IF EXISTS `usuario`;
DROP TABLE IF EXISTS `tipo_documento`;
DROP TABLE IF EXISTS `rol_usuario`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. TABLAS MAESTRAS Y SEGURIDAD
-- ============================================================================

CREATE TABLE `rol_usuario` (
  `id_rol_usuario` VARCHAR(20) NOT NULL COMMENT 'PK Código del rol',
  `nombre_rol` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`id_rol_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipo_documento` (
  `t_doc` ENUM('CC', 'CE', 'TI') NOT NULL COMMENT 'PK Código del tipo de documento',
  `desc_doc` ENUM('Cédula de ciudadanía', 'Cédula de extranjería', 'Tarjeta de identidad') NOT NULL,
  PRIMARY KEY (`t_doc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `usuario` (
  `id_usuario` VARCHAR(15) NOT NULL,
  `nom_1` VARCHAR(50) NOT NULL,
  `nom_2` VARCHAR(50) DEFAULT NULL,
  `ape_1` VARCHAR(50) NOT NULL,
  `ape_2` VARCHAR(50) DEFAULT NULL,
  `correo` VARCHAR(40) NOT NULL,
  `telefono` BIGINT NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `codigo` VARCHAR(255) DEFAULT NULL,
  `id_rol_usuario` VARCHAR(20) NOT NULL,
  `t_doc` ENUM('CC', 'CE', 'TI') NOT NULL,
  `img_perfil` VARCHAR(255) DEFAULT NULL,
  `codigo_visible` VARCHAR(20) DEFAULT NULL,
  `reset_codigo` VARCHAR(255) DEFAULT NULL,
  `reset_expira` DATETIME DEFAULT NULL,
  `estado` INT DEFAULT 1,
  `fcm_token` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuario_codigo` (`codigo`),
  KEY `fk_usuario_rol` (`id_rol_usuario`),
  KEY `fk_usuario_tdoc` (`t_doc`),
  CONSTRAINT `chk_usuario_correo` CHECK (`correo` LIKE '%@%.%'),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_usuario_tdoc` FOREIGN KEY (`t_doc`) REFERENCES `tipo_documento` (`t_doc`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. CATÁLOGOS CON ENUM
-- ============================================================================

CREATE TABLE `categoria` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre_c` ENUM('Sabanas', 'Cubrelechos', 'Amigurumis', 'Llaveros') NOT NULL,
  `descripcion` VARCHAR(60) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `clasificacion` (
  `id_clasificacion` INT NOT NULL AUTO_INCREMENT,
  `nombre_clas` ENUM('Sin clasificar', 'En oferta', 'Mas vendidos', 'Nuevos', 'Ultimas unidades') NOT NULL,
  PRIMARY KEY (`id_clasificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `estado_pago` (
  `id_estado` ENUM('E-pt', 'E-pd', 'E-f', 'E-e') NOT NULL,
  `nom_metodo` ENUM('Pendiente', 'Pagado', 'finalizado', 'entregado') NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `metodo_pago` (
  `id_met_pago` ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') NOT NULL,
  `nom_metodo` ENUM('Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Por definir') NOT NULL,
  PRIMARY KEY (`id_met_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipo_movimiento` (
  `id_m` ENUM('M-E', 'M-S') NOT NULL,
  `nom_movimiento` ENUM('Entrada', 'Salida') NOT NULL,
  PRIMARY KEY (`id_m`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipo_pedido` (
  `id_tipo` ENUM('P-P', 'P-E') NOT NULL,
  `tipo_pedido` ENUM('Personalizado', 'Estandar') NOT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. PRODUCTOS, MATERIALES Y MOVIMIENTOS
-- ============================================================================

CREATE TABLE `producto` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `nom_producto` VARCHAR(60) NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  `stock_actual` INT NOT NULL,
  `stock_minimo` INT NOT NULL,
  `ultima_actualiz` DATETIME NOT NULL,
  `color` VARCHAR(20) DEFAULT NULL,
  `talla` VARCHAR(20) DEFAULT NULL,
  `tamaño` VARCHAR(20) DEFAULT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `id_categoria` INT NOT NULL,
  `id_clasificacion` INT NOT NULL,
  `ruta_imagen` VARCHAR(255) DEFAULT NULL,
  `estado` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id_producto`),
  CONSTRAINT `chk_producto_precio` CHECK (`precio_unitario` >= 0),
  CONSTRAINT `chk_producto_stock_actual` CHECK (`stock_actual` >= 0),
  CONSTRAINT `chk_producto_stock_minimo` CHECK (`stock_minimo` >= 0),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_producto_clasificacion` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion` (`id_clasificacion`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `material` (
  `id_material` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `tipo` ENUM('Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio') NOT NULL,
  `unidad` ENUM('metro', 'unidad') NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  `stock_actual` INT NOT NULL DEFAULT 0,
  `stock_minimo` INT NOT NULL DEFAULT 5,
  `ruta_imagen` VARCHAR(255) DEFAULT NULL,
  `estado` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id_material`),
  CONSTRAINT `chk_material_precio` CHECK (`precio_unitario` >= 0),
  CONSTRAINT `chk_material_stock_actual` CHECK (`stock_actual` >= 0),
  CONSTRAINT `chk_material_stock_minimo` CHECK (`stock_minimo` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `material_color` (
  `id_color` INT NOT NULL AUTO_INCREMENT,
  `id_material` INT NOT NULL,
  `nombre` VARCHAR(40) NOT NULL,
  `codigo_hex` VARCHAR(7) DEFAULT NULL,
  `estado` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_color`),
  CONSTRAINT `chk_color_hex` CHECK (`codigo_hex` IS NULL OR `codigo_hex` REGEXP '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT `fk_color_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `material_diseno` (
  `id_diseno` INT NOT NULL AUTO_INCREMENT,
  `id_material` INT NOT NULL,
  `nombre` VARCHAR(60) NOT NULL,
  `ruta_imagen` VARCHAR(255) DEFAULT NULL,
  `estado` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_diseno`),
  CONSTRAINT `fk_diseno_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `movimiento` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT,
  `Cantidad_m` INT NOT NULL,
  `fecha_m` DATETIME DEFAULT NULL,
  `observaciones` VARCHAR(80) DEFAULT NULL,
  `id_m` ENUM('M-E', 'M-S') NOT NULL,
  `id_producto` INT NOT NULL,
  `id_usuario` VARCHAR(15) NOT NULL,
  `id_material` INT DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  CONSTRAINT `chk_movimiento_cantidad` CHECK (`Cantidad_m` > 0),
  CONSTRAINT `fk_movimiento_tipo` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento` (`id_m`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_movimiento_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_movimiento_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. PEDIDOS, TICKETS Y NOTIFICACIONES
-- ============================================================================

CREATE TABLE `pedido` (
  `id_pedido` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATETIME NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `id_usuario` VARCHAR(15) NOT NULL,
  `id_tipo` ENUM('P-P', 'P-E') NOT NULL,
  PRIMARY KEY (`id_pedido`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_pedido_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_pedido` (`id_tipo`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalles_pedido` (
  `id_detalles` INT NOT NULL AUTO_INCREMENT,
  `descrip_detalles` VARCHAR(100) NOT NULL,
  `cantidad` INT NOT NULL,
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  PRIMARY KEY (`id_detalles`),
  CONSTRAINT `chk_detalles_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `fk_detalles_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_detalles_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ticket_compra` (
  `id_ticket_c` INT NOT NULL AUTO_INCREMENT,
  `num_ticket` INT NOT NULL UNIQUE,
  `fecha_emision` DATETIME NOT NULL,
  `sub_total` DECIMAL(10, 0) NOT NULL,
  `total_ticket` DECIMAL(10, 0) NOT NULL,
  `id_pedido` INT NOT NULL UNIQUE,
  `id_estado` ENUM('E-pt', 'E-pd', 'E-f', 'E-e') NOT NULL,
  `id_met_pago` ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') NOT NULL,
  PRIMARY KEY (`id_ticket_c`),
  CONSTRAINT `chk_ticket_subtotal` CHECK (`sub_total` >= 0),
  CONSTRAINT `chk_ticket_total` CHECK (`total_ticket` >= 0),
  CONSTRAINT `fk_ticket_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ticket_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado_pago` (`id_estado`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_ticket_metodo` FOREIGN KEY (`id_met_pago`) REFERENCES `metodo_pago` (`id_met_pago`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pedido_personalizado` (
  `id_ped_personal` INT NOT NULL AUTO_INCREMENT,
  `id_pedido` INT NOT NULL,
  `tipo_producto` ENUM('Sabana', 'Cubrelecho') NOT NULL,
  `tamanio` VARCHAR(30) NOT NULL,
  `precio_total` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id_ped_personal`),
  CONSTRAINT `chk_pedido_pers_precio` CHECK (`precio_total` >= 0),
  CONSTRAINT `fk_personalizado_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_pedido_personalizado` (
  `id_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_ped_personal` INT NOT NULL,
  `id_material` INT NOT NULL,
  `cantidad` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  CONSTRAINT `chk_det_pers_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `chk_det_pers_subtotal` CHECK (`subtotal` >= 0),
  CONSTRAINT `fk_det_pers_pedido` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_det_pers_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notificacion` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` VARCHAR(15) NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` VARCHAR(500) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL DEFAULT 'general',
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_notificacion_usuario_leida` (`id_usuario`, `leida`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. DATOS REALES E INSERTS DE REGISTROS CON ENUM
-- ============================================================================

INSERT INTO `rol_usuario` (`id_rol_usuario`, `nombre_rol`) VALUES
('1', 'Administrador'),
('2', 'Cliente'),
('3', 'Trabajador');

INSERT INTO `tipo_documento` (`t_doc`, `desc_doc`) VALUES
('CC', 'Cédula de ciudadanía'),
('CE', 'Cédula de extranjería'),
('TI', 'Tarjeta de identidad');

INSERT INTO `usuario` (
  `id_usuario`, `nom_1`, `nom_2`, `ape_1`, `ape_2`, `correo`, `telefono`, 
  `contrasena`, `codigo`, `id_rol_usuario`, `t_doc`, `img_perfil`, `codigo_visible`, `fcm_token`
) VALUES (
  'Adm-01', 'Valentina', NULL, 'Ruiz', 'Castro', 'valruiz@gmail.com', 3123456789,
  '$2b$10$ZpyBdvjxoxOFc9H1WE.9v.sSNaEvHqRH1ThGiMvDAYy/StkwtxK6a',
  '$2b$10$jQpj1gMJypBF/d2zQEGz20dfRT1vBzhMUj2nrkHxV./I/tNMqymke',
  '1', 'CC', '/uploads/perfiles/Adm-01-1782018735677.jpg', '12345',
  'eRpaElB1R1KzljGREGPDff:APA91bExB6KBn3qA2BbDEijky5tyF5n8VQLGLu3AIjg7WJlmpKPBAE06zcFMDwoYyzeMQXKknk_n-WsZgqAmxZIKzMcQk5Q-nneAXmFoDhCCiPkDDaofzrM'
);

INSERT INTO `categoria` (`id_categoria`, `nombre_c`, `descripcion`) VALUES
(1, 'Sabanas', 'Sabanas con encaje en todos los tamaños'),
(2, 'Cubrelechos', 'Cubrelechos con diseños'),
(3, 'Amigurumis', 'Muñecos tejidos'),
(4, 'Llaveros', 'Llaveros tejidos a mano');

INSERT INTO `clasificacion` (`id_clasificacion`, `nombre_clas`) VALUES
(1, 'Sin clasificar'),
(2, 'En oferta'),
(3, 'Mas vendidos'),
(4, 'Nuevos'),
(5, 'Ultimas unidades');

INSERT INTO `estado_pago` (`id_estado`, `nom_metodo`) VALUES
('E-pt', 'Pendiente'),
('E-pd', 'Pagado'),
('E-f', 'finalizado'),
('E-e', 'entregado');

INSERT INTO `metodo_pago` (`id_met_pago`, `nom_metodo`) VALUES
('Mtd-EF', 'Efectivo'),
('Mtd-NQ', 'Nequi'),
('Mtd-DP', 'Daviplata'),
('Mtd-TJ', 'Tarjeta'),
('Mtd-PD', 'Por definir');

INSERT INTO `tipo_movimiento` (`id_m`, `nom_movimiento`) VALUES
('M-E', 'Entrada'),
('M-S', 'Salida');

INSERT INTO `tipo_pedido` (`id_tipo`, `tipo_pedido`) VALUES
('P-P', 'Personalizado'),
('P-E', 'Estandar');