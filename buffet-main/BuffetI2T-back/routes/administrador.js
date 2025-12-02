const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

// ====================================================
// 1. GESTIÓN DE CATÁLOGO (PLATOS)
// ====================================================

// OBTENER TODOS LOS PLATOS
router.get("/items", (req, res) => {
    const sql = "SELECT id, nombre, descripcion, categoria, stock, imagen FROM item_menu ORDER BY nombre";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error SQL /items:", err);
            return res.status(500).json({ error: "Error al cargar el catálogo" });
        }
        res.json(results);
    });
});

// AGREGAR UN PLATO
router.post("/items/agregar", (req, res) => {
    const { nombre, stock, descripcion, categoria } = req.body;
    
    // Nombre de imagen autogenerado
    const imagen = `${nombre.toLowerCase().replace(/\s+/g, '_')}.jpg`; 

    const sql = "INSERT INTO item_menu (nombre, stock, descripcion, categoria, imagen) VALUES (?, ?, ?, ?, ?)";
    
    connection.query(sql, [nombre, stock, descripcion, categoria, imagen], (err, result) => {
        if (err) {
            console.error("Error SQL /items/agregar:", err);
            return res.status(500).send("Error al guardar en base de datos.");
        }
        res.status(201).json({ message: "Plato creado", id: result.insertId });
    });
});

// ====================================================
// 2. GESTIÓN DE MENÚS SEMANALES
// ====================================================

// VER TODOS LOS MENÚS (Para el panel de gestión - Usado para cargar selector de semanas)
router.get("/menu/todos", (req, res) => {
    const sql = `
        SELECT 
            m.id AS id_menu, m.semana, m.es_actual,
            im.id AS id_item_menu, im.nombre AS nombre_plato, im.categoria,
            d.id AS id_dia, d.nombre AS nombre_dia
        FROM menu m
        LEFT JOIN menu_item_menu mim ON m.id = mim.id_menu
        LEFT JOIN item_menu im ON mim.id_item_menu = im.id
        LEFT JOIN dia d ON mim.id_dia = d.id
        ORDER BY m.semana DESC, d.id;`;
        
    connection.query(sql, (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ error: "Error en servidor" }); }
        res.json(results);
    });
});

// CREAR SEMANA
router.post("/menu/crear", (req, res) => {
    const { semana } = req.body;
    if(!semana) return res.status(400).json({error: "Falta la semana"});
    
    connection.query("INSERT INTO menu (semana, es_actual) VALUES (?, 0)", [semana], (err, result) => {
        if(err) return res.status(500).json({error: "Error DB"});
        res.json({message: "OK", id: result.insertId});
    });
});

// PUBLICAR MENÚ
router.post("/menu/establecer-actual/:id", (req, res) => {
    const id = req.params.id;
    
    // PASO 1: Desactivar todos los menús (es_actual = 0)
    connection.query("UPDATE menu SET es_actual = 0", (err) => {
        if (err) {
            console.error("Error al desactivar menús:", err);
            return res.status(500).json({ error: "Error al desactivar menús" });
        }
        
        // PASO 2: Si el Paso 1 fue exitoso, activar el menú con el ID proporcionado
        connection.query("UPDATE menu SET es_actual = 1 WHERE id = ?", [id], (err) => {
            if(err) {
                console.error("Error al activar menú:", err);
                return res.status(500).json({ error: "Error al activar el nuevo menú" });
            }
            res.json({message: "OK"});
        });
    });
});

// ASIGNAR PLATO A DÍA
router.post("/menu/asignar-item", (req, res) => {
    const { id_menu, id_item_menu, dias } = req.body;
    const values = dias.map(d => [id_menu, id_item_menu, d]);
    
    connection.query("INSERT INTO menu_item_menu (id_menu, id_item_menu, id_dia) VALUES ?", [values], (err) => {
        if(err) { console.error(err); return res.status(500).json({error: "Error asignando"}); }
        res.json({message: "OK"});
    });
});

// ELIMINAR PLATO DE DÍA
router.delete("/menu/remover-item", (req, res) => {
    const { id_menu, id_item_menu, id_dia } = req.body;
    connection.query("DELETE FROM menu_item_menu WHERE id_menu=? AND id_item_menu=? AND id_dia=?", 
        [id_menu, id_item_menu, id_dia], (err) => {
            if(err) return res.status(500).json({error: "Error DB"});
            res.json({message: "OK"});
    });
});

// ====================================================
// 3. REPORTES DE PEDIDOS
// ====================================================

