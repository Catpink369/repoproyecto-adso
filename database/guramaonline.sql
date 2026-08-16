-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-08-2026 a las 03:18:33
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
(4, 'Llaveros', 'Llaveros tejidos a mano'),
(5, 'Sabanas', NULL),
(6, 'Cubrelechos', NULL),
(7, 'Amigurumis', NULL),
(8, 'Llaveros', NULL);

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

--
-- Volcado de datos para la tabla `detalles_pedido`
--

INSERT INTO `detalles_pedido` (`id_detalles`, `descrip_detalles`, `cantidad`, `id_pedido`, `id_producto`) VALUES
(14, 'Virgencitas  - $30000', 1, 25, 1),
(15, 'Virgencitas  - $30000', 1, 28, 1),
(16, 'Cubrelecho español - $120000', 2, 29, 3),
(17, 'Accesorios para maleta tejido  - $18000', 1, 29, 4),
(18, 'Ramo de tulipanes - $45000', 1, 29, 2),
(19, 'Accesorios para maleta tejido  - $18000', 1, 30, 4),
(20, 'Ramo de tulipanes - $45000', 1, 31, 2),
(21, 'Accesorios para maleta tejido  - $18000', 1, 32, 4),
(22, 'Ramo de tulipanes - $45000', 1, 33, 2),
(23, 'Perritos Snoopy para pareja - $10000', 1, 35, 7),
(24, 'prueba  - $200', 2, 40, 10),
(25, 'prueba  - $200', 2, 41, 10),
(26, 'Perritos Snoopy para pareja - $10000', 1, 41, 7),
(27, 'Sábanas para cama doble - $100000', 1, 41, 6),
(28, 'Virgencitas  - $30000', 5, 41, 1),
(29, 'Ramo de tulipanes - $45000', 1, 43, 2),
(30, 'Virgencitas - $30000', 3, 46, 1),
(31, 'Ramo de tulipanes - $45000', 1, 46, 2),
(32, 'Accesorios para maleta tejido  - $18000', 2, 46, 4),
(33, 'Virgencitas - $30000', 1, 48, 1),
(34, 'Accesorios para maleta tejido  - $18000', 2, 49, 4),
(35, 'Ramo de tulipanes - $45000', 2, 52, 2),
(36, 'Virgencitas - $30000', 2, 54, 1),
(37, 'Ramo de tulipanes - $45000', 1, 57, 2),
(38, 'Ramo de tulipanes - $45000', 1, 58, 2),
(39, 'Ramo de tulipanes - $45000', 4, 59, 2),
(40, 'Ramo de tulipanes - $45000', 1, 60, 2),
(41, 'Ramo de tulipanes - $45000', 9, 61, 2),
(42, 'Ramo de tulipanes - $45000', 1, 62, 2),
(43, 'Cubrelecho español - $120000', 5, 63, 3),
(44, 'Cubrelecho español - $120000', 5, 64, 3),
(45, 'Perritos Snoopy para pareja - $10000', 1, 65, 7),
(46, 'Cubrelecho español - $120000', 1, 66, 3),
(47, 'Hollow Knight - $15000', 5, 67, 5),
(48, 'Ramo de tulipanes - $45000', 3, 68, 2),
(49, 'Perritos Snoopy para pareja - $10000', 1, 70, 7),
(50, 'Hollow Knight - $15000', 2, 72, 5),
(51, 'Virgencitas - $30000', 1, 73, 1),
(52, 'Ramo de tulipanes - $45000', 1, 74, 2),
(53, 'Accesorios para maleta tejido  - $18000', 2, 74, 4),
(54, 'Perrito - $15000', 1, 74, 13),
(55, 'llaveros de minions - $10000', 1, 74, 19),
(56, 'muñeco budu - $15000', 1, 74, 18),
(57, 'sabana blancaa - $20000', 1, 74, 17),
(58, 'Ramo de tulipanes - $45000', 5, 75, 2),
(59, 'Hollow Knight - $15000', 13, 77, 5),
(60, 'Virgencitas - $30000', 1, 78, 1),
(61, 'Hollow Knight - $15000', 1, 78, 5),
(62, 'Sábanas para cama doble - $100000', 1, 78, 6),
(63, 'Perritos Snoopy para pareja - $10000', 1, 78, 7),
(64, 'Virgencitas - $30000', 8, 79, 1),
(65, 'Perritos Snoopy para pareja - $10000', 1, 81, 7),
(66, 'Perrito - $15000', 1, 81, 13),
(67, 'Renos de navidad - $10000', 1, 81, 14),
(68, 'cubrelecho de minnie mouse - $30000', 1, 81, 15),
(69, 'Accesorios para maleta tejido  - $18000', 2, 82, 4),
(70, 'Cubrelecho español - $120000', 1, 84, 3),
(71, 'Cubrelecho español - $120000', 2, 85, 3),
(72, 'Renos de navidad - $10000', 1, 85, 14),
(73, 'Perrito - $15000', 1, 85, 13),
(74, 'muñeco budu - $15000', 1, 85, 18),
(75, 'Perrito - $15000', 1, 86, 13),
(76, 'Hollow Knight - $15000', 1, 89, 5),
(77, 'Cubrelecho español - $120000', 1, 90, 3),
(78, 'Cubrelecho español - $120000', 1, 91, 3),
(79, 'Cubrelecho español - $120000', 1, 92, 3),
(80, 'Cubrelecho español - $120000', 2, 96, 3),
(81, 'Perrito - $15000', 1, 97, 13),
(82, 'muñeco budu - $15000', 1, 97, 18),
(83, 'llaveros de minions - $10000', 2, 97, 19),
(84, 'Cubrelecho español - $120000', 1, 98, 3),
(85, 'Cubrelecho español - $120000', 1, 100, 3),
(86, 'Perrito - $15000', 1, 100, 13),
(87, 'muñeco budu - $15000', 1, 100, 18),
(88, 'Perrito - $15000', 1, 101, 13);

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

--
-- Volcado de datos para la tabla `detalle_pedido_personalizado`
--

