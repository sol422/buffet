-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-11-2025 a las 03:09:51
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
-- Base de datos: `buffet`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`id`, `id_usuario`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dia`
--

CREATE TABLE `dia` (
  `id` int(11) NOT NULL,
  `nombre` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dia`
--

INSERT INTO `dia` (`id`, `nombre`) VALUES
(1, 'LUNES'),
(2, 'MARTES'),
(3, 'MIERCOLES'),
(4, 'JUEVES'),
(5, 'VIERNES');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id`, `id_usuario`) VALUES
(1, 2),
(2, 5),
(3, 6),
(4, 7),
(5, 8),
(6, 9),
(7, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `item_menu`
--

CREATE TABLE `item_menu` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 100,
  `imagen` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `item_menu`
--

INSERT INTO `item_menu` (`id`, `nombre`, `descripcion`, `categoria`, `stock`, `imagen`) VALUES
(1, 'Milanesa de Ternera con Puré', 'Clásico plato argentino, tierno y sabroso.', 'Principal', 100, 'milanesa_pure.jpg'),
(2, 'Ensalada César con Pollo', 'Lechuga fresca, pollo grillado, crutones y aderezo césar.', 'Light', 100, 'ensalada_cesar.jpg'),
(3, 'Lentejas a la Española', 'Guiso potente con chorizo colorado y panceta.', 'Guiso', 100, 'lentejas.jpg'),
(4, 'Wok de Vegetales y Arroz', 'Salteado de vegetales de estación con arroz y salsa de soja.', 'Vegetariano', 100, 'wok_vegetales.jpg'),
(5, 'Pastel de Papas', 'Carne picada suave cubierta con un cremoso puré de papas gratinado.', 'Principal', 100, 'pastel_papas.jpg'),
(6, 'Tarta de Espinaca y Ricota', 'Porción individual de tarta con masa casera.', 'Light', 100, 'tarta_espinaca.jpg'),
(7, 'Pollo al Curry con Arroz', 'Trozos de pollo en una suave y aromática salsa al curry.', 'Exótico', 100, 'pollo_curry.jpg'),
(8, 'Filet de Merluza a la Romana', 'Acompañado con rodajas de limón y puré de calabaza.', 'Pescado', 100, 'filet_merluza.jpg'),
(9, 'Pizza Muzarella Individual', 'Pizza al molde con abundante queso muzzarella y aceitunas.', 'Minutas', 100, 'pizza.jpg'),
(10, 'Ñoquis con Salsa Bolognesa', 'Pasta casera con una rica y tradicional salsa de carne.', 'Pastas', 100, 'noquis_bolognesa.jpg'),
(11, 'Fideos con Salsa Bolognesa', 'Un clásico que nunca falla, con carne de primera.', 'Pastas', 100, 'fideos_bolognesa.jpg'),
(12, 'Agua Mineral sin gas 500ml', 'Hidratación pura y natural.', 'Bebida', 100, 'agua_mineral.jpg'),
(13, 'Flan Casero con Dulce de Leche', 'El final perfecto para cualquier comida.', 'Postre', 100, 'flan_casero.jpg'),
(14, 'Gaseosa línea Coca-Cola 500ml', 'Elige tu sabor preferido.', 'Bebida', 100, 'gaseosa_cola.jpg'),
(15, 'Ensalada de Frutas de Estación', 'Una opción fresca y saludable.', 'Postre', 100, 'ensalada_frutas.jpg'),
(16, 'Jugo de Naranja Exprimido', 'Natural y lleno de vitaminas.', 'Bebida', 100, 'jugo_naranja.jpg'),
(17, 'Mousse de Chocolate', 'Intenso y aireado, para los amantes del chocolate.', 'Postre', 100, 'mousse_chocolate.jpg'),
(18, 'Copa de Vino (Tinto o Blanco)', 'Selección de la casa.', 'Bebida', 100, 'copa_vino.jpg'),
(19, 'Ravioles de Verdura', 'Elige entre salsa rosa, blanca o fileto.', 'Pastas', 100, 'ravioles_verdura.jpg'),
(20, 'Tiramisú', 'El clásico postre italiano, cremoso y con un toque de café.', 'Postre', 100, 'tiramisu.jpg'),
(21, 'Canelones de Espinaca y Ricota', 'Gratinados con una suave salsa blanca.', 'Pastas', 100, 'canelones_espinaca.jpg'),
(22, 'Papas Fritas', 'Crocantes y doradas, el acompañamiento perfecto.', 'Guarnición', 100, 'papas_fritas.jpg'),
(23, 'Pechuga de Pollo Grillada', 'Tierna pechuga a la plancha con finas hierbas.', 'Principal', 100, 'pechuga_grillada.jpg'),
(24, 'Gaseosa línea Pepsi 500ml', 'Elige tu sabor preferido.', 'Bebida', 100, 'gaseosa_pepsi.jpg'),
(25, 'Sopa Crema de Calabaza', 'Suave y reconfortante, con crutones crocantes.', 'Sopa', 100, 'sopa_calabaza.jpg'),
(26, 'Tarta de Jamón y Queso', 'Porción individual de tarta casera con jamón y queso.', 'Tarta', 100, 'tarta_jamonyqueso.jpg'),
(27, 'Lasaña de Carne', 'Un plato de pasta integral cremosa y rica, relleno capa por capa con cebollas y ajo frescos y refrescantes, cubierto con una salsa suculenta y cubierto con mozzarella importada de primera calidad.', 'Pastas', 100, 'lasaña_de_carne.jpg'),
(28, 'Wok de Pollo y Vegetales', 'Trozos de pechuga de pollo salteados con vegetales frescos de estación (brócoli, pimiento, zanahoria) y una suave salsa de soja', 'Principal', 69, 'wok_de_pollo_y_vegetales.jpg'),
(29, 'Sándwich de Lomo Completo', 'Tierno lomo a la plancha, con jamón, queso, lechuga, tomate y huevo frito.', 'principal', 50, 'sándwich_de_lomo_completo.jpg'),
(30, 'ñoquis', 'ñoquis bolognesa', 'Pastas', 100, 'ñoquis.jpg'),
(31, 'ñoquis', '4 quesos', 'Pastas', 100, 'ñoquis.jpg'),
(32, 'Pavo asado con relleno vegetal y macerado en verde y AOVE', 'Un plato  elegante y reconfortante que celebra los sabores naturales y frescos.', 'Principal', 100, 'pavo_asado_con_relleno_vegetal_y_macerado_en_verde_y_aove.jpg'),
(33, 'Tiramisú de Curry y Coco', 'Capas de bizcocho de especias, crema ligera de queso Mascarpone infusionada con curry dulce de la India y un toque final de coco tostado.', 'Postre', 100, 'tiramisú_de_curry_y_coco.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `semana` int(11) NOT NULL,
  `id_administrador` int(11) DEFAULT NULL,
  `es_actual` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menu`
