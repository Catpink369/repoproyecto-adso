-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-08-2026 a las 05:43:55
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
-- Base de datos: `gurama_test`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(4) NOT NULL COMMENT '	PK Identificador único de la categoría.',
  `nombre_c` enum('Sabanas','Cubrelechos','Amigurumis','Llaveros') NOT NULL COMMENT '	Nombre de la categoría (ejemplo: llaveros, amigurumis, sabanas).',
  `descripcion` varchar(60) DEFAULT NULL COMMENT 'Breve explicación de la categoría (opcional).'
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
  `id_clasificacion` int(11) NOT NULL COMMENT 'PK Identificador único de la Clasificación.',
  `nombre_clas` enum('Sin clasificar','En oferta','Mas vendidos','Nuevos','Ultimas unidades') NOT NULL COMMENT 'Nombre de la Clasificación (ejemplo: oferta, más vendido, promoción).'
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
  `id_detalles` int(4) NOT NULL COMMENT 'PK Identificador único del detalle del pedido.',
  `descrip_detalles` varchar(100) NOT NULL COMMENT 'Información extra (ejemplo: color, tamaño, tela).',
  `cantidad` int(11) NOT NULL COMMENT 'Número de unidades de un producto dentro del pedido.',
  `id_pedido` int(4) NOT NULL COMMENT 'PK_FK Relación con el pedido al que pertenece el detalle.',
  `id_producto` int(3) NOT NULL COMMENT 'PK_FK Relación con el producto al que pertenece el detalle.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pago`
--

