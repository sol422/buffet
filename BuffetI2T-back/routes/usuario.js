const express = require("express");
const router = express.Router(); 
const connection = require("../db/connection");


// ✅ LOGIN: detecta rol según jerarquía
router.post("/login", (req, res) => { 
    const { email, password } = req.body;
    const sql = "SELECT * FROM usuario WHERE TRIM(email) = ? AND TRIM(password) = ? AND fecha_baja IS NULL";

    connection.query(sql, [email, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send("FAIL"); 
        }
        
        const usuario = results[0];  
        const datosUsuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: "USUARIO" // por defecto
        };

        // Verificamos si es administrador
        const checkAdmin = "SELECT * FROM administrador WHERE id_usuario = ?";
        connection.query(checkAdmin, [usuario.id], (err, adminResults) => {
            if (err) return res.status(500).json({ error: "Error al verificar rol" });
            if (adminResults.length > 0) {
                datosUsuario.rol = "ADMINISTRADOR";
                return res.json(datosUsuario);
            }

            // Si no es admin, verificamos si es empleado
            const checkEmpleado = "SELECT * FROM empleado WHERE id_usuario = ?";
            connection.query(checkEmpleado, [usuario.id], (err, empResults) => {
                if (err) return res.status(500).json({ error: "Error al verificar rol" });
                if (empResults.length > 0) {
                    datosUsuario.rol = "EMPLEADO";
                }
                res.json(datosUsuario);
            });
        });
    });
});


// ✅ ELIMINAR USUARIO (fecha_baja)
router.post("/eliminar", (req, res) => {
    const { id } = req.body;
    const sql = "UPDATE usuario SET fecha_baja = CURRENT_DATE WHERE id = ?";
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al ejecutar UPDATE en la base de datos:", err);
            return res.status(500).send("Error al eliminar usuario");
        }
        console.log("Baja de usuario exitosa en la BD. Filas afectadas:", result.affectedRows);
        res.send("OK");
    });
});


// ✅ REGISTRO DE EMPLEADO (usuario + vínculo)
router.post("/empleado", (req, res) => {
    const { email, nombre, apellido, password } = req.body;
    
    const checkEmailSql = "SELECT * FROM usuario WHERE email = ?";
    connection.query(checkEmailSql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor al verificar email" });
        if (results.length > 0) {
            return res.send("FAIL"); 
        }
        
        const sqlInsert = `INSERT INTO usuario (email, nombre, apellido, password) VALUES (?, ?, ?, ?)`;
        connection.query(sqlInsert, [email, nombre, apellido, password], (err, result) => {
            if (err) return res.status(500).json({ error: "Error al registrar usuario" });
            
            const usuarioId = result.insertId;
            const sqlEmpleado = "INSERT INTO empleado (id_usuario) VALUES (?)";
            connection.query(sqlEmpleado, [usuarioId], (err) => {
                if (err) return res.status(500).json({ error: "Error al registrar empleado" });
                res.send("OK");
            });
        });
    });
});


