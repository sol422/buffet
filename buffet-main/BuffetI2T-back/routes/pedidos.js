const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

// [POST] /api/pedido — Confirmar pedido (Implementa lógica de Stock)
router.post('/', (req, res) => {
    const { id_usuario, semana, detalles } = req.body;

    if (!id_usuario || !semana || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan datos (usuario, semana o detalles) para crear el pedido." });
    }

    connection.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).json({ error: "Error al iniciar la transacción." });
        }

        const fecha_pedido = new Date();
        const pedidoSql = 'INSERT INTO pedido (id_empleado, semana, fecha_pedido) VALUES (?, ?, ?)';

        // 1. Obtener ID de empleado
        connection.query('SELECT id FROM empleado WHERE id_usuario = ?', [id_usuario], (err, empleadoResult) => {
            if (err || empleadoResult.length === 0) {
                return connection.rollback(() => res.status(500).json({ error: "Error al encontrar el empleado." }));
            }

            const id_empleado = empleadoResult[0].id;

            // 2. Insertar encabezado del pedido
            connection.query(pedidoSql, [id_empleado, semana, fecha_pedido], (err, result) => {
                if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar el pedido." }));

                const pedidoId = result.insertId;
                
                // ----------------------------------------------------
                // 3. VERIFICACIÓN Y DESCUENTO DE STOCK
                // ----------------------------------------------------
                const stockPromises = detalles.map(item => {
                    return new Promise((resolve, reject) => {
                        // A. Verificar Stock
                        const checkStockSql = "SELECT stock, nombre FROM item_menu WHERE id = ?";
                        connection.query(checkStockSql, [item.id_item_menu], (err, itemResult) => {
                            if (err || itemResult.length === 0) return reject(`Error al verificar stock del ítem ${item.id_item_menu}`);
                            
                            const plato = itemResult[0];
                            if (plato.stock < item.cantidad) {
                                // Falla la validación
                                return reject(`Stock insuficiente para: ${plato.nombre}. Disponible: ${plato.stock}, Solicitado: ${item.cantidad}`);
                            }

                            // B. Descontar Stock si es suficiente
                            const updateStockSql = "UPDATE item_menu SET stock = stock - ? WHERE id = ?";
                            connection.query(updateStockSql, [item.cantidad, item.id_item_menu], (err) => {
                                if (err) return reject(`Error al descontar stock del ítem ${item.id_item_menu}`);
                                resolve(); // Stock descontado con éxito
                            });
                        });
                    });
                });

                // Ejecutar todas las promesas de stock
                Promise.all(stockPromises)
                    .then(() => {
                        // 4. Si todo el stock es válido y descontado, guardar los items del pedido
                        const pedidoItemsValues = detalles.map(item => [
                            pedidoId,
                            item.id_item_menu,
                            item.id_dia || null, 
                            item.cantidad
                        ]);
                        
                        const itemsSql = `
                            INSERT INTO pedido_item_menu 
                            (id_pedido, id_item_menu, id_dia, cantidad) 
                            VALUES ?
                        `;

                        connection.query(itemsSql, [pedidoItemsValues], (err) => {
                            if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar los items del pedido." }));

                            // 5. Commit final si todo fue bien 
                            connection.commit(err => {
                                if (err) return connection.rollback(() => res.status(500).json({ error: "Error al finalizar la transacción." }));
                                res.status(201).json({ message: 'Pedido confirmado y guardado con éxito.', pedidoId });
                            });
                        });
                    })
                    .catch(error => {
                        // Si alguna promesa falla (stock insuficiente), hacer Rollback
                        connection.rollback(() => res.status(409).json({ error: `Fallo de Stock: ${error}` }));
                    });
                // ----------------------------------------------------
                
            });
        });
    });
});

// ✅ GET /api/pedido/empleado/pedidos/:id — Historial con semana y mes (Incluye id_dia para Repetir)
router.get('/empleado/pedidos/:id', (req, res) => {
    const id_usuario = req.params.id;

    const sql = `
        SELECT 
            p.id AS id_pedido,
            p.fecha_pedido,
            WEEK(p.fecha_pedido, 1) AS semana,
            CONCAT(
                UPPER(LEFT(MONTHNAME(p.fecha_pedido), 1)), 
                LOWER(SUBSTRING(MONTHNAME(p.fecha_pedido), 2))
            ) AS mes,
            i.id AS id_item_menu,
            i.nombre AS nombre_plato,
            i.categoria,
            i.imagen AS imagen_url,
            pim.cantidad,
            pim.id_dia 

        FROM pedido p
        JOIN empleado e ON p.id_empleado = e.id
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        JOIN item_menu i ON pim.id_item_menu = i.id
        WHERE e.id_usuario = ?
        ORDER BY p.fecha_pedido DESC
    `;

    connection.query(sql, [id_usuario], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener historial:", err.sqlMessage);
            return res.status(500).json({ error: "Error al obtener historial de pedidos." });
        }
        res.json(results);
    });
});

