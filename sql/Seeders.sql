-- Inserta datos en las tablas maestras para que el sistema pueda funcionar

-- 1. TIPOS DE USUARIO
INSERT INTO `tipos_usuario` (`id`, `nombre`) VALUES
(1, 'cliente'),
(2, 'propietario'),
(3, 'administrador');

-- 2. ESTADOS DE USUARIO
INSERT INTO `estados_usuario` (`id`, `nombre`) VALUES
(1, 'activo'),
(2, 'inactivo'),
(3, 'suspendido');

-- 3. ESTADOS DE PROPIETARIO
INSERT INTO `estados_propietario` (`id`, `nombre`) VALUES
(1, 'pendiente'),
(2, 'aprobado'),
(3, 'rechazado');

-- 4. ESTADOS DE CENTRO DEPORTIVO
INSERT INTO `estados_centro` (`id`, `nombre`) VALUES
(1, 'activo'),
(2, 'inactivo'),
(3, 'mantenimiento');

-- 5. ESTADOS DE INSTALACIÓN
INSERT INTO `estados_instalacion` (`id`, `nombre`) VALUES
(1, 'disponible'),
(2, 'mantenimiento'),
(3, 'fuera_servicio');

-- 6. ESTADOS DE HORARIO
INSERT INTO `estados_horario` (`id`, `nombre`) VALUES
(1, 'disponible'),
(2, 'ocupado'),
(3, 'bloqueado');

-- 7. ESTADOS DE RESERVA
INSERT INTO `estados_reserva` (`id`, `nombre`) VALUES
(1, 'pendiente'),
(2, 'confirmada'),
(3, 'completada'),
(4, 'cancelada');

-- 8. MÉTODOS DE PAGO
INSERT INTO `metodos_pago` (`id`, `nombre`) VALUES
(1, 'efectivo'),
(2, 'tarjeta'),
(3, 'transferencia'),
(4, 'yape'),
(5, 'plin');

-- 9. ESTADOS DE PAGO
INSERT INTO `estados_pago` (`id`, `nombre`) VALUES
(1, 'pendiente'),
(2, 'completado'),
(3, 'fallido'),
(4, 'reembolsado');

-- 10. TIPOS DE DOCUMENTO (Muy importante para futuros registros)
INSERT INTO `tipos_documento` (`id`, `nombre`, `descripcion`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad'),
(2, 'RUC', 'Registro Único de Contribuyentes'),
(3, 'CE', 'Carné de Extranjería'),
(4, 'PASAPORTE', 'Pasaporte');

-- Puedes añadir aquí los departamentos, provincias y distritos de Perú si los tienes a mano
-- Ejemplo para TIPOS DE DEPORTES
INSERT INTO `tipos_deportes` (`id`, `nombre`) VALUES
(1, 'Fútbol'),
(2, 'Básquet'),
(3, 'Tenis'),
(4, 'Vóley');