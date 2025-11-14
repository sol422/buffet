const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

// ✅ POST /api/pedido — Confirmar pedido
router.post('/', (req, res) => {
    const { id_usuario, semana, detalles } = req.body;

    if (!id_usuario || !semana || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: "Faltan datos (usuario, semana o detalles) para crear el pedido." });
    }

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Error al iniciar la transacción." });

        const fecha_pedido = new Date();
        const pedidoSql = 'INSERT INTO pedido (id_empleado, semana, fecha_pedido) VALUES (?, ?, ?)';

        connection.query('SELECT id FROM empleado WHERE id_usuario = ?', [id_usuario], (err, empleadoResult) => {
            if (err || empleadoResult.length === 0) {
                return connection.rollback(() => res.status(500).json({ error: "Error al encontrar el empleado." }));
            }

            const id_empleado = empleadoResult[0].id;

            connection.query(pedidoSql, [id_empleado, semana, fecha_pedido], (err, result) => {
                if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar el pedido." }));

                const pedidoId = result.insertId;
                const pedidoItemsValues = detalles.map(item => [pedidoId, item.id_item_menu, item.cantidad]);
                const itemsSql = 'INSERT INTO pedido_item_menu (id_pedido, id_item_menu, cantidad) VALUES ?';

                connection.query(itemsSql, [pedidoItemsValues], (err) => {
                    if (err) return connection.rollback(() => res.status(500).json({ error: "Error al guardar los items del pedido." }));

                    connection.commit(err => {
                        if (err) return connection.rollback(() => res.status(500).json({ error: "Error al finalizar la transacción." }));
                        res.status(201).json({ message: 'Pedido confirmado y guardado con éxito.', pedidoId });
                    });
                });
            });
        });
    });
});

// ✅ GET /api/empleado/pedidos/:id — Historial con semana y mes
router.get('/empleado/pedidos/:id', (req, res) => {
    const id_usuario = req.params.id;

    const sql = `
        SELECT 
            p.id_pedido,
            p.fecha_pedido,
            WEEK(p.fecha_pedido, 1) AS semana,
            CONCAT(UCASE(LEFT(MONTHNAME(p.fecha_pedido), 1)), LCASE(SUBSTRING(MONTHNAME(p.fecha_pedido), 2))) AS mes,
            i.id_item_menu,
            i.nombre_plato,
            i.categoria,
            i.imagen_url,
            pim.cantidad
        FROM pedido p
        JOIN empleado e ON p.id_empleado = e.id
        JOIN pedido_item_menu pim ON p.id_pedido = pim.id_pedido
        JOIN item_menu i ON pim.id_item_menu = i.id_item_menu
        WHERE e.id_usuario = ?
        ORDER BY p.fecha_pedido DESC
    `;

    connection.query(sql, [id_usuario], (err, results) => {
        if (err) {
            console.error("Error al obtener historial:", err);
            return res.status(500).json({ error: "Error al obtener historial de pedidos." });
        }
        res.json(results);
    });
});

// ✅ GET /api/pedido/:id — Repetir pedido
router.get('/:id', (req, res) => {

    const id_pedido = req.params.id;

    const sql = `
        SELECT 
            i.id_item_menu AS id,
            i.nombre_plato AS nombre,
            i.categoria,
            i.descripcion,
            i.imagen_url,
            pim.cantidad,
            p.semana,
            ms.dia_semana AS nombre_dia
        FROM pedido p
        JOIN pedido_item_menu pim ON p.id_pedido = pim.id_pedido
        JOIN item_menu i ON pim.id_item_menu = i.id_item_menu
        JOIN menu_semanal ms ON ms.id_item_menu = i.id_item_menu AND ms.semana = p.semana
        WHERE p.id_pedido = ?
    `;

    connection.query(sql, [id_pedido], (err, results) => {
        if (err) {
            console.error("Error al repetir pedido:", err);
            return res.status(500).json({ error: "No se pudo cargar el pedido para repetir." });
        }
        res.json(results);
    });
});

module.exports = router;
