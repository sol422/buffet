CREATE DATABASE IF NOT EXISTS `buffet` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `buffet`;


CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  `asiste_lunes` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_martes` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_miercoles` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_jueves` tinyint(1) NOT NULL DEFAULT 0,
  `asiste_viernes` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `administrador` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `admin_fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `empleado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `empleado_fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `dia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `item_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 100,
  `imagen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semana` int(11) NOT NULL,
  `id_administrador` int(11) DEFAULT NULL,
  `es_actual` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_administrador` (`id_administrador`),
  CONSTRAINT `menu_fk_admin` FOREIGN KEY (`id_administrador`) REFERENCES `administrador` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `menu_item_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_menu` int(11) NOT NULL,
  `id_item_menu` int(11) NOT NULL,
  `id_dia` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_menu` (`id_menu`),
  KEY `id_item_menu` (`id_item_menu`),
  KEY `id_dia` (`id_dia`),
  CONSTRAINT `mim_fk_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mim_fk_item` FOREIGN KEY (`id_item_menu`) REFERENCES `item_menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mim_fk_dia` FOREIGN KEY (`id_dia`) REFERENCES `dia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_empleado` int(11) NOT NULL,
  `semana` int(11) NOT NULL,
  `fecha_pedido` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `pedido_fk_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pedido_item_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_item_menu` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_item_menu` (`id_item_menu`),
  CONSTRAINT `pim_fk_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pim_fk_item` FOREIGN KEY (`id_item_menu`) REFERENCES `item_menu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



INSERT INTO `usuario` (`id`, `email`, `nombre`, `apellido`, `password`) VALUES
(1, 'admin@buffet.com', 'Admin', 'Buffet', 'admin123'),
(2, 'empleado@test.com', 'Empleado', 'Demo', '123456');

INSERT INTO `administrador` (`id_usuario`) VALUES (1);
INSERT INTO `empleado` (`id_usuario`) VALUES (2);

INSERT INTO `dia` (`id`, `nombre`) VALUES (1, 'LUNES'), (2, 'MARTES'), (3, 'MIERCOLES'), (4, 'JUEVES'), (5, 'VIERNES');

INSERT INTO `item_menu` (`nombre`, `descripcion`, `categoria`, `stock`, `imagen`) VALUES
('Milanesa de Ternera con Puré', 'Clásico plato argentino, tierno y sabroso.', 'Principal', 100, 'milanesa_pure.jpg'),
('Ensalada César con Pollo', 'Lechuga fresca, pollo grillado, crutones y aderezo césar.', 'Light', 100, 'ensalada_cesar.jpg'),
('Lentejas a la Española', 'Guiso potente con chorizo colorado y panceta.', 'Guiso', 100, 'lentejas.jpg'),
('Wok de Vegetales y Arroz', 'Salteado de vegetales de estación con arroz y salsa de soja.', 'Vegetariano', 100, 'wok_vegetales.jpg'),
('Pastel de Papas', 'Carne picada suave cubierta con un cremoso puré de papas gratinado.', 'Principal', 100, 'pastel_papas.jpg'),
('Tarta de Espinaca y Ricota', 'Porción individual de tarta con masa casera.', 'Light', 100, 'tarta_espinaca.jpg'),
('Pollo al Curry con Arroz', 'Trozos de pollo en una suave y aromática salsa al curry.', 'Exótico', 100, 'pollo_curry.jpg'),
('Filet de Merluza a la Romana', 'Acompañado con rodajas de limón y puré de calabaza.', 'Pescado', 100, 'filet_merluza.jpg'),
('Pizza Muzarella Individual', 'Pizza al molde con abundante queso muzzarella y aceitunas.', 'Minutas', 100, 'pizza.jpg'),
('Ñoquis con Salsa Bolognesa', 'Pasta casera con una rica y tradicional salsa de carne.', 'Pastas', 100, 'noquis_bolognesa.jpg'),
('Fideos con Salsa Bolognesa', 'Un clásico que nunca falla, con carne de primera.', 'Pastas', 100, 'fideos_bolognesa.jpg'),
('Agua Mineral sin gas 500ml', 'Hidratación pura y natural.', 'Bebida', 100, 'agua_mineral.jpg'),
('Flan Casero con Dulce de Leche', 'El final perfecto para cualquier comida.', 'Postre', 100, 'flan_casero.jpg'),
('Gaseosa línea Coca-Cola 500ml', 'Elige tu sabor preferido.', 'Bebida', 100, 'gaseosa_cola.jpg'),
('Ensalada de Frutas de Estación', 'Una opción fresca y saludable.', 'Postre', 100, 'ensalada_frutas.jpg'),
('Jugo de Naranja Exprimido', 'Natural y lleno de vitaminas.', 'Bebida', 100, 'jugo_naranja.jpg'),
('Mousse de Chocolate', 'Intenso y aireado, para los amantes del chocolate.', 'Postre', 100, 'mousse_chocolate.jpg'),
('Copa de Vino (Tinto o Blanco)', 'Selección de la casa.', 'Bebida', 100, 'copa_vino.jpg'),
('Ravioles de Verdura', 'Elige entre salsa rosa, blanca o fileto.', 'Pastas', 100, 'ravioles_verdura.jpg'),
('Tiramisú', 'El clásico postre italiano, cremoso y con un toque de café.', 'Postre', 100, 'tiramisu.jpg'),
('Canelones de Espinaca y Ricota', 'Gratinados con una suave salsa blanca.', 'Pastas', 100, 'canelones_espinaca.jpg'),
('Papas Fritas', 'Crocantes y doradas, el acompañamiento perfecto.', 'Guarnición', 100, 'papas_fritas.jpg'),
('Pechuga de Pollo Grillada', 'Tierna pechuga a la plancha con finas hierbas.', 'Principal', 100, 'pechuga_grillada.jpg'),
('Gaseosa línea Pepsi 500ml', 'Elige tu sabor preferido.', 'Bebida', 100, 'gaseosa_pepsi.jpg'),
('Sopa Crema de Calabaza', 'Suave y reconfortante, con crutones crocantes.', 'Sopa', 100, 'sopa_calabaza.jpg'),
('Tarta de Jamón y Queso', 'Porción individual de tarta casera con jamón y queso.', 'Tarta', 100, 'tarta_jamonyqueso.jpg');

INSERT INTO `menu` (`semana`, `id_administrador`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1);

UPDATE `menu` SET `es_actual` = 1 WHERE `semana` = 1;