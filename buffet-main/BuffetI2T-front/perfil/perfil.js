// Carga los datos del usuario desde localStorage al iniciar
document.addEventListener("DOMContentLoaded", () => {
    const nombre = localStorage.getItem("nombre");
    const apellido = localStorage.getItem("apellido");
    const email = localStorage.getItem("email");

    if (nombre && apellido && email) {
        document.getElementById("nombre-apellido").textContent = `${nombre} ${apellido}`;
        document.getElementById("email-usuario").textContent = email;
    } else {
        // Si no hay datos, redirigimos al login
        window.location.href = "../index.html";
    }
});

// --- ESTA ES LA FUNCIÓN CORREGIDA Y CONECTADA AL BACKEND ---
async function darDeBaja() {
    // 1. Pedimos confirmación al usuario
    if (confirm("¿Estás seguro? Esta acción es permanente y no podrás volver a ingresar con esta cuenta.")) {
        
        // 2. Obtenemos el ID del usuario que guardamos en el login
        const idUsuario = localStorage.getItem("id"); 

        if (!idUsuario) {
            alert("Error: No se encontró el ID de usuario. Por favor, inicia sesión de nuevo.");
            return;
        }

        try {
            // 3. Hacemos la llamada a la ruta del backend para eliminar (dar de baja)
            const response = await fetch("http://localhost:3000/api/usuario/eliminar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: idUsuario }), // 4. Enviamos el ID del usuario al backend
            });

            if (response.ok) {
                // 5. Si el backend responde que todo salió bien
                alert("Usuario dado de baja correctamente.");
                localStorage.clear(); // Limpiamos los datos del navegador
                window.location.href = "../index.html"; // Redirigimos al inicio
            } else {
                alert("Hubo un error al procesar tu solicitud de baja en el servidor.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    }
}

function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = "../index.html";
    }
}