// ✅ PERFIL DEL USUARIO (datos + asistencia)
router.get('/perfil/:id', (req, res) => {
    const usuarioId = req.params.id;
    const sql = `
      SELECT id, nombre, apellido, email, 
             asiste_lunes, asiste_martes, asiste_miercoles, 
             asiste_jueves, asiste_viernes 
      FROM usuario 
      WHERE id = ?`;

    connection.query(sql, [usuarioId], (err, results) => {
        if (err) {
            console.error("Error al obtener perfil:", err);
            return res.status(500).json({ error: "Error en el servidor" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(results[0]);
    });
});

// ✅ MENÚ COMPLETO PARA USUARIO COMÚN
router.get("/platos", (req, res) => {
    console.log("📌 Ruta /usuario/platos ejecutada");
    const sql = `
        SELECT 
            im.id,
            im.nombre,
            im.descripcion,
            im.categoria,
            im.imagen AS imagen_url
        FROM item_menu im
        ORDER BY im.nombre;
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener todos los platos:", err);
            return res.status(500).json({ error: "Error en el servidor." });
        }
        res.json(results);
    });
});

// ✅ REGISTRO DE USUARIO COMÚN (sin vínculo)
router.post("/registro", (req, res) => {
    const { email, nombre, apellido, password } = req.body;

    const checkEmailSql = "SELECT * FROM usuario WHERE email = ?";
    connection.query(checkEmailSql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Error al verificar email" });
        if (results.length > 0) {
            return res.send("FAIL");
        }

        const sqlInsert = `INSERT INTO usuario (email, nombre, apellido, password) VALUES (?, ?, ?, ?)`;
        connection.query(sqlInsert, [email, nombre, apellido, password], (err) => {
            if (err) return res.status(500).json({ error: "Error al registrar usuario" });
            res.send("OK");
        });
    });
});

// ✅ ENDPOINT: POST /api/usuario/pedido-personal (Confirmar Compra del Usuario Común)
router.post('/pedido-personal', (req, res) => {
    const { id_usuario, detalles } = req.body;

    if (!id_usuario || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan datos para crear el pedido personal." });
    }

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Error al iniciar la transacción." });

        // 1. Insertar el pedido principal (ligado a la tabla usuario)
        // La tabla debe registrar la fecha_pedido para calcular la ventana de cancelación.
        const pedidoSql = 'INSERT INTO pedido_personal (id_usuario) VALUES (?)';
        
        connection.query(pedidoSql, [id_usuario], (err, result) => {
            if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar el pedido personal." }));

            const pedidoId = result.insertId;
            const pedidoItemsValues = detalles.map(item => [pedidoId, item.id_item_menu, item.cantidad]);
            
            // 2. Insertar los detalles del pedido
            const itemsSql = 'INSERT INTO pedido_personal_item (id_pedido_personal, id_item_menu, cantidad) VALUES ?';

            connection.query(itemsSql, [pedidoItemsValues], (err) => {
                if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar los items del pedido personal." }));

                connection.commit(err => {
                    if (err) return connection.rollback(() => res.status(500).json({ error: "Error al finalizar la transacción." }));
                    res.status(201).json({ message: 'Pedido personal confirmado con éxito.', pedidoId: pedidoId });
                });
            });
        });
    });
});

// ✅ RUTA CORREGIDA: GET /api/usuario/historial-personal/:id
// Obtiene el historial de pedidos personales (usuario común)
router.get('/historial-personal/:id', (req, res) => {
    const idUsuario = req.params.id;

    const sql = `
        SELECT 
            pp.id AS id_pedido,
            pp.fecha_pedido,
            pp.estado AS estado_pedido,
            ppi.cantidad,
            im.nombre AS nombre_plato,
            im.categoria,
            im.imagen AS imagen_url
        FROM pedido_personal pp
        JOIN pedido_personal_item ppi ON pp.id = ppi.id_pedido_personal
        JOIN item_menu im ON ppi.id_item_menu = im.id
        WHERE pp.id_usuario = ?
        ORDER BY pp.fecha_pedido DESC;
    `;

    connection.query(sql, [idUsuario], (err, results) => {
        if (err) {
            console.error("❌ SQL Error al obtener historial personal:", err.message, err.sql); 
            return res.status(500).json({ error: "Error en el servidor al obtener historial. Ver consola de Node para detalles SQL." });
        }
        res.json(results);
    });
});


// ✅ NUEVA RUTA: PUT /api/usuario/pedido-personal/estado/:id
// Permite al usuario CANCELAR el pedido si no ha pasado 1 hora.
router.put('/pedido-personal/estado/:id', (req, res) => {
    const idPedido = req.params.id;
    const { estado } = req.body; // Esperamos { estado: 'CANCELADO' }

    if (!estado || estado !== 'CANCELADO') {
        return res.status(400).json({ error: "El estado proporcionado no es válido para esta acción." });
    }

    // 1. Verificar la fecha y hora del pedido
    const checkTimeSql = "SELECT fecha_pedido, estado FROM pedido_personal WHERE id = ?";
    
    connection.query(checkTimeSql, [idPedido], (err, results) => {
        if (err) return res.status(500).json({ error: "Error al verificar el tiempo del pedido." });
        if (results.length === 0) return res.status(404).json({ error: "Pedido no encontrado." });

        const pedido = results[0];
        const fechaPedido = new Date(pedido.fecha_pedido);
        const estadoActual = pedido.estado ? pedido.estado.toUpperCase() : 'PENDIENTE';
        const ahora = new Date();
        
        // Calcular la hora límite de cancelación (fecha de pedido + 60 minutos)
        const horaLimite = new Date(fechaPedido.getTime() + 60 * 60 * 1000); 

        if (estadoActual === 'CANCELADO') {
            return res.status(403).json({ error: "El pedido ya está cancelado." });
        }
        
        // 2. Aplicar la regla de 1 hora
        if (ahora > horaLimite) {
            const tiempoTranscurrido = Math.floor((ahora - fechaPedido) / (60 * 1000));
            return res.status(403).json({ error: `El tiempo límite de 1 hora para cancelar ha expirado. (Tiempo transcurrido: ${tiempoTranscurrido} minutos)` });
        }

        // 3. Si pasa la verificación de tiempo, actualizamos el estado a CANCELADO
        const updateSql = "UPDATE pedido_personal SET estado = 'CANCELADO' WHERE id = ?";
        
        connection.query(updateSql, [idPedido], (err, result) => {
            if (err) {
                console.error("Error al cancelar pedido:", err);
                return res.status(500).json({ error: "Error al actualizar el estado del pedido a CANCELADO." });
            }
            res.json({ message: "Pedido cancelado con éxito dentro del límite de 1 hora." });
        });
    });
});


// ✅ NUEVA RUTA: Modificar Perfil Básico (Usuario Común)
router.put("/perfil/:email", (req, res) => {
    const emailOriginal = req.params.email;
    const { nombre, apellido, email } = req.body;

    if (!nombre || !apellido || !email) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const sql = `
        UPDATE usuario SET 
            nombre = ?, apellido = ?, email = ?
        WHERE email = ?`;
        
    const params = [nombre, apellido, email, emailOriginal];

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error al modificar perfil básico:", err);
            if (err.errno === 1062) {
                 return res.status(409).json({ error: "El nuevo email ya está registrado." });
            }
            return res.status(500).json({ error: "Error al modificar el perfil." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        res.json({ message: "OK" });
    });
});

// ✅ MENÚ FILTRADO POR ASISTENCIA (solo para empleados)
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            d.nombre AS nombre_dia,
            im.id,
            im.nombre,
            im.descripcion,
            im.categoria,
            im.imagen AS imagen_url
        FROM usuario u
        JOIN menu m ON m.es_actual = 1
        JOIN menu_item_menu mim ON mim.id_menu = m.id
        JOIN dia d ON d.id = mim.id_dia
        JOIN item_menu im ON im.id = mim.id_item_menu
        WHERE u.id = ?
          AND (
            (d.nombre = 'LUNES' AND u.asiste_lunes = 1) OR
            (d.nombre = 'MARTES' AND u.asiste_martes = 1) OR
            (d.nombre = 'MIERCOLES' AND u.asiste_miercoles = 1) OR
            (d.nombre = 'JUEVES' AND u.asiste_jueves = 1) OR
            (d.nombre = 'VIERNES' AND u.asiste_viernes = 1)
          );
    `;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener menú del usuario:", err);
            return res.status(500).json({ error: "Error en el servidor." });
        }

        res.json(results);
    });
});
module.exports = router;