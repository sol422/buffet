document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    emailError.textContent = "";
    passwordError.textContent = "";

    let valido = true;
    if (!email) {
        emailError.textContent = "El email es obligatorio";
        valido = false;
    }
    if (!password) {
        passwordError.textContent = "La contraseña es obligatoria";
        valido = false;
    }
    if (!valido) return;

    try {
        const response = await fetch("http://localhost:3000/api/usuario/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            alert("Email o contraseña incorrectos (o el usuario fue dado de baja).");
            return;
        }

        const datosUsuario = await response.json();

        localStorage.setItem("id", datosUsuario.id);
        localStorage.setItem("nombre", datosUsuario.nombre);
        localStorage.setItem("apellido", datosUsuario.apellido);
        localStorage.setItem("email", datosUsuario.email);
        localStorage.setItem("rol", datosUsuario.rol);

        alert("Inicio de sesión exitoso. ¡Bienvenido!");

        // ✅ Redirección según rol
        if (datosUsuario.rol === "ADMINISTRADOR") {
            window.location.href = "./perfil-administrador/perfil-administrador.html"; 
        } else if (datosUsuario.rol === "EMPLEADO") {
            window.location.href = "./home/home.html";
        } else if (datosUsuario.rol === "USUARIO") {
            window.location.href = "./perfil-usuario/perfil-usuario.html";
        } else {
            alert("Rol desconocido. No se pudo redirigir.");
        }

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error de conexión con el servidor. Por favor, asegúrate de que el backend (node server.js) esté corriendo.");
    }
}