INSERT INTO `detalle_pedido_personalizado` (`id_detalle`, `id_ped_personal`, `id_material`, `cantidad`, `subtotal`) VALUES
(1, 19, 5, 6.00, 60000.00),
(2, 20, 1, 6.00, 72000.00),
(3, 21, 8, 4.00, 60000.00),
(4, 22, 1, 2.00, 24000.00),
(5, 22, 6, 2.00, 30000.00),
(6, 23, 1, 4.00, 48000.00),
(7, 23, 6, 4.00, 60000.00),
(8, 24, 4, 6.00, 84000.00),
(9, 25, 6, 12.00, 180000.00),
(10, 26, 1, 2.00, 24000.00),
(11, 26, 6, 2.00, 30000.00),
(12, 27, 4, 10.00, 140000.00),
(13, 28, 1, 2.00, 24000.00),
(14, 28, 1, 2.00, 24000.00),
(15, 29, 1, 4.00, 48000.00),
(16, 29, 5, 4.00, 40000.00),
(17, 30, 1, 4.00, 48000.00),
(18, 31, 1, 6.00, 72000.00),
(19, 32, 1, 5.00, 60000.00),
(20, 33, 1, 3.00, 36000.00),
(21, 34, 1, 4.00, 48000.00),
(22, 35, 1, 5.00, 60000.00);

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
(1, 11, '2026-04-07 01:46:37', NULL, 'M-E', 1, 'Adm-01', NULL),
(2, 30, '2026-04-06 19:52:03', 'Stock inicial', 'M-E', 2, 'Adm-01', NULL),
(3, 20, '2026-04-06 19:52:03', 'Stock inicial', 'M-E', 3, 'Adm-01', NULL),
(4, 5, '2026-04-06 19:52:03', 'Stock inicial', 'M-E', 4, 'Adm-01', NULL),
(5, 5, '2026-04-07 01:53:04', 'se agregan 5 unidades mas\n', 'M-E', 4, 'Adm-01', NULL),
(6, 5, '2026-04-07 04:51:24', 'VENTA MANUAL - Cliente: Juan perez | Tel: 3456789 | Total: $150.000 | Pago: efec', 'M-S', 1, 'Adm-01', NULL),
(7, 10, '2026-04-07 13:42:45', 'se agregan 10 unidades más', 'M-E', 1, 'Adm-01', NULL),
(8, 5, '2026-04-07 15:55:48', 'Agrego 5 unidades.', 'M-E', 4, '10233658985', NULL),
(9, 5, '2026-04-07 20:53:24', NULL, 'M-E', 3, '10233658985', NULL),
(10, 5, '2026-04-07 20:54:38', 'VENTA MANUAL - Cliente: harry potter | Tel: 3522145754 | Total: $600.000 | Pago:', 'M-S', 3, '10233658985', NULL),
(24, 1, '2026-04-08 04:27:37', 'Venta Online - Pedido #25', 'M-S', 1, '234567876543', NULL),
(25, 1, '2026-04-08 20:05:11', 'Venta Online - Pedido #28', 'M-S', 1, '1023898051', NULL),
(26, 2, '2026-04-08 20:29:58', 'Venta Online - Pedido #29', 'M-S', 3, '234567876543', NULL),
(27, 1, '2026-04-08 20:29:58', 'Venta Online - Pedido #29', 'M-S', 4, '234567876543', NULL),
(28, 1, '2026-04-08 20:29:58', 'Venta Online - Pedido #29', 'M-S', 2, '234567876543', NULL),
(29, 1, '2026-04-08 20:34:10', 'Venta Online - Pedido #30', 'M-S', 4, '234567876543', NULL),
(30, 1, '2026-04-08 20:37:39', 'Venta Online - Pedido #31', 'M-S', 2, '234567876543', NULL),
(31, 1, '2026-04-08 20:38:25', 'Venta Online - Pedido #32', 'M-S', 4, '234567876543', NULL),
(32, 1, '2026-04-08 20:40:52', 'Venta Online - Pedido #33', 'M-S', 2, '234567876543', NULL),
(33, 1, '2026-04-08 20:47:34', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 4, 'Adm-01', NULL),
(34, 1, '2026-04-08 20:47:34', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 2, 'Adm-01', NULL),
(35, 2, '2026-04-08 20:47:34', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 3, 'Adm-01', NULL),
(36, 9, '2026-04-09 19:47:15', NULL, 'M-E', 3, 'Adm-01', NULL),
(37, 1, '2026-04-13 10:59:49', 'Venta Online - Pedido #35', 'M-S', 7, '234567876543', NULL),
(38, 2, '2026-04-13 11:01:59', 'se agregan 2 unidades más al stock', 'M-E', 7, 'Adm-01', NULL),
(39, 1, '2026-04-13 11:02:52', 'PEDIDO #35 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 10.000 | Pago', 'M-S', 7, 'Adm-01', NULL),
(40, 4, '2026-05-21 19:35:29', 'agregó 4 más', 'M-E', 1, 'Adm-01', NULL),
(41, 5, '2026-05-21 19:39:35', 'VENTA MANUAL - Cliente: usuario de prueba | Tel: 3105425788 | Total: $150000 | P', 'M-S', 1, 'Adm-01', NULL),
(42, 7, '2026-05-25 20:36:29', 'VENTA MANUAL - Cliente: prueba | Tel: 12255 | Total: $1400 | Pago: EFECTIVO | No', 'M-S', 10, 'Adm-01', NULL),
(43, 2, '2026-05-28 12:47:19', 'Venta Online - Pedido #40', 'M-S', 10, '10229675322', NULL),
(44, 2, '2026-05-28 12:49:11', 'PEDIDO #40 - Cliente: Camila Mancera | Tel: 45665432 | Total: $ 400 | Pago: Tarj', 'M-S', 10, 'Adm-01', NULL),
(45, 2, '2026-06-09 19:38:25', 'PEDIDO #40 - Cliente: Camila Mancera | Tel: 45665432 | Total: $ 400 | Pago: Tarj', 'M-S', 10, 'Adm-01', NULL),
(46, 2, '2026-06-10 19:09:03', 'PEDIDO #40 - Cliente: Camila Mancera | Tel: 45665432 | Total: $ 400 | Pago: Efec', 'M-S', 10, 'Adm-01', NULL),
(47, 2, '2026-06-10 19:18:47', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 3, 'Adm-01', NULL),
(48, 1, '2026-06-10 19:18:47', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 4, 'Adm-01', NULL),
(49, 1, '2026-06-10 19:18:47', 'PEDIDO #29 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 303.000 | Pag', 'M-S', 2, 'Adm-01', NULL),
(50, 1, '2026-06-10 20:01:27', 'PEDIDO #35 - Cliente: matthew Mancera | Tel: 3103945633 | Total: $ 10.000 | Pago', 'M-S', 7, 'Adm-01', NULL),
(51, 12, '2026-06-10 20:03:46', 'se agregan mas u\n', 'M-E', 10, 'Adm-01', NULL),
(52, 2, '2026-06-10 20:06:21', 'Venta Online - Pedido #41', 'M-S', 10, '10229675322', NULL),
(53, 1, '2026-06-10 20:06:21', 'Venta Online - Pedido #41', 'M-S', 7, '10229675322', NULL),
(54, 1, '2026-06-10 20:06:21', 'Venta Online - Pedido #41', 'M-S', 6, '10229675322', NULL),
(55, 5, '2026-06-10 20:06:21', 'Venta Online - Pedido #41', 'M-S', 1, '10229675322', NULL),
(56, 1, '2026-06-15 18:24:42', 'Venta Online - Pedido #43', 'M-S', 2, '10229675322', NULL),
(57, 4, '2026-06-16 01:48:17', 'se agregan 4u', 'M-E', 3, 'Adm-01', NULL),
(58, 5, '2026-06-16 01:50:38', 'VENTA MANUAL - Cliente: fhfgy | Tel: 1111224 | Total: $600000 | Pago: EFECTIVO |', 'M-S', 3, 'Adm-01', NULL),
(59, 1, '2026-06-16 01:51:30', 'PEDIDO #43 - Pago registrado (Efectivo)', 'M-S', 2, 'Adm-01', NULL),
(60, 3, '2026-06-18 20:39:30', 'Venta Online - Pedido #46', 'M-S', 1, '10229675322', NULL),
(61, 1, '2026-06-18 20:39:30', 'Venta Online - Pedido #46', 'M-S', 2, '10229675322', NULL),
(62, 2, '2026-06-18 20:39:30', 'Venta Online - Pedido #46', 'M-S', 4, '10229675322', NULL),
(63, 1, '2026-06-18 21:51:10', 'Venta Online - Pedido #48', 'M-S', 1, '10229675322', NULL),
(64, 2, '2026-06-18 21:57:28', 'Venta Online - Pedido #49', 'M-S', 4, '10229675322', NULL),
(65, 2, '2026-06-21 00:26:22', 'Venta Online - Pedido #52', 'M-S', 2, '10229675322', NULL),
(66, 10, '2026-06-21 00:42:08', '10 u a la prueba de movil', 'M-E', 10, 'Adm-01', NULL),
(67, 2, '2026-06-21 01:14:37', 'Venta Online - Pedido #54', 'M-S', 1, '10229675322', NULL),
(68, 1, '2026-06-21 01:54:58', 'Venta Online - Pedido #57', 'M-S', 2, '10229675322', NULL),
(69, 1, '2026-06-21 02:30:00', 'Venta Online - Pedido #58', 'M-S', 2, '10229675322', NULL),
(70, 4, '2026-06-21 02:42:29', 'Venta Online - Pedido #59', 'M-S', 2, '10229675322', NULL),
(71, 1, '2026-06-21 02:48:38', 'Venta Online - Pedido #60', 'M-S', 2, '10229675322', NULL),
(72, 9, '2026-06-21 02:57:08', 'Venta Online - Pedido #61', 'M-S', 2, '10229675322', NULL),
(73, 1, '2026-06-21 03:06:12', 'Venta Online - Pedido #62', 'M-S', 2, '10229675322', NULL),
(74, 5, '2026-06-21 03:10:03', 'Venta Online - Pedido #63', 'M-S', 3, '10229675322', NULL),
(75, 5, '2026-06-21 03:20:13', 'Venta Online - Pedido #64', 'M-S', 3, '10229675322', NULL),
(76, 1, '2026-06-22 19:47:01', 'Venta Online - Pedido #65', 'M-S', 7, '10229675322', NULL),
(77, 1, '2026-06-23 19:34:37', 'Venta Online - Pedido #66', 'M-S', 3, '10229675322', NULL),
(78, 5, '2026-06-25 20:40:31', 'Venta Online - Pedido #67', 'M-S', 5, '10229675322', NULL),
(79, 1, '2026-06-25 20:42:23', 'PEDIDO #65 - Pago registrado (Transferencia)', 'M-S', 7, 'Adm-01', NULL),
(80, 3, '2026-06-25 22:01:53', 'Venta Online - Pedido #68', 'M-S', 2, '10229675322', NULL),
(81, 1, '2026-06-25 22:06:41', 'Venta Online - Pedido #70', 'M-S', 7, '10229675322', NULL),
(82, 3, '2026-06-25 22:33:58', 'VENTA MANUAL - Cliente: prueba | Tel: 158855 | Total: $54000 | Pago: EFECTIVO | ', 'M-S', 4, 'Adm-01', NULL),
(83, 3, '2026-06-25 22:34:09', 'VENTA MANUAL - Cliente: prueba | Tel: 158855 | Total: $54000 | Pago: EFECTIVO | ', 'M-S', 4, 'Adm-01', NULL),
(84, 1, '2026-06-25 22:34:24', NULL, 'M-E', 3, 'Adm-01', NULL),
(85, 52, '2026-06-30 03:31:16', NULL, 'M-E', 1, 'Adm-01', NULL),
(86, 52, '2026-06-30 03:31:24', NULL, 'M-E', 1, 'Adm-01', NULL),
(87, 12, '2026-06-30 03:44:36', NULL, 'M-E', 1, 'Adm-01', NULL),
(88, 2, '2026-06-30 03:56:54', 'Venta Online - Pedido #72', 'M-S', 5, '10229675322', NULL),
(89, 5, '2026-07-03 12:45:18', NULL, 'M-E', 1, 'Adm-01', NULL),
(90, 5, '2026-07-03 12:46:48', 'VENTA MANUAL - Cliente: prueba | Tel: 1354854 | Total: $150000 | Pago: EFECTIVO ', 'M-S', 1, 'Adm-01', NULL),
(91, 1, '2026-07-03 12:52:15', 'Venta Online - Pedido #73', 'M-S', 1, '10229675322', NULL),
(92, 1, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 2, '10229675322', NULL),
(93, 2, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 4, '10229675322', NULL),
(94, 1, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 13, '10229675322', NULL),
(95, 1, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 19, '10229675322', NULL),
(96, 1, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 18, '10229675322', NULL),
(97, 1, '2026-07-03 20:56:50', 'Venta Online - Pedido #74', 'M-S', 17, '10229675322', NULL),
(98, 5, '2026-07-09 21:28:02', 'Venta Online - Pedido #75', 'M-S', 2, '123', NULL),
(99, 13, '2026-07-09 21:49:07', 'Venta Online - Pedido #77', 'M-S', 5, '1234565421', NULL),
(100, 800, '2026-07-09 21:57:16', 'harta demanda', 'M-E', 5, '12345123423', NULL),
(101, 1, '2026-07-16 02:54:46', 'Venta Online - Pedido #78', 'M-S', 1, '1234565421', NULL),
(102, 1, '2026-07-16 02:54:47', 'Venta Online - Pedido #78', 'M-S', 5, '1234565421', NULL),
(103, 1, '2026-07-16 02:54:47', 'Venta Online - Pedido #78', 'M-S', 6, '1234565421', NULL),
(104, 1, '2026-07-16 02:54:47', 'Venta Online - Pedido #78', 'M-S', 7, '1234565421', NULL),
(105, 8, '2026-07-16 02:57:47', 'Venta Online - Pedido #79', 'M-S', 1, '10229675322', NULL),
(106, 1, '2026-07-16 21:10:53', 'Venta Online - Pedido #81', 'M-S', 7, '1234565421', NULL),
(107, 1, '2026-07-16 21:10:53', 'Venta Online - Pedido #81', 'M-S', 13, '1234565421', NULL),
(108, 1, '2026-07-16 21:10:53', 'Venta Online - Pedido #81', 'M-S', 14, '1234565421', NULL),
(109, 1, '2026-07-16 21:10:53', 'Venta Online - Pedido #81', 'M-S', 15, '1234565421', NULL),
(110, 2, '2026-07-16 21:15:30', 'Venta Online - Pedido #82', 'M-S', 4, '1234565421', NULL),
(111, 1, '2026-07-16 21:18:36', 'Venta Online - Pedido #84', 'M-S', 3, '10229675322', NULL),
(112, 2, '2026-07-16 21:24:35', 'Venta Online - Pedido #85', 'M-S', 3, '10229675322', NULL),
(113, 1, '2026-07-16 21:24:35', 'Venta Online - Pedido #85', 'M-S', 14, '10229675322', NULL),
(114, 1, '2026-07-16 21:24:35', 'Venta Online - Pedido #85', 'M-S', 13, '10229675322', NULL),
(115, 1, '2026-07-16 21:24:35', 'Venta Online - Pedido #85', 'M-S', 18, '10229675322', NULL),
(116, 1, '2026-07-16 21:41:54', 'Venta Online - Pedido #86', 'M-S', 13, '1234565421', NULL),
(117, 1, '2026-07-16 21:45:53', 'Venta Online - Pedido #89', 'M-S', 5, '1234565421', NULL),
(118, 1, '2026-07-16 21:50:38', 'Venta Online - Pedido #90', 'M-S', 3, '1234565421', NULL),
(119, 1, '2026-07-16 21:50:43', 'Venta Online - Pedido #91', 'M-S', 3, '1234565421', NULL),
(120, 1, '2026-07-16 21:50:48', 'Venta Online - Pedido #92', 'M-S', 3, '1234565421', NULL),
(121, 2, '2026-07-17 15:21:32', 'Venta Online - Pedido #96', 'M-S', 3, '1234565421', NULL),
(122, 1, '2026-07-17 15:34:33', 'Venta Online - Pedido #97', 'M-S', 13, '1234565421', NULL),
(123, 1, '2026-07-17 15:34:33', 'Venta Online - Pedido #97', 'M-S', 18, '1234565421', NULL),
(124, 2, '2026-07-17 15:34:33', 'Venta Online - Pedido #97', 'M-S', 19, '1234565421', NULL),
(125, 1, '2026-07-17 16:05:55', 'Venta Online - Pedido #98', 'M-S', 3, '1234565421', NULL),
(126, 1, '2026-07-21 18:44:29', 'Venta Online - Pedido #100', 'M-S', 3, '1234565421', NULL),
(127, 1, '2026-07-21 18:44:29', 'Venta Online - Pedido #100', 'M-S', 13, '1234565421', NULL),
(128, 1, '2026-07-21 18:44:29', 'Venta Online - Pedido #100', 'M-S', 18, '1234565421', NULL),
(129, 1, '2026-07-21 18:45:06', 'Venta Online - Pedido #101', 'M-S', 13, '1234565421', NULL),
(130, 30, '2026-08-13 16:08:57', 'Entrada de 30u', 'M-E', 1, 'Adm-01', NULL);

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
(1, '1234565421', 'Actualización de pedido', 'Tu pedido #101 está siendo preparado con cariño.', 'pedido_estado', 1, '2026-07-21 18:46:32.585'),
(2, '1234565421', 'Actualización de pedido', 'Tu pedido #96 fue anulado. Si tienes dudas, contáctanos.', 'pedido_estado', 0, '2026-08-12 18:51:18.016');

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
(25, '2026-04-08 04:27:37', 'Pendiente', '234567876543', 'P-E'),
(26, '2026-04-08 04:46:42', 'Pagado', '234567876543', 'P-P'),
(27, '2026-04-08 11:38:47', 'Pagado', '234567876543', 'P-P'),
(28, '2026-04-08 20:05:11', 'Pendiente', '1023898051', 'P-E'),
(29, '2026-04-08 20:29:58', 'Pagado', '234567876543', 'P-E'),
(30, '2026-04-08 20:34:10', 'Pendiente', '234567876543', 'P-E'),
(31, '2026-04-08 20:37:39', 'Pendiente', '234567876543', 'P-E'),
(32, '2026-04-08 20:38:24', 'Pendiente', '234567876543', 'P-E'),
(33, '2026-04-08 20:40:51', 'Pagado', '234567876543', 'P-E'),
(34, '2026-04-08 20:49:06', 'Pagado', '234567876543', 'P-P'),
(35, '2026-04-13 10:59:49', 'Pagado', '234567876543', 'P-E'),
(36, '2026-04-13 11:00:20', 'Pagado', '234567876543', 'P-P'),
(37, '2026-04-20 20:12:18', 'Pagado', '234567876543', 'P-P'),
(38, '2026-04-20 20:12:40', 'Pagado', '234567876543', 'P-P'),
(39, '2026-05-28 12:46:50', 'Pagado', '10229675322', 'P-P'),
(40, '2026-05-28 12:47:19', 'Pagado', '10229675322', 'P-E'),
(41, '2026-06-10 20:06:21', 'Pendiente', '10229675322', 'P-E'),
(42, '2026-06-10 20:07:00', 'Pendiente', '10229675322', 'P-P'),
(43, '2026-06-15 18:24:42', 'Pagado', '10229675322', 'P-E'),
(44, '2026-06-16 01:20:29', 'Pendiente', '10229675322', 'P-P'),
(45, '2026-06-18 09:02:34', 'Pendiente', '10229675322', 'P-P'),
(46, '2026-06-18 20:39:30', 'Entregado', '10229675322', 'P-E'),
(47, '2026-06-18 20:48:11', 'Pendiente', '10229675322', 'P-P'),
(48, '2026-06-18 21:51:10', 'Pendiente', '10229675322', 'P-E'),
(49, '2026-06-18 21:57:28', 'Pendiente', '10229675322', 'P-E'),
(50, '2026-06-18 22:00:45', 'Pendiente', '10229675322', 'P-P'),
(52, '2026-06-21 00:26:22', 'Pendiente', '10229675322', 'P-E'),
(53, '2026-06-21 00:30:14', 'Pendiente', '10229675322', 'P-P'),
(54, '2026-06-21 01:14:37', 'Pendiente', '10229675322', 'P-E'),
(55, '2026-06-21 01:42:25', 'Pendiente', '10229675322', 'P-P'),
(56, '2026-06-21 01:43:50', 'Pendiente', '10229675322', 'P-P'),
(57, '2026-06-21 01:54:58', 'Pendiente', '10229675322', 'P-E'),
(58, '2026-06-21 02:29:59', 'Pendiente', '10229675322', 'P-E'),
(59, '2026-06-21 02:42:29', 'Pendiente', '10229675322', 'P-E'),
(60, '2026-06-21 02:48:38', 'Pendiente', '10229675322', 'P-E'),
(61, '2026-06-21 02:57:08', 'Entregado', '10229675322', 'P-E'),
(62, '2026-06-21 03:06:12', 'En preparación', '10229675322', 'P-E'),
(63, '2026-06-21 03:10:03', 'Pagado', '10229675322', 'P-E'),
(64, '2026-06-21 03:20:13', 'Pagado', '10229675322', 'P-E'),
(65, '2026-06-22 19:47:01', 'Pendiente', '10229675322', 'P-E'),
(66, '2026-06-23 19:34:37', 'Pagado', '10229675322', 'P-E'),
(67, '2026-06-25 20:40:31', 'Pagado', '10229675322', 'P-E'),
(68, '2026-06-25 22:01:53', 'Entregado', '10229675322', 'P-E'),
(69, '2026-06-25 22:02:35', 'Pagado', '10229675322', 'P-P'),
(70, '2026-06-25 22:06:41', 'En preparación', '10229675322', 'P-E'),
(71, '2026-06-25 22:07:17', 'Pagado', '10229675322', 'P-P'),
(72, '2026-06-30 03:56:54', 'Pendiente', '10229675322', 'P-E'),
(73, '2026-07-03 12:52:15', 'Pendiente', '10229675322', 'P-E'),
(74, '2026-07-03 20:56:50', 'Pendiente', '10229675322', 'P-E'),
(75, '2026-07-09 21:28:02', 'Pendiente', '123', 'P-E'),
(76, '2026-07-09 21:30:20', 'Pendiente', '123', 'P-P'),
(77, '2026-07-09 21:49:06', 'Pendiente', '1234565421', 'P-E'),
(78, '2026-07-16 02:54:46', 'Pendiente', '1234565421', 'P-E'),
(79, '2026-07-16 02:57:47', 'Finalizado', '10229675322', 'P-E'),
(81, '2026-07-16 21:10:53', 'Pendiente', '1234565421', 'P-E'),
(82, '2026-07-16 21:15:30', 'Pendiente', '1234565421', 'P-E'),
(84, '2026-07-16 21:18:36', 'Pendiente', '10229675322', 'P-E'),
(85, '2026-07-16 21:24:35', 'Pendiente', '10229675322', 'P-E'),
(86, '2026-07-16 21:41:54', 'Pendiente', '1234565421', 'P-E'),
(87, '2026-07-16 21:43:11', 'Pendiente', '1234565421', 'P-P'),
(88, '2026-07-16 21:44:01', 'Pendiente', '1234565421', 'P-P'),
(89, '2026-07-16 21:45:53', 'Pendiente', '1234565421', 'P-E'),
(90, '2026-07-16 21:50:38', 'Pendiente', '1234565421', 'P-E'),
(91, '2026-07-16 21:50:43', 'Pagado', '1234565421', 'P-E'),
(92, '2026-07-16 21:50:48', 'Entregado', '1234565421', 'P-E'),
(93, '2026-07-17 05:23:03', 'Pendiente', '1234565421', 'P-P'),
(94, '2026-07-17 14:26:25', 'Pendiente', '1234565421', 'P-P'),
(95, '2026-07-17 14:27:27', 'Pendiente', '1234565421', 'P-P'),
(96, '2026-07-17 15:21:32', 'Anulado', '1234565421', 'P-E'),
(97, '2026-07-17 15:34:32', 'Entregado', '1234565421', 'P-E'),
(98, '2026-07-17 16:05:55', 'En preparación', '1234565421', 'P-E'),
(99, '2026-07-17 16:07:32', 'Entregado', '1234565421', 'P-P'),
(100, '2026-07-21 18:44:29', 'Anulado', '1234565421', 'P-E'),
(101, '2026-07-21 18:45:06', 'En preparación', '1234565421', 'P-E');

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
(12, 26, 'Sabana', 'Cuna (100x145 cm)', 48000.00),
(13, 27, 'Cubrelecho', 'Sencilla', 52000.00),
(14, 34, 'Cubrelecho', 'Sencilla', 52000.00),
(15, 36, 'Sabana', 'Rey (275x275 cm)', 195000.00),
(16, 37, 'Sabana', 'Cuna (100x145 cm)', 60000.00),
(17, 38, 'Cubrelecho', 'Sencilla', 44000.00),
(18, 39, 'Sabana', 'Cuna (100x145 cm)', 90000.00),
(19, 42, 'Sabana', 'Cuna (100x145 cm)', 60000.00),
(20, 44, 'Sabana', 'Cuna', 72000.00),
(21, 45, 'Sabana', 'Cuna', 60000.00),
(22, 47, 'Cubrelecho', 'Sencilla', 54000.00),
(23, 50, 'Cubrelecho', 'King', 108000.00),
(24, 53, 'Sabana', 'Individual', 84000.00),
(25, 55, 'Sabana', 'Rey', 180000.00),
(26, 56, 'Cubrelecho', 'Semidoble', 54000.00),
(27, 69, 'Sabana', 'Doble (230x275 cm)', 140000.00),
(28, 71, 'Cubrelecho', 'Semidoble', 48000.00),
(29, 76, 'Cubrelecho', 'King', 88000.00),
(30, 87, 'Cubrelecho', 'Sencilla', 48000.00),
(31, 88, 'Sabana', 'Cuna (100x145 cm)', 72000.00),
(32, 93, 'Sabana', 'Cuna (100x145 cm)', 60000.00),
(33, 94, 'Sabana', 'Cuna (100x145 cm)', 36000.00),
(34, 95, 'Cubrelecho', 'Sencilla', 48000.00),
(35, 99, 'Sabana', 'Cuna (100x145 cm)', 60000.00);

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
(1, 'Virgencitas', 30000.00, 30, 1, '2026-08-13 16:08:57', 'Azul y rosa', NULL, NULL, 'Par de virgencita de 20cm', 3, 2, '/uploads/productos/1-1775387234350.png', 1),
(2, 'Ramo de tulipanes', 45000.00, 0, 8, '2026-07-09 15:28:02', NULL, NULL, '35 cm', 'Ramo de tulipanes tejidos', 3, 3, '/uploads/productos/2-1775387482275.png', 1),
(3, 'Cubrelecho español', 120000.00, 14, 5, '2026-07-21 12:44:29', 'Lado1 - amarillo / L', 'Cama Doble', '230 × 275 cm', 'Cubrelecho para cama doble. Incluye 2 almohadas', 2, 2, '/uploads/productos/3-1775513205392.png', 1),
(4, 'Accesorios para maleta tejido ', 18000.00, 0, 2, '2026-07-16 15:15:30', 'varios colores', NULL, '8cm', 'Paquete con 10 adornos creativos y resistentes para personalizar tu equipaje o mochila, dándole un toque único y fácil de identificar. ', 4, 2, '/uploads/productos/4-1775522891852.png', 1),
(5, 'Hollow Knight', 15000.00, 798, 5, '2026-07-16 15:45:53', NULL, NULL, NULL, 'Llavero tejido Hollow Knight. El icónico caballero del videojuego en formato mini. Un accesorio indispensable para fans del gaming.', 4, 4, '/uploads/productos/5-1775965189010.png', 1),
(6, 'Sábanas para cama doble', 100000.00, 17, 5, '2026-07-15 20:54:47', 'azul y blanco', 'Cama Doble', NULL, 'Juego de sábanas suaves y frescas. Incluye 2 fundas y sobresanaba.', 1, 2, '/uploads/productos/6-1775965172407.png', 1),
(7, 'Perritos Snoopy para pareja', 10000.00, 12, 5, '2026-07-16 15:10:53', NULL, NULL, NULL, 'Set de dos figuras de Snoopy, ideales para compartir con esa persona especial como símbolo de amistad o amor.', 3, 3, '/uploads/productos/7-1775965139367.png', 1),
(8, 'Cubrelecho ', 70000.00, 20, 5, '2026-04-13 21:03:24', 'Lado1 - amarillo / L', 'Cama Doble', '230 × 275 cm', 'Cubrelecho para cama doble. Incluye 2 almohadas', 2, 2, NULL, 0),
(9, 'paw patrol aaaaaa', 244444.00, 45, 6, '2026-04-13 21:13:00', 'azul', NULL, NULL, '....', 7, 1, '/uploads/productos/9-1776114773391.png', 0),
(10, 'prueba ', 200.00, 10, 6, '2026-07-03 13:13:01', NULL, NULL, NULL, 'k ufff fcgvh', 4, 4, NULL, 0),
(11, 'pruebaaaaa', 10000.00, 10, 4, '2026-07-03 13:13:07', NULL, NULL, NULL, 'dgdf', 1, 2, NULL, 0),
(12, 'prueba3', 1000.00, 10, 3, '2026-07-03 13:13:13', NULL, NULL, NULL, 'gdjgdjhdsag', 2, 3, NULL, 0),
(13, 'Perrito', 15000.00, 13, 4, '2026-07-21 12:45:06', 'cafe y blanco', NULL, NULL, 'amigurumi de perrito', 3, 4, '/uploads/productos/13-1783092093534.png', 1),
(14, 'Renos de navidad', 10000.00, 27, 9, '2026-07-16 15:24:35', NULL, NULL, NULL, '2 renos tejidos', 3, 4, '/uploads/productos/14-1783092229236.png', 1),
(15, 'cubrelecho de minnie mouse', 30000.00, 12, 4, '2026-07-16 15:10:53', 'rosado', 'cama individual', NULL, 'cubrelecho de minnie mouse', 2, 4, '/uploads/productos/15-1783092303150.png', 1),
(16, 'cubrelecho de Spider-man', 30000.00, 20, 5, '2026-07-03 15:27:51', 'azul', 'cama individual', NULL, 'cubrelecho de Spider-man para cama individual', 2, 4, '/uploads/productos/16-1783092471717.png', 1),
(17, 'sabana blancaa', 20000.00, 49, 9, '2026-07-03 14:56:50', 'blanco', 'cama doble', NULL, 'Sabana blnaca, incluye 2 fundas para almohada y  sobresabana', 1, 4, '/uploads/productos/17-1783092599509.webp', 1),
(18, 'muñeco budu', 15000.00, 25, 3, '2026-07-21 12:44:29', NULL, NULL, NULL, 'muñeco budu tejido', 3, 4, '/uploads/productos/18-1783092661455.png', 1),
(19, 'llaveros de minions', 10000.00, 27, 1, '2026-07-17 09:34:33', 'amarillo y azul', NULL, NULL, '3 llaveros de los minions ', 4, 2, '/uploads/productos/19-1783092739966.png', 1),
(20, 'llaveros de gatos', 5000.00, 7, 4, '2026-07-03 15:34:08', 'azul, rosado y blanc', NULL, NULL, '4 llaveros de gatos', 4, 3, '/uploads/productos/20-1783092848908.png', 1),
(21, 'cubrelecho de Paw patrol', 30000.00, 10, 3, '2026-07-03 15:35:55', 'azul oscuro', NULL, NULL, 'cubrelecho de Paw patrol', 2, 4, '/uploads/productos/21-1783092955229.png', 1),
(22, 'sabana de stich', 20000.00, 39, 10, '2026-07-03 15:37:54', 'azul', NULL, NULL, 'sabana para cama individual, trae llavero de stich junto con el pedido', 1, 3, '/uploads/productos/22-1783093074272.png', 1),
(23, 'prueba', 1000.00, 6, 2, '2026-07-03 20:55:58', 'rosado', NULL, NULL, 'esdtfgvhbjn', 5, 2, '/uploads/productos/23-1783112149379.png', 0),
(24, 'Capitan america', 10000.00, 45, 4, '2026-07-10 21:52:31', NULL, NULL, '10cm', 'Muñeco tejido del capitan america de 10cm perfecto para regalar', 3, 4, '/uploads/productos/24-1783112549689.png', 1),
(25, 'prueba 2', 100.00, 10, 5, '2026-07-09 21:50:56', NULL, NULL, NULL, 'gdhsn', 6, 3, '/uploads/productos/25-1783112731881.jpg', 0),
(26, 'mmmm', 1321.00, 23, 1, '2026-07-10 22:07:28', NULL, NULL, NULL, 'dfghjfghhhfxgjfg', 2, 1, NULL, 0),
(27, 'qregr', 34555.00, 33, 1, '2026-07-10 22:09:41', 'azul', NULL, NULL, 'sdfghjk', 2, 2, '/uploads/productos/27-1783721313229.png', 0),
(28, 'prueba4566', 23333.00, 33, 1, '2026-07-10 22:19:28', 'rosado', NULL, NULL, 'dfghjxcvbnm', 2, 2, NULL, 0),
(29, 'gfdsshtgrfehgf', 33333.00, 34, 1, '2026-07-10 22:19:32', NULL, NULL, NULL, 'sfgfgdfsgsg', 2, 2, NULL, 0),
(30, 'cubrelecho de minnie mouse', 45000.00, 44, 1, '2026-07-10 22:19:36', NULL, NULL, NULL, 'sdfghjk', 2, 1, NULL, 0),
(31, 'prueba automatizada', 50000.00, 10, 5, '2026-08-14 22:01:02', NULL, NULL, NULL, 'prueba automatizada eliminar despues', 1, 4, NULL, 1);

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
  `id_estado` enum('E-pt','E-pd','E-e') NOT NULL COMMENT '	FK relaciona el estado de pago con el ticket(cuando esta se emite el estado por defecto es "Pendiente")',
  `id_met_pago` enum('Mtd-EF','Mtd-NQ','Mtd-DP','Mtd-TJ','Mtd-PD') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_compra`
--

INSERT INTO `ticket_compra` (`id_ticket_c`, `num_ticket`, `fecha_emision`, `sub_total`, `total_ticket`, `id_pedido`, `id_estado`, `id_met_pago`) VALUES
(11, 373037, '2026-04-08 04:27:37', 30000, 30000, 25, 'E-pd', 'Mtd-PD'),
(12, 762319, '2026-04-08 04:46:42', 48000, 48000, 26, 'E-pt', 'Mtd-EF'),
(13, 128468, '2026-04-08 11:38:47', 52000, 52000, 27, 'E-pt', 'Mtd-DP'),
(14, 959985, '2026-04-08 20:05:11', 30000, 30000, 28, 'E-pd', 'Mtd-PD'),
(15, 492664, '2026-04-08 20:29:58', 303000, 303000, 29, 'E-pd', 'Mtd-TJ'),
(16, 101859, '2026-04-08 20:34:10', 18000, 18000, 30, 'E-pd', 'Mtd-PD'),
(17, 705362, '2026-04-08 20:37:39', 45000, 45000, 31, 'E-pd', 'Mtd-PD'),
(18, 539687, '2026-04-08 20:38:25', 18000, 18000, 32, 'E-pd', 'Mtd-PD'),
(19, 573875, '2026-04-08 20:40:52', 45000, 45000, 33, 'E-pd', 'Mtd-PD'),
(20, 976847, '2026-04-08 20:49:06', 52000, 52000, 34, 'E-pt', 'Mtd-TJ'),
(21, 802742, '2026-04-13 10:59:49', 10000, 10000, 35, 'E-pd', 'Mtd-DP'),
(22, 644021, '2026-04-13 11:00:20', 195000, 195000, 36, 'E-pt', 'Mtd-EF'),
(23, 705554, '2026-04-20 20:12:18', 60000, 60000, 37, 'E-pt', 'Mtd-TJ'),
(24, 488496, '2026-04-20 20:12:41', 44000, 44000, 38, 'E-pt', 'Mtd-TJ'),
(25, 363573, '2026-05-28 12:46:50', 90000, 90000, 39, 'E-pt', 'Mtd-NQ'),
(26, 323673, '2026-05-28 12:47:19', 400, 400, 40, 'E-pd', 'Mtd-EF'),
(27, 313594, '2026-06-10 20:06:21', 260400, 260400, 41, 'E-pd', 'Mtd-PD'),
(28, 370495, '2026-06-10 20:07:00', 60000, 60000, 42, 'E-pt', 'Mtd-PD'),
(29, 753945, '2026-06-15 18:24:42', 45000, 45000, 43, 'E-pd', 'Mtd-EF'),
(30, 186080, '2026-06-16 01:20:30', 72000, 72000, 44, 'E-pt', 'Mtd-EF'),
(31, 529194, '2026-06-18 09:02:34', 60000, 60000, 45, 'E-pt', 'Mtd-TJ'),
(32, 884252, '2026-06-18 20:39:30', 171000, 171000, 46, 'E-pd', 'Mtd-PD'),
(33, 361603, '2026-06-18 20:48:11', 54000, 54000, 47, 'E-pt', 'Mtd-EF'),
(34, 973248, '2026-06-18 21:51:10', 30000, 30000, 48, 'E-pd', 'Mtd-PD'),
(35, 103138, '2026-06-18 21:57:28', 36000, 36000, 49, 'E-pd', 'Mtd-PD'),
(36, 276541, '2026-06-18 22:00:45', 108000, 108000, 50, 'E-pt', 'Mtd-EF'),
(37, 320675, '2026-06-21 00:26:22', 90000, 90000, 52, 'E-pd', 'Mtd-PD'),
(38, 741450, '2026-06-21 00:30:14', 84000, 84000, 53, 'E-pt', 'Mtd-EF'),
(39, 358539, '2026-06-21 01:14:37', 60000, 60000, 54, 'E-pd', 'Mtd-PD'),
(40, 441193, '2026-06-21 01:42:25', 180000, 180000, 55, 'E-pt', 'Mtd-PD'),
(41, 849197, '2026-06-21 01:43:50', 54000, 54000, 56, 'E-pt', 'Mtd-PD'),
(42, 897127, '2026-06-21 01:54:58', 45000, 45000, 57, 'E-pd', 'Mtd-PD'),
(43, 571928, '2026-06-21 02:30:00', 45000, 45000, 58, 'E-pd', 'Mtd-PD'),
(44, 747871, '2026-06-21 02:42:29', 180000, 180000, 59, 'E-pd', 'Mtd-PD'),
(45, 759867, '2026-06-21 02:48:38', 45000, 45000, 60, 'E-pd', 'Mtd-PD'),
(46, 542990, '2026-06-21 02:57:08', 405000, 405000, 61, 'E-pd', 'Mtd-PD'),
(47, 688810, '2026-06-21 03:06:12', 45000, 45000, 62, 'E-pd', 'Mtd-PD'),
(48, 738521, '2026-06-21 03:10:03', 600000, 600000, 63, 'E-pd', 'Mtd-PD'),
(49, 306814, '2026-06-21 03:20:13', 600000, 600000, 64, 'E-pd', 'Mtd-PD'),
(50, 492088, '2026-06-22 19:47:01', 10000, 10000, 65, 'E-pd', 'Mtd-TJ'),
(51, 701318, '2026-06-23 19:34:38', 120000, 120000, 66, 'E-pd', 'Mtd-EF'),
(52, 361749, '2026-06-25 20:40:31', 75000, 75000, 67, 'E-pd', 'Mtd-PD'),
(53, 259301, '2026-06-25 22:01:53', 135000, 135000, 68, 'E-pd', 'Mtd-PD'),
(54, 907869, '2026-06-25 22:02:35', 140000, 140000, 69, 'E-pt', 'Mtd-PD'),
(55, 943286, '2026-06-25 22:06:41', 10000, 10000, 70, 'E-pd', 'Mtd-PD'),
(56, 846990, '2026-06-25 22:07:17', 48000, 48000, 71, 'E-pt', 'Mtd-PD'),
(57, 951306, '2026-06-30 03:56:54', 30000, 30000, 72, 'E-pd', 'Mtd-PD'),
(58, 674829, '2026-07-03 12:52:15', 30000, 30000, 73, 'E-pd', 'Mtd-PD'),
(59, 494586, '2026-07-03 20:56:50', 141000, 141000, 74, 'E-pd', 'Mtd-PD'),
(60, 676680, '2026-07-09 21:28:02', 225000, 225000, 75, 'E-pd', 'Mtd-PD'),
(61, 162137, '2026-07-09 21:30:20', 88000, 88000, 76, 'E-pt', 'Mtd-PD'),
(62, 884195, '2026-07-09 21:49:07', 195000, 195000, 77, 'E-pd', 'Mtd-PD'),
(63, 989202, '2026-07-16 02:54:47', 155000, 155000, 78, 'E-pd', 'Mtd-PD'),
(64, 912782, '2026-07-16 02:57:47', 240000, 240000, 79, 'E-pd', 'Mtd-TJ'),
(65, 714419, '2026-07-16 21:10:53', 65000, 65000, 81, 'E-pd', 'Mtd-PD'),
(66, 106149, '2026-07-16 21:15:30', 36000, 36000, 82, 'E-pd', 'Mtd-PD'),
(67, 748691, '2026-07-16 21:18:36', 120000, 120000, 84, 'E-pd', 'Mtd-PD'),
(68, 965544, '2026-07-16 21:24:35', 280000, 280000, 85, 'E-pd', 'Mtd-PD'),
(69, 876412, '2026-07-16 21:41:54', 15000, 15000, 86, 'E-pd', 'Mtd-PD'),
(70, 296439, '2026-07-16 21:43:11', 48000, 48000, 87, 'E-pt', 'Mtd-PD'),
(71, 855595, '2026-07-16 21:44:01', 72000, 72000, 88, 'E-pt', 'Mtd-PD'),
(72, 251978, '2026-07-16 21:45:53', 15000, 15000, 89, 'E-pd', 'Mtd-PD'),
(73, 141628, '2026-07-16 21:50:38', 120000, 120000, 90, 'E-pd', 'Mtd-PD'),
(74, 406498, '2026-07-16 21:50:43', 120000, 120000, 91, 'E-pd', 'Mtd-PD'),
(75, 268825, '2026-07-16 21:50:48', 120000, 120000, 92, 'E-pd', 'Mtd-EF'),
(76, 419941, '2026-07-17 05:23:03', 60000, 60000, 93, 'E-pt', 'Mtd-PD'),
(77, 466415, '2026-07-17 14:26:25', 36000, 36000, 94, 'E-pt', 'Mtd-PD'),
(78, 778212, '2026-07-17 14:27:27', 48000, 48000, 95, 'E-pt', 'Mtd-PD'),
(79, 582855, '2026-07-17 15:21:32', 240000, 240000, 96, 'E-pd', 'Mtd-PD'),
(80, 251279, '2026-07-17 15:34:33', 50000, 50000, 97, 'E-pd', 'Mtd-PD'),
(81, 271930, '2026-07-17 16:05:55', 120000, 120000, 98, 'E-pd', 'Mtd-PD'),
(82, 111270, '2026-07-17 16:07:32', 60000, 60000, 99, 'E-pt', 'Mtd-PD'),
(83, 637455, '2026-07-21 18:44:29', 150000, 150000, 100, 'E-pd', 'Mtd-PD'),
(84, 733701, '2026-07-21 18:45:06', 15000, 15000, 101, 'E-pd', 'Mtd-PD');

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
('1', 'Juan', '', 'Pérez', '', 'juan@gmail.com', 3001234567, '$2b$10$soM52fE94RaD9I5apCDcg.M1y07WXlDT.zvY007pDCKokyEdqPcv.', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 0, NULL),
('10229675322', 'Camila', 'Alejandra', 'Mancera', NULL, 'camilamahecha369@gmail.com', 45665432, '$2b$10$pDuvNhtI9KZB8M3uuTw82Oiwe1cVTl8kUTry7ZWIFsHi0LTCU0dlS', NULL, '2', 'CC', '/uploads/perfiles/10229675322-1775508621589.png', NULL, NULL, NULL, 1, 'eRpaElB1R1KzljGREGPDff:APA91bExB6KBn3qA2BbDEijky5tyF5n8VQLGLu3AIjg7WJlmpKPBAE06zcFMDwoYyzeMQXKknk_n-WsZgqAmxZIKzMcQk5Q-nneAXmFoDhCCiPkDDaofzrM'),
('10233658985', 'harry', '', 'potter', '', 'harry@gmail.com', 3254478012, '$2b$10$IWN5vGDBWMJ52hWs5vmQY./FXUoK2pQeK2sVo9ACdSBMV397sLy4e', '$2b$10$Z/JvUwDXpenDyozrgpVAAO9BdLBMBnFr20VEq/93j7bpe9lq.xjNO', '3', 'CC', '/uploads/perfiles/10233658985-1775577294659.png', 'TRB-O5PLJ', NULL, NULL, 1, NULL),
('1023898051', 'Evelyn', NULL, 'Cardenas', NULL, 'zahorycardenas9@gmail.com', 3132171185, '$2b$10$HK9y8Z7w.LoPR0pWcWiwiedlkW4umrAX97.aoKW3QIrevNE9shuJm', NULL, '2', 'CC', '/uploads/perfiles/1023898051-1775528516911.png', NULL, NULL, NULL, 1, NULL),
('102923323', 'Caso', '', 'pruebaa', '', 'casop@gmail.com', 1234563456, '$2b$10$7GdqBv9dluI3cZMFlTPcfe5p0RMD2PyW067.zhkCTc81HyC/2yWZO', '$2b$10$mTgzd16rjeb9.NUu9Cs0Ne4FULWNhKAd9djkZjqGulaS6J/cLDm.m', '3', 'CC', NULL, 'TRB-SGWS2', NULL, NULL, 1, NULL),
('1118024081', 'Reinel', NULL, 'Loaiza', 'Lizcano', 'reinelloaizali@gmail.com', 3125303927, '$2b$10$yx4xi0VwFaLdZKHXJx4BWu3mzIl4S2WT1i1ukzG4WrzADSiaX3kke', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('121234346678', 'vgsgadsv', '', 'asgdjhasdjh', '', 'pruebacorreo@gshgvj.com', 234567, '$2b$10$lw0W0MkH4gav0uFSDp/WJODvXjxsreAOkGoUBRndwyMLeD.H352ye', '$2b$10$X0sswJ4zkLKokBWwdPp.UexEexJL089t9B6vusOBr54vwjt.aY/km', '3', 'CC', NULL, 'TRB-JG08L', NULL, NULL, 1, NULL),
('123', 'prueba 3.0', NULL, 'mmm', NULL, 'pruebas@gmail.com', 123456789012, '$2b$10$SUtArdcOAvJiz750TIRnUe4Otg7fN753ky4J.Nbwx.auixC5aM3kK', NULL, '2', 'CC', '/uploads/perfiles/123-1783633374321.png', NULL, NULL, NULL, 1, NULL),
('123121212', 'sdsds', 'prueba', 'nuemero', 'tres', 'catp369@ghjdsjh.com', 3456789, '$2b$10$UcyGWoiPrC2h4CM5h/lRk.2mguzaok3GMLjkwfVta.N/jh0OrsMT6', '$2b$10$mhKS7sqWqsdugdD4qZNz9uKqXeQSfs6PNZaOcKPWZMLfbRvf6a4Vm', '3', 'CC', NULL, 'TRB-N88QZ', NULL, NULL, 1, NULL),
('12323%%$&%$', 'holaaa', '', 'edcghsd', '', 'coshd@gmail.com', 1234567, '$2b$10$BVR0Kz7U1A00oH/dXfgTZuV0SCHBFP9J2FH1Cb7hyi2QnM04b7wui', '$2b$10$4OTQ7X.ywdbspHlzzSqNYuxv/NeTFDCvLIkjvTCnskn59HsWBvg2S', '3', 'CC', NULL, 'TRB-L57QJ', NULL, NULL, 1, NULL),
('12345', 'prueba', '', 'werr', '', 'cor@gmail.com', 123445, '$2b$10$hvPLo4Pu77C7lVCfnKVgCu7J690WLOFTQp1UOlyT0Ycv2L.z1Ji3u', '$2b$10$9SL7wJQI5iBYhEN7ljGRger44JImJFK62pHzeELqEr4zikAIrCn8m', '3', 'CE', NULL, 'TRB-ZUV1G', NULL, NULL, 1, NULL),
('12345123423', 'reinel', '', 'loaiza', '', 'paraia@gmail.com', 234567, '$2b$10$2wm3DfbpVXYD9y0SkryGQeOwQvCAdL6WHJnem5y7t2thm0ovrif/i', '$2b$10$mA1mgdhI22Rb4X/fWm0nY.zfOR31zuzv.hUTUHZ/NxVUI.dS1OP3O', '3', 'CC', NULL, 'TRB-3E2MI', NULL, NULL, 1, 'eRpaElB1R1KzljGREGPDff:APA91bExB6KBn3qA2BbDEijky5tyF5n8VQLGLu3AIjg7WJlmpKPBAE06zcFMDwoYyzeMQXKknk_n-WsZgqAmxZIKzMcQk5Q-nneAXmFoDhCCiPkDDaofzrM'),
('123456', 'javier', '', 'yara', '', 'javier@gmail.com', 12345678, '$2b$10$tY.bJ0qG3pV6Wjqvk35w0.Jw0Va51XM.7FthHIW3V9oPOlP36voMq', '$2b$10$KKSd2/aS7VWtEd2l4r6IqelOw4NkcxXSJTJ9GblSeylBfmtjCY7ae', '3', 'CC', NULL, 'TRB-B010L', NULL, NULL, 1, NULL),
('1234565421', 'cat', 'pink', '369', NULL, 'catpink369@gmail.com', 310309452157, '$2b$10$oDIlSqOy9dmK2fXxcz7fVus1bPtUHFats2D0rRCuWh53WPWcczFmq', NULL, '2', 'CC', '/uploads/perfiles/1234565421-1783633183261.jpg', NULL, NULL, NULL, 1, 'eRpaElB1R1KzljGREGPDff:APA91bExB6KBn3qA2BbDEijky5tyF5n8VQLGLu3AIjg7WJlmpKPBAE06zcFMDwoYyzeMQXKknk_n-WsZgqAmxZIKzMcQk5Q-nneAXmFoDhCCiPkDDaofzrM'),
('123456713%$##', 'sdfsa', '', 'adafe', '', 'catp69@gmail.com', 234567, '$2b$10$4Nc/zW2Hm7YNSZEXZexUh.hTzJb/xreA8Y9fHhoisrl94DTWHUCPG', '$2b$10$lpv4AQOnLFKG6J1p2V.dluINJJI5NfVIcx7ehlXIUcKRGsBWFWIAW', '3', 'CC', NULL, 'TRB-R18TL', NULL, NULL, 1, NULL),
('1234569787655', 'rf', '', 'prueba', '', 'wertyq@gmail.com', 234564345, '$2b$10$8/VLKe9CIsBmuSsjzUfAlef5aXKBYN7jrw4PC6bg17iasInRuh3zq', '$2b$10$MKgskrvRhPpcix/dfrWW2ehycLkxuyrIhfNvYlgrWIP4EEkS8M32S', '3', 'CC', NULL, 'TRB-KAPMF', NULL, NULL, 1, NULL),
('145674564', 'Javier', '', 'Yara', '', 'javier@gmail.com', 3001234567, '$2b$10$TdeVagOjpkOoqohjcIm20.QT3A.yDAo3A0kAp2D/aoVKGpDKqga6i', '$2b$10$3om1kud4nblUMr5aqAzCXOX3cOm4Kj//bXaqWKojHfLgSfCsKwB6a', '1', 'CC', NULL, '1234', NULL, NULL, 1, NULL),
('145674567', 'Juan', '', 'Pérez', '', 'juan@gmail.com', 3001234567, '$2b$10$AXJ6fvdOPOEfQKP5xPjsdO8/zbudGTbn7xaN.8xXkVLItPtfWtbKi', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('234567', 'sdas', 'sda', 'sda', '', '12@gmail.com', 34567, '$2b$10$SFX8o1bq9aH60M59YbFWIuna8Mx6Jgj0Yx5hstr4epqmb//1T2whS', '$2b$10$h/XVIDG2ogPUaftv2tFaduDJqsZq9OfrxJ89/HE/Ju63CI6tHs5aO', '3', 'CC', NULL, 'TRB-3NJWP', NULL, NULL, 0, NULL),
('2345678', 'trabajador', '', 'prueba', '', 'trabajador@gmail.com', 2345678, '$2b$10$pcy/htYsg70AJud782/joe2H1wn/VPr7d1MwyuHtd/fjxa8wJObH6', '$2b$10$H7l0anVsl0f1lRWLoydXCOiU0V5gyXTidNMGi9e5CTRFBiZa1NZuK', '3', 'CC', NULL, 'TRB-WJM4T', NULL, NULL, 1, NULL),
('234567876543', 'matthew', 'sebastian', 'Mancera', 'Riaño', 'correo@gmail.com', 3103945633, '$2b$10$FlR/DK89gEJlSGmcZf6ty.4K8w4Fv4ggx0BlaNTWHtSLOENuEdkWK', NULL, '2', 'CC', '/uploads/perfiles/234567876543-1775622354327.webp', NULL, NULL, NULL, 1, NULL),
('243545', 'pruebaaaa', NULL, 'sdcvcxcv', NULL, 'cat@gmail.com', 2345678, '$2b$10$POnimb1Ps0xnTiZZcqm4cOm3ttSvPNbFoKedoh1lBz6DDAriJkTA6', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL),
('31757864', 'prueba', NULL, 'movil', NULL, 'owisjxeow@gmail.com', 2676767949, '$2b$10$ur50UrpDpy5T8iGgTiM1keY2d6CcG3Oe2YAuFnFl050T03C7kujca', '$2b$10$0TiNZbKLuw/.zy1U81gNNe77cmzeiA2ZmgxxuXvZA1DwzbuimBXHq', '3', 'CC', NULL, 'TRB-NCE6Y', NULL, NULL, 0, NULL),
('58023858358', 'prueba movil', NULL, '123456780', NULL, 'a@gmail.com', 8894898, '$2b$10$NM2C6Tf0DPtSr0nshHF4f.2pcYAsYi8aUD9LHQjde17dZfYJgeDt6', NULL, '2', 'CE', NULL, NULL, NULL, NULL, 1, NULL),
('Adm-01', 'Valentina', NULL, 'Ruiz', 'Castro', 'valruiz@gmail.com', 3123456789, '$2b$10$ZpYbdvjxoxOFc9H1WE.9v.sSNaEvHqRHlThGiMvDAYy/StkwtxK6a', '$2b$10$jQpj1gMJypBF/d2zQEGz2OdfRTlvBzhMUj2nrkHxV./I/tNMqymke', '1', 'CC', '/uploads/perfiles/Adm-01-1782018735677.jpg', '12345', NULL, NULL, 1, 'eRpaElB1R1KzljGREGPDff:APA91bExB6KBn3qA2BbDEijky5tyF5n8VQLGLu3AIjg7WJlmpKPBAE06zcFMDwoYyzeMQXKknk_n-WsZgqAmxZIKzMcQk5Q-nneAXmFoDhCCiPkDDaofzrM'),
('Cli_04', 'Sofía', 'Andrea', 'Ramírez', 'Torres', 'sofia.ramirez@example.com', 3015558899, '$2b$10$jRk9I8r47OACUcKzGXFE..DCfBUWmW4VlTOdfiW8STG9z41So37HS', NULL, '2', 'CC', NULL, NULL, NULL, NULL, 1, NULL);

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
  ADD KEY `idx_notif_usuario` (`id_usuario`),
  ADD KEY `idx_notif_leida` (`id_usuario`,`leida`);

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
  MODIFY `id_detalles` int(4) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del detalle del pedido.', AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK identificador unico del material', AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `material_color`
--
ALTER TABLE `material_color`
  MODIFY `id_color` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `material_diseno`
--
ALTER TABLE `material_diseno`
  MODIFY `id_diseno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del movimiento.', AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(4) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador unico del pedido', AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT de la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  MODIFY `id_ped_personal` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador unico del pedido perzonalizado', AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del producto.', AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  MODIFY `id_ticket_c` int(6) NOT NULL AUTO_INCREMENT COMMENT 'PK Identificador único del ticket', AUTO_INCREMENT=85;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `detalle_pedido_personalizado`
--
ALTER TABLE `detalle_pedido_personalizado`
  ADD CONSTRAINT `fk_dpp_material` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`),
  ADD CONSTRAINT `fk_dpp_pedido` FOREIGN KEY (`id_ped_personal`) REFERENCES `pedido_personalizado` (`id_ped_personal`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`id_m`) REFERENCES `tipo_movimiento` (`id_m`),
  ADD CONSTRAINT `movimiento_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `movimiento_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `movimiento_ibfk_4` FOREIGN KEY (`id_material`) REFERENCES `material` (`id_material`);

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_pedido` (`id_tipo`);

--
-- Filtros para la tabla `pedido_personalizado`
--
ALTER TABLE `pedido_personalizado`
  ADD CONSTRAINT `pedido_personalizado_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion` (`id_clasificacion`);

--
-- Filtros para la tabla `ticket_compra`
--
ALTER TABLE `ticket_compra`
  ADD CONSTRAINT `ticket_compra_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `ticket_compra_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estado_pago` (`id_estado`),
  ADD CONSTRAINT `ticket_compra_ibfk_3` FOREIGN KEY (`id_met_pago`) REFERENCES `metodo_pago` (`id_met_pago`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`t_doc`) REFERENCES `tipo_documento` (`t_doc`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
