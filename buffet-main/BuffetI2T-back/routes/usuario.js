const express = require("express");
const router = express.Router(); 
const connection = require("../db/connection");

// ✅ LOGIN UNIFICADO: Solo existen 2 Roles (Admin o Empleado)
router.post("/login", (req, res) => { 
    const { email, password } = req.body;
    // 1. Validar credenciales básicas
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
        };

        // 2. Verificar si es Administrador
        const checkAdmin = "SELECT * FROM administrador WHERE id_usuario = ?";
        connection.query(checkAdmin, [usuario.id], (err, adminResults) => {
            if (err) return res.status(500).json({ error: "Error al verificar rol" });
            
            if (adminResults.length > 0) {
                datosUsuario.rol = "ADMINISTRADOR";
                return res.json(datosUsuario);
            }

            // 3. Si no es Admin, asumimos que ES Empleado
            const checkEmpleado = "SELECT * FROM empleado WHERE id_usuario = ?";
            connection.query(checkEmpleado, [usuario.id], (err, empResults) => {
                if (err) return res.status(500).json({ error: "Error al verificar rol" });
                
                if (empResults.length > 0) {
                    datosUsuario.rol = "EMPLEADO";
                    res.json(datosUsuario);
                } else {
                    datosUsuario.rol = "EMPLEADO"; 
                    res.json(datosUsuario);
                }
            });
        });
    });
});

// ✅ PERFIL (Datos + Asistencia)
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

// ✅ MODIFICAR PERFIL BÁSICO
router.put("/perfil/:email", (req, res) => {
    const emailOriginal = req.params.email;
    const { nombre, apellido, email } = req.body;

    if (!nombre || !apellido || !email) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const sql = `UPDATE usuario SET nombre = ?, apellido = ?, email = ? WHERE email = ?`;
    
    connection.query(sql, [nombre, apellido, email, emailOriginal], (err, result) => {
        if (err) {
            if (err.errno === 1062) return res.status(409).json({ error: "El email ya está registrado." });
            return res.status(500).json({ error: "Error al modificar perfil." });
        }
        res.json({ message: "OK" });
    });
});

// ✅ GESTIÓN DE PEDIDOS (Funcionalidad unificada para el Empleado - Express)
// IMPLEMENTA VALIDACIÓN Y DESCUENTO DE STOCK
router.post('/pedido-personal', (req, res) => {
    const { id_usuario, detalles } = req.body;

    if (!id_usuario || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan datos para el pedido." });
    }

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Error de transacción." });

        // 1. VERIFICACIÓN Y DESCUENTO DE STOCK (Transaccional)
        const stockPromises = detalles.map(item => {
            return new Promise((resolve, reject) => {
                const checkStockSql = "SELECT stock, nombre FROM item_menu WHERE id = ?";
                connection.query(checkStockSql, [item.id_item_menu], (err, itemResult) => {
                    if (err || itemResult.length === 0) return reject(`Error al verificar stock del ítem ${item.id_item_menu}`);
                    
                    const plato = itemResult[0];
                    if (plato.stock < item.cantidad) {
                        return reject(`Stock insuficiente para: ${plato.nombre}. Disponible: ${plato.stock}, Solicitado: ${item.cantidad}`);
                    }

                    const updateStockSql = "UPDATE item_menu SET stock = stock - ? WHERE id = ?";
                    connection.query(updateStockSql, [item.cantidad, item.id_item_menu], (err) => {
                        if (err) return reject(`Error al descontar stock del ítem ${item.id_item_menu}`);
                        resolve();
                    });
                });
            });
        });

        Promise.all(stockPromises)
            .then(() => {
                // 2. Insertar encabezado del pedido_personal
                const pedidoSql = 'INSERT INTO pedido_personal (id_usuario) VALUES (?)';
                
                connection.query(pedidoSql, [id_usuario], (err, result) => {
                    if (err) return connection.rollback(() => res.status(500).json({ error: "Error al crear pedido." }));

                    const pedidoId = result.insertId;
                    const pedidoItemsValues = detalles.map(item => [pedidoId, item.id_item_menu, item.cantidad]);
                    const itemsSql = 'INSERT INTO pedido_personal_item (id_pedido_personal, id_item_menu, cantidad) VALUES ?';

                    // 3. Insertar items del pedido_personal
                    connection.query(itemsSql, [pedidoItemsValues], (err) => {
                        if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar items." }));

                        // 4. Commit final si todo fue bien
                        connection.commit(err => {
                            if (err) return connection.rollback(() => res.status(500).json({ error: "Error final de transacción." }));
                            res.status(201).json({ message: 'Pedido confirmado.', pedidoId: pedidoId });
                        });
                    });
                });
            })
            .catch(error => {
                // Si falla la validación de stock, hacer Rollback de toda la transacción
                connection.rollback(() => res.status(409).json({ error: `Fallo de Stock: ${error}` }));
            });
    });
});

// ✅ HISTORIAL DE PEDIDOS PERSONAL (Usado para Express)
router.get('/historial-personal/:id', (req, res) => {
    const idUsuario = req.params.id;
    const sql = `
        SELECT 
            pp.id AS id_pedido, pp.fecha_pedido, pp.estado AS estado_pedido,
            ppi.cantidad, im.nombre AS nombre_plato, im.categoria, im.imagen AS imagen_url
        FROM pedido_personal pp
        JOIN pedido_personal_item ppi ON pp.id = ppi.id_pedido_personal
        JOIN item_menu im ON ppi.id_item_menu = im.id
        WHERE pp.id_usuario = ?
        ORDER BY pp.fecha_pedido DESC;
    `;
    connection.query(sql, [idUsuario], (err, results) => {
        if (err) return res.status(500).json({ error: "Error al obtener historial." });
        res.json(results);
    });
});

// ✅ CANCELAR PEDIDO PERSONAL (Lógica de 1 hora)
// NOTA: Esta ruta solo cambia el estado, NO REPONE STOCK.
// Para reponer stock, la función debería ser un DELETE y replicar la lógica de reposición de pedidos.js
router.put('/pedido-personal/estado/:id', (req, res) => {
    const idPedido = req.params.id;
    const { estado } = req.body; 

    if (estado !== 'CANCELADO') return res.status(400).json({ error: "Acción inválida." });

    const checkTimeSql = "SELECT fecha_pedido, estado FROM pedido_personal WHERE id = ?";
    connection.query(checkTimeSql, [idPedido], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "Pedido no encontrado." });

        const pedido = results[0];
        if (pedido.estado === 'CANCELADO') return res.status(403).json({ error: "Ya está cancelado." });

        const fechaPedido = new Date(pedido.fecha_pedido);
        const ahora = new Date();
        const horaLimite = new Date(fechaPedido.getTime() + 60 * 60 * 1000); // 1 hora

        if (ahora > horaLimite) {
            return res.status(403).json({ error: "Pasó más de 1 hora, no se puede cancelar." });
        }
        
        // El pedido Express queda cancelado, pero NO SE REPONE STOCK en esta ruta.
        // Se recomienda usar DELETE /api/pedido/:id del archivo pedidos.js para unificar la lógica de cancelación con reposición de stock.

        const updateSql = "UPDATE pedido_personal SET estado = 'CANCELADO' WHERE id = ?";
        connection.query(updateSql, [idPedido], (err) => {
            if (err) return res.status(500).json({ error: "Error al cancelar." });
            res.json({ message: "Pedido cancelado." });
        });
    });
});

module.exports = router;