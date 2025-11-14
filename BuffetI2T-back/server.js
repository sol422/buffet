const express = require("express"); // crear servidor
const cors = require("cors");
const path = require("path");
const app = express(); 
require("dotenv").config(); // claves o contraseñas

// Conexión a la base de datos
const db = require('./db/connection');

// Middlewares
app.use(cors());
app.use(express.json()); // datos en formato JSON
app.use(express.urlencoded({ extended: true })); 

// ✅ Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../Buffet12T-front")));

// Rutas API
const usuarioRoutes = require("./routes/usuario");
const administradorRoutes = require("./routes/administrador");
const empleadoRoutes = require("./routes/empleado");
const pedidosRoutes = require("./routes/pedidos");

app.use("/api/usuario", usuarioRoutes);
app.use("/api/administrador", administradorRoutes);
app.use("/api/empleado", empleadoRoutes);
app.use("/api/pedido", pedidosRoutes);
app.use("/api/menu-usuario", usuarioRoutes);

// Ruta de prueba
app.get("/api", (req, res) => {
  res.send("API funcionando correctamente");
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
