document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDelPerfil();
});

async function cargarDatosDelPerfil() {
    const idUsuario = localStorage.getItem("id");
    if (!idUsuario) {
        alert("Error: No se encontró sesión. Redirigiendo al login.");
        window.location.href = "../index.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/usuario/perfil/${idUsuario}`);
        if (!response.ok) {
            throw new Error("No se pudo obtener la información del perfil.");
        }
        const perfil = await response.json();

        document.getElementById("nombre").value = perfil.nombre || "";
        document.getElementById("apellido").value = perfil.apellido || "";
        document.getElementById("email").value = perfil.email || "";

        document.getElementById("asiste_lunes").checked = perfil.asiste_lunes;
        document.getElementById("asiste_martes").checked = perfil.asiste_martes;
        document.getElementById("asiste_miercoles").checked = perfil.asiste_miercoles;
        document.getElementById("asiste_jueves").checked = perfil.asiste_jueves;
        document.getElementById("asiste_viernes").checked = perfil.asiste_viernes;

    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        alert("Hubo un error al cargar tus datos. Intenta de nuevo.");
    }
}

async function validarDatos() {
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const emailInput = document.getElementById("email");
    
    const asiste_lunes = document.getElementById("asiste_lunes").checked;
    const asiste_martes = document.getElementById("asiste_martes").checked;
    const asiste_miercoles = document.getElementById("asiste_miercoles").checked;
    const asiste_jueves = document.getElementById("asiste_jueves").checked;
    const asiste_viernes = document.getElementById("asiste_viernes").checked;
    
    const datosParaEnviar = {
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        email: emailInput.value.trim(),
        asiste_lunes: asiste_lunes,
        asiste_martes: asiste_martes,
        asiste_miercoles: asiste_miercoles,
        asiste_jueves: asiste_jueves,
        asiste_viernes: asiste_viernes
    };

    const emailOriginal = localStorage.getItem("email");

    try {
        const response = await fetch(`http://localhost:3000/api/empleado/${emailOriginal}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosParaEnviar)
        });

        if (response.ok) {
            alert("Perfil actualizado correctamente.");
            localStorage.setItem("nombre", datosParaEnviar.nombre);
            localStorage.setItem("apellido", datosParaEnviar.apellido);
            localStorage.setItem("email", datosParaEnviar.email);
            window.location.href = "../perfil/perfil.html";
        } else {
            throw new Error("Hubo un error al actualizar el perfil.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error de conexión con el servidor.");
    }
}