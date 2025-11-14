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


// ✅ MENÚ COMPLETO PARA USUARIO COMÚN
router.get("/platos", (req, res) => {
  const sql = `
    SELECT 
      d.nombre AS nombre_dia,
      im.id,
      im.nombre,
      im.descripcion,
      im.categoria,
      im.imagen AS imagen_url
    FROM menu m
    JOIN menu_item_menu mim ON mim.id_menu = m.id
    JOIN dia d ON d.id = mim.id_dia
    JOIN item_menu im ON im.id = mim.id_item_menu
    WHERE m.es_actual = 1
    ORDER BY d.id, im.nombre;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener todos los platos:", err);
      return res.status(500).json({ error: "Error en el servidor." });
    }
    res.json(results);
  });
});


module.exports = router;