// ✅ GET /api/pedido/:id — Repetir pedido (empleado). LEFT JOIN dia por si acaso.
router.get('/:id', (req, res) => {
    const id_pedido = req.params.id;

    const sql = `
        SELECT 
            im.id AS id_item_menu,
            im.nombre,
            im.categoria,
            im.descripcion,
            im.imagen AS imagen_url,
            d.nombre AS nombre_dia,
            d.id AS id_dia, 
            pim.cantidad,
            p.semana

        FROM pedido p
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        JOIN item_menu im ON pim.id_item_menu = im.id
        LEFT JOIN dia d ON d.id = pim.id_dia
        WHERE p.id = ?
    `;

    connection.query(sql, [id_pedido], (err, results) => {
        if (err) {
            console.error("❌ Error al repetir pedido:", err);
            return res.status(500).json({ error: "No se pudo cargar el pedido para repetir." });
        }
        res.json(results);
    });
});

// ✅ NUEVA RUTA: GET /api/pedido/personal/:id — Repetir pedido personal (express)
router.get('/personal/:id', (req, res) => {
    const id_pedido_personal = req.params.id;

    const sql = `
        SELECT 
            p.id AS pedido_personal_id,
            p.fecha_pedido,
            p.estado AS estado_pedido,
            ppi.id_item_menu AS id_item_menu,
            im.nombre,
            im.categoria,
            im.imagen AS imagen_url,
            ppi.cantidad
        FROM pedido_personal p
        JOIN pedido_personal_item ppi ON p.id = ppi.id_pedido_personal
        JOIN item_menu im ON ppi.id_item_menu = im.id
        WHERE p.id = ?
    `;

    connection.query(sql, [id_pedido_personal], (err, results) => {
        if (err) {
            console.error("❌ Error al cargar pedido personal:", err);
            return res.status(500).json({ error: "No se pudo cargar el pedido personal para repetir." });
        }
        res.json(results);
    });
});

// ✅ DELETE /api/pedido/:id — Cancelar pedido (Implementa Reposición de Stock)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const checkSql = `
        SELECT p.fecha_pedido, pim.id_item_menu, pim.cantidad
        FROM pedido p
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        WHERE p.id = ?
    `;
    
    connection.query(checkSql, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado o ya cancelado." });
        }

        const fechaPedido = new Date(results[0].fecha_pedido);
        const ahora = new Date();
        const diffMs = ahora - fechaPedido;
        const unaHora = 60 * 60 * 1000;
        
        const itemsParaDevolverStock = results.map(r => ({ id: r.id_item_menu, cantidad: r.cantidad }));

        if (diffMs > unaHora) {
            return res.status(403).json({ error: "El tiempo límite para cancelar (1 hora) ha expirado." });
        }

        connection.beginTransaction(err => {
            if (err) return res.status(500).json({ error: "Error al iniciar transacción de cancelación." });

            const stockPromises = itemsParaDevolverStock.map(item => {
                return new Promise((resolve, reject) => {
                    const updateStockSql = "UPDATE item_menu SET stock = stock + ? WHERE id = ?";
                    connection.query(updateStockSql, [item.cantidad, item.id], (err) => {
                        if (err) return reject(`Error al reponer stock del ítem ${item.id}`);
                        resolve();
                    });
                });
            });

            Promise.all(stockPromises)
                .then(() => {
                    const deleteSql = "DELETE FROM pedido WHERE id = ?";
                    connection.query(deleteSql, [id], (err) => {
                        if (err) {
                            console.error("Error al eliminar pedido:", err);
                            return connection.rollback(() => res.status(500).json({ error: "Error interno al eliminar el pedido." }));
                        }
                        connection.commit(err => {
                            if (err) return connection.rollback(() => res.status(500).json({ error: "Error al finalizar transacción de cancelación." }));
                            res.json({ message: "Pedido cancelado y stock repuesto con éxito." });
                        });
                    });
                })
                .catch(error => {
                    connection.rollback(() => res.status(500).json({ error: `Fallo al reponer stock: ${error}` }));
                });
        });
    });
});

module.exports = router;
