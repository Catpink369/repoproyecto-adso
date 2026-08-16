-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-08-2026 a las 22:23:28
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `guramaonline`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre_c` enum('Sabanas','Cubrelechos','Amigurumis','Llaveros') NOT NULL,
  `descripcion` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre_c`, `descripcion`) VALUES
(1, 'Sabanas', 'Sabanas con encaje en todos los tamaños'),
(2, 'Cubrelechos', 'Cubrelechos con diseños'),
(3, 'Amigurumis', 'Muñecos tejidos'),
(4, 'Llaveros', 'Llaveros tejidos a mano');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificacion`
--

CREATE TABLE `clasificacion` (
  `id_clasificacion` int(11) NOT NULL,
  `nombre_clas` enum('Sin clasificar','En oferta','Mas vendidos','Nuevos','Ultimas unidades') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clasificacion`
--

INSERT INTO `clasificacion` (`id_clasificacion`, `nombre_clas`) VALUES
(1, 'Sin clasificar'),
(2, 'En oferta'),
(3, 'Mas vendidos'),
(4, 'Nuevos'),
(5, 'Ultimas unidades');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `id_detalles` int(11) NOT NULL,
  `descrip_detalles` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido_personalizado`
--

CREATE TABLE `detalle_pedido_personalizado` (
  `id_detalle` int(11) NOT NULL,
  `id_ped_personal` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pago`
--

