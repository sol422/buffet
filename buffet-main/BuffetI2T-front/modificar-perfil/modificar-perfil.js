document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDelPerfil();

    // Asignar evento al formulario o botón
    // Buscamos el botón de tipo submit o el botón verde genérico
    const btnGuardar = document.querySelector("button[type='submit']") || document.querySelector(".btn-success");
    if (btnGuardar) {
        btnGuardar.onclick = validarDatos;
    }
});

async function cargarDatosDelPerfil() {
    // 1. Validar sesión correctamente (ahora es un objeto)
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
        alert("Error: No se encontró sesión. Redirigiendo al login.");
        window.location.href = "../index.html";
        return;
    }
    
    const usuario = JSON.parse(usuarioStr);

    try {
        // Usamos el ID guardado en el objeto de sesión
        const response = await fetch(`http://localhost:3000/api/usuario/perfil/${usuario.id}`);
        
        if (!response.ok) {
            throw new Error("No se pudo obtener la información del perfil.");
        }
        
        const perfil = await response.json();

        // Rellenar campos de texto
        document.getElementById("nombre").value = perfil.nombre || "";
        document.getElementById("apellido").value = perfil.apellido || "";
        document.getElementById("email").value = perfil.email || "";

        // Rellenar checkboxes (Convierte 1/0 a true/false)
        document.getElementById("asiste_lunes").checked = (perfil.asiste_lunes === 1);
        document.getElementById("asiste_martes").checked = (perfil.asiste_martes === 1);
        document.getElementById("asiste_miercoles").checked = (perfil.asiste_miercoles === 1);
        document.getElementById("asiste_jueves").checked = (perfil.asiste_jueves === 1);
        document.getElementById("asiste_viernes").checked = (perfil.asiste_viernes === 1);

    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        alert("Hubo un error al cargar tus datos. Intenta de nuevo.");
    }
}

async function validarDatos(event) {
    if (event) event.preventDefault(); // Evita recarga si está dentro de un form

    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const emailInput = document.getElementById("email");
    
    // Convertir estado de checkbox (true/false) a entero (1/0) para la BD
    const asiste_lunes = document.getElementById("asiste_lunes").checked ? 1 : 0;
    const asiste_martes = document.getElementById("asiste_martes").checked ? 1 : 0;
    const asiste_miercoles = document.getElementById("asiste_miercoles").checked ? 1 : 0;
    const asiste_jueves = document.getElementById("asiste_jueves").checked ? 1 : 0;
    const asiste_viernes = document.getElementById("asiste_viernes").checked ? 1 : 0;
    
    const datosParaEnviar = {
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        email: emailInput.value.trim(),
        asiste_lunes,
        asiste_martes,
        asiste_miercoles,
        asiste_jueves,
        asiste_viernes
    };

    // Obtenemos el email original para usarlo en la URL del PUT (por si el usuario lo cambió)
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const emailOriginal = usuarioLocal.email;

    try {
        // Usamos la ruta de actualización de empleado
        const response = await fetch(`http://localhost:3000/api/empleado/${emailOriginal}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosParaEnviar)
        });

        if (response.ok) {
            alert("Perfil actualizado correctamente.");
            
            // ✅ ACTUALIZACIÓN DE SESIÓN EN VIVO
            // Actualizamos el objeto en localStorage para que el Home y Navbar reflejen los cambios sin reloguear
            usuarioLocal.nombre = datosParaEnviar.nombre;
            usuarioLocal.apellido = datosParaEnviar.apellido;
            usuarioLocal.email = datosParaEnviar.email;
            
            // Importante: Actualizar la asistencia local para el filtrado del menú
            usuarioLocal.asiste_lunes = asiste_lunes;
            usuarioLocal.asiste_martes = asiste_martes;
            usuarioLocal.asiste_miercoles = asiste_miercoles;
            usuarioLocal.asiste_jueves = asiste_jueves;
            usuarioLocal.asiste_viernes = asiste_viernes;

            localStorage.setItem("usuario", JSON.stringify(usuarioLocal));
            
            // Redirigir al home para ver el menú actualizado
            window.location.href = "../home/home.html";
        } else {
            throw new Error("Hubo un error al actualizar el perfil.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error de conexión con el servidor.");
    }
}