// 1. RESUMEN COCINA (Agrupado por día, plato y SEMANA)
router.get('/pedidos/resumen-cocina', (req, res) => {
    const semanaFiltro = req.query.semana; 
    let whereClause = '';

    // Si el Frontend pasa una semana, filtramos por ella.
    if (semanaFiltro) {
        whereClause = `WHERE p.semana = ${connection.escape(semanaFiltro)}`;
    } else {
        // Si no se pasa filtro (comportamiento original, buscar la activa)
        whereClause = 'WHERE p.semana = (SELECT semana FROM menu WHERE es_actual = 1 LIMIT 1)';
    }
    
    const sql = `
        SELECT 
            p.semana, 
            IFNULL(d.nombre, 'SIN DÍA') as nombre_dia, 
            im.nombre as nombre_plato, 
            im.categoria, 
            SUM(pim.cantidad) as cantidad_total
        FROM pedido p
        JOIN pedido_item_menu pim ON p.id = pim.id_pedido
        JOIN item_menu im ON pim.id_item_menu = im.id
        LEFT JOIN dia d ON pim.id_dia = d.id
        ${whereClause} -- Aplica el filtro de la semana seleccionada
        GROUP BY p.semana, nombre_dia, im.nombre, im.categoria
        ORDER BY 
            p.semana DESC, 
            CASE nombre_dia 
                WHEN 'LUNES' THEN 1
                WHEN 'MARTES' THEN 2
                WHEN 'MIERCOLES' THEN 3
                WHEN 'JUEVES' THEN 4
                WHEN 'VIERNES' THEN 5
                ELSE 6 
            END, 
            im.nombre;
    `;
        
    connection.query(sql, (err, r) => { 
        if (err) {
            console.error("Error en SQL /resumen-cocina:", err);
            return res.status(500).json({ error: "Error al generar resumen de cocina" });
        }
        res.json(r || []); 
    });
});

// 2. PEDIDOS EXPRESS (Pedidos Personales del día)
router.get('/pedidos/express', (req, res) => {
    const sql = `
        SELECT pp.id, u.nombre, u.apellido, pp.fecha_pedido, pp.estado, im.nombre as plato, ppi.cantidad
        FROM pedido_personal pp
        JOIN usuario u ON pp.id_usuario = u.id
        JOIN pedido_personal_item ppi ON pp.id = ppi.id_pedido_personal
        JOIN item_menu im ON ppi.id_item_menu = im.id
        WHERE DATE(pp.fecha_pedido) = CURDATE() 
        ORDER BY pp.fecha_pedido DESC`;
    connection.query(sql, (err, r) => { 
        if (err) {
             console.error("Error en SQL /pedidos/express:", err);
             return res.status(500).json({ error: "Error al cargar pedidos express" });
        }
        res.json(r || []); 
    });
});

// 3. CAMBIO DE ESTADO EXPRESS
router.put('/pedidos/express/:id/estado', (req, res) => {
    connection.query("UPDATE pedido_personal SET estado = ? WHERE id = ?", [req.body.estado, req.params.id], 
        (err) => {
            if (err) {
                 console.error('Error en SQL PUT estado:', err);
                 return res.status(500).json({ error: "Error al actualizar estado" });
            }
            res.json({message: "OK"})
        });
});

// 4. DETALLE SEMANAL POR EMPLEADO (PARA TABLA DE DETALLE)
router.get('/pedidos/detalle-semanal', (req, res) => {
    // *** CONSULTA CORREGIDA: Eliminamos el filtro estricto de semana activa para que el Frontend filtre ***
    const sql = `
        SELECT u.nombre, u.apellido, p.semana, d.nombre as dia, im.nombre as plato, pim.cantidad 
        FROM pedido p 
        JOIN pedido_item_menu pim ON p.id=pim.id_pedido 
        JOIN item_menu im ON pim.id_item_menu=im.id 
        LEFT JOIN dia d ON pim.id_dia=d.id 
        JOIN empleado e ON p.id_empleado=e.id 
        JOIN usuario u ON e.id_usuario=u.id
        -- SIN CLÁUSULA WHERE para que el Frontend reciba todas las semanas y filtre por la seleccionada
        ORDER BY p.semana DESC, u.apellido, d.id, im.nombre;
    `;
    connection.query(sql, (err, r) => { 
        if (err) {
            console.error("Error en SQL /detalle-semanal:", err);
            return res.status(500).json({ error: "Error al cargar detalle semanal" });
        }
        res.json(r || []); 
    });
});

module.exports = router;