CREATE TABLE `estado_pago` (
  `id_estado` enum('E-pt','E-pd','E-f','E-e') NOT NULL,
  `nom_metodo` enum('Pendiente','Pagado','finalizado','entregado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_pago`
--

INSERT INTO `estado_pago` (`id_estado`, `nom_metodo`) VALUES
('E-pt', 'Pendiente'),
('E-pd', 'Pagado'),
('E-f', 'finalizado'),
('E-e', 'entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material`
--

CREATE TABLE `material` (
  `id_material` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `tipo` enum('Tela','Bordado','Diseño','Relleno','Accesorio') NOT NULL,
  `unidad` enum('metro','unidad') NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `stock_actual` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material_color`
--

CREATE TABLE `material_color` (
  `id_color` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `codigo_hex` varchar(7) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material_diseno`
--

CREATE TABLE `material_diseno` (
  `id_diseno` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo_pago`
--

CREATE TABLE `metodo_pago` (
  `id_met_pago` enum('Mtd-EF','Mtd-NQ','Mtd-DP','Mtd-TJ','Mtd-PD') NOT NULL,
  `nom_metodo` enum('Efectivo','Nequi','Daviplata','Tarjeta','Por definir') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodo_pago`
--

INSERT INTO `metodo_pago` (`id_met_pago`, `nom_metodo`) VALUES
('Mtd-EF', 'Efectivo'),
('Mtd-NQ', 'Nequi'),
('Mtd-DP', 'Daviplata'),
('Mtd-TJ', 'Tarjeta'),
('Mtd-PD', 'Por definir');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento`
--

CREATE TABLE `movimiento` (
  `id_movimiento` int(11) NOT NULL,
  `Cantidad_m` int(11) NOT NULL,
  `fecha_m` datetime DEFAULT NULL,
  `observaciones` varchar(80) DEFAULT NULL,
  `id_m` enum('M-E','M-S') NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_usuario` varchar(15) NOT NULL,
  `id_material` int(11) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacion`
--

CREATE TABLE `notificacion` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario` varchar(15) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` varchar(500) NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT 'general',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `estado` varchar(20) NOT NULL,
  `id_usuario` varchar(15) NOT NULL,
  `id_tipo` enum('P-P','P-E') NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_personalizado`
--

CREATE TABLE `pedido_personalizado` (
  `id_ped_personal` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `tipo_producto` enum('Sabana','Cubrelecho') NOT NULL,
  `tamanio` varchar(30) NOT NULL,
  `precio_total` decimal(10,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nom_producto` varchar(60) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `ultima_actualiz` datetime NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `talla` varchar(20) DEFAULT NULL,
  `tamaño` varchar(20) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_clasificacion` int(11) NOT NULL,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id_rol_usuario` varchar(20) NOT NULL COMMENT 'PK Código del rol',
  `nombre_rol` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_usuario`
--

INSERT INTO `rol_usuario` (`id_rol_usuario`, `nombre_rol`) VALUES
('1', 'Administrador'),
('2', 'Cliente'),
('3', 'Trabajador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_compra`
--

CREATE TABLE `ticket_compra` (
  `id_ticket_c` int(11) NOT NULL,
  `num_ticket` int(11) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `sub_total` decimal(10,0) NOT NULL,
  `total_ticket` decimal(10,0) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_estado` enum('E-pt','E-pd','E-f','E-e') NOT NULL,
  `id_met_pago` enum('Mtd-EF','Mtd-NQ','Mtd-DP','Mtd-TJ','Mtd-PD') NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `t_doc` enum('CC','CE','TI') NOT NULL COMMENT 'PK Código del tipo de documento',
  `desc_doc` enum('Cédula de ciudadanía','Cédula de extranjería','Tarjeta de identidad') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_documento`
--

INSERT INTO `tipo_documento` (`t_doc`, `desc_doc`) VALUES
('CC', 'Cédula de ciudadanía'),
('CE', 'Cédula de extranjería'),
('TI', 'Tarjeta de identidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_movimiento`
--

CREATE TABLE `tipo_movimiento` (
  `id_m` enum('M-E','M-S') NOT NULL,
  `nom_movimiento` enum('Entrada','Salida') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_movimiento`
--

INSERT INTO `tipo_movimiento` (`id_m`, `nom_movimiento`) VALUES
('M-E', 'Entrada'),
('M-S', 'Salida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_pedido`
--

CREATE TABLE `tipo_pedido` (
  `id_tipo` enum('P-P','P-E') NOT NULL,
  `tipo_pedido` enum('Personalizado','Estandar') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_pedido`
--

INSERT INTO `tipo_pedido` (`id_tipo`, `tipo_pedido`) VALUES
('P-P', 'Personalizado'),
('P-E', 'Estandar');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` varchar(15) NOT NULL,
  `nom_1` varchar(50) NOT NULL,
  `nom_2` varchar(50) DEFAULT NULL,
  `ape_1` varchar(50) NOT NULL,
  `ape_2` varchar(50) DEFAULT NULL,
  `correo` varchar(40) NOT NULL,
  `telefono` bigint(20) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `id_rol_usuario` varchar(20) NOT NULL,
  `t_doc` enum('CC','CE','TI') NOT NULL,
  `img_perfil` varchar(255) DEFAULT NULL,
  `codigo_visible` varchar(20) DEFAULT NULL,
  `reset_codigo` varchar(255) DEFAULT NULL,
  `reset_expira` datetime DEFAULT NULL,
  `estado` int(11) DEFAULT 1,
  `fcm_token` varchar(255) DEFAULT NULL,
  `bloqueado_hasta` datetime(3) DEFAULT NULL,
  `intentos_fallidos` int(11) NOT NULL DEFAULT 0
) ;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nom_1`, `nom_2`, `ape_1`, `ape_2`, `correo`, `telefono`, `contrasena`, `codigo`, `id_rol_usuario`, `t_doc`, `img_perfil`, `codigo_visible`, `reset_codigo`, `reset_expira`, `estado`, `fcm_token`, `bloqueado_hasta`, `intentos_fallidos`) VALUES
('Adm-01', 'Valentina', NULL, 'Ruiz', 'Castro', 'valruiz@gmail.com', 3123456789, '$2b$10$MQ8Rq2ay0hTSjhQD5tNGDeL3XRc8n9plA65vZMF1iGQE3BvxAr84.', '$2b$10$ZH6itzBvzfIkJA21fSR2Y.MYNgKo152SH10kysBJlK9WfJDRkdO46', '1', 'CC', NULL, '12345', NULL, NULL, 1, NULL, NULL, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `clasificacion`
--
ALTER TABLE `clasificacion`
  ADD PRIMARY KEY (`id_clasificacion`);

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`id_detalles`),
  ADD KEY `fk_detalles_pedido` (`id_pedido`),
  ADD KEY `fk_detalles_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_det_pers_pedido` (`id_ped_personal`),
  ADD KEY `fk_det_pers_material` (`id_material`);

--
-- Indices de la tabla `estado_pago`
--
ALTER TABLE `estado_pago`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id_material`);

--
-- Indices de la tabla `material_color`
--
ALTER TABLE `material_color`
  ADD PRIMARY KEY (`id_color`),
  ADD KEY `fk_color_material` (`id_material`);

--
-- Indices de la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  ADD PRIMARY KEY (`id_diseno`),
  ADD KEY `fk_diseno_material` (`id_material`);

--
-- Indices de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  ADD PRIMARY KEY (`id_met_pago`);

--
-- Indices de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_movimiento_tipo` (`id_m`),
  ADD KEY `fk_movimiento_producto` (`id_producto`),
  ADD KEY `fk_movimiento_usuario` (`id_usuario`),
  ADD KEY `fk_movimiento_material` (`id_material`);

--
-- Indices de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `idx_notificacion_usuario_leida` (`id_usuario`,`leida`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `fk_pedido_usuario` (`id_usuario`),
  ADD KEY `fk_pedido_tipo` (`id_tipo`);

--
-- Indices de la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  ADD PRIMARY KEY (`id_ped_personal`),
  ADD KEY `fk_personalizado_pedido` (`id_pedido`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_clasificacion` (`id_clasificacion`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`id_rol_usuario`);

--
-- Indices de la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  ADD PRIMARY KEY (`id_ticket_c`),
  ADD UNIQUE KEY `num_ticket` (`num_ticket`),
  ADD UNIQUE KEY `id_pedido` (`id_pedido`),
  ADD KEY `fk_ticket_estado` (`id_estado`),
  ADD KEY `fk_ticket_metodo` (`id_met_pago`);

--
-- Indices de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`t_doc`);

--
-- Indices de la tabla `tipo_movimiento`
--
ALTER TABLE `tipo_movimiento`
  ADD PRIMARY KEY (`id_m`);

--
-- Indices de la tabla `tipo_pedido`
--
ALTER TABLE `tipo_pedido`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uk_usuario_codigo` (`codigo`),
  ADD KEY `fk_usuario_rol` (`id_rol_usuario`),
  ADD KEY `fk_usuario_tdoc` (`t_doc`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `clasificacion`
--
ALTER TABLE `clasificacion`
  MODIFY `id_clasificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  MODIFY `id_detalles` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `material_color`
--
ALTER TABLE `material_color`
  MODIFY `id_color` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  MODIFY `id_diseno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  MODIFY `id_ped_personal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  MODIFY `id_ticket_c` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `fk_detalles_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalles_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  ADD CONSTRAINT `fk_det_pers_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_det_pers_pedido` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `material_color`
--
ALTER TABLE `material_color`
  ADD CONSTRAINT `fk_color_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  ADD CONSTRAINT `fk_diseno_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD CONSTRAINT `fk_movimiento_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimiento_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimiento_tipo` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento` (`id_m`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_pedido` (`id_tipo`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  ADD CONSTRAINT `fk_personalizado_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_clasificacion` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion` (`id_clasificacion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  ADD CONSTRAINT `fk_ticket_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado_pago` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ticket_metodo` FOREIGN KEY (`id_met_pago`) REFERENCES `metodo_pago` (`id_met_pago`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ticket_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_tdoc` FOREIGN KEY (`t_doc`) REFERENCES `tipo_documento` (`t_doc`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
