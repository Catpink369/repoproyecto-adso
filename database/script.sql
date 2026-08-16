-- =============================================================================
-- SCRIPT DE BASE DE DATOS: GESTIÓN DE TIENDA Y PEDIDOS PERSONALIZADOS
-- Motor: MySQL 8.0+ / MariaDB (Alineado con Prisma Schema)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS material_diseno;
DROP TABLE IF EXISTS material_color;
DROP TABLE IF EXISTS detalle_pedido_personalizado;
DROP TABLE IF EXISTS pedido_personalizado;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS movimiento;
DROP TABLE IF EXISTS tipo_movimiento;
DROP TABLE IF EXISTS ticket_compra;
DROP TABLE IF EXISTS detalles_pedido;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS clasificacion;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS tipo_pedido;
DROP TABLE IF EXISTS metodo_pago;
DROP TABLE IF EXISTS estado_pago;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS tipo_documento;
DROP TABLE IF EXISTS rol_usuario;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. TABLAS MAESTRAS / ROLES Y TIPOS DE DOCUMENTO
-- =============================================================================

-- Tabla: rol_usuario
CREATE TABLE rol_usuario (
  id_rol_usuario VARCHAR(20) PRIMARY KEY,
  nombre_rol VARCHAR(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Roles de acceso del sistema';

-- Tabla: tipo_documento
CREATE TABLE tipo_documento (
  t_doc ENUM('CC', 'CE', 'TI') PRIMARY KEY,
  desc_doc ENUM('Cédula de ciudadanía', 'Cédula de extranjería', 'Tarjeta de identidad') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tipos de documento de identidad';

-- Tabla: usuario
CREATE TABLE usuario (
  id_usuario VARCHAR(15) PRIMARY KEY,
  nom_1 VARCHAR(50) NOT NULL,
  nom_2 VARCHAR(50),
  ape_1 VARCHAR(50) NOT NULL,
  ape_2 VARCHAR(50),
  correo VARCHAR(40) NOT NULL,
  telefono BIGINT NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  codigo VARCHAR(255) UNIQUE,
  id_rol_usuario VARCHAR(20) NOT NULL,
  t_doc ENUM('CC', 'CE', 'TI') NOT NULL,
  img_perfil VARCHAR(255),
  codigo_visible VARCHAR(20),
  reset_codigo VARCHAR(255),
  reset_expira DATETIME(0),
  estado INT NOT NULL DEFAULT 1,
  fcm_token VARCHAR(255),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol_usuario) REFERENCES rol_usuario(id_rol_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_tdoc FOREIGN KEY (t_doc) REFERENCES tipo_documento(t_doc) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Usuarios registrados en la plataforma';

-- =============================================================================
-- 2. TABLAS DE ESTADOS, MÉTODOS Y TIPOS DE PEDIDO
-- =============================================================================

-- Tabla: estado_pago
CREATE TABLE estado_pago (
  id_estado ENUM('E-pt', 'E-pd', 'E-f', 'E-e') PRIMARY KEY,
  nom_metodo ENUM('Pendiente', 'Pagado', 'finalizado', 'entregado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de estados de transacciones de pago';

-- Tabla: metodo_pago
CREATE TABLE metodo_pago (
  id_met_pago ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') PRIMARY KEY,
  nom_metodo ENUM('Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Por definir') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Métodos de pago aceptados';

-- Tabla: tipo_pedido
CREATE TABLE tipo_pedido (
  id_tipo ENUM('P-P', 'P-E') PRIMARY KEY,
  tipo_pedido ENUM('Personalizado', 'Estandar') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Modo de pedido (Personalizado o Estándar)';

-- =============================================================================
-- 3. CATEGORÍAS, CLASIFICACIÓN Y PRODUCTOS
-- =============================================================================

-- Tabla: categoria
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_c ENUM('Sabanas', 'Cubrelechos', 'Amigurumis', 'Llaveros') NOT NULL,
  descripcion VARCHAR(60)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Categorías de productos disponibles';

-- Tabla: clasificacion
CREATE TABLE clasificacion (
  id_clasificacion INT AUTO_INCREMENT PRIMARY KEY,
  nombre_clas ENUM('Sin clasificar', 'En oferta', 'Mas vendidos', 'Nuevos', 'Ultimas unidades') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Segmentación comercial de productos';

-- Tabla: producto
CREATE TABLE producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nom_producto VARCHAR(60) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  stock_actual INT NOT NULL,
  stock_minimo INT NOT NULL,
  ultima_actualiz DATETIME(0) NOT NULL,
  color VARCHAR(20),
  talla VARCHAR(20),
  `tamaño` VARCHAR(20),
  descripcion VARCHAR(255) NOT NULL,
  id_categoria INT NOT NULL,
  id_clasificacion INT NOT NULL,
  ruta_imagen VARCHAR(255),
  estado BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_producto_clasificacion FOREIGN KEY (id_clasificacion) REFERENCES clasificacion(id_clasificacion) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de productos finales estandarizados';

-- =============================================================================
-- 4. TABLAS DE PEDIDOS Y TICKETS DE COMPRA
-- =============================================================================

-- Tabla: pedido
CREATE TABLE pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME(0) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  id_usuario VARCHAR(15) NOT NULL,
  id_tipo ENUM('P-P', 'P-E') NOT NULL,
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_tipo FOREIGN KEY (id_tipo) REFERENCES tipo_pedido(id_tipo) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cabecera principal de pedidos';

-- Tabla: detalles_pedido (Pedidos Estándar)
CREATE TABLE detalles_pedido (
  id_detalles INT AUTO_INCREMENT PRIMARY KEY,
  descrip_detalles VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  CONSTRAINT fk_detalles_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalles_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Items asociados a un pedido estándar';

-- Tabla: ticket_compra
CREATE TABLE ticket_compra (
  id_ticket_c INT AUTO_INCREMENT PRIMARY KEY,
  num_ticket INT NOT NULL UNIQUE,
  fecha_emision DATETIME(0) NOT NULL,
  sub_total DECIMAL(10, 0) NOT NULL,
  total_ticket DECIMAL(10, 0) NOT NULL,
  id_pedido INT NOT NULL UNIQUE,
  id_estado ENUM('E-pt', 'E-pd', 'E-f', 'E-e') NOT NULL,
  id_met_pago ENUM('Mtd-EF', 'Mtd-NQ', 'Mtd-DP', 'Mtd-TJ', 'Mtd-PD') NOT NULL,
  CONSTRAINT fk_ticket_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ticket_estado FOREIGN KEY (id_estado) REFERENCES estado_pago(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_metodo FOREIGN KEY (id_met_pago) REFERENCES metodo_pago(id_met_pago) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Comprobantes y estados de cobro';

-- =============================================================================
-- 5. MATERIALES Y CONFIGURACIÓN DE PERSONALIZACIÓN
-- =============================================================================

-- Tabla: material
CREATE TABLE material (
  id_material INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  tipo ENUM('Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio') NOT NULL,
  unidad ENUM('metro', 'unidad') NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  ruta_imagen VARCHAR(255),
  estado BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Insumos base para confección de personalizados';

-- Tabla: material_color
CREATE TABLE material_color (
  id_color INT AUTO_INCREMENT PRIMARY KEY,
  id_material INT NOT NULL,
  nombre VARCHAR(40) NOT NULL,
  codigo_hex VARCHAR(7),
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_color_material FOREIGN KEY (id_material) REFERENCES material(id_material) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Opciones de colores asignados a materiales';

-- Tabla: material_diseno
CREATE TABLE material_diseno (
  id_diseno INT AUTO_INCREMENT PRIMARY KEY,
  id_material INT NOT NULL,
  nombre VARCHAR(60) NOT NULL,
  ruta_imagen VARCHAR(255),
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_diseno_material FOREIGN KEY (id_material) REFERENCES material(id_material) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Diseños o estampados asignados a materiales';

-- Tabla: pedido_personalizado
CREATE TABLE pedido_personalizado (
  id_ped_personal INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  tipo_producto ENUM('Sabana', 'Cubrelecho') NOT NULL,
  tamanio VARCHAR(30) NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_personalizado_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cabecera de especificación a medida';

-- Tabla: detalle_pedido_personalizado
CREATE TABLE detalle_pedido_personalizado (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_ped_personal INT NOT NULL,
  id_material INT NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_det_pers_pedido FOREIGN KEY (id_ped_personal) REFERENCES pedido_personalizado(id_ped_personal) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_det_pers_material FOREIGN KEY (id_material) REFERENCES material(id_material) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Desglose de telas e insumos seleccionados por pedido a medida';

-- =============================================================================
-- 6. INVENTARIO Y NOTIFICACIONES
-- =============================================================================

-- Tabla: tipo_movimiento
CREATE TABLE tipo_movimiento (
  id_m ENUM('M-E', 'M-S') PRIMARY KEY,
  nom_movimiento ENUM('Entrada', 'Salida') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tipos de movimiento de stock (Entradas/Salidas)';

-- Tabla: movimiento
CREATE TABLE movimiento (
  id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
  Cantidad_m INT NOT NULL,
  fecha_m DATETIME(0),
  observaciones VARCHAR(80),
  id_m ENUM('M-E', 'M-S') NOT NULL,
  id_producto INT NOT NULL,
  id_usuario VARCHAR(15) NOT NULL,
  id_material INT,
  CONSTRAINT fk_movimiento_tipo FOREIGN KEY (id_m) REFERENCES tipo_movimiento(id_m) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimiento_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimiento_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimiento_material FOREIGN KEY (id_material) REFERENCES material(id_material) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Historial de movimientos de inventario';

-- Tabla: notificacion
CREATE TABLE notificacion (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario VARCHAR(15) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'general',
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Notificaciones dirigidas a usuarios';


-- =============================================================================
-- 7. INSERTS DE DATOS MAESTROS OBLIGATORIOS (Alineados con los ENUMs de Prisma)
-- =============================================================================

-- Roles de Usuario
INSERT INTO rol_usuario (id_rol_usuario, nombre_rol) VALUES
('ROL-01', 'Cliente'),
('ROL-02', 'Administrador')
ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol);

-- Tipos de Documento
INSERT INTO tipo_documento (t_doc, desc_doc) VALUES
('CC', 'Cédula de ciudadanía'),
('CE', 'Cédula de extranjería'),
('TI', 'Tarjeta de identidad')
ON DUPLICATE KEY UPDATE desc_doc=VALUES(desc_doc);

-- Estados de Pago
INSERT INTO estado_pago (id_estado, nom_metodo) VALUES
('E-pt', 'Pendiente'),
('E-pd', 'Pagado'),
('E-f', 'finalizado'),
('E-e', 'entregado')
ON DUPLICATE KEY UPDATE nom_metodo=VALUES(nom_metodo);

-- Métodos de Pago
INSERT INTO metodo_pago (id_met_pago, nom_metodo) VALUES
('Mtd-EF', 'Efectivo'),
('Mtd-NQ', 'Nequi'),
('Mtd-DP', 'Daviplata'),
('Mtd-TJ', 'Tarjeta'),
('Mtd-PD', 'Por definir')
ON DUPLICATE KEY UPDATE nom_metodo=VALUES(nom_metodo);

-- Tipos de Pedido
INSERT INTO tipo_pedido (id_tipo, tipo_pedido) VALUES
('P-P', 'Personalizado'),
('P-E', 'Estandar')
ON DUPLICATE KEY UPDATE tipo_pedido=VALUES(tipo_pedido);

-- Categorías
INSERT INTO categoria (id_categoria, nombre_c, descripcion) VALUES
(1, 'Sabanas', 'Sábanas lisas o estampadas'),
(2, 'Cubrelechos', 'Cubrelechos y edredones acolchados'),
(3, 'Amigurumis', 'Muñecos e insumos tejidos'),
(4, 'Llaveros', 'Accesorios y llaveros varios')
ON DUPLICATE KEY UPDATE nombre_c=VALUES(nombre_c);

-- Clasificaciones
INSERT INTO clasificacion (id_clasificacion, nombre_clas) VALUES
(1, 'Sin clasificar'),
(2, 'En oferta'),
(3, 'Mas vendidos'),
(4, 'Nuevos'),
(5, 'Ultimas unidades')
ON DUPLICATE KEY UPDATE nombre_clas=VALUES(nombre_clas);

-- Tipos de Movimiento
INSERT INTO tipo_movimiento (id_m, nom_movimiento) VALUES
('M-E', 'Entrada'),
('M-S', 'Salida')
ON DUPLICATE KEY UPDATE nom_movimiento=VALUES(nom_movimiento);

-- Insumos / Materiales iniciales requeridos
INSERT INTO material (id_material, nombre, tipo, unidad, precio_unitario, stock_actual, stock_minimo) VALUES
(1, 'Algodón Premium', 'Tela', 'metro', 15000.00, 100, 10),
(2, 'Microfibra Suave', 'Tela', 'metro', 11000.00, 150, 10),
(3, 'Satín Boreal', 'Tela', 'metro', 18000.00, 80, 5)
ON DUPLICATE KEY UPDATE precio_unitario=VALUES(precio_unitario);