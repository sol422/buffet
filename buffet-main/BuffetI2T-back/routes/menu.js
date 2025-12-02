const express = require("express");
const router = express.Router();
console.log(" >>> RUTA MENU CARGADA <<< ");

const connection = require("../db/connection");

router.get('/:id/items', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del menú.' });
    }

    const sql = `
        SELECT 
            d.nombre AS dia_semana,
            im.id AS id_item_menu,
            im.nombre AS nombre_plato,
            im.categoria
        FROM menu_item_menu mim
        JOIN dia d ON mim.id_dia = d.id
        JOIN item_menu im ON mim.id_item_menu = im.id
        WHERE mim.id_menu = ?;
    `;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener items del menú:", err);
            return res.status(500).json({ error: "Error en el servidor." });
        }
        res.json(results);
    });
});


router.post('/:id/publicar', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del menú.' });
    }

    // 1. Primero desactivamos cualquier menú que esté marcado como actual
    const desactivarSql = `UPDATE menu SET es_actual = 0`;

    connection.query(desactivarSql, (err) => {
        if (err) {
            console.error("Error al desactivar menús anteriores:", err);
            return res.status(500).json({ error: "No se pudo desactivar los menús anteriores." });
        }

        // 2. Activamos el menú seleccionado
        const activarSql = `UPDATE menu SET es_actual = 1 WHERE id = ?`;

        connection.query(activarSql, [id], (err, result) => {
            if (err) {
                console.error("Error al activar el menú:", err);
                return res.status(500).json({ error: "No se pudo activar el nuevo menú." });
            }

            res.status(200).json({ message: "Menú publicado correctamente." });
        });
    });
});

module.exports = router;