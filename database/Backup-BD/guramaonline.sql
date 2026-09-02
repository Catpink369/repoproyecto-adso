-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-09-2026 a las 13:03:52
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

--
-- Volcado de datos para la tabla `detalles_pedido`
--

INSERT INTO `detalles_pedido` (`id_detalles`, `descrip_detalles`, `cantidad`, `id_pedido`, `id_producto`) VALUES
(1, 'cubrelecho de Spider-man - $95000', 2, 1, 2),
(2, 'cubrelecho de minnie mouse - $95000', 1, 1, 4),
(3, 'Virgencitas de crochet - $45000', 1, 1, 1),
(4, 'cubrelecho de Spider-man - $95000', 1, 7, 2),
(5, 'cubrelecho de minnie mouse - $95000', 1, 7, 4),
(6, 'Virgencitas de crochet - $45000', 1, 10, 1),
(7, 'cubrelecho de Spider-man - $95000', 1, 13, 2),
(8, 'Virgencitas de crochet - $45000', 1, 14, 1),
(9, 'cubrelecho de Spider-man - $95000', 1, 15, 2),
(10, 'Virgencitas de crochet - $45000', 1, 31, 1),
(11, 'Virgencitas de crochet - $45000', 1, 32, 1),
(12, 'Virgencitas de crochet - $45000', 1, 33, 1),
(13, 'Virgencitas de crochet - $45000', 1, 34, 1),
(14, 'Virgencitas de crochet - $45000', 1, 35, 1),
(15, 'Virgencitas de crochet - $45000', 1, 36, 1),
(16, 'Virgencitas de crochet - $45000', 1, 37, 1),
(17, 'Virgencitas de crochet - $45000', 1, 38, 1),
(18, 'Virgencitas de crochet - $45000', 1, 39, 1),
(19, 'Virgencitas de crochet - $45000', 1, 40, 1),
(20, 'Virgencitas de crochet - $45000', 1, 41, 1),
(21, 'Virgencitas de crochet - $45000', 1, 42, 1),
(22, 'Virgencitas de crochet - $45000', 1, 43, 1),
(23, 'Virgencitas de crochet - $45000', 1, 44, 1),
(24, 'Virgencitas de crochet - $45000', 1, 45, 1),
(25, 'Virgencitas de crochet - $45000', 2, 46, 1),
(26, 'cubrelecho de Spider-man - $95000', 2, 46, 2),
(27, 'cubrelecho de minnie mouse - $95000', 2, 46, 4),
(28, 'cubrelecho de Spider-man - $95000', 1, 48, 2),
(29, 'Virgencitas de crochet - $45000', 1, 50, 1),
(30, 'Virgencitas de crochet - $45000', 1, 51, 1),
(31, 'Virgencitas de crochet - $45000', 1, 52, 1),
(32, 'Virgencitas de crochet - $45000', 1, 54, 1),
(33, 'Producto Editado 1665 - $35000', 1, 55, 1),
(34, 'Producto Editado 1665 - $35000', 1, 57, 1),
(35, 'Producto Editado 1665 - $35000', 1, 58, 1),
(36, 'Producto Editado 1665 - $35000', 1, 60, 1),
(37, 'cubrelecho de minnie mouse - $95000', 1, 61, 4),
(38, 'cubrelecho de Spider-man - $95000', 1, 69, 2),
(39, 'Virgencitas - $35000', 1, 72, 1),
(40, 'Producto Editado 8089 - $35000', 1, 73, 1),
(41, 'Producto Editado 8089 - $35000', 1, 74, 1),
(42, 'Producto Editado 8089 - $35000', 1, 75, 1),
(43, 'Producto Editado 8089 - $35000', 1, 76, 1),
(44, 'Producto Editado 8089 - $35000', 1, 77, 1),
(45, 'Producto Editado 5935 - $35000', 1, 78, 1),
(46, 'Producto Editado 5935 - $35000', 1, 79, 1),
(47, 'Producto Editado 5935 - $35000', 1, 80, 1),
(48, 'Producto Editado 5935 - $35000', 1, 81, 1),
(49, 'Producto Editado 5935 - $35000', 1, 82, 1),
(50, 'Producto Editado 5935 - $35000', 1, 83, 1),
(51, 'Producto Editado 5935 - $35000', 1, 84, 1),
(52, 'Producto Editado 5935 - $35000', 1, 85, 1),
(53, 'Producto Editado 1175 - $35000', 1, 86, 1),
(54, 'Producto Editado 1175 - $35000', 1, 87, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido_personalizado`
--

CREATE TABLE `detalle_pedido_personalizado` (
  `id_detalle` int(11) NOT NULL,
  `id_ped_personal` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `id_color` int(11) DEFAULT NULL,
  `id_diseno` int(11) DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `concepto` varchar(40) DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `detalle_pedido_personalizado`
--

INSERT INTO `detalle_pedido_personalizado` (`id_detalle`, `id_ped_personal`, `id_material`, `id_color`, `id_diseno`, `cantidad`, `subtotal`, `concepto`) VALUES
(1, 1, 1, NULL, NULL, 6.00, 30000.00, NULL),
(2, 2, 1, NULL, NULL, 8.00, 40000.00, NULL),
(3, 3, 1, NULL, NULL, 10.00, 50000.00, NULL),
(4, 4, 1, NULL, NULL, 8.00, 40000.00, NULL),
(5, 5, 1, NULL, NULL, 10.00, 50000.00, NULL),
(6, 6, 2, 5, 5, 3.00, 18000.00, 'Tela base'),
(7, 6, 2, 5, 5, 2.00, 12000.00, 'Sobresábana'),
(8, 6, 2, 5, 5, 2.00, 12000.00, 'Funda x2'),
(9, 7, 1, 2, 3, 2.00, 10000.00, 'Lado 1'),
(10, 7, 2, 4, 4, 2.00, 12000.00, 'Lado 2'),
(11, 8, 1, 1, 3, 3.00, 15000.00, 'Tela base'),
(12, 8, 1, 1, 3, 1.00, 5000.00, 'Funda x1'),
(13, 9, 2, 6, 4, 2.50, 15000.00, 'Lado 1'),
(14, 9, 2, 5, 5, 2.50, 15000.00, 'Lado 2'),
(15, 10, 2, NULL, NULL, 4.00, 24000.00, NULL),
(16, 11, 1, NULL, NULL, 2.00, 10000.00, NULL),
(17, 11, 2, NULL, NULL, 2.00, 12000.00, NULL),
(18, 12, 1, NULL, NULL, 8.00, 40000.00, NULL),
(19, 13, 1, NULL, NULL, 10.00, 50000.00, NULL),
(20, 14, 1, NULL, NULL, 8.00, 40000.00, NULL),
(21, 15, 1, NULL, NULL, 10.00, 50000.00, NULL),
(22, 16, 2, NULL, NULL, 9.00, 54000.00, NULL),
(23, 17, 1, NULL, NULL, 8.00, 40000.00, NULL),
(24, 18, 1, NULL, NULL, 8.00, 40000.00, NULL),
(25, 19, 1, NULL, NULL, 8.00, 40000.00, NULL),
(26, 20, 1, NULL, NULL, 8.00, 40000.00, NULL),
(27, 21, 1, NULL, NULL, 10.00, 50000.00, NULL),
(28, 22, 1, NULL, NULL, 8.00, 40000.00, NULL),
(29, 23, 1, NULL, NULL, 10.00, 50000.00, NULL),
(30, 24, 1, NULL, NULL, 4.00, 20000.00, NULL),
(31, 25, 2, NULL, NULL, 6.00, 36000.00, NULL),
(32, 26, 2, NULL, NULL, 5.00, 30000.00, NULL),
(33, 27, 1, NULL, NULL, 4.00, 20000.00, NULL),
(34, 28, 1, NULL, NULL, 4.00, 20000.00, NULL),
(35, 29, 1, NULL, NULL, 4.00, 20000.00, NULL),
(36, 30, 1, NULL, NULL, 15.00, 75000.00, NULL),
(37, 31, 1, NULL, NULL, 2.50, 12500.00, NULL),
(38, 31, 2, NULL, NULL, 2.50, 15000.00, NULL),
(39, 32, 2, 6, 5, 3.00, 18000.00, 'Sábana'),
(40, 32, 2, 6, 5, 2.00, 12000.00, 'Sobresábana'),
(41, 32, 2, 6, 5, 2.00, 12000.00, 'Fundas de almohada (2)'),
(42, 33, 2, 6, 5, 2.50, 15000.00, 'Lado 1'),
(43, 33, 1, 3, 3, 2.50, 12500.00, 'Lado 2'),
(44, 34, 1, 1, 3, 8.00, 40000.00, 'Cubrelecho (ambos lados)'),
(45, 35, 2, 4, 5, 3.00, 18000.00, 'Sábana'),
(46, 35, 2, 4, 5, 2.00, 12000.00, 'Sobresábana'),
(47, 35, 2, 4, 5, 1.00, 6000.00, 'Funda de almohada (1)'),
(48, 36, 1, 3, 3, 3.00, 15000.00, 'Sábana'),
(49, 36, 1, 3, 3, 2.00, 10000.00, 'Sobresábana'),
(50, 36, 1, 3, 3, 1.00, 5000.00, 'Funda de almohada (1)'),
(51, 37, 1, 2, 3, 2.00, 10000.00, 'Lado 1'),
(52, 37, 2, 5, 5, 2.00, 12000.00, 'Lado 2'),
(53, 38, 1, 3, 3, 3.00, 15000.00, 'Sábana'),
(54, 38, 1, 3, 3, 2.00, 10000.00, 'Sobresábana'),
(55, 38, 1, 3, 3, 1.00, 5000.00, 'Funda de almohada (1)');

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

--
-- Volcado de datos para la tabla `material`
--

INSERT INTO `material` (`id_material`, `nombre`, `tipo`, `unidad`, `precio_unitario`, `stock_actual`, `stock_minimo`, `ruta_imagen`, `estado`) VALUES
(1, 'Algodón ', 'Tela', 'metro', 5000.00, 4, 5, '/uploads/materiales/material-1-1787683984093.jpg', 1),
(2, 'Microfibra', 'Tela', 'metro', 6000.00, 539, 5, '/uploads/materiales/material-2-1786947906620.jpg', 1),
(3, 'ovejero', 'Bordado', 'metro', 150000.00, 30, 5, NULL, 1);

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

--
-- Volcado de datos para la tabla `material_color`
--

INSERT INTO `material_color` (`id_color`, `id_material`, `nombre`, `codigo_hex`, `estado`) VALUES
(1, 1, 'Rosa fuerte', '#c45a77', 1),
(2, 1, 'azul claro', '#8bcedf', 1),
(3, 1, 'verde limon', '#6cc45a', 1),
(4, 2, 'lila', '#ce8fe6', 1),
(5, 2, 'rojo', '#f40606', 1),
(6, 2, 'beige', '#dcd5a7', 1);

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
(1, 1, 'hojas', NULL, 0),
(2, 1, 'hojas', NULL, 0),
(3, 1, 'Hojas', '/uploads/materiales/diseno-3-1786934483076.jpg', 1),
(4, 2, 'Flores', '/uploads/materiales/diseno-4-1786947967560.jpg', 1),
(5, 2, 'Color plano', '/uploads/materiales/diseno-5-1786947992935.jpg', 1);

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

--
-- Volcado de datos para la tabla `movimiento`
--

INSERT INTO `movimiento` (`id_movimiento`, `Cantidad_m`, `fecha_m`, `observaciones`, `id_m`, `id_producto`, `id_usuario`, `id_material`) VALUES
(1, 10, '2026-08-17 01:12:26', NULL, 'M-E', 2, 'Adm-01', NULL),
(2, 10, '2026-08-17 01:20:07', 'venta manual', 'M-S', 2, 'Adm-01', NULL),
(3, 2, '2026-08-17 01:29:26', 'Venta Online - Pedido #1', 'M-S', 2, '1234567890', NULL),
(4, 1, '2026-08-17 01:29:26', 'Venta Online - Pedido #1', 'M-S', 4, '1234567890', NULL),
(5, 1, '2026-08-17 01:29:26', 'Venta Online - Pedido #1', 'M-S', 1, '1234567890', NULL),
(6, 1, '2026-08-17 19:15:39', 'Venta Online - Pedido #7', 'M-S', 2, '1234567890', NULL),
(7, 1, '2026-08-17 19:15:39', 'Venta Online - Pedido #7', 'M-S', 4, '1234567890', NULL),
(8, 1, '2026-08-17 19:42:11', 'Venta Online - Pedido #10', 'M-S', 1, '1234567890', NULL),
(9, 1, '2026-08-17 20:28:35', 'Venta Online - Pedido #13', 'M-S', 2, '12345678', NULL),
(10, 1, '2026-08-17 21:44:15', 'Venta Online - Pedido #14', 'M-S', 1, '12345678', NULL),
(11, 1, '2026-08-17 21:56:12', 'Venta Online - Pedido #15', 'M-S', 2, '12345678', NULL),
(12, 1, '2026-08-18 16:55:15', 'Venta Online - Pedido #31', 'M-S', 1, '12345678', NULL),
(13, 1, '2026-08-18 16:58:34', 'Venta Online - Pedido #32', 'M-S', 1, '12345678', NULL),
(14, 1, '2026-08-18 16:59:46', 'Venta Online - Pedido #33', 'M-S', 1, '12345678', NULL),
(15, 1, '2026-08-18 17:05:59', 'Venta Online - Pedido #34', 'M-S', 1, '12345678', NULL),
(16, 1, '2026-08-18 17:06:07', 'Venta Online - Pedido #35', 'M-S', 1, '12345678', NULL),
(17, 1, '2026-08-18 17:07:09', 'Venta Online - Pedido #36', 'M-S', 1, '12345678', NULL),
(18, 1, '2026-08-18 17:07:16', 'Venta Online - Pedido #37', 'M-S', 1, '12345678', NULL),
(19, 1, '2026-08-18 17:10:41', 'Venta Online - Pedido #38', 'M-S', 1, '12345678', NULL),
(20, 1, '2026-08-18 17:14:00', 'Venta Online - Pedido #39', 'M-S', 1, '12345678', NULL),
(21, 1, '2026-08-18 17:16:35', 'Venta Online - Pedido #40', 'M-S', 1, '12345678', NULL),
(22, 1, '2026-08-18 17:17:01', 'Venta Online - Pedido #41', 'M-S', 1, '12345678', NULL),
(23, 1, '2026-08-18 17:28:34', 'Venta Online - Pedido #42', 'M-S', 1, '12345678', NULL),
(24, 1, '2026-08-18 17:29:39', 'Venta Online - Pedido #43', 'M-S', 1, '12345678', NULL),
(25, 1, '2026-08-18 17:37:36', 'Venta Online - Pedido #44', 'M-S', 1, '12345678', NULL),
(26, 1, '2026-08-18 17:39:13', 'Venta Online - Pedido #45', 'M-S', 1, '12345678', NULL),
(27, 2, '2026-08-20 03:18:08', 'Venta Online - Pedido #46', 'M-S', 1, '1140916974', NULL),
(28, 2, '2026-08-20 03:18:08', 'Venta Online - Pedido #46', 'M-S', 2, '1140916974', NULL),
(29, 2, '2026-08-20 03:18:08', 'Venta Online - Pedido #46', 'M-S', 4, '1140916974', NULL),
(30, 5, '2026-08-20 03:32:14', 'es una rata', 'M-E', 4, 'Adm-01', NULL),
(31, 3, '2026-08-20 03:41:56', 'pato', 'M-S', 1, 'Adm-01', NULL),
(32, 1, '2026-08-20 15:41:07', 'Venta Online - Pedido #48', 'M-S', 2, '12345678', NULL),
(33, 1, '2026-08-24 00:35:20', 'Venta Online - Pedido #50', 'M-S', 1, '12345678', NULL),
(34, 1, '2026-08-24 00:35:31', 'Venta Online - Pedido #51', 'M-S', 1, '12345678', NULL),
(35, 1, '2026-08-24 02:20:56', 'Venta Online - Pedido #52', 'M-S', 1, '12345678', NULL),
(36, 1, '2026-08-24 02:21:03', 'Venta Online - Pedido #54', 'M-S', 1, '12345678', NULL),
(37, 1, '2026-08-24 03:52:46', 'Venta Online - Pedido #55', 'M-S', 1, '1234567898', NULL),
(38, 1, '2026-08-24 03:52:56', 'Venta Online - Pedido #57', 'M-S', 1, '1234567898', NULL),
(39, 1, '2026-08-24 04:02:32', 'Venta Online - Pedido #58', 'M-S', 1, '1234567898', NULL),
(40, 1, '2026-08-24 04:02:44', 'Venta Online - Pedido #60', 'M-S', 1, '1234567898', NULL),
(41, 1, '2026-08-25 18:11:30', 'Venta Online - Pedido #61', 'M-S', 4, '12345678', NULL),
(42, 1, '2026-08-25 18:49:47', 'Venta Online - Pedido #69', 'M-S', 2, '12345678', NULL),
(43, 5, '2026-08-26 15:59:39', 'se agregan 5 unidades', 'M-E', 6, 'Adm-01', NULL),
(44, 1, '2026-08-26 16:00:21', 'venta en tienda fisica', 'M-S', 5, 'Adm-01', NULL),
(45, 23, '2026-08-26 22:00:39', NULL, 'M-E', 2, 'Adm-01', NULL),
(46, 1, '2026-08-30 07:44:32', 'Venta Online - Pedido #72', 'M-S', 1, '1234567898', NULL),
(47, 1, '2026-08-30 08:06:49', 'Venta Online - Pedido #73', 'M-S', 1, '1234567898', NULL),
(48, 1, '2026-08-30 08:06:59', 'Venta Online - Pedido #74', 'M-S', 1, '1234567898', NULL),
(49, 1, '2026-08-30 08:25:23', 'Venta Online - Pedido #75', 'M-S', 1, '1234567898', NULL),
(50, 1, '2026-08-30 08:25:34', 'Venta Online - Pedido #76', 'M-S', 1, '1234567898', NULL),
(51, 1, '2026-08-30 08:26:38', 'Venta Online - Pedido #77', 'M-S', 1, '1234567898', NULL),
(52, 1, '2026-08-30 08:52:51', 'Venta Online - Pedido #78', 'M-S', 1, '1234567898', NULL),
(53, 1, '2026-08-30 08:53:02', 'Venta Online - Pedido #79', 'M-S', 1, '1234567898', NULL),
(54, 1, '2026-08-30 08:54:15', 'Venta Online - Pedido #80', 'M-S', 1, '1234567898', NULL),
(55, 1, '2026-08-30 09:07:19', 'Venta Online - Pedido #81', 'M-S', 1, '1234567898', NULL),
(56, 1, '2026-08-30 09:07:29', 'Venta Online - Pedido #82', 'M-S', 1, '1234567898', NULL),
(57, 1, '2026-08-30 09:16:13', 'Venta Online - Pedido #83', 'M-S', 1, '1234567898', NULL),
(58, 1, '2026-08-30 09:17:39', 'Venta Online - Pedido #84', 'M-S', 1, '1234567898', NULL),
(59, 1, '2026-08-30 09:17:52', 'Venta Online - Pedido #85', 'M-S', 1, '1234567898', NULL),
(60, 1, '2026-08-31 08:24:44', 'Venta Online - Pedido #86', 'M-S', 1, '1234567898', NULL),
(61, 1, '2026-08-31 08:24:58', 'Venta Online - Pedido #87', 'M-S', 1, '1234567898', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_material`
--

CREATE TABLE `movimiento_material` (
  `id_movimiento_material` int(11) NOT NULL,
  `cantidad_m` decimal(10,2) NOT NULL,
  `fecha_m` datetime NOT NULL DEFAULT current_timestamp(),
  `observaciones` varchar(80) DEFAULT NULL,
  `id_m` enum('M-E','M-S') NOT NULL,
  `id_material` int(11) NOT NULL,
  `id_usuario` varchar(15) NOT NULL,
  `id_ped_personal` int(11) DEFAULT NULL COMMENT 'Solo se llena en salidas automáticas generadas por un pedido personalizado'
) ;

--
-- Volcado de datos para la tabla `movimiento_material`
--

INSERT INTO `movimiento_material` (`id_movimiento_material`, `cantidad_m`, `fecha_m`, `observaciones`, `id_m`, `id_material`, `id_usuario`, `id_ped_personal`) VALUES
(1, 30.00, '2026-08-16 20:48:35', '30metros mas de algodon', 'M-E', 1, 'Adm-01', NULL),
(2, 6.00, '2026-08-16 21:12:22', 'Consumido automáticamente por el pedido personalizado #2.', 'M-S', 1, '1234567890', 1),
(3, 8.00, '2026-08-17 00:21:13', 'Consumido automáticamente por el pedido personalizado #3.', 'M-S', 1, '1234567890', 2),
(4, 10.00, '2026-08-17 00:21:22', 'Consumido automáticamente por el pedido personalizado #4.', 'M-S', 1, '1234567890', 3),
(5, 8.00, '2026-08-17 00:26:57', 'Consumido automáticamente por el pedido personalizado #5.', 'M-S', 1, '1234567890', 4),
(6, 10.00, '2026-08-17 00:27:03', 'Consumido automáticamente por el pedido personalizado #6.', 'M-S', 1, '1234567890', 5),
(7, 7.00, '2026-08-17 13:16:14', 'Consumido automáticamente por el pedido personalizado #8.', 'M-S', 2, '1234567890', 6),
(8, 2.00, '2026-08-17 13:16:52', 'Consumido automáticamente por el pedido personalizado #9.', 'M-S', 1, '1234567890', 7),
(9, 2.00, '2026-08-17 13:16:52', 'Consumido automáticamente por el pedido personalizado #9.', 'M-S', 2, '1234567890', 7),
(10, 4.00, '2026-08-17 13:42:42', 'Consumido automáticamente por el pedido personalizado #11.', 'M-S', 1, '1234567890', 8),
(11, 5.00, '2026-08-17 13:43:23', 'Consumido automáticamente por el pedido personalizado #12.', 'M-S', 2, '1234567890', 9),
(12, 4.00, '2026-08-18 09:08:45', 'Consumido automáticamente por el pedido personalizado #16.', 'M-S', 2, '12345678', 10),
(13, 2.00, '2026-08-18 09:09:23', 'Consumido automáticamente por el pedido personalizado #17.', 'M-S', 1, '12345678', 11),
(14, 2.00, '2026-08-18 09:09:23', 'Consumido automáticamente por el pedido personalizado #17.', 'M-S', 2, '12345678', 11),
(15, 8.00, '2026-08-18 09:09:44', 'Consumido automáticamente por el pedido personalizado #18.', 'M-S', 1, '12345678', 12),
(16, 10.00, '2026-08-18 09:09:51', 'Consumido automáticamente por el pedido personalizado #19.', 'M-S', 1, '12345678', 13),
(17, 8.00, '2026-08-18 09:11:40', 'Consumido automáticamente por el pedido personalizado #20.', 'M-S', 1, '12345678', 14),
(18, 10.00, '2026-08-18 09:11:48', 'Consumido automáticamente por el pedido personalizado #21.', 'M-S', 1, '12345678', 15),
(19, 9.00, '2026-08-18 09:16:48', 'Consumido automáticamente por el pedido personalizado #22.', 'M-S', 2, '12345678', 16),
(20, 8.00, '2026-08-18 09:17:05', 'Consumido automáticamente por el pedido personalizado #23.', 'M-S', 1, '12345678', 17),
(21, 8.00, '2026-08-18 09:17:55', 'Consumido automáticamente por el pedido personalizado #24.', 'M-S', 1, '12345678', 18),
(22, 8.00, '2026-08-18 09:20:12', 'Consumido automáticamente por el pedido personalizado #25.', 'M-S', 1, '12345678', 19),
(23, 8.00, '2026-08-18 09:23:18', 'Consumido automáticamente por el pedido personalizado #26.', 'M-S', 1, '12345678', 20),
(24, 10.00, '2026-08-18 09:23:24', 'Consumido automáticamente por el pedido personalizado #27.', 'M-S', 1, '12345678', 21),
(25, 8.00, '2026-08-18 09:25:25', 'Consumido automáticamente por el pedido personalizado #28.', 'M-S', 1, '12345678', 22),
(26, 10.00, '2026-08-18 09:25:31', 'Consumido automáticamente por el pedido personalizado #29.', 'M-S', 1, '12345678', 23),
(27, 4.00, '2026-08-18 09:28:06', 'Consumido automáticamente por el pedido personalizado #30.', 'M-S', 1, '12345678', 24),
(28, 6.00, '2026-08-20 09:40:49', 'Consumido automáticamente por el pedido personalizado #47.', 'M-S', 2, '12345678', 25),
(29, 5.00, '2026-08-21 13:43:19', 'Consumido automáticamente por el pedido personalizado #49.', 'M-S', 2, '12345678', 26),
(30, 4.00, '2026-08-23 20:21:00', 'Consumido automáticamente por el pedido personalizado #53.', 'M-S', 1, '12345678', 27),
(31, 4.00, '2026-08-23 21:52:51', 'Consumido automáticamente por el pedido personalizado #56.', 'M-S', 1, '1234567898', 28),
(32, 4.00, '2026-08-23 22:02:39', 'Consumido automáticamente por el pedido personalizado #59.', 'M-S', 1, '1234567898', 29),
(33, 15.00, '2026-08-25 12:11:56', 'Consumido automáticamente por el pedido personalizado #62.', 'M-S', 1, '12345678', 30),
(34, 2.50, '2026-08-25 12:18:35', 'Consumido automáticamente por el pedido personalizado #63.', 'M-S', 1, '12345678', 31),
(35, 2.50, '2026-08-25 12:18:35', 'Consumido automáticamente por el pedido personalizado #63.', 'M-S', 2, '12345678', 31),
(36, 3.00, '2026-08-25 12:22:17', 'Consumido automáticamente por el pedido personalizado #64.', 'M-S', 2, '12345678', 32),
(37, 2.00, '2026-08-25 12:22:17', 'Consumido automáticamente por el pedido personalizado #64.', 'M-S', 2, '12345678', 32),
(38, 2.00, '2026-08-25 12:22:17', 'Consumido automáticamente por el pedido personalizado #64.', 'M-S', 2, '12345678', 32),
(39, 2.50, '2026-08-25 12:22:46', 'Consumido automáticamente por el pedido personalizado #65.', 'M-S', 2, '12345678', 33),
(40, 2.50, '2026-08-25 12:22:46', 'Consumido automáticamente por el pedido personalizado #65.', 'M-S', 1, '12345678', 33),
(41, 8.00, '2026-08-25 12:27:25', 'Consumido automáticamente por el pedido personalizado #66.', 'M-S', 1, '12345678', 34),
(42, 3.00, '2026-08-25 12:31:29', 'Consumido automáticamente por el pedido personalizado #67.', 'M-S', 2, '12345678', 35),
(43, 2.00, '2026-08-25 12:31:29', 'Consumido automáticamente por el pedido personalizado #67.', 'M-S', 2, '12345678', 35),
(44, 1.00, '2026-08-25 12:31:29', 'Consumido automáticamente por el pedido personalizado #67.', 'M-S', 2, '12345678', 35),
(45, 3.00, '2026-08-25 12:32:12', 'Consumido automáticamente por el pedido personalizado #68.', 'M-S', 1, '12345678', 36),
(46, 2.00, '2026-08-25 12:32:12', 'Consumido automáticamente por el pedido personalizado #68.', 'M-S', 1, '12345678', 36),
(47, 1.00, '2026-08-25 12:32:12', 'Consumido automáticamente por el pedido personalizado #68.', 'M-S', 1, '12345678', 36),
(48, 2.00, '2026-08-25 12:50:02', 'Consumido automáticamente por el pedido personalizado #70.', 'M-S', 1, '12345678', 37),
(49, 2.00, '2026-08-25 12:50:02', 'Consumido automáticamente por el pedido personalizado #70.', 'M-S', 2, '12345678', 37),
(50, 3.00, '2026-08-25 12:50:16', 'Consumido automáticamente por el pedido personalizado #71.', 'M-S', 1, '12345678', 38),
(51, 2.00, '2026-08-25 12:50:16', 'Consumido automáticamente por el pedido personalizado #71.', 'M-S', 1, '12345678', 38),
(52, 1.00, '2026-08-25 12:50:16', 'Consumido automáticamente por el pedido personalizado #71.', 'M-S', 1, '12345678', 38);

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

--
-- Volcado de datos para la tabla `notificacion`
--

INSERT INTO `notificacion` (`id_notificacion`, `id_usuario`, `titulo`, `mensaje`, `tipo`, `leida`, `fecha`) VALUES
(1, '1234567890', 'Actualización de pedido', 'Tu pedido #1 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-08-17 02:56:42'),
(2, '1234567890', 'Actualización de pedido', 'Tu pedido #1 tuvo su pago confirmado.', 'pedido_estado', 1, '2026-08-17 02:57:01'),
(3, '1234567890', 'Actualización de pedido', 'Tu pedido #1 fue entregado.', 'pedido_estado', 1, '2026-08-17 02:57:30'),
(4, '1234567890', 'Actualización de pedido', 'Tu pedido #2 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 1, '2026-08-17 03:13:59'),
(5, '1234567890', 'Actualización de pedido', 'Tu pedido #9 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-08-17 19:18:55'),
(6, '1234567890', 'Actualización de pedido', 'Tu pedido #9 tuvo su pago confirmado.', 'pedido_estado', 1, '2026-08-17 19:19:19'),
(7, '1234567890', 'Actualización de pedido', 'Tu pedido #9 fue finalizado. ¡Gracias por tu compra!', 'pedido_estado', 1, '2026-08-17 19:19:32'),
(8, '1234567890', 'Actualización de pedido', 'Tu pedido #6 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 1, '2026-08-17 19:21:20'),
(9, '1234567890', 'Actualización de pedido', 'Tu pedido #5 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 1, '2026-08-17 19:21:33'),
(10, '1234567890', 'Actualización de pedido', 'Tu pedido #4 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 1, '2026-08-17 19:21:37'),
(11, '1234567890', 'Actualización de pedido', 'Tu pedido #3 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 1, '2026-08-17 19:21:56'),
(12, '1234567890', 'Actualización de pedido', 'Tu pedido #7 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-08-17 19:22:51'),
(13, '1234567890', 'Actualización de pedido', 'Tu pedido #7 tuvo su pago confirmado.', 'pedido_estado', 1, '2026-08-17 19:23:01'),
(14, '1234567890', 'Actualización de pedido', 'Tu pedido #7 fue entregado.', 'pedido_estado', 1, '2026-08-17 19:23:08'),
(15, '1234567890', 'Actualización de pedido', 'Tu pedido #10 está siendo preparado con cariño.', 'pedido_estado', 0, '2026-08-17 19:44:07'),
(16, '1234567890', 'Actualización de pedido', 'Tu pedido #10 tuvo su pago confirmado.', 'pedido_estado', 0, '2026-08-17 20:07:37'),
(17, '1234567890', 'Actualización de pedido', 'Tu pedido #10 fue finalizado. ¡Gracias por tu compra!', 'pedido_estado', 0, '2026-08-17 20:08:50'),
(18, '1234567890', 'Actualización de pedido', 'Tu pedido #8 está siendo preparado con cariño.', 'pedido_estado', 0, '2026-08-17 20:18:24'),
(19, '1234567890', 'Actualización de pedido', 'Tu pedido #8 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 0, '2026-08-17 20:19:36'),
(20, '1234567890', 'Actualización de pedido', 'Tu pedido #12 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 0, '2026-08-17 20:20:02'),
(21, '1234567890', 'Actualización de pedido', 'Tu pedido #11 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 0, '2026-08-17 20:20:11'),
(22, '12345678', 'Actualización de pedido', 'Tu pedido #13 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-08-17 20:42:51'),
(23, '12345678', 'Actualización de pedido', 'Tu pedido #13 tuvo su pago confirmado.', 'pedido_estado', 1, '2026-08-17 20:43:20'),
(24, '12345678', 'Actualización de pedido', 'Tu pedido #13 fue finalizado. ¡Gracias por tu compra!', 'pedido_estado', 1, '2026-08-17 20:43:37'),
(25, '12345678', 'Actualización de pedido', 'Tu pedido #14 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-08-17 21:44:51'),
(26, '12345678', 'Actualización de pedido', 'Tu pedido #14 tuvo su pago confirmado.', 'pedido_estado', 1, '2026-08-17 21:44:58'),
(27, '12345678', 'Actualización de pedido', 'Tu pedido #14 fue finalizado. ¡Gracias por tu compra!', 'pedido_estado', 1, '2026-08-17 21:45:39'),
(28, '12345678', 'Pedido realizado con éxito', 'Tu pedido #15 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-17 21:56:12'),
(29, '12345678', 'Pedido realizado con éxito', 'Tu pedido #31 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 16:55:15'),
(30, '12345678', 'Pedido realizado con éxito', 'Tu pedido #32 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 16:58:34'),
(31, '12345678', 'Pedido realizado con éxito', 'Tu pedido #33 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 16:59:46'),
(32, '12345678', 'Actualización de tu pedido', 'Tu pedido #33 fue anulado.', 'pedido_estado', 1, '2026-08-18 17:00:29'),
(33, '12345678', 'Pedido realizado con éxito', 'Tu pedido #34 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:05:59'),
(34, '12345678', 'Pedido realizado con éxito', 'Tu pedido #35 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:06:07'),
(35, '12345678', 'Pedido realizado con éxito', 'Tu pedido #36 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:07:10'),
(36, '12345678', 'Pedido realizado con éxito', 'Tu pedido #37 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:07:16'),
(37, '12345678', 'Pedido realizado con éxito', 'Tu pedido #38 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:10:41'),
(38, '12345678', 'Pedido realizado con éxito', 'Tu pedido #39 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:14:01'),
(39, '12345678', 'Pedido realizado con éxito', 'Tu pedido #40 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:16:35'),
(40, '12345678', 'Pedido realizado con éxito', 'Tu pedido #41 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:17:01'),
(41, '12345678', 'Actualización de tu pedido', 'Tu pedido #41 fue anulado.', 'pedido_estado', 1, '2026-08-18 17:17:34'),
(42, '12345678', 'Pedido realizado con éxito', 'Tu pedido #42 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:28:34'),
(43, '12345678', 'Pedido realizado con éxito', 'Tu pedido #43 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:29:39'),
(44, '12345678', 'Actualización de tu pedido', 'Tu pedido #43 fue anulado.', 'pedido_estado', 1, '2026-08-18 17:29:58'),
(45, '12345678', 'Pedido realizado con éxito', 'Tu pedido #44 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:37:37'),
(46, '12345678', 'Pedido realizado con éxito', 'Tu pedido #45 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-18 17:39:13'),
(47, '1140916974', 'Pedido realizado con éxito', 'Tu pedido #46 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-20 03:18:08'),
(48, '1140916974', 'Actualización de tu pedido', 'Tu pedido #46 fue anulado.', 'pedido_estado', 1, '2026-08-20 03:32:47'),
(49, '12345678', 'Actualización de tu pedido', 'Tu pedido #45 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 03:32:59'),
(50, '12345678', 'Actualización de tu pedido', 'Tu pedido #44 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:27:29'),
(51, '12345678', 'Actualización de tu pedido', 'Tu pedido #42 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:27:34'),
(52, '12345678', 'Actualización de tu pedido', 'Tu pedido #40 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:27:38'),
(53, '12345678', 'Actualización de tu pedido', 'Tu pedido #38 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:27:54'),
(54, '12345678', 'Actualización de tu pedido', 'Tu pedido #36 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:28:05'),
(55, '12345678', 'Actualización de tu pedido', 'Tu pedido #39 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:33:46'),
(56, '12345678', 'Actualización de tu pedido', 'Tu pedido #39 fue marcado como pagado.', 'pedido_estado', 1, '2026-08-20 15:33:51'),
(57, '12345678', 'Actualización de tu pedido', 'Tu pedido #39 fue entregado.', 'pedido_estado', 1, '2026-08-20 15:33:56'),
(58, '12345678', 'Actualización de tu pedido', 'Tu pedido #36 fue marcado como pagado.', 'pedido_estado', 1, '2026-08-20 15:34:05'),
(59, '12345678', 'Actualización de tu pedido', 'Tu pedido #37 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:34:31'),
(60, '12345678', 'Actualización de tu pedido', 'Tu pedido #35 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:34:36'),
(61, '12345678', 'Actualización de tu pedido', 'Tu pedido #29 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:34:44'),
(62, '12345678', 'Actualización de tu pedido', 'Tu pedido #28 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:34:47'),
(63, '12345678', 'Actualización de tu pedido', 'Tu pedido #34 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:35:43'),
(64, '12345678', 'Actualización de tu pedido', 'Tu pedido #32 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:36:57'),
(65, '12345678', 'Actualización de tu pedido', 'Tu pedido #31 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:37:47'),
(66, '12345678', 'Actualización de tu pedido', 'Tu pedido #30 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:37:51'),
(67, '12345678', 'Actualización de tu pedido', 'Tu pedido #27 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:37:55'),
(68, '12345678', 'Actualización de tu pedido', 'Tu pedido #44 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:38:06'),
(69, '12345678', 'Actualización de tu pedido', 'Tu pedido #42 fue marcado como pagado.', 'pedido_estado', 1, '2026-08-20 15:38:15'),
(70, '12345678', 'Actualización de tu pedido', 'Tu pedido #42 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:38:20'),
(71, '12345678', 'Actualización de tu pedido', 'Tu pedido #16 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:38:48'),
(72, '12345678', 'Actualización de tu pedido', 'Tu pedido #15 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:38:58'),
(73, '12345678', 'Actualización de tu pedido', 'Tu pedido #17 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:10'),
(74, '12345678', 'Actualización de tu pedido', 'Tu pedido #18 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:13'),
(75, '12345678', 'Actualización de tu pedido', 'Tu pedido #19 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:17'),
(76, '12345678', 'Actualización de tu pedido', 'Tu pedido #20 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:21'),
(77, '12345678', 'Actualización de tu pedido', 'Tu pedido #26 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:25'),
(78, '12345678', 'Actualización de tu pedido', 'Tu pedido #25 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:28'),
(79, '12345678', 'Actualización de tu pedido', 'Tu pedido #24 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:31'),
(80, '12345678', 'Actualización de tu pedido', 'Tu pedido #23 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:34'),
(81, '12345678', 'Actualización de tu pedido', 'Tu pedido #22 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:36'),
(82, '12345678', 'Actualización de tu pedido', 'Tu pedido #21 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:39:40'),
(83, '12345678', 'Pedido realizado con éxito', 'Tu pedido #48 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-20 15:41:07'),
(84, '12345678', 'Actualización de tu pedido', 'Tu pedido #47 fue anulado.', 'pedido_estado', 1, '2026-08-20 15:41:48'),
(85, '12345678', 'Actualización de tu pedido', 'Tu pedido #48 ya se está preparando.', 'pedido_estado', 1, '2026-08-20 15:42:13'),
(86, '12345678', 'Actualización de tu pedido', 'Tu pedido #49 fue anulado.', 'pedido_estado', 1, '2026-08-23 20:28:20'),
(87, '12345678', 'Actualización de tu pedido', 'Tu pedido #48 fue anulado.', 'pedido_estado', 1, '2026-08-23 23:53:24'),
(88, '12345678', 'Actualización de tu pedido', 'Tu pedido #45 fue anulado.', 'pedido_estado', 1, '2026-08-24 00:34:50'),
(89, '12345678', 'Pedido realizado con éxito', 'Tu pedido #50 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-24 00:35:20'),
(90, '12345678', 'Pedido realizado con éxito', 'Tu pedido #51 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-24 00:35:31'),
(91, '12345678', 'Actualización de tu pedido', 'Tu pedido #51 fue anulado.', 'pedido_estado', 1, '2026-08-24 02:20:42'),
(92, '12345678', 'Pedido realizado con éxito', 'Tu pedido #52 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-24 02:20:56'),
(93, '12345678', 'Pedido realizado con éxito', 'Tu pedido #54 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-24 02:21:03'),
(94, '12345678', 'Actualización de tu pedido', 'Tu pedido #54 fue anulado.', 'pedido_estado', 1, '2026-08-24 03:52:20'),
(95, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #55 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-24 03:52:46'),
(96, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #57 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-24 03:52:56'),
(97, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #58 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-24 04:02:33'),
(98, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #60 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-24 04:02:44'),
(99, '1234567898', 'Actualización de tu pedido', 'Tu pedido #60 fue anulado.', 'pedido_estado', 0, '2026-08-24 04:06:42'),
(100, '1234567898', 'Actualización de tu pedido', 'Tu pedido #59 fue anulado.', 'pedido_estado', 0, '2026-08-24 21:45:50'),
(101, '1234567898', 'Actualización de tu pedido', 'Tu pedido #58 ya se está preparando.', 'pedido_estado', 0, '2026-08-24 21:46:02'),
(102, '1234567898', 'Actualización de tu pedido', 'Tu pedido #57 ya se está preparando.', 'pedido_estado', 0, '2026-08-24 21:46:06'),
(103, '1234567898', 'Actualización de tu pedido', 'Tu pedido #56 ya se está preparando.', 'pedido_estado', 0, '2026-08-24 21:48:03'),
(104, '1234567898', 'Actualización de tu pedido', 'Tu pedido #55 ya se está preparando.', 'pedido_estado', 0, '2026-08-24 21:55:00'),
(105, '12345678', 'Actualización de tu pedido', 'Tu pedido #53 fue anulado.', 'pedido_estado', 1, '2026-08-24 21:55:05'),
(106, '12345678', 'Actualización de tu pedido', 'Tu pedido #50 fue anulado.', 'pedido_estado', 1, '2026-08-24 21:56:19'),
(107, '12345678', 'Actualización de tu pedido', 'Tu pedido #52 ya se está preparando.', 'pedido_estado', 1, '2026-08-24 22:01:58'),
(108, '1234567898', 'Actualización de tu pedido', 'Tu pedido #58 fue marcado como pagado.', 'pedido_estado', 0, '2026-08-24 22:02:05'),
(109, '1234567898', 'Actualización de tu pedido', 'Tu pedido #56 fue marcado como pagado.', 'pedido_estado', 0, '2026-08-24 22:13:17'),
(110, '12345678', 'Actualización de tu pedido', 'Tu pedido #15 fue marcado como pagado.', 'pedido_estado', 1, '2026-08-24 22:14:49'),
(111, '12345678', 'Actualización de tu pedido', 'Tu pedido #15 fue entregado.', 'pedido_estado', 1, '2026-08-24 22:14:53'),
(112, '12345678', 'Actualización de tu pedido', 'Tu pedido #28 fue marcado como pagado.', 'pedido_estado', 1, '2026-08-25 18:09:16'),
(113, '12345678', 'Actualización de tu pedido', 'Tu pedido #28 fue finalizado.', 'pedido_estado', 1, '2026-08-25 18:09:20'),
(114, '1234567898', 'Actualización de tu pedido', 'Tu pedido #58 fue entregado.', 'pedido_estado', 0, '2026-08-25 18:09:28'),
(115, '1234567898', 'Actualización de tu pedido', 'Tu pedido #57 fue marcado como pagado.', 'pedido_estado', 0, '2026-08-25 18:09:31'),
(116, '1234567898', 'Actualización de tu pedido', 'Tu pedido #57 fue entregado.', 'pedido_estado', 0, '2026-08-25 18:09:35'),
(117, '1234567898', 'Actualización de tu pedido', 'Tu pedido #56 fue anulado.', 'pedido_estado', 0, '2026-08-25 18:09:46'),
(118, '1234567898', 'Actualización de tu pedido', 'Tu pedido #55 fue marcado como pagado.', 'pedido_estado', 0, '2026-08-25 18:09:52'),
(119, '1234567898', 'Actualización de tu pedido', 'Tu pedido #55 fue entregado.', 'pedido_estado', 0, '2026-08-25 18:10:07'),
(120, '12345678', 'Pedido realizado con éxito', 'Tu pedido #61 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 1, '2026-08-25 18:11:30'),
(121, '12345678', 'Pedido realizado con éxito', 'Tu pedido #69 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-25 18:49:48'),
(122, '12345678', 'Actualización de tu pedido', 'Tu pedido #71 fue anulado.', 'pedido_estado', 0, '2026-08-26 16:10:23'),
(123, '12345678', 'Actualización de tu pedido', 'Tu pedido #70 ya se está preparando.', 'pedido_estado', 0, '2026-08-26 16:10:35'),
(124, '12345678', 'Actualización de tu pedido', 'Tu pedido #69 ya se está preparando.', 'pedido_estado', 0, '2026-08-26 22:14:07'),
(125, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #72 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 07:44:32'),
(126, '1234567898', 'Actualización de tu pedido', 'Tu pedido #72 fue anulado.', 'pedido_estado', 0, '2026-08-30 07:44:51'),
(127, '12345678', 'Actualización de tu pedido', 'Tu pedido #68 ya se está preparando.', 'pedido_estado', 0, '2026-08-30 07:55:37'),
(128, '12345678', 'Actualización de tu pedido', 'Tu pedido #70 fue anulado.', 'pedido_estado', 0, '2026-08-30 07:57:24'),
(129, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #73 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:06:49'),
(130, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #74 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:06:59'),
(131, '1234567898', 'Actualización de tu pedido', 'Tu pedido #74 fue anulado.', 'pedido_estado', 0, '2026-08-30 08:08:49'),
(132, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #75 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:25:23'),
(133, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #76 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:25:34'),
(134, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #77 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:26:38'),
(135, '1234567898', 'Actualización de tu pedido', 'Tu pedido #77 fue anulado.', 'pedido_estado', 0, '2026-08-30 08:26:57'),
(136, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #78 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:52:51'),
(137, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #79 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:53:02'),
(138, '1234567898', 'Actualización de tu pedido', 'Tu pedido #79 ya se está preparando.', 'pedido_estado', 0, '2026-08-30 08:53:09'),
(139, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #80 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 08:54:15'),
(140, '1234567898', 'Actualización de tu pedido', 'Tu pedido #80 fue anulado.', 'pedido_estado', 0, '2026-08-30 08:54:33'),
(141, '1234567898', 'Actualización de tu pedido', 'Tu pedido #79 fue anulado.', 'pedido_estado', 0, '2026-08-30 09:07:08'),
(142, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #81 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 09:07:19'),
(143, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #82 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 09:07:29'),
(144, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #83 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 09:16:13'),
(145, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #84 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 09:17:39'),
(146, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #85 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-30 09:17:52'),
(147, '1234567898', 'Actualización de tu pedido', 'Tu pedido #85 fue anulado.', 'pedido_estado', 0, '2026-08-31 08:23:44'),
(148, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #86 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-31 08:24:45'),
(149, '1234567898', 'Pedido realizado con éxito', 'Tu pedido #87 fue realizado exitosamente. Te notificaremos cuando se esté preparando.', 'pedido_estado', 0, '2026-08-31 08:24:58');

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

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `fecha`, `estado`, `id_usuario`, `id_tipo`) VALUES
(1, '2026-08-17 01:29:26', 'Entregado', '1234567890', 'P-E'),
(2, '2026-08-17 03:12:22', 'Anulado', '1234567890', 'P-P'),
(3, '2026-08-17 06:21:13', 'Anulado', '1234567890', 'P-P'),
(4, '2026-08-17 06:21:22', 'Anulado', '1234567890', 'P-P'),
(5, '2026-08-17 06:26:57', 'Anulado', '1234567890', 'P-P'),
(6, '2026-08-17 06:27:03', 'Anulado', '1234567890', 'P-P'),
(7, '2026-08-17 19:15:38', 'Entregado', '1234567890', 'P-E'),
(8, '2026-08-17 19:16:13', 'Anulado', '1234567890', 'P-P'),
(9, '2026-08-17 19:16:52', 'Finalizado', '1234567890', 'P-P'),
(10, '2026-08-17 19:42:11', 'Finalizado', '1234567890', 'P-E'),
(11, '2026-08-17 19:42:42', 'Anulado', '1234567890', 'P-P'),
(12, '2026-08-17 19:43:23', 'Anulado', '1234567890', 'P-P'),
(13, '2026-08-17 20:28:35', 'Finalizado', '12345678', 'P-E'),
(14, '2026-08-17 21:44:15', 'Finalizado', '12345678', 'P-E'),
(15, '2026-08-17 21:56:12', 'Entregado', '12345678', 'P-E'),
(16, '2026-08-18 15:08:45', 'Anulado', '12345678', 'P-P'),
(17, '2026-08-18 15:09:23', 'Anulado', '12345678', 'P-P'),
(18, '2026-08-18 15:09:44', 'Anulado', '12345678', 'P-P'),
(19, '2026-08-18 15:09:51', 'Anulado', '12345678', 'P-P'),
(20, '2026-08-18 15:11:40', 'Anulado', '12345678', 'P-P'),
(21, '2026-08-18 15:11:48', 'Anulado', '12345678', 'P-P'),
(22, '2026-08-18 15:16:48', 'Anulado', '12345678', 'P-P'),
(23, '2026-08-18 15:17:05', 'Anulado', '12345678', 'P-P'),
(24, '2026-08-18 15:17:55', 'Anulado', '12345678', 'P-P'),
(25, '2026-08-18 15:20:12', 'Anulado', '12345678', 'P-P'),
(26, '2026-08-18 15:23:17', 'Anulado', '12345678', 'P-P'),
(27, '2026-08-18 15:23:24', 'Anulado', '12345678', 'P-P'),
(28, '2026-08-18 15:25:25', 'Finalizado', '12345678', 'P-P'),
(29, '2026-08-18 15:25:31', 'En preparación', '12345678', 'P-P'),
(30, '2026-08-18 15:28:06', 'Anulado', '12345678', 'P-P'),
(31, '2026-08-18 16:55:15', 'En preparación', '12345678', 'P-E'),
(32, '2026-08-18 16:58:34', 'En preparación', '12345678', 'P-E'),
(33, '2026-08-18 16:59:46', 'Anulado', '12345678', 'P-E'),
(34, '2026-08-18 17:05:59', 'En preparación', '12345678', 'P-E'),
(35, '2026-08-18 17:06:07', 'En preparación', '12345678', 'P-E'),
(36, '2026-08-18 17:07:09', 'Pagado', '12345678', 'P-E'),
(37, '2026-08-18 17:07:16', 'En preparación', '12345678', 'P-E'),
(38, '2026-08-18 17:10:41', 'En preparación', '12345678', 'P-E'),
(39, '2026-08-18 17:14:00', 'Entregado', '12345678', 'P-E'),
(40, '2026-08-18 17:16:35', 'En preparación', '12345678', 'P-E'),
(41, '2026-08-18 17:17:01', 'Anulado', '12345678', 'P-E'),
(42, '2026-08-18 17:28:34', 'Anulado', '12345678', 'P-E'),
(43, '2026-08-18 17:29:39', 'Anulado', '12345678', 'P-E'),
(44, '2026-08-18 17:37:36', 'Anulado', '12345678', 'P-E'),
(45, '2026-08-18 17:39:12', 'Anulado', '12345678', 'P-E'),
(46, '2026-08-20 03:18:07', 'Anulado', '1140916974', 'P-E'),
(47, '2026-08-20 15:40:49', 'Anulado', '12345678', 'P-P'),
(48, '2026-08-20 15:41:07', 'Anulado', '12345678', 'P-E'),
(49, '2026-08-21 19:43:19', 'Anulado', '12345678', 'P-P'),
(50, '2026-08-24 00:35:20', 'Anulado', '12345678', 'P-E'),
(51, '2026-08-24 00:35:31', 'Anulado', '12345678', 'P-E'),
(52, '2026-08-24 02:20:56', 'En preparación', '12345678', 'P-E'),
(53, '2026-08-24 02:20:59', 'Anulado', '12345678', 'P-P'),
(54, '2026-08-24 02:21:03', 'Anulado', '12345678', 'P-E'),
(55, '2026-08-24 03:52:46', 'Entregado', '1234567898', 'P-E'),
(56, '2026-08-24 03:52:51', 'Anulado', '1234567898', 'P-P'),
(57, '2026-08-24 03:52:56', 'Entregado', '1234567898', 'P-E'),
(58, '2026-08-24 04:02:32', 'Entregado', '1234567898', 'P-E'),
(59, '2026-08-24 04:02:38', 'Anulado', '1234567898', 'P-P'),
(60, '2026-08-24 04:02:44', 'Anulado', '1234567898', 'P-E'),
(61, '2026-08-25 18:11:29', 'Pendiente', '12345678', 'P-E'),
(62, '2026-08-25 18:11:56', 'Pendiente', '12345678', 'P-P'),
(63, '2026-08-25 18:18:35', 'Pendiente', '12345678', 'P-P'),
(64, '2026-08-25 18:22:17', 'Pendiente', '12345678', 'P-P'),
(65, '2026-08-25 18:22:46', 'Pendiente', '12345678', 'P-P'),
(66, '2026-08-25 18:27:25', 'Pendiente', '12345678', 'P-P'),
(67, '2026-08-25 18:31:29', 'Pendiente', '12345678', 'P-P'),
(68, '2026-08-25 18:32:12', 'En preparación', '12345678', 'P-P'),
(69, '2026-08-25 18:49:47', 'En preparación', '12345678', 'P-E'),
(70, '2026-08-25 18:50:02', 'Anulado', '12345678', 'P-P'),
(71, '2026-08-25 18:50:16', 'Anulado', '12345678', 'P-P'),
(72, '2026-08-30 07:44:32', 'Anulado', '1234567898', 'P-E'),
(73, '2026-08-30 08:06:49', 'Pendiente', '1234567898', 'P-E'),
(74, '2026-08-30 08:06:59', 'Anulado', '1234567898', 'P-E'),
(75, '2026-08-30 08:25:23', 'Pendiente', '1234567898', 'P-E'),
(76, '2026-08-30 08:25:34', 'Pendiente', '1234567898', 'P-E'),
(77, '2026-08-30 08:26:38', 'Anulado', '1234567898', 'P-E'),
(78, '2026-08-30 08:52:51', 'Pendiente', '1234567898', 'P-E'),
(79, '2026-08-30 08:53:02', 'Anulado', '1234567898', 'P-E'),
(80, '2026-08-30 08:54:15', 'Anulado', '1234567898', 'P-E'),
(81, '2026-08-30 09:07:19', 'Pendiente', '1234567898', 'P-E'),
(82, '2026-08-30 09:07:29', 'Pendiente', '1234567898', 'P-E'),
(83, '2026-08-30 09:16:13', 'Pendiente', '1234567898', 'P-E'),
(84, '2026-08-30 09:17:39', 'Pendiente', '1234567898', 'P-E'),
(85, '2026-08-30 09:17:52', 'Anulado', '1234567898', 'P-E'),
(86, '2026-08-31 08:24:44', 'Pendiente', '1234567898', 'P-E'),
(87, '2026-08-31 08:24:58', 'Pendiente', '1234567898', 'P-E');

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

--
-- Volcado de datos para la tabla `pedido_personalizado`
--

INSERT INTO `pedido_personalizado` (`id_ped_personal`, `id_pedido`, `tipo_producto`, `tamanio`, `precio_total`) VALUES
(1, 2, 'Sabana', 'Cuna (100x145 cm)', 30000.00),
(2, 3, 'Cubrelecho', 'King', 40000.00),
(3, 4, 'Sabana', 'Individual (180x275 cm)', 50000.00),
(4, 5, 'Cubrelecho', 'King', 40000.00),
(5, 6, 'Sabana', 'Individual (180x275 cm)', 50000.00),
(6, 8, 'Sabana', 'Cuna (100x145 cm)', 42000.00),
(7, 9, 'Cubrelecho', 'Sencilla', 22000.00),
(8, 11, 'Sabana', 'Cuna (100x145 cm)', 20000.00),
(9, 12, 'Cubrelecho', 'Semidoble', 30000.00),
(10, 16, 'Sabana', 'Cuna', 24000.00),
(11, 17, 'Cubrelecho', 'Sencilla', 22000.00),
(12, 18, 'Cubrelecho', 'King', 40000.00),
(13, 19, 'Sabana', 'Individual', 50000.00),
(14, 20, 'Cubrelecho', 'King', 40000.00),
(15, 21, 'Sabana', 'Individual', 50000.00),
(16, 22, 'Sabana', 'Individual', 54000.00),
(17, 23, 'Cubrelecho', 'King', 40000.00),
(18, 24, 'Cubrelecho', 'King', 40000.00),
(19, 25, 'Cubrelecho', 'King', 40000.00),
(20, 26, 'Cubrelecho', 'King', 40000.00),
(21, 27, 'Sabana', 'Individual', 50000.00),
(22, 28, 'Cubrelecho', 'King', 40000.00),
(23, 29, 'Sabana', 'Individual', 50000.00),
(24, 30, 'Cubrelecho', 'Sencilla', 20000.00),
(25, 47, 'Sabana', 'Cuna', 36000.00),
(26, 49, 'Sabana', 'Cuna', 30000.00),
(27, 53, 'Cubrelecho', 'Sencilla', 20000.00),
(28, 56, 'Cubrelecho', 'Sencilla', 20000.00),
(29, 59, 'Cubrelecho', 'Sencilla', 20000.00),
(30, 62, 'Sabana', 'Rey europeo', 75000.00),
(31, 63, 'Cubrelecho', 'Semidoble', 27500.00),
(32, 64, 'Sabana', 'Cuna', 42000.00),
(33, 65, 'Cubrelecho', 'Semidoble', 27500.00),
(34, 66, 'Cubrelecho', 'King', 40000.00),
(35, 67, 'Sabana', 'Cuna', 36000.00),
(36, 68, 'Sabana', 'Cuna', 30000.00),
(37, 70, 'Cubrelecho', 'Sencilla', 22000.00),
(38, 71, 'Sabana', 'Cuna', 30000.00);

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

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nom_producto`, `precio_unitario`, `stock_actual`, `stock_minimo`, `ultima_actualiz`, `color`, `talla`, `tamaño`, `descripcion`, `id_categoria`, `id_clasificacion`, `ruta_imagen`, `estado`) VALUES
(1, 'Producto Editado 1376', 35000.00, 3, 5, '2026-08-31 08:27:41', 'Azul y Rosado', NULL, '20cm', 'Descripción actualizada por prueba automatizada 1376', 3, 4, '/uploads/productos/1-1787604299471.png', 1),
(2, 'cubrelecho de Spider-man', 95000.00, 44, 5, '2026-08-26 22:00:39', 'Azul', 'Cama sencilla', NULL, 'Cubrelecho temático de spiderman para niños, suave y lavable', 2, 3, '/uploads/productos/2-1787607860410.jpeg', 1),
(4, 'cubrelecho de minnie mouse', 95000.00, 30, 10, '2026-08-25 18:11:29', 'Rosado', 'cama individual', '5cm', 'Cubrelecho con estampado de dibujos animados, suave y cómodo', 2, 2, '/uploads/productos/4-1787607811439.jpeg', 1),
(5, 'Renos de navidad', 35000.00, 49, 10, '2026-08-26 16:00:21', NULL, NULL, '20cm', 'Dos renitos tejidos a mano para decorar tu casa en estas fiestas', 3, 4, '/uploads/productos/5-1787607791319.jpeg', 1),
(6, 'Llaveros de Gatitos', 10000.00, 15, 5, '2026-08-26 15:59:39', 'azul, rosado y blanc', NULL, '5cm', '4 llaveritos tegidos de gatos, perfectos para regalar', 4, 2, '/uploads/productos/6-1787607772060.jpeg', 1),
(7, 'Juego de sabanas', 85000.00, 7, 5, '2026-08-24 21:42:27', 'Azul y blanco', 'cama doble', NULL, 'Lleva 3 sabanas para cama doble, incluyen sobresabana y 2 fundas para almohada', 1, 4, '/uploads/productos/7-1787607747741.jpeg', 1),
(8, 'muñeco budu', 20000.00, 10, 5, '2026-08-24 21:40:48', 'Amarillo', NULL, '15cm', 'Muñeco budu tejido', 3, 1, '/uploads/productos/8-1787607648801.jpeg', 1),
(9, 'ramo ', 10000.00, 10, 5, '2026-08-24 21:41:56', 'rosado, amarillo y f', NULL, '20cm', 'Ramo de flores tegidas. Perfecto para regalar ', 3, 4, '/uploads/productos/9-1787607716362.jpeg', 1),
(10, 'Hollow Knigth', 5000.00, 15, 5, '2026-08-24 21:41:34', 'Blanco y negro', NULL, '10cm', 'Muñeco tejido del caballerito del juego Hollow Knigth', 3, 4, '/uploads/productos/10-1787607694455.jpeg', 1),
(11, 'Cubrelecho español', 80000.00, 50, 15, '2026-08-24 21:41:11', 'Lado 1 beige / Lado ', 'cama doble', NULL, 'Cubrelecho español cama doble', 2, 4, '/uploads/productos/11-1787607671090.jpeg', 1),
(12, 'Pareja de perritos - Snoopy', 4000.00, 10, 5, '2026-08-24 21:39:00', 'Blanco', NULL, '5cm', 'Pareja de perritos snoopy. El regalo perfecto para esa persona especial', 3, 4, '/uploads/productos/12-1787607540829.jpeg', 1),
(13, 'llaveros de minions', 10000.00, 20, 5, '2026-08-24 21:39:20', 'amarillo y azul', NULL, '10cm', '3 llaveros de minions', 4, 4, '/uploads/productos/13-1787607560541.jpeg', 1),
(14, 'Capitan america', 30000.00, 6, 5, '2026-08-24 21:39:51', 'azul', NULL, '10cm', 'Muñeco tejido del capitan america', 3, 4, '/uploads/productos/14-1787607591829.jpeg', 1),
(15, 'Kuromi', 10000.00, 10, 5, '2026-08-30 08:29:20', NULL, NULL, '10cm', 'Muñeco tejido de Kuromi', 3, 4, '/uploads/productos/15-1787607924445.jpg', 0),
(16, 'Producto Prueba 915564', 25000.00, 50, 1, '2026-08-24 20:35:49', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/16-1787542928273.jpg', 0),
(17, 'Producto Editado 8657', 35000.00, 50, 1, '2026-08-24 20:23:12', NULL, NULL, NULL, 'Descripción actualizada por prueba automatizada 8657', 1, 1, '/uploads/productos/17-1787543612059.jpg', 0),
(18, 'Producto Prueba 209532', 25000.00, 50, 1, '2026-08-24 20:23:08', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/18-1787544222385.jpg', 0),
(19, 'prueba', 100.00, 10, 5, '2026-08-24 21:03:46', NULL, NULL, NULL, 'ertyu', 1, 1, '/uploads/productos/19-1787605406699.jpg', 0),
(20, 'cubrelec', 1234.00, 12, 2, '2026-08-24 21:38:37', 'Azul y Rosado', NULL, NULL, 'dftgh', 1, 2, '/uploads/productos/20-1787607387899.jpg', 0),
(21, 'peluche', 10000.00, 20, 2, '2026-08-26 21:59:19', 'azul', NULL, 'Grande', 'descripcion del peluche', 3, 4, '/uploads/productos/21-1787781273157.jpg', 0),
(22, 'Producto Editado 5391', 35000.00, 50, 1, '2026-08-30 07:43:50', NULL, NULL, NULL, 'Descripción actualizada por prueba automatizada 5391', 1, 1, '/uploads/productos/22-1788075742343.jpg', 0),
(23, 'Producto Prueba 677602', 25000.00, 50, 1, '2026-08-30 07:59:34', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/23-1788076685454.jpg', 0),
(24, 'Producto Editado 6191', 35000.00, 50, 1, '2026-08-30 08:10:31', NULL, NULL, NULL, 'Descripción actualizada por prueba automatizada 6191', 1, 1, '/uploads/productos/24-1788077343072.jpg', 0),
(25, 'Producto Prueba 463414', 25000.00, 50, 1, '2026-08-30 08:29:18', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/25-1788078472210.jpg', 0),
(26, 'Producto Editado 9905', 35000.00, 50, 1, '2026-08-30 08:56:14', NULL, NULL, NULL, 'Descripción actualizada por prueba automatizada 9905', 1, 1, '/uploads/productos/26-1788080086991.jpg', 0),
(27, 'Producto Editado 7994', 35000.00, 50, 1, '2026-08-30 09:11:12', NULL, NULL, NULL, 'Descripción actualizada por prueba automatizada 7994', 1, 1, '/uploads/productos/27-1788080949942.jpg', 0),
(28, 'Producto Prueba 795727', 25000.00, 50, 1, '2026-08-30 09:23:29', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/28-1788081809223.jpg', 1),
(29, 'Producto Prueba 753009', 25000.00, 50, 1, '2026-08-31 08:26:05', NULL, NULL, NULL, 'Descripción de prueba', 1, 1, '/uploads/productos/29-1788164765621.jpg', 1);

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

--
-- Volcado de datos para la tabla `ticket_compra`
--

INSERT INTO `ticket_compra` (`id_ticket_c`, `num_ticket`, `fecha_emision`, `sub_total`, `total_ticket`, `id_pedido`, `id_estado`, `id_met_pago`) VALUES
(1, 505189, '2026-08-17 01:29:26', 330000, 330000, 1, 'E-pd', 'Mtd-EF'),
(2, 898424, '2026-08-17 03:12:22', 30000, 30000, 2, 'E-pt', 'Mtd-PD'),
(3, 819727, '2026-08-17 06:21:13', 40000, 40000, 3, 'E-pt', 'Mtd-PD'),
(4, 948539, '2026-08-17 06:21:22', 50000, 50000, 4, 'E-pt', 'Mtd-PD'),
(5, 274400, '2026-08-17 06:26:57', 40000, 40000, 5, 'E-pt', 'Mtd-PD'),
(6, 199938, '2026-08-17 06:27:03', 50000, 50000, 6, 'E-pt', 'Mtd-PD'),
(7, 393837, '2026-08-17 19:15:39', 190000, 190000, 7, 'E-pd', 'Mtd-EF'),
(8, 481158, '2026-08-17 19:16:13', 42000, 42000, 8, 'E-pd', 'Mtd-DP'),
(9, 136727, '2026-08-17 19:16:52', 22000, 22000, 9, 'E-pt', 'Mtd-PD'),
(10, 933492, '2026-08-17 19:42:11', 45000, 45000, 10, 'E-pd', 'Mtd-TJ'),
(11, 983748, '2026-08-17 19:42:42', 20000, 20000, 11, 'E-pt', 'Mtd-PD'),
(12, 802951, '2026-08-17 19:43:23', 30000, 30000, 12, 'E-pt', 'Mtd-PD'),
(13, 741347, '2026-08-17 20:28:35', 95000, 95000, 13, 'E-pt', 'Mtd-PD'),
(14, 409880, '2026-08-17 21:44:15', 45000, 45000, 14, 'E-pd', 'Mtd-DP'),
(15, 481930, '2026-08-17 21:56:12', 95000, 95000, 15, 'E-pd', 'Mtd-NQ'),
(16, 768372, '2026-08-18 15:08:45', 24000, 24000, 16, 'E-pt', 'Mtd-PD'),
(17, 584906, '2026-08-18 15:09:23', 22000, 22000, 17, 'E-pt', 'Mtd-PD'),
(18, 445534, '2026-08-18 15:09:44', 40000, 40000, 18, 'E-pt', 'Mtd-PD'),
(19, 605799, '2026-08-18 15:09:51', 50000, 50000, 19, 'E-pt', 'Mtd-PD'),
(20, 747148, '2026-08-18 15:11:40', 40000, 40000, 20, 'E-pt', 'Mtd-PD'),
(21, 621249, '2026-08-18 15:11:48', 50000, 50000, 21, 'E-pt', 'Mtd-PD'),
(22, 613527, '2026-08-18 15:16:48', 54000, 54000, 22, 'E-pt', 'Mtd-PD'),
(23, 147388, '2026-08-18 15:17:05', 40000, 40000, 23, 'E-pt', 'Mtd-PD'),
(24, 491160, '2026-08-18 15:17:55', 40000, 40000, 24, 'E-pt', 'Mtd-PD'),
(25, 826503, '2026-08-18 15:20:12', 40000, 40000, 25, 'E-pt', 'Mtd-PD'),
(26, 715833, '2026-08-18 15:23:17', 40000, 40000, 26, 'E-pt', 'Mtd-PD'),
(27, 325749, '2026-08-18 15:23:24', 50000, 50000, 27, 'E-pt', 'Mtd-PD'),
(28, 565143, '2026-08-18 15:25:25', 40000, 40000, 28, 'E-pd', 'Mtd-TJ'),
(29, 493219, '2026-08-18 15:25:31', 50000, 50000, 29, 'E-pt', 'Mtd-PD'),
(30, 660381, '2026-08-18 15:28:06', 20000, 20000, 30, 'E-pt', 'Mtd-PD'),
(31, 364399, '2026-08-18 16:55:15', 45000, 45000, 31, 'E-pt', 'Mtd-PD'),
(32, 791928, '2026-08-18 16:58:34', 45000, 45000, 32, 'E-pt', 'Mtd-PD'),
(33, 655116, '2026-08-18 16:59:46', 45000, 45000, 33, 'E-pt', 'Mtd-PD'),
(34, 838317, '2026-08-18 17:05:59', 45000, 45000, 34, 'E-pt', 'Mtd-PD'),
(35, 746998, '2026-08-18 17:06:07', 45000, 45000, 35, 'E-pt', 'Mtd-PD'),
(36, 194508, '2026-08-18 17:07:10', 45000, 45000, 36, 'E-pt', 'Mtd-PD'),
(37, 196181, '2026-08-18 17:07:16', 45000, 45000, 37, 'E-pt', 'Mtd-PD'),
(38, 230256, '2026-08-18 17:10:41', 45000, 45000, 38, 'E-pt', 'Mtd-PD'),
(39, 276304, '2026-08-18 17:14:00', 45000, 45000, 39, 'E-pd', 'Mtd-NQ'),
(40, 112644, '2026-08-18 17:16:35', 45000, 45000, 40, 'E-pt', 'Mtd-PD'),
(41, 283080, '2026-08-18 17:17:01', 45000, 45000, 41, 'E-pt', 'Mtd-PD'),
(42, 236912, '2026-08-18 17:28:34', 45000, 45000, 42, 'E-pt', 'Mtd-PD'),
(43, 771261, '2026-08-18 17:29:39', 45000, 45000, 43, 'E-pt', 'Mtd-PD'),
(44, 607101, '2026-08-18 17:37:36', 45000, 45000, 44, 'E-pt', 'Mtd-PD'),
(45, 736432, '2026-08-18 17:39:13', 45000, 45000, 45, 'E-pt', 'Mtd-PD'),
(46, 861656, '2026-08-20 03:18:08', 470000, 470000, 46, 'E-pt', 'Mtd-PD'),
(47, 633823, '2026-08-20 15:40:49', 36000, 36000, 47, 'E-pt', 'Mtd-PD'),
(48, 529994, '2026-08-20 15:41:07', 95000, 95000, 48, 'E-pt', 'Mtd-PD'),
(49, 713129, '2026-08-21 19:43:19', 30000, 30000, 49, 'E-pt', 'Mtd-PD'),
(50, 329182, '2026-08-24 00:35:20', 45000, 45000, 50, 'E-pt', 'Mtd-PD'),
(51, 909875, '2026-08-24 00:35:31', 45000, 45000, 51, 'E-pt', 'Mtd-PD'),
(52, 979006, '2026-08-24 02:20:56', 45000, 45000, 52, 'E-pt', 'Mtd-PD'),
(53, 409122, '2026-08-24 02:20:59', 20000, 20000, 53, 'E-pt', 'Mtd-PD'),
(54, 729263, '2026-08-24 02:21:03', 45000, 45000, 54, 'E-pt', 'Mtd-PD'),
(55, 879895, '2026-08-24 03:52:46', 35000, 35000, 55, 'E-pd', 'Mtd-NQ'),
(56, 333693, '2026-08-24 03:52:51', 20000, 20000, 56, 'E-pt', 'Mtd-PD'),
(57, 246247, '2026-08-24 03:52:56', 35000, 35000, 57, 'E-pd', 'Mtd-EF'),
(58, 884105, '2026-08-24 04:02:32', 35000, 35000, 58, 'E-pd', 'Mtd-EF'),
(59, 434865, '2026-08-24 04:02:38', 20000, 20000, 59, 'E-pt', 'Mtd-PD'),
(60, 965283, '2026-08-24 04:02:44', 35000, 35000, 60, 'E-pt', 'Mtd-PD'),
(61, 352375, '2026-08-25 18:11:30', 95000, 95000, 61, 'E-pt', 'Mtd-PD'),
(62, 717734, '2026-08-25 18:11:56', 75000, 75000, 62, 'E-pt', 'Mtd-PD'),
(63, 729003, '2026-08-25 18:18:35', 27500, 27500, 63, 'E-pt', 'Mtd-PD'),
(64, 975168, '2026-08-25 18:22:17', 42000, 42000, 64, 'E-pt', 'Mtd-PD'),
(65, 747854, '2026-08-25 18:22:46', 27500, 27500, 65, 'E-pt', 'Mtd-PD'),
(66, 226185, '2026-08-25 18:27:25', 40000, 40000, 66, 'E-pt', 'Mtd-PD'),
(67, 794511, '2026-08-25 18:31:29', 36000, 36000, 67, 'E-pt', 'Mtd-PD'),
(68, 186921, '2026-08-25 18:32:12', 30000, 30000, 68, 'E-pt', 'Mtd-PD'),
(69, 957846, '2026-08-25 18:49:48', 95000, 95000, 69, 'E-pd', 'Mtd-NQ'),
(70, 445747, '2026-08-25 18:50:02', 22000, 22000, 70, 'E-pd', 'Mtd-EF'),
(71, 776201, '2026-08-25 18:50:16', 30000, 30000, 71, 'E-pt', 'Mtd-PD'),
(72, 983402, '2026-08-30 07:44:32', 35000, 35000, 72, 'E-pt', 'Mtd-PD'),
(73, 303240, '2026-08-30 08:06:49', 35000, 35000, 73, 'E-pt', 'Mtd-PD'),
(74, 262770, '2026-08-30 08:06:59', 35000, 35000, 74, 'E-pd', 'Mtd-NQ'),
(75, 207678, '2026-08-30 08:25:23', 35000, 35000, 75, 'E-pt', 'Mtd-PD'),
(76, 412501, '2026-08-30 08:25:34', 35000, 35000, 76, 'E-pd', 'Mtd-NQ'),
(77, 164411, '2026-08-30 08:26:38', 35000, 35000, 77, 'E-pt', 'Mtd-PD'),
(78, 555280, '2026-08-30 08:52:51', 35000, 35000, 78, 'E-pt', 'Mtd-PD'),
(79, 320022, '2026-08-30 08:53:02', 35000, 35000, 79, 'E-pd', 'Mtd-NQ'),
(80, 293184, '2026-08-30 08:54:15', 35000, 35000, 80, 'E-pt', 'Mtd-PD'),
(81, 112824, '2026-08-30 09:07:19', 35000, 35000, 81, 'E-pt', 'Mtd-PD'),
(82, 455317, '2026-08-30 09:07:29', 35000, 35000, 82, 'E-pd', 'Mtd-NQ'),
(83, 305947, '2026-08-30 09:16:13', 35000, 35000, 83, 'E-pt', 'Mtd-PD'),
(84, 225394, '2026-08-30 09:17:39', 35000, 35000, 84, 'E-pt', 'Mtd-PD'),
(85, 527653, '2026-08-30 09:17:52', 35000, 35000, 85, 'E-pd', 'Mtd-NQ'),
(86, 967168, '2026-08-31 08:24:44', 35000, 35000, 86, 'E-pt', 'Mtd-PD'),
(87, 219135, '2026-08-31 08:24:58', 35000, 35000, 87, 'E-pd', 'Mtd-NQ');

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
('075897114', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.075897114@example.com', 3001234567, '$2b$10$.kNFmnLOHNqfuouGAlGyT.6NQJ8zTdZhrjg.RWipo9KmZ23cuhwJS', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('076781828', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.076781828@example.com', 3001234567, '$2b$10$riiyfWkrruNwXz.19puk7eXPEZ5HJSMXnfrqdHpjKBhWjpeA7gH7O', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('077438158', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.077438158@example.com', 3001234567, '$2b$10$tQ84kPLaeqHfgtEIlh0Zz.GwIuRx3F/Zm0OBi8Z8bbPwJ1ZUoFohW', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('078610274', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.078610274@example.com', 3001234567, '$2b$10$6b1l36sR/Kb6z7nuG5A2Qu6Xc4miBuWi91wquyrlNHnY1bIyiCbPW', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('080181398', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.080181398@example.com', 3001234567, '$2b$10$ZOqSNukCrD6/BJGUuVUbKuxDqXrc15qhpswiZzQx/bet8bmIY.qTS', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('081084154', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.081084154@example.com', 3001234567, '$2b$10$ZM.LYDrm7EcegY.l08gK5uRNWESgRmRMOSuzp7Tq7mXyPwCBnuJzS', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('081526796', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.081526796@example.com', 3001234567, '$2b$10$fFAVvviTfhv8cP2YbS8.Ke7zPNUe1KqMFICUSSuG1Ptl1Gn3DxJu2', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('1023898051', 'Prueba', NULL, 'Duplicado', NULL, 'nuevo.intento.1787543846702@example.com', 3001234567, '$2b$10$RxanbEzN3Ceza1lByDPzT.RQPATTKJly8XFXnG3LhOoY09lAp7hFi', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('1140916974', 'Mathew', '', 'Mancera', '', 'hedgeodzero@gmail.com', 3194042478, '$2b$10$2RJd4oHGMB4E9sOoCZ92cOUI0AfK5HUFJTmczAGk4SY2RTq5irt3u', '', '2', 'CC', '/uploads/perfiles/1140916974-1787195750296.png', NULL, NULL, NULL, 1, NULL, NULL, 0),
('1234564563', 'max', '', 'steal', '', 'max34@gmail.com', 3234325234, '$2b$10$uA9rWGjg0IyXhOu93If/ie/GIS20fFo5oSKQi5Aa4eJy/grCw9e0S', '$2b$10$oYEyeNTnHz0QJLufo/WXPu1Js8cPurxkrbwJpbYZMWOjKTIqTI49C', '3', 'CE', NULL, '3690', NULL, NULL, 1, NULL, NULL, 0),
('1234565421', 'Valentina', '', 'Segura', '', 'ejemplo@ejemplo.com', 123345678, '$2b$10$SGP.weNyJxTlnqM.N8RqNOaXerf5ZniUnfaqogGKRmqlI4L2A6tf.', '$2b$10$mHu4YratW2pD0E5PTbCNTeE1LBMrhGP8DSNH2xidnk9lQ.iMUa2O2', '3', 'TI', NULL, 'TRB-N5ZS1', NULL, NULL, 0, NULL, NULL, 0),
('1234567', 'cat', '', 'dhfc', '', 'pruebaaaa@gmail.com', 234567, '$2b$10$l7hHdRjCb0289WtRJgusceWYYN4ntyN.I0d18Wgclo5ezqjy551k.', '$2b$10$4XMRC9I0OIaQZEU4d/Ky/u67PEHX/v6Do9qzQ5AOSH4l0erL97KkG', '3', 'CC', NULL, 'TRB-R3OMA', NULL, NULL, 1, NULL, NULL, 0),
('12345678', 'catpink', NULL, 'tres', NULL, 'catpink369@gmail.com', 234567, '$2b$10$bp0XSAzTWcKYBC/ICuoHHe3d/n8Pa0JfKOWd/gD5Tw5VLTE5yme2O', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('1234567890', 'prueba', 'contraseña123456', 'borrar', '', 'prueba@gmail.com', 3214423411, '$2b$10$WNZtjtzYOvCVzszVRZDaYurJ9R5uSVIMFpaIALf8IJyxf8cB2eDlm', NULL, '3', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('1234567898', 'Evelyn', NULL, 'Cardenas', NULL, 'zahorycardenas9@gmail.com', 32123456, '$2b$10$htixRSeolWkp9PF6qNDL6u2dI28ibnO7E3CN9bVDXixTenmN9JYBq', NULL, '2', 'CC', NULL, '125940', NULL, NULL, 1, NULL, NULL, 0),
('164893423', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.164893423@example.com', 3001234567, '$2b$10$usAo5G0A67RQeLqgexh/5ejBxb3GgQaQiD7Yb/RmpG0aAbcXRV88y', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('3544668747', 'Elba', '', 'Zuri', '', 'usuario@gmail.com', 5649654897, '$2b$10$4.9JlGGaXQ8TMHqBRAAom.Vq2nORcMeu7719xWwgn5tD5UfGKltDq', '$2b$10$ykJMjYec6IH6MAcNXO1K4udX.Ttq7zvvcEUR81bmqOpLYk1PJlzuG', '3', 'CC', NULL, '843697', NULL, NULL, 0, NULL, NULL, 0),
('517160678', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.517160678@example.com', 3001234567, '$2b$10$faoUp3XQnQQLL7l6sAq1b.cMZ/ZKwXCjkDaE8Y7E7OsmxPjdOwvOC', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('529287196', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.529287196@example.com', 3001234567, '$2b$10$xaXDP8OEt4OpnPBG6ck6xucTt5U55hzzb1eiIKokGVWvrdIURsZrK', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('531807342', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.531807342@example.com', 3001234567, '$2b$10$l0WeHC990ZriMh8X8mLGkudCB0uML7nPyLuEPkI5c0OznyUOcG6Ba', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('538143401', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.538143401@example.com', 3001234567, '$2b$10$Y9vOeowAS81Wws/GO3Rqaedj0EYNw/3YxJfoATiq0d0Ua1Qat9r1i', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('541888096', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.541888096@example.com', 3001234567, '$2b$10$6EnwNwh30EQzJcTZ3xQNAeWDwxHt6y9ejmfi5bEqM7eYyJxP060T2', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('542139332', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.542139332@example.com', 3001234567, '$2b$10$vGKlK7C.SsBHkYSLTmZu8eolaXohhRExnS.6yblAybUzOROTn3QSS', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('543809607', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.543809607@example.com', 3001234567, '$2b$10$h/na7RCz64Aj1wDD50QCcumLPvd2dIj9PPDxBme4YgalJd2.lGcsy', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('544455570', 'John', NULL, 'Cordoba', NULL, 'john.cordoba.544455570@example.com', 3001234567, '$2b$10$oCwguuim9yKM5E1G3cNU2OrPi21iSMP/ogG9zmlKsukqRZmn4P1/y', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0),
('Adm-01', 'Valentina', NULL, 'Ruiz', 'Castro', 'valruiz@gmail.com', 3119998877, '$2b$10$eGVIGMz7QE1VOrm.3a4qMuUfMZ.lqm0WPMipZARRqvrhXUOS5qKeG', '$2b$10$ZH6itzBvzfIkJA21fSR2Y.MYNgKo152SH10kysBJlK9WfJDRkdO46', '1', 'CC', '/uploads/perfiles/Adm-01-1787602542811.jpg', '12345', NULL, NULL, 1, NULL, NULL, 0);

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
  ADD KEY `fk_det_pers_material` (`id_material`),
  ADD KEY `fk_detpp_color` (`id_color`),
  ADD KEY `fk_detpp_diseno` (`id_diseno`);

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
-- Indices de la tabla `movimiento_material`
--
ALTER TABLE `movimiento_material`
  ADD PRIMARY KEY (`id_movimiento_material`),
  ADD KEY `fk_movmat_tipo` (`id_m`),
  ADD KEY `fk_movmat_material` (`id_material`),
  ADD KEY `fk_movmat_usuario` (`id_usuario`),
  ADD KEY `fk_movmat_pedido` (`id_ped_personal`);

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
  MODIFY `id_diseno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimiento_material`
--
ALTER TABLE `movimiento_material`
  MODIFY `id_movimiento_material` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

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
  ADD CONSTRAINT `fk_det_pers_pedido` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detpp_color` FOREIGN KEY (`id_color`) REFERENCES `material_color` (`id_color`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_detpp_diseno` FOREIGN KEY (`id_diseno`) REFERENCES `material_diseno` (`id_diseno`) ON DELETE SET NULL;

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
-- Filtros para la tabla `movimiento_material`
--
ALTER TABLE `movimiento_material`
  ADD CONSTRAINT `fk_movmat_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movmat_pedido` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movmat_tipo` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento` (`id_m`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movmat_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

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