CREATE TABLE `estado_pago` (
  `id_estado` enum('E-pt','E-pd','E-f','E-e') NOT NULL COMMENT 'PK Identificador único del estado del pago.',
  `nom_metodo` enum('Pendiente','Pagado','finalizado','entregado') NOT NULL COMMENT '	Estado del pago (ejemplo: aprobado, rechazado, pendiente)'
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
  `id_material` int(11) NOT NULL COMMENT 'PK identificador unico del material',
  `nombre` varchar(60) NOT NULL COMMENT 'nombre del material (tela, diseño)',
  `tipo` enum('Tela','Bordado','Diseño','Relleno','Accesorio') NOT NULL COMMENT 'Tipo de material (Tela, bordado, etc)',
  `unidad` enum('metro','unidad') NOT NULL COMMENT 'Unidad de medida ingresada (metro, centimetrros,etc)',
  `precio_unitario` decimal(10,2) NOT NULL COMMENT 'Precio del material por unidad',
  `stock_actual` int(11) NOT NULL DEFAULT 0 COMMENT '	Stock total disponible del material en ese momento.',
  `stock_minimo` int(11) NOT NULL DEFAULT 5 COMMENT 'Cantidad mínima que debe haber en inventario para no generar alerta.',
  `ruta_imagen` varchar(255) DEFAULT NULL COMMENT 'Guarda la imagen del material',
  `estado` tinyint(1) DEFAULT 1 COMMENT 'eliminación lógica, en lugar de borrar el producto de la BD, se marca como estado = 0 (false)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `material`
--

INSERT INTO `material` (`id_material`, `nombre`, `tipo`, `unidad`, `precio_unitario`, `stock_actual`, `stock_minimo`, `ruta_imagen`, `estado`) VALUES
(1, 'Algodón liso', 'Tela', 'metro', 12000.00, 36, 5, '/uploads/materiales/material-1-1775563239882.png', 1),
(2, 'Hilo de costura', 'Accesorio', 'unidad', 3000.00, 100, 15, NULL, 1),
(3, 'Elástico ', 'Accesorio', 'metro', 2000.00, 200, 10, NULL, 1),
(4, 'Algodon estampado ', 'Tela', 'metro', 14000.00, 60, 15, NULL, 1),
(5, 'Microfibra', 'Tela', 'metro', 10000.00, 108, 15, NULL, 1),
(6, 'Ovejero', 'Tela', 'metro', 15000.00, 74, 5, NULL, 1),
(7, 'Conejo', 'Tela', 'metro', 15000.00, 100, 5, NULL, 1),
(8, 'Venus pelo largo', 'Tela', 'metro', 15000.00, 96, 5, NULL, 1),
(9, 'Peluche liso', 'Tela', 'metro', 15000.00, 87, 5, NULL, 1),
(10, 'Micropolar', 'Tela', 'metro', 15000.00, 100, 5, NULL, 1),
(11, 'prueba movil ', 'Tela', 'metro', 5000.00, 12, 5, NULL, 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `material_color`
--

INSERT INTO `material_color` (`id_color`, `id_material`, `nombre`, `codigo_hex`, `estado`) VALUES
(1, 1, 'Blanco', '#FFFFFF', 1),
(2, 1, 'Negro', '#1A1A1A', 1),
(3, 1, 'Azul cielo', '#87CEEB', 1),
(4, 1, 'Rosa palo', '#FFB6C1', 1),
(5, 1, 'Verde menta', '#98FF98', 1),
(6, 1, 'Gris perla', '#D3D3D3', 1),
(7, 1, 'Amarillo suave', '#FFFACD', 1),
(8, 1, 'Lila', '#C8A2C8', 1),
(9, 4, 'Fondo blanco', '#FFFFFF', 1),
(10, 4, 'Fondo beige', '#F5F0DC', 1),
(11, 4, 'Fondo azul', '#87CEEB', 1),
(12, 4, 'Fondo rosado', '#FFB6C1', 1),
(13, 5, 'Blanco', '#FFFFFF', 1),
(14, 5, 'Beige', '#F5F0DC', 1),
(15, 5, 'Gris oscuro', '#4A4A4A', 1),
(16, 5, 'Azul marino', '#001F5B', 1),
(17, 5, 'Vino', '#722F37', 1),
(18, 5, 'Verde oliva', '#808000', 1),
(19, 6, 'Blanco', '#FFFFFF', 1),
(20, 6, 'Gris', '#808080', 1),
(21, 6, 'Crema', '#FFFDD0', 1),
(22, 6, 'Café claro', '#C4A35A', 1),
(23, 7, 'Blanco', '#FFFFFF', 1),
(24, 7, 'Gris claro', '#C0C0C0', 1),
(25, 7, 'Rosado', '#FFC0CB', 1),
(26, 7, 'Café', '#8B4513', 1),
(27, 8, 'Blanco', '#FFFFFF', 1),
(28, 8, 'Negro', '#1A1A1A', 1),
(29, 8, 'Gris', '#808080', 1),
(30, 8, 'Rosado', '#FFC0CB', 1);

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

--
-- Volcado de datos para la tabla `material_diseno`
--

INSERT INTO `material_diseno` (`id_diseno`, `id_material`, `nombre`, `ruta_imagen`, `estado`) VALUES
(1, 4, 'Flores pequeñas', NULL, 1),
(2, 4, 'Flores grandes', NULL, 1),
(3, 4, 'Rayas horizontales', NULL, 1),
(4, 4, 'Rayas verticales', NULL, 1),
(5, 4, 'Puntos', NULL, 1),
(6, 4, 'Cuadros escoceses', NULL, 1),
(7, 4, 'Animales cartoon', NULL, 1),
(8, 4, 'Geométrico', NULL, 1),
(9, 4, 'Hojas tropicales', NULL, 1),
(10, 4, 'Abstracto', NULL, 1);

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
  `id_movimiento` int(11) NOT NULL COMMENT 'PK Identificador único del movimiento.',
  `Cantidad_m` int(5) NOT NULL COMMENT 'Cantidad de productos en el movimiento (entrada o salida).',
  `fecha_m` datetime DEFAULT NULL COMMENT 'Fecha en que se registra el movimiento.',
  `observaciones` varchar(80) DEFAULT NULL COMMENT '	Nota descriptiva (ejemplo: ingreso de productos, venta a cliente).',
  `id_m` enum('M-E','M-S') NOT NULL COMMENT 'PK_FK relaciona un tipo de movimiento con la trabla del movimientos',
  `id_producto` int(3) NOT NULL COMMENT 'PK_FK relaciona un producto con el movimiento',
  `id_usuario` varchar(15) NOT NULL COMMENT 'FK relaciona al movimieto con el usuario (admin/trabajador) que lo realiza',
  `id_material` int(11) DEFAULT NULL COMMENT 'PK_FK relaciona un material con el movimiento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento`
--

INSERT INTO `movimiento` (`id_movimiento`, `Cantidad_m`, `fecha_m`, `observaciones`, `id_m`, `id_producto`, `id_usuario`, `id_material`) VALUES
(126, 1, '2026-08-11 19:00:52', 'Venta Online - Pedido #102', 'M-S', 31, '5358207551', NULL),
(127, 1, '2026-08-11 19:00:52', 'Venta Online - Pedido #106', 'M-S', 31, '5358207551', NULL),
(128, 1, '2026-08-11 19:00:53', 'Venta Online - Pedido #107', 'M-S', 31, '5358207551', NULL),
(129, 1, '2026-08-11 19:00:53', 'Venta Online - Pedido #108', 'M-S', 31, '5358207551', NULL),
(130, 1, '2026-08-11 19:00:53', 'Venta Online - Pedido #110', 'M-S', 31, '5358207551', NULL),
(131, 1, '2026-08-11 19:01:05', 'Venta Online - Pedido #114', 'M-S', 31, '5358207551', NULL),
(132, 1, '2026-08-11 19:01:08', 'Venta Online - Pedido #115', 'M-S', 31, '5358207551', NULL),
(133, 1, '2026-08-11 19:01:10', 'Venta Online - Pedido #116', 'M-S', 31, '5358207551', NULL),
(134, 1, '2026-08-11 19:01:10', 'Venta Online - Pedido #117', 'M-S', 31, '5358207551', NULL),
(135, 1, '2026-08-11 19:01:10', 'Venta Online - Pedido #118', 'M-S', 31, '5358207551', NULL),
(136, 1, '2026-08-11 19:01:10', 'Venta Online - Pedido #119', 'M-S', 31, '5358207551', NULL),
(137, 1, '2026-08-11 19:01:11', 'Venta Online - Pedido #120', 'M-S', 31, '5358207551', NULL),
(138, 1, '2026-08-11 19:01:11', 'Venta Online - Pedido #122', 'M-S', 31, '5358207551', NULL);

--
-- Disparadores `movimiento`
--
DELIMITER $$
CREATE TRIGGER `after_movimiento_insert` AFTER INSERT ON `movimiento` FOR EACH ROW UPDATE producto 
SET ultima_actualiz = NOW()
WHERE id_producto = NEW.id_producto
$$
DELIMITER ;

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
  `fecha` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificacion`
--

INSERT INTO `notificacion` (`id_notificacion`, `id_usuario`, `titulo`, `mensaje`, `tipo`, `leida`, `fecha`) VALUES
(1, '5358207551', 'Actualización de pedido', 'Tu pedido #110 está siendo preparado con cariño.', 'pedido_estado', 0, '2026-08-11 19:00:54.150'),
(2, '5358207551', 'Actualización de pedido', 'Tu pedido #114 fue finalizado. ¡Gracias por tu compra!', 'pedido_estado', 0, '2026-08-11 19:01:06.219'),
(3, '5358207551', 'Actualización de pedido', 'Tu pedido #115 está siendo preparado con cariño.', 'pedido_estado', 0, '2026-08-11 19:01:08.163');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(4) NOT NULL COMMENT 'PK Identificador unico del pedido',
  `fecha` datetime NOT NULL COMMENT 'Fecha y hora en que se realizó el pedido.',
  `estado` varchar(20) NOT NULL COMMENT 'Estado actual del pedido (ejemplo: En proceso, pendiente, entregado).',
  `id_usuario` varchar(15) NOT NULL COMMENT 'FK Usuario que realiza el pedido.',
  `id_tipo` enum('P-P','P-E') NOT NULL COMMENT 'PK_FK relacion que indica el tipo de pedido (estandar o personalizado).'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `fecha`, `estado`, `id_usuario`, `id_tipo`) VALUES
(100, '2026-08-11 19:00:51', 'Pendiente', '3676568822', 'P-P'),
(101, '2026-08-11 19:00:52', 'Pendiente', '3676568822', 'P-P'),
(103, '2026-08-11 19:00:52', 'Pendiente', '3676568822', 'P-P'),
(104, '2026-08-11 19:00:52', 'Pendiente', '5358207551', 'P-P'),
(109, '2026-08-11 19:00:53', 'Pendiente', '3676568822', 'P-P'),
(111, '2026-08-11 19:00:54', 'Pendiente', '3676568822', 'P-P'),
(112, '2026-08-11 19:00:54', 'Pendiente', '3676568822', 'P-P'),
(113, '2026-08-11 19:00:54', 'Pendiente', '3676568822', 'P-P'),
(121, '2026-08-11 19:01:11', 'Pendiente', '5358207551', 'P-P');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_personalizado`
--

CREATE TABLE `pedido_personalizado` (
  `id_ped_personal` int(11) NOT NULL COMMENT 'PK Identificador unico del pedido perzonalizado',
  `id_pedido` int(11) NOT NULL COMMENT '	Define si es una personalización de sabana o cubrelecho',
  `tipo_producto` enum('Sabana','Cubrelecho') NOT NULL COMMENT 'Tamaño en el que se desea el pedido',
  `tamanio` varchar(30) NOT NULL COMMENT '	Precio total en baase a sus materiales',
  `precio_total` decimal(10,2) NOT NULL COMMENT 'FK Realaciona al pedido personalizadp con un pedido.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_personalizado`
--

INSERT INTO `pedido_personalizado` (`id_ped_personal`, `id_pedido`, `tipo_producto`, `tamanio`, `precio_total`) VALUES
(36, 100, 'Cubrelecho', 'Queen', 44000.00),
(37, 101, 'Sabana', 'Doble', 18000.00),
(38, 103, 'Cubrelecho', 'Queen', 0.00),
(39, 104, 'Sabana', 'Doble', 18000.00),
(40, 109, 'Cubrelecho', 'King', 54000.00),
(41, 111, 'Sabana', 'Sencilla', 10000.00),
(42, 112, 'Sabana', 'Doble', 10000.00),
(43, 113, 'Sabana', 'Doble', 36000.00),
(44, 121, 'Sabana', 'Sencilla', 9000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL COMMENT 'PK Identificador único del producto.',
  `nom_producto` varchar(60) NOT NULL COMMENT '	Nombre del producto.',
  `precio_unitario` decimal(10,2) NOT NULL COMMENT 'Precio de venta por unidad.',
  `stock_actual` int(5) NOT NULL COMMENT 'Stock total disponible del producto en ese momento.',
  `stock_minimo` int(5) NOT NULL COMMENT 'Cantidad mínima que debe haber en inventario para no generar alerta.',
  `ultima_actualiz` datetime NOT NULL COMMENT 'Fecha y hora de la última modificacin en inventario.',
  `color` varchar(20) DEFAULT NULL COMMENT 'Contiene el color del producto',
  `talla` varchar(20) DEFAULT NULL COMMENT 'Contiene la talla del producto',
  `tamaño` varchar(20) DEFAULT NULL COMMENT 'Contiene el tamaño del producto',
  `descripcion` varchar(255) NOT NULL COMMENT 'Información general del producto.',
  `id_categoria` int(4) NOT NULL COMMENT '	FK Identificador de la categoría del producto, viene de la tabla categoría',
  `id_clasificacion` int(4) NOT NULL COMMENT '	FK Identificador de la clasificación del producto, viene de la tabla clasificación',
  `ruta_imagen` varchar(255) DEFAULT NULL COMMENT 'Contiene la imagen del producto',
  `estado` tinyint(1) DEFAULT 1 COMMENT '	eliminación lógica, en lugar de borrar el producto de la BD, se marca como estado = 0 (false)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nom_producto`, `precio_unitario`, `stock_actual`, `stock_minimo`, `ultima_actualiz`, `color`, `talla`, `tamaño`, `descripcion`, `id_categoria`, `id_clasificacion`, `ruta_imagen`, `estado`) VALUES
(31, 'Producto Ticket Test 1786474846267', 25000.00, 17, 5, '2026-08-11 13:01:11', NULL, NULL, NULL, 'Producto de prueba para tickets', 1, 1, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id_rol_usuario` varchar(20) NOT NULL COMMENT 'PK Identificador único del rol.',
  `nombre_rol` varchar(25) NOT NULL COMMENT 'Nombre del rol que tendrá el usuario (ejemplo: Cliente o Administrador).'
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
  `id_ticket_c` int(6) NOT NULL COMMENT 'PK Identificador único del ticket',
  `num_ticket` int(6) NOT NULL COMMENT 'numero de la ticket emitido (10, 245, 30, 1002...)',
  `fecha_emision` datetime NOT NULL COMMENT 'Fecha de emisión del ticket.',
  `sub_total` decimal(10,0) NOT NULL COMMENT '	Suma de los precios de los productos en el pedido, sin incluir impuestos ni descuentos.',
  `total_ticket` decimal(10,0) NOT NULL COMMENT 'Valor total facturado en el ticket.',
  `id_pedido` int(4) NOT NULL COMMENT '	PK_FK Relaciona el pedido realizado con el ticket',
  `id_estado` enum('E-pt','E-pd','E-f','E-e') NOT NULL,
  `id_met_pago` enum('Mtd-EF','Mtd-NQ','Mtd-DP','Mtd-TJ','Mtd-PD') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_compra`
--

INSERT INTO `ticket_compra` (`id_ticket_c`, `num_ticket`, `fecha_emision`, `sub_total`, `total_ticket`, `id_pedido`, `id_estado`, `id_met_pago`) VALUES
(83, 730842, '2026-08-11 19:00:51', 44000, 44000, 100, 'E-pt', 'Mtd-PD'),
(84, 247961, '2026-08-11 19:00:52', 18000, 18000, 101, 'E-pt', 'Mtd-PD'),
(85, 585622, '2026-08-11 19:00:52', 0, 0, 103, 'E-pt', 'Mtd-PD'),
(87, 729894, '2026-08-11 19:00:52', 18000, 18000, 104, 'E-pt', 'Mtd-PD'),
(91, 238337, '2026-08-11 19:00:53', 54000, 54000, 109, 'E-pt', 'Mtd-PD'),
(93, 962664, '2026-08-11 19:00:54', 10000, 10000, 111, 'E-pt', 'Mtd-PD'),
(94, 137150, '2026-08-11 19:00:54', 10000, 10000, 112, 'E-pt', 'Mtd-PD'),
(95, 906686, '2026-08-11 19:00:54', 36000, 36000, 113, 'E-pt', 'Mtd-PD'),
(103, 255050, '2026-08-11 19:01:11', 9000, 9000, 121, 'E-pt', 'Mtd-PD');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `t_doc` enum('CC','CE','TI') NOT NULL COMMENT 'PK Codigo único del tipo de documento (ejemplo: CC, TI, NIT).',
  `desc_doc` enum('Cédula de ciudadanía','Cédula de extranjería','Tarjeta de identidad') NOT NULL COMMENT 'Nombre o descripción completa del documento (ejemplo: Cédula de ciudadanía, Tarjeta de identidad, etc.).'
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
  `id_m` enum('M-E','M-S') NOT NULL COMMENT 'PK identificador unico del tipo de movimiento',
  `nom_movimiento` enum('Entrada','Salida') NOT NULL COMMENT 'nombre del tipo de movimieto (entrada o salida)'
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
  `id_tipo` enum('P-P','P-E') NOT NULL COMMENT '	PK Identificador único del tipo de pedido.',
  `tipo_pedido` enum('Personalizado','Estandar') NOT NULL COMMENT 'Nombre del tipo (ejemplo: estandar, personalizado).'
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
  `id_usuario` varchar(15) NOT NULL COMMENT 'PK Identificador único de cada usuario (Numero de identificacion).',
  `nom_1` varchar(50) NOT NULL COMMENT '	Primer nombre del usuario.',
  `nom_2` varchar(50) DEFAULT NULL COMMENT 'Segundo nombre del usuario (opcional).',
  `ape_1` varchar(50) NOT NULL COMMENT 'Primer apellido del usuario.',
  `ape_2` varchar(50) DEFAULT NULL COMMENT 'Segundo apellido del usuario (opcional).',
  `correo` varchar(40) NOT NULL COMMENT 'Dirección de correo electrónico del usuario.',
  `telefono` bigint(20) NOT NULL COMMENT 'Número de teléfono o celular del usuario.',
  `contrasena` varchar(255) NOT NULL COMMENT 'contraseña alfanumerica con la que el usuario podra ingresar al sistema',
  `codigo` varchar(255) DEFAULT NULL COMMENT '	Se le pide a los roles de administrador y trabajador cuando trata de iniciar sesión',
  `id_rol_usuario` varchar(20) NOT NULL COMMENT 'PK_FK Relación con el rol del usuario (ejemplo: cliente/admin).',
  `t_doc` enum('CC','CE','TI') NOT NULL COMMENT '	PK_FK Relación con el tipo de documento que posee el usuario (CC, CE, TI).',
  `img_perfil` varchar(255) DEFAULT NULL COMMENT 'Guarda la foto de perfil del usuario',
  `codigo_visible` varchar(20) DEFAULT NULL COMMENT 'Código en texto plano solo para visualización administrativa',
  `reset_codigo` varchar(255) DEFAULT NULL,
  `reset_expira` datetime DEFAULT NULL,
  `estado` int(11) NOT NULL DEFAULT 1,
  `fcm_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nom_1`, `nom_2`, `ape_1`, `ape_2`, `correo`, `telefono`, `contrasena`, `codigo`, `id_rol_usuario`, `t_doc`, `img_perfil`, `codigo_visible`, `reset_codigo`, `reset_expira`, `estado`, `fcm_token`) VALUES
('3140044786', 'Luz', NULL, 'Armstrong', NULL, 'Louvenia_McCullough@yahoo.com', 2958303129, '$2b$10$krtFyOCC2QdGs6.xTyYs1urpYESHxOKglF/nTFdaG4l3Aq9Dv7jKu', '$2b$10$nP5/9xwh2Tut4srrId0rd.hOhjdGc.33uvKJ/2m7X55sxbMvrJxLK', '1', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('3676568822', 'Maudie', NULL, 'Little', NULL, 'Reese.Cassin@hotmail.com', 4736187823, '$2b$10$2AmVOYwmzgdfUP.2SC0NeOqAkDYl9M7DcN4v3j1jDzME/UWvBgTjO', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('4502260042', 'Eldon', NULL, 'Mante-Konopelski', NULL, 'Clifton_Pouros61@yahoo.com', 3340716508, '$2b$10$RcdcqZhOng6zzwtwjV2LaeBVtMJQh3eM7eVXw0qDis5iHeKCD9w0q', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('5358207551', 'Cade', NULL, 'Davis', NULL, 'London_Pacocha75@hotmail.com', 830281777, '$2b$10$pLsbhkYnUXfYR63ISv/bx..rBUAtbfnblThq17E5TlEiygg9Rg44u', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('6638056846', 'Baylee', NULL, 'Pouros', NULL, 'Emilie_Robel30@yahoo.com', 8191015986, '$2b$10$/7igR2DRr7EQF2wNsaZQTenyZrsAtM79gQ/6pb4ET3WSQ1rXwKiv6', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('7263753337', 'Samantha', NULL, 'Thiel', NULL, 'Ezekiel.Batz@hotmail.com', 2380924017, '$2b$10$ZWfEVLeKMuuqHgeVE.3YX.A7JbxVO1DKjIOGlOOAdgRvKbnlobyAK', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('8200125713', 'Johnson', NULL, 'Farrell', NULL, 'Dion.Barton74@yahoo.com', 2485558216, '$2b$10$iKkcBhYJS7Yk8WKPzXfx4e.BBdyg1DeZDe5D.2RkDegY3PA/0vpYC', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL);

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
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_ped_personal` (`id_ped_personal`),
  ADD KEY `id_material` (`id_material`);

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
  ADD KEY `idx_color_material` (`id_material`);

--
-- Indices de la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  ADD PRIMARY KEY (`id_diseno`),
  ADD KEY `idx_diseno_material` (`id_material`);

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
  ADD KEY `id_m` (`id_m`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_material` (`id_material`);

--
-- Indices de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `notificacion_id_usuario_leida_idx` (`id_usuario`,`leida`),
  ADD KEY `notificacion_id_usuario_idx` (`id_usuario`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  ADD PRIMARY KEY (`id_ped_personal`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_clasificacion` (`id_clasificacion`);

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
  ADD UNIQUE KEY `ticket_compra_id_pedido_key` (`id_pedido`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `ticket_compra_ibfk_3` (`id_met_pago`);

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
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `id_rol_usuario` (`id_rol_usuario`),
  ADD KEY `t_doc` (`t_doc`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(4) NOT NULL AUTO_INCREMENT COMMENT '	PK Identificador único de la categoría.', AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `clasificacion`
--
ALTER TABLE `clasificacion`
  MODIFY `id_clasificacion` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único de la Clasificación.', AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  MODIFY `id_detalles` int(4) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del detalle del pedido.', AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK identificador unico del material', AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `material_color`
--
ALTER TABLE `material_color`
  MODIFY `id_color` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  MODIFY `id_diseno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del movimiento.', AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(4) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador unico del pedido', AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT de la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  MODIFY `id_ped_personal` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador unico del pedido perzonalizado', AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del producto.', AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  MODIFY `id_ticket_c` int(6) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del ticket', AUTO_INCREMENT=105;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE,
  ADD CONSTRAINT `detalles_pedido_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  ADD CONSTRAINT `detalle_pedido_personalizado_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE,
  ADD CONSTRAINT `detalle_pedido_personalizado_id_ped_personal_fkey` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `material_color`
--
ALTER TABLE `material_color`
  ADD CONSTRAINT `material_color_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  ADD CONSTRAINT `material_diseno_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD CONSTRAINT `movimiento_id_m_fkey` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento` (`id_m`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimiento_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimiento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `notificacion_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_id_tipo_fkey` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_pedido` (`id_tipo`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pedido_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  ADD CONSTRAINT `pedido_personalizado_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_id_clasificacion_fkey` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion` (`id_clasificacion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  ADD CONSTRAINT `ticket_compra_id_estado_fkey` FOREIGN KEY (`id_estado`) REFERENCES `estado_pago` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_compra_id_met_pago_fkey` FOREIGN KEY (`id_met_pago`) REFERENCES `metodo_pago` (`id_met_pago`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_compra_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_id_rol_usuario_fkey` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `usuario_t_doc_fkey` FOREIGN KEY (`t_doc`) REFERENCES `tipo_documento` (`t_doc`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