--

INSERT INTO `menu` (`id`, `semana`, `id_administrador`, `es_actual`, `fecha_creacion`) VALUES
(1, 1, 1, 0, '2025-09-09 14:32:51'),
(2, 2, 1, 1, '2025-09-09 14:32:51'),
(3, 3, 1, 0, '2025-09-09 14:32:51'),
(4, 4, 1, 0, '2025-09-09 14:32:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_item_menu`
--

CREATE TABLE `menu_item_menu` (
  `id` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  `id_item_menu` int(11) NOT NULL,
  `id_dia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menu_item_menu`
--

INSERT INTO `menu_item_menu` (`id`, `id_menu`, `id_item_menu`, `id_dia`) VALUES
(4, 2, 27, 1),
(5, 2, 27, 4),
(6, 2, 27, 5),
(10, 2, 21, 1),
(11, 2, 21, 3),
(12, 2, 21, 5),
(21, 3, 29, 1),
(22, 3, 29, 3),
(23, 3, 29, 5),
(24, 4, 24, 1),
(25, 4, 24, 2),
(26, 4, 24, 5),
(27, 1, 11, 1),
(28, 1, 11, 2),
(29, 1, 24, 1),
(30, 1, 24, 2),
(31, 1, 24, 5),
(32, 1, 21, 1),
(33, 1, 21, 3),
(34, 1, 21, 5),
(35, 2, 8, 1),
(36, 2, 8, 2),
(37, 2, 8, 3),
(39, 2, 8, 5),
(40, 4, 30, 1),
(41, 4, 30, 2),
(42, 4, 30, 3),
(43, 4, 30, 4),
(44, 4, 30, 5),
(45, 2, 11, 1),
(46, 2, 11, 2),
(47, 2, 11, 3),
(48, 2, 11, 4),
(49, 2, 11, 5),
(50, 1, 11, 1),
(51, 1, 11, 2),
(52, 1, 11, 3),
(53, 1, 11, 4),
(54, 1, 11, 5),
(55, 1, 21, 1),
(56, 1, 21, 2),
(57, 1, 21, 3),
(58, 1, 21, 4),
(59, 1, 21, 5),
(60, 2, 32, 1),
(61, 2, 32, 2),
(62, 2, 32, 3),
(63, 2, 32, 4),
(64, 2, 32, 5),
(65, 3, 33, 1),
(66, 3, 33, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `semana` int(11) NOT NULL,
  `fecha_pedido` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id`, `id_empleado`, `semana`, `fecha_pedido`) VALUES
(1, 1, 1, '2025-09-09'),
(2, 1, 1, '2025-09-09'),
(3, 1, 1, '2025-09-09'),
(4, 1, 1, '2025-09-09'),
(5, 1, 1, '2025-09-09'),
(6, 1, 1, '2025-09-09'),
(7, 1, 1, '2025-09-10'),
(8, 1, 1, '2025-09-10'),
(9, 1, 1, '2025-09-10'),
(10, 1, 1, '2025-09-10'),
(11, 1, 1, '2025-09-10'),
(12, 1, 1, '2025-09-10'),
(13, 1, 1, '2025-09-10'),
(14, 1, 1, '2025-09-10'),
(15, 1, 3, '2025-09-10'),
(16, 1, 3, '2025-09-10'),
(17, 1, 3, '2025-10-15'),
(18, 1, 2, '2025-10-15'),
(19, 1, 2, '2025-10-15'),
(20, 1, 2, '2025-10-15'),
(21, 1, 2, '2025-10-15'),
(22, 3, 2, '2025-10-15'),
(23, 2, 2, '2025-10-15'),
(24, 1, 2, '2025-10-16'),
(25, 1, 46, '2025-11-11'),
(26, 1, 46, '2025-11-11'),
(27, 1, 46, '2025-11-14'),
(28, 1, 46, '2025-11-14'),
(29, 1, 2, '2025-11-18'),
(30, 1, 2, '2025-11-18'),
(31, 1, 2, '2025-11-18'),
(32, 1, 2, '2025-11-18'),
(33, 1, 2, '2025-11-18'),
(34, 1, 1, '2025-11-24'),
(35, 1, 1, '2025-11-24'),
(36, 1, 1, '2025-11-24'),
(37, 1, 1, '2025-11-24'),
(38, 1, 1, '2025-11-24'),
(39, 1, 1, '2025-11-24'),
(40, 1, 1, '2025-11-24'),
(41, 1, 1, '2025-11-24'),
(42, 1, 1, '2025-11-24'),
(43, 1, 1, '2025-11-24'),
(44, 1, 1, '2025-11-24'),
(45, 1, 1, '2025-11-24'),
(46, 1, 1, '2025-11-24'),
(47, 1, 1, '2025-11-24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_item_menu`
--

CREATE TABLE `pedido_item_menu` (
  `id` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_item_menu` int(11) NOT NULL,
  `id_dia` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_item_menu`
--

INSERT INTO `pedido_item_menu` (`id`, `id_pedido`, `id_item_menu`, `id_dia`, `cantidad`) VALUES
(1, 1, 12, NULL, 1),
(2, 1, 20, NULL, 1),
(3, 1, 20, NULL, 1),
(4, 1, 12, NULL, 2),
(5, 2, 12, NULL, 1),
(6, 2, 20, NULL, 1),
(7, 2, 20, NULL, 1),
(8, 3, 12, NULL, 1),
(9, 4, 12, NULL, 1),
(10, 4, 12, NULL, 1),
(11, 5, 12, NULL, 1),
(12, 5, 20, NULL, 1),
(13, 5, 20, NULL, 1),
(14, 6, 12, NULL, 2),
(15, 6, 20, NULL, 2),
(16, 6, 12, NULL, 2),
(17, 6, 20, NULL, 2),
(18, 7, 12, NULL, 1),
(19, 8, 20, NULL, 1),
(20, 9, 12, NULL, 1),
(21, 10, 12, NULL, 1),
(22, 11, 12, NULL, 1),
(23, 12, 20, NULL, 1),
(24, 13, 12, NULL, 1),
(25, 14, 12, NULL, 1),
(26, 15, 2, NULL, 1),
(27, 15, 28, NULL, 1),
(28, 16, 28, NULL, 1),
(29, 17, 29, NULL, 2),
(30, 18, 21, NULL, 1),
(31, 18, 27, NULL, 1),
(32, 19, 27, NULL, 3),
(33, 19, 21, NULL, 3),
(34, 20, 21, NULL, 3),
(35, 20, 21, NULL, 3),
(36, 21, 27, NULL, 4),
(37, 22, 27, NULL, 1),
(38, 22, 21, NULL, 3),
(39, 23, 21, NULL, 1),
(40, 23, 21, NULL, 2),
(41, 24, 27, NULL, 1),
(42, 24, 8, NULL, 1),
(43, 25, 24, NULL, 2),
(44, 25, 30, NULL, 1),
(45, 25, 24, NULL, 1),
(46, 25, 30, NULL, 1),
(47, 25, 30, NULL, 1),
(48, 25, 24, NULL, 1),
(49, 25, 30, NULL, 1),
(50, 25, 30, NULL, 1),
(51, 26, 24, NULL, 2),
(52, 26, 30, NULL, 2),
(53, 26, 24, NULL, 1),
(54, 26, 30, NULL, 1),
(55, 26, 30, NULL, 1),
(56, 26, 30, NULL, 1),
(57, 27, 30, NULL, 1),
(58, 27, 24, NULL, 1),
(59, 27, 30, NULL, 1),
(60, 27, 30, NULL, 1),
(61, 27, 30, NULL, 1),
(62, 27, 24, NULL, 1),
(63, 28, 24, NULL, 1),
(64, 28, 24, NULL, 1),
(65, 28, 30, NULL, 1),
(66, 28, 30, NULL, 1),
(67, 28, 30, NULL, 1),
(68, 29, 21, NULL, 1),
(69, 29, 27, NULL, 1),
(70, 30, 32, NULL, 1),
(71, 30, 32, NULL, 1),
(72, 30, 8, NULL, 1),
(73, 31, 11, NULL, 1),
(74, 31, 11, NULL, 1),
(75, 31, 32, NULL, 1),
(76, 32, 11, NULL, 2),
(77, 32, 21, NULL, 1),
(78, 32, 27, NULL, 1),
(79, 32, 8, NULL, 1),
(80, 33, 11, NULL, 1),
(81, 33, 32, NULL, 1),
(82, 33, 27, NULL, 1),
(83, 34, 21, NULL, 1),
(84, 34, 21, NULL, 1),
(85, 34, 21, NULL, 1),
(86, 34, 21, NULL, 1),
(87, 34, 21, NULL, 1),
(88, 34, 24, NULL, 1),
(89, 35, 24, NULL, 1),
(90, 35, 21, NULL, 1),
(91, 35, 24, NULL, 1),
(92, 35, 11, NULL, 1),
(93, 35, 21, NULL, 1),
(94, 35, 21, NULL, 1),
(95, 35, 24, NULL, 1),
(96, 36, 21, NULL, 1),
(97, 36, 11, NULL, 1),
(98, 36, 11, NULL, 1),
(99, 36, 11, NULL, 1),
(100, 36, 24, NULL, 1),
(101, 36, 21, NULL, 1),
(102, 37, 24, NULL, 2),
(103, 37, 24, NULL, 1),
(104, 37, 21, NULL, 1),
(105, 37, 11, NULL, 1),
(106, 37, 24, NULL, 1),
(107, 38, 24, NULL, 1),
(108, 38, 11, NULL, 1),
(109, 38, 21, NULL, 1),
(110, 38, 11, NULL, 1),
(111, 38, 21, NULL, 1),
(112, 38, 11, NULL, 1),
(113, 38, 21, NULL, 3),
(114, 39, 24, NULL, 1),
(115, 39, 11, NULL, 1),
(116, 39, 21, NULL, 1),
(117, 39, 11, NULL, 1),
(118, 39, 11, NULL, 1),
(119, 40, 24, NULL, 1),
(120, 40, 11, NULL, 1),
(121, 40, 21, NULL, 1),
(122, 40, 21, NULL, 1),
(123, 40, 11, NULL, 1),
(124, 40, 24, NULL, 1),
(125, 40, 24, NULL, 1),
(126, 41, 24, NULL, 1),
(127, 41, 11, NULL, 1),
(128, 42, 24, NULL, 1),
(129, 42, 21, NULL, 1),
(130, 43, 11, NULL, 1),
(131, 43, 11, NULL, 1),
(132, 44, 24, NULL, 1),
(133, 44, 24, NULL, 1),
(134, 45, 24, NULL, 1),
(135, 45, 21, NULL, 1),
(136, 45, 11, NULL, 1),
(137, 45, 11, NULL, 1),
(138, 45, 24, NULL, 1),
(139, 45, 24, NULL, 1),
(140, 46, 24, NULL, 1),
(141, 46, 24, NULL, 1),
(142, 46, 21, NULL, 1),
(143, 46, 11, NULL, 1),
(144, 46, 24, NULL, 1),
(145, 47, 21, NULL, 1),
(146, 47, 21, NULL, 1),
(147, 47, 21, NULL, 1),
(148, 47, 21, NULL, 1),
(149, 47, 24, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_personal`
--

CREATE TABLE `pedido_personal` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('PENDIENTE','CONFIRMADO','CANCELADO') NOT NULL DEFAULT 'CONFIRMADO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_personal`
--

INSERT INTO `pedido_personal` (`id`, `id_usuario`, `fecha_pedido`, `estado`) VALUES
(1, 11, '2025-11-25 01:21:19', 'CONFIRMADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_personal_item`
--

CREATE TABLE `pedido_personal_item` (
  `id` int(11) NOT NULL,
  `id_pedido_personal` int(11) NOT NULL,
  `id_item_menu` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_personal_item`
--

INSERT INTO `pedido_personal_item` (`id`, `id_pedido_personal`, `id_item_menu`, `cantidad`) VALUES
(1, 1, 18, 1),
(2, 1, 21, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  `asiste_lunes` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_martes` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_miercoles` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_jueves` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_viernes` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `email`, `nombre`, `apellido`, `password`, `fecha_baja`, `asiste_lunes`, `asiste_martes`, `asiste_miercoles`, `asiste_jueves`, `asiste_viernes`) VALUES
(1, 'admin@buffet.com', 'Admin', 'Buffet', 'admin123', NULL, 0, 0, 0, 0, 0),
(2, 'empleado@test.com', 'Empleado', 'Demo', '123456', NULL, 1, 1, 1, 1, 1),
(3, 'olmedocristina885@gmail.com', 'soledad', 'Olmedo', '123456', '2025-09-09', 0, 0, 0, 0, 0),
(4, 'aldana@gmail.com', 'mia', 'lopez', '123456', '2025-09-10', 0, 0, 0, 0, 0),
(5, 'cris@gmail.com', 'sol', 'Olmedo', '123456', '2025-10-15', 1, 0, 1, 0, 1),
(6, 'raul@gmail.com', 'pablo', 'lopez', '123456', '2025-10-15', 1, 0, 0, 1, 1),
(7, 'carlos@gmail.com', 'rodrigo', 'lopez', '123456', '2025-10-16', 1, 1, 1, 1, 1),
(8, 'sol456@gmail.com', 'soledad', 'lopez', '123456', '2025-11-14', 1, 1, 1, 1, 1),
(9, 'milo@gmail.com', 'milo', 'lopez', '123456', '2025-11-14', 1, 0, 0, 0, 0),
(10, 'camilo@gmail.com', 'carlos', 'lopez', '123456', '2025-11-18', 0, 0, 0, 0, 0),
(11, 'usuario@gmail.com', 'cari', 'Olmedo', '123456', NULL, 1, 0, 0, 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `dia`
--
ALTER TABLE `dia`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `item_menu`
--
ALTER TABLE `item_menu`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_administrador` (`id_administrador`);

--
-- Indices de la tabla `menu_item_menu`
--
ALTER TABLE `menu_item_menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_menu` (`id_menu`),
  ADD KEY `id_item_menu` (`id_item_menu`),
  ADD KEY `id_dia` (`id_dia`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_empleado` (`id_empleado`);

--
-- Indices de la tabla `pedido_item_menu`
--
ALTER TABLE `pedido_item_menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_item_menu` (`id_item_menu`);

--
-- Indices de la tabla `pedido_personal`
--
ALTER TABLE `pedido_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pp_fk_usuario` (`id_usuario`);

--
-- Indices de la tabla `pedido_personal_item`
--
ALTER TABLE `pedido_personal_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pp_fk_pedido` (`id_pedido_personal`),
  ADD KEY `pp_fk_item` (`id_item_menu`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `dia`
--
ALTER TABLE `dia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `item_menu`
--
ALTER TABLE `item_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `menu_item_menu`
--
ALTER TABLE `menu_item_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `pedido_item_menu`
--
ALTER TABLE `pedido_item_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT de la tabla `pedido_personal`
--
ALTER TABLE `pedido_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pedido_personal_item`
--
ALTER TABLE `pedido_personal_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD CONSTRAINT `admin_fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `empleado_fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_fk_admin` FOREIGN KEY (`id_administrador`) REFERENCES `administrador` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `menu_item_menu`
--
ALTER TABLE `menu_item_menu`
  ADD CONSTRAINT `mim_fk_dia` FOREIGN KEY (`id_dia`) REFERENCES `dia` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mim_fk_item` FOREIGN KEY (`id_item_menu`) REFERENCES `item_menu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mim_fk_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_fk_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido_item_menu`
--
ALTER TABLE `pedido_item_menu`
  ADD CONSTRAINT `pim_fk_item` FOREIGN KEY (`id_item_menu`) REFERENCES `item_menu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pim_fk_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido_personal`
--
ALTER TABLE `pedido_personal`
  ADD CONSTRAINT `pp_fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido_personal_item`
--
ALTER TABLE `pedido_personal_item`
  ADD CONSTRAINT `pp_fk_item` FOREIGN KEY (`id_item_menu`) REFERENCES `item_menu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pp_fk_pedido` FOREIGN KEY (`id_pedido_personal`) REFERENCES `pedido_personal` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `evento_limpieza_pedidos_viejos` ON SCHEDULE EVERY 1 DAY STARTS '2025-09-10 11:54:56' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM pedido
  WHERE fecha_pedido < DATE_SUB(NOW(), INTERVAL 60 DAY)$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
