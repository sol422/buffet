const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

router.get("/menu/actual", (req, res) => {
    const sql = `
        SELECT im.id, im.nombre, im.descripcion, im.categoria, im.stock, d.nombre AS nombre_dia, im.imagen
        FROM menu_item_menu mim
        JOIN item_menu im ON mim.id_item_menu = im.id
        JOIN dia d ON mim.id_dia = d.id
        JOIN menu m ON mim.id_menu = m.id
        WHERE m.es_actual = 1 ORDER BY d.id, im.categoria;`;
    connection.query(sql, (err, results) => {
        if (err) { console.error("Error SQL en /menu/actual:", err); return res.status(500).json({ error: "Error en el servidor" }); }
        const menuConRutasCorregidas = results.map(item => ({ ...item, imagen_url: `../img/${item.imagen}` }));
        res.json(menuConRutasCorregidas);
    });
});

router.get("/menu/todos", (req, res) => {
    const sql = `
        SELECT 
            m.id AS id_menu,
            m.semana,
            m.es_actual,
            im.id AS id_item_menu, -- <-- ID del plato que necesitamos
            im.nombre AS nombre_plato,
            im.categoria,
            d.id AS id_dia, -- <-- ID del día que necesitamos
            d.nombre AS nombre_dia
        FROM menu m
        JOIN menu_item_menu mim ON m.id = mim.id_menu
        JOIN item_menu im ON mim.id_item_menu = im.id
        JOIN dia d ON mim.id_dia = d.id
        ORDER BY m.semana, d.id, im.nombre;`;
    connection.query(sql, (err, results) => {
        if (err) { console.error("Error SQL en /menu/todos:", err); return res.status(500).json({ error: "Error en el servidor." }); }
        res.json(results);
    });
});

router.post("/menu/establecer-actual/:id", (req, res) => {
    const menuId = req.params.id;
    connection.beginTransaction(err => {
        if (err) { console.error("Error transaction:", err); return res.status(500).json({ error: "Error en el servidor." }); }
        const sqlReset = "UPDATE menu SET es_actual = 0";
        connection.query(sqlReset, (err, result) => {
            if (err) return connection.rollback(() => res.status(500).json({ error: "Error al actualizar menús." }));
            const sqlSet = "UPDATE menu SET es_actual = 1 WHERE id = ?";
            connection.query(sqlSet, [menuId], (err, result) => {
                if (err) return connection.rollback(() => res.status(500).json({ error: "Error al actualizar el menú." }));
                connection.commit(err => {
                    if (err) return connection.rollback(() => res.status(500).json({ error: "Error al finalizar la operación." }));
                    res.json({ message: "OK" });
                });
            });
        });
    });
});

router.post("/menu/asignar-item", (req, res) => {
    const { id_menu, id_item_menu, dias } = req.body;
    if (!id_menu || !id_item_menu || !dias || !Array.isArray(dias) || dias.length === 0) {
        return res.status(400).json({ error: "Faltan datos o los datos son incorrectos para la asignación." });
    }
    const values = dias.map(id_dia => [id_menu, id_item_menu, id_dia]);

    console.log("Valores que se intentarán insertar en la BD:", values);

    const sql = `INSERT INTO menu_item_menu (id_menu, id_item_menu, id_dia) VALUES ?`;
    connection.query(sql, [values], (err, result) => {
        if (err) { 
            console.error("Error al asignar el plato al menú:", err); 
            return res.status(500).send("Error al asignar el plato a los días."); 
        }
        res.json({ message: "OK" });
    });
});

// CATÁLOGO DE PLATOS
router.get("/items", (req, res) => {
    const sql = "SELECT id, nombre, descripcion, categoria, stock, imagen FROM item_menu ORDER BY nombre";
    connection.query(sql, (err, results) => {
        if (err) { console.error("Error SQL en /items:", err); return res.status(500).json({ error: "Error en el servidor" }); }
        res.json(results);
    });
});

// CREAR UN PLATO NUEVO
router.post("/items/agregar", (req, res) => {
    const { nombre, stock, descripcion, categoria } = req.body;
    const imagen = `${nombre.toLowerCase().replace(/\s/g, '_')}.jpg`;
    const sql = `INSERT INTO item_menu (nombre, stock, descripcion, categoria, imagen) VALUES (?, ?, ?, ?, ?)`;

    connection.query(sql, [nombre, stock, descripcion, categoria, imagen], (err, result) => {
        if (err) { 
            console.error("Error SQL en /items/agregar:", err); 
            return res.status(500).send("Error al crear el plato en el catálogo."); 
        }
        connection.query('COMMIT', (commitErr) => {
            if (commitErr) {
                console.error("Error al hacer COMMIT:", commitErr);
                return res.status(500).send("El plato se insertó pero no se pudo confirmar.");
            }
            console.log("COMMIT realizado con éxito.");
            res.status(201).json({ message: "OK", insertId: result.insertId });
        });
    });
}); 

router.delete('/menu/remover-item', (req, res) => {
    const { id_menu, id_item_menu, id_dia } = req.body;

    if (!id_menu || !id_item_menu || !id_dia) {
        return res.status(400).json({ error: "Faltan los IDs necesarios para eliminar la asignación." });
    }

    const sql = `
        DELETE FROM menu_item_menu 
        WHERE id_menu = ? AND id_item_menu = ? AND id_dia = ?;
    `;

    connection.query(sql, [id_menu, id_item_menu, id_dia], (err, result) => {
        if (err) {
            console.error("Error al eliminar la asignación:", err);
            return res.status(500).json({ error: "Error en la base de datos." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se encontró la asignación para eliminar." });
        }
        res.json({ message: "Asignación eliminada con éxito." });
    });
});


router.get('/pedidos/resumen-semanal', (req, res) => {
    const sql = `
        SELECT 
            u.nombre AS nombre_empleado,
            u.apellido AS apellido_empleado,
            im.nombre AS nombre_plato,
            pim.cantidad,
            p.fecha_pedido,
            p.id AS id_pedido
        FROM pedido p
        JOIN empleado e ON p.id_empleado = e.id
        JOIN usuario u ON e.id_usuario = u.id
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        JOIN item_menu im ON pim.id_item_menu = im.id
        WHERE p.semana = (SELECT id FROM menu WHERE es_actual = 1 LIMIT 1)
        ORDER BY p.fecha_pedido, u.apellido, u.nombre;
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener el resumen de pedidos:", err);
            return res.status(500).json({ error: "Error en el servidor." });
        }
        res.json(results);
    });
});

module.exports = router;