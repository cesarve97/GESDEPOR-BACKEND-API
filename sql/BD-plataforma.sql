-- Creación de la base de datos si no existe
CREATE DATABASE IF NOT EXISTS railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;

-- TABLAS DE UBIGEO Y DOCUMENTOS
CREATE TABLE `tipos_documento` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(100)
);

CREATE TABLE `departamentos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE `provincias` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `departamento_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`),
  UNIQUE (`departamento_id`, `nombre`)
);

CREATE TABLE `distritos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `provincia_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  FOREIGN KEY (`provincia_id`) REFERENCES `provincias` (`id`),
  UNIQUE (`provincia_id`, `nombre`)
);

-- TABLAS DE USUARIOS Y ROLES
CREATE TABLE `tipos_usuario` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- cliente, propietario, administrador
);

CREATE TABLE `estados_usuario` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- activo, inactivo, suspendido
);

CREATE TABLE `usuarios` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(100),
  `apellido` VARCHAR(100),
  `email` VARCHAR(150) UNIQUE,
  `password` VARCHAR(255),
  `telefono` VARCHAR(20),
  `fecha_nacimiento` DATE,
  `tipo_documento_id` INT,
  `numero_documento` VARCHAR(20) UNIQUE,
  `razon_social` VARCHAR(200),
  `tipo_usuario_id` INT,
  `estado_id` INT,
  `foto_perfil` VARCHAR(255),
  `es_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipos_documento` (`id`),
  FOREIGN KEY (`tipo_usuario_id`) REFERENCES `tipos_usuario` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_usuario` (`id`)
);

-- TABLAS DE PROPIETARIOS Y CENTROS DEPORTIVOS
CREATE TABLE `estados_propietario` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- pendiente, aprobado, rechazado
);

CREATE TABLE `propietarios` (
  `id` INT PRIMARY KEY,
  `estado_id` INT,
  `logo_negocio` VARCHAR(255),
  `nombre_negocio` VARCHAR(200),
  `descripcion_negocio` TEXT,
  `telefono_negocio` VARCHAR(20),
  `email_negocio` VARCHAR(150),
  `direccion_negocio` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`id`) REFERENCES `usuarios` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_propietario` (`id`)
);

CREATE TABLE `estados_centro` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- activo, inactivo, mantenimiento
);

CREATE TABLE `centros_deportivos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `propietario_id` INT,
  `nombre` VARCHAR(200),
  `descripcion` TEXT,
  `direccion` TEXT,
  `departamento_id` INT,
  `provincia_id` INT,
  `distrito_id` INT,
  `codigo_postal` VARCHAR(10),
  `telefono` VARCHAR(20),
  `email` VARCHAR(150),
  `latitud` DECIMAL(10,8),
  `longitud` DECIMAL(11,8),
  `servicios_adicionales` TEXT,
  `politicas` TEXT,
  `calificacion_promedio` DECIMAL(3,2),
  `estado_id` INT,
  `fotos` JSON,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`propietario_id`) REFERENCES `propietarios` (`id`),
  FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`),
  FOREIGN KEY (`provincia_id`) REFERENCES `provincias` (`id`),
  FOREIGN KEY (`distrito_id`) REFERENCES `distritos` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_centro` (`id`),
  INDEX `idx_ubicacion` (`latitud`, `longitud`)
);

-- TABLAS DE INSTALACIONES Y DEPORTES
CREATE TABLE `tipos_deportes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(100) UNIQUE,
  `descripcion` TEXT,
  `equipamiento_requerido` TEXT,
  `icono_imagen` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `estados_instalacion` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- disponible, mantenimiento, fuera_servicio
);

CREATE TABLE `instalaciones` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `centro_id` INT,
  `nombre` VARCHAR(200),
  `descripcion` TEXT,
  `capacidad_maxima` INT,
  `precio_por_hora` DECIMAL(8,2),
  `superficie` VARCHAR(50),
  `dimensiones` VARCHAR(100),
  `equipamiento_incluido` TEXT,
  `estado_id` INT,
  `fotos` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`centro_id`) REFERENCES `centros_deportivos` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_instalacion` (`id`)
);

CREATE TABLE `instalacion_tipo_deporte` (
  `instalacion_id` INT,
  `tipo_deporte_id` INT,
  PRIMARY KEY (`instalacion_id`, `tipo_deporte_id`),
  FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tipo_deporte_id`) REFERENCES `tipos_deportes` (`id`) ON DELETE CASCADE
);

-- TABLAS DE HORARIOS Y RESERVAS
CREATE TABLE `estados_horario` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- disponible, ocupado, bloqueado
);

CREATE TABLE `horarios_disponibilidad` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `instalacion_id` INT,
  `dia_semana` VARCHAR(20),
  `hora_inicio` TIME,
  `hora_fin` TIME,
  `estado_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`instalacion_id`, `dia_semana`, `hora_inicio`, `hora_fin`),
  FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_horario` (`id`)
);

CREATE TABLE `estados_reserva` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- pendiente, confirmada, completada, cancelada
);

CREATE TABLE `reservas` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` INT,
  `instalacion_id` INT,
  `fecha_reserva` DATE,
  `hora_inicio` TIME,
  `hora_fin` TIME,
  `duracion_horas` DECIMAL(3,1),
  `precio_total` DECIMAL(8,2),
  `estado_id` INT,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_reserva` (`id`),
  INDEX `idx_reserva_fecha` (`instalacion_id`, `fecha_reserva`, `hora_inicio`, `hora_fin`)
);

-- TABLAS DE PAGOS Y EVALUACIONES
CREATE TABLE `metodos_pago` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- efectivo, tarjeta, transferencia, yape, plin
);

CREATE TABLE `estados_pago` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50) -- pendiente, completado, fallido, reembolsado
);

CREATE TABLE `pagos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `reserva_id` INT UNIQUE,
  `monto` DECIMAL(8,2),
  `metodo_pago_id` INT,
  `estado_id` INT,
  `fecha_pago` TIMESTAMP,
  `referencia_transaccion` VARCHAR(100) UNIQUE,
  `comprobante` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`),
  FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`),
  FOREIGN KEY (`estado_id`) REFERENCES `estados_pago` (`id`)
);

CREATE TABLE `evaluaciones` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` INT,
  `centro_id` INT,
  `reserva_id` INT UNIQUE,
  `calificacion` INT,
  `comentario` TEXT,
  `fecha_evaluacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  FOREIGN KEY (`centro_id`) REFERENCES `centros_deportivos` (`id`),
  FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`)
);