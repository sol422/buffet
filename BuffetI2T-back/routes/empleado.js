const express = require("express");
const router = express.Router();
const connection = require("../db/connection");
const { DiaEnum, SemanaEnum } = require("../constants/enums");

//  registrar un nuevo usuario/empleado 
router.post("/", (req, res) => {
    const { nombre, apellido, email, password } = req.body;
    if (!nombre || !apellido || !email || !password) {
        return res.status(400).send("Faltan datos obligatorios");
    }
    const verificarEmailSql = "SELECT * FROM usuario WHERE email = ?";
    connection.query(verificarEmailSql, [email], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).send("Error interno");
        }
        if (results.length > 0) {
            return res.status(409).send("FAIL");
        }
        const insertarSql = "INSERT INTO usuario (nombre, apellido, email, password) VALUES (?, ?, ?, ?)";
        connection.query(insertarSql, [nombre, apellido, email, password], (err, result) => {
            if (err) {
                console.error("Error al insertar usuario:", err);
                return res.status(500).send("Error interno");
            }
            const nuevoUsuarioId = result.insertId;
            const sqlEmpleado = "INSERT INTO empleado (id_usuario) VALUES (?)";
            connection.query(sqlEmpleado, [nuevoUsuarioId], (err, result) => {
                if (err) {
                    console.error("Error al insertar en tabla empleado:", err);
                    return res.status(500).send("Error interno");
                }
                res.status(200).send("OK");
            });
        });
    });
});


router.get('/menu-actual/:idUsuario', (req, res) => {
    const { idUsuario } = req.params;

    const sqlUsuario = "SELECT asiste_lunes, asiste_martes, asiste_miercoles, asiste_jueves, asiste_viernes FROM usuario WHERE id = ?";
    
    connection.query(sqlUsuario, [idUsuario], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error("Error al buscar usuario o su asistencia:", err);
            return res.status(500).json({ error: 'No se pudo encontrar el usuario o sus días de asistencia.' });
        }
        
        const asistencia = userResults[0];
        const diasQueAsiste = [];
        if (asistencia.asiste_lunes) diasQueAsiste.push('LUNES');
        if (asistencia.asiste_martes) diasQueAsiste.push('MARTES');
        if (asistencia.asiste_miercoles) diasQueAsiste.push('MIERCOLES');
        if (asistencia.asiste_jueves) diasQueAsiste.push('JUEVES');
        if (asistencia.asiste_viernes) diasQueAsiste.push('VIERNES');

        if (diasQueAsiste.length === 0) {
            return res.json([]);
        }

        const sqlMenu = `
            SELECT 
                m.id AS id_menu,
                m.semana, 
                im.id, 
                im.nombre, 
                im.descripcion, 
                im.categoria, 
                im.stock, 
                d.nombre AS nombre_dia, 
                im.imagen
            FROM menu_item_menu mim
            JOIN item_menu im ON mim.id_item_menu = im.id
            JOIN dia d ON mim.id_dia = d.id
            JOIN menu m ON mim.id_menu = m.id
            WHERE m.es_actual = 1 AND d.nombre IN (?)
            ORDER BY d.id, im.categoria;
        `;

        connection.query(sqlMenu, [diasQueAsiste], (err, menuResults) => {
            if (err) {
                console.error("Error al obtener el menú filtrado:", err);
                return res.status(500).json({ error: 'Error al obtener el menú.' });
            }
            const menuConRutasCorregidas = menuResults.map(item => ({ ...item, imagen_url: `../img/${item.imagen}` }));
            res.json(menuConRutasCorregidas);
        });
    });
});

/*router.post('/pedido', (req, res) => {
    const { id_usuario, semana, items } = req.body;
    if (!id_usuario || !semana || !items || items.length === 0) {
        return res.status(400).json({ error: "Faltan datos para crear el pedido." });
    }
    connection.beginTransaction(err => {
        if (err) { 
            console.error("Error al iniciar transacción:", err);
            return res.status(500).json({ error: "Error al iniciar la transacción." });
        }
        const fecha_pedido = new Date();
        const pedidoSql = 'INSERT INTO pedido (id_empleado, semana, fecha_pedido) VALUES (?, ?, ?)';
        
        connection.query('SELECT id FROM empleado WHERE id_usuario = ?', [id_usuario], (err, empleadoResult) => {
            if (err || empleadoResult.length === 0) {
                return connection.rollback(() => res.status(500).json({ error: "Error al encontrar el empleado." }));
            }
            const id_empleado = empleadoResult[0].id;

            connection.query(pedidoSql, [id_empleado, semana, fecha_pedido], (err, result) => {
                if (err) {
                    console.error("Error al guardar en tabla pedido:", err);
                    return connection.rollback(() => res.status(500).json({ error: "Error al guardar el pedido." }));
                }
                const pedidoId = result.insertId;
                const pedidoItemsValues = items.map(item => [pedidoId, item.id, item.cantidad]);
                const itemsSql = 'INSERT INTO pedido_item_menu (id_pedido, id_item_menu, cantidad) VALUES ?';
                connection.query(itemsSql, [pedidoItemsValues], (err, result) => {
                    if (err) {
                        console.error("Error al guardar en tabla pedido_item_menu:", err);
                        return connection.rollback(() => res.status(500).json({ error: "Error al guardar los items del pedido." }));
                    }
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => res.status(500).json({ error: "Error al finalizar la transacción." }));
                        }
                        res.status(201).json({ message: 'Pedido confirmado y guardado con éxito.', pedidoId: pedidoId });
                    });
                });
            });
        });
    });
});*/

//  OBTENER HISTORIAL DE PEDIDOS DE UN USUARIO 
router.get('/pedidos/:idUsuario', (req, res) => {
    const { idUsuario } = req.params;
    const sql = `
        SELECT 
            p.id AS id_pedido, p.semana, p.fecha_pedido, pim.cantidad,
            im.nombre AS nombre_plato, im.categoria, im.imagen
        FROM pedido p
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        JOIN item_menu im ON pim.id_item_menu = im.id
        JOIN empleado e ON p.id_empleado = e.id
        WHERE e.id_usuario = ?
        ORDER BY p.fecha_pedido DESC, im.nombre;
    `;
    connection.query(sql, [idUsuario], (err, results) => {
        if (err) {
            console.error("Error al obtener el historial de pedidos:", err);
            return res.status(500).json({ error: "Error en el servidor." });
        }
        const historialConImagenes = results.map(item => ({
            ...item,
            imagen_url: `../img/${item.imagen}`
        }));
        res.json(historialConImagenes);
    });
});

//MODIFICAR UN EMPLEADO
router.put("/:email", (req, res) => {
    const emailOriginal = req.params.email;
    const { nombre, apellido, email, asiste_lunes, asiste_martes, asiste_miercoles, asiste_jueves, asiste_viernes } = req.body;
    if (!nombre || !apellido || !email) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const sql = `
        UPDATE usuario SET 
            nombre = ?, apellido = ?, email = ?,
            asiste_lunes = ?, asiste_martes = ?, asiste_miercoles = ?,
            asiste_jueves = ?, asiste_viernes = ?
        WHERE email = ?`;
    const params = [
        nombre, apellido, email,
        asiste_lunes, asiste_martes, asiste_miercoles, asiste_jueves, asiste_viernes,
        emailOriginal
    ];
    connection.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error al modificar empleado:", err);
            return res.status(500).json({ error: "Error al modificar empleado" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Empleado no encontrado" });
        }
        res.send("OK");
    });
});

module.exports = router;