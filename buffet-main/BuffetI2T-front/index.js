document.addEventListener('DOMContentLoaded', () => {
    // 1. Limpiar sesión previa para evitar conflictos
    localStorage.clear();

    // 2. Buscar el formulario (soporte por ID o etiqueta)
    const loginForm = document.getElementById('login-form') || document.querySelector('form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // (Opcional) Limpiar mensajes de error mientras el usuario escribe
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.id) {
                    const errorSpan = document.getElementById(`${input.id}-error`);
                    if (errorSpan) errorSpan.textContent = "";
                }
            });
        });
    } else {
        console.error("Error: No se encontró el formulario de login en el HTML.");
    }
});

async function handleLogin(event) {
    event.preventDefault(); 

    // Referencias a los inputs
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    // Validación de seguridad: que existan los inputs en el HTML
    if (!emailInput || !passwordInput) {
        alert("Error en la estructura del formulario (Faltan IDs 'email' o 'password').");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Referencias a los mensajes de error (opcional si existen en el HTML)
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    // Limpiar mensajes anteriores
    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";

    // Validación local
    let valido = true;
    if (!email) {
        if (emailError) emailError.textContent = "El email es obligatorio";
        else alert("El email es obligatorio");
        valido = false;
    }
    if (!password) {
        if (passwordError) passwordError.textContent = "La contraseña es obligatoria";
        else alert("La contraseña es obligatoria");
        valido = false;
    }
    if (!valido) return;

    try {
        // Petición al Backend
        const response = await fetch("http://localhost:3000/api/usuario/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        // Manejo de errores HTTP
        if (!response.ok) {
            if (response.status === 401) {
                alert("Email o contraseña incorrectos.");
            } else if (response.status === 403) {
                alert("Acceso denegado: Usuario inactivo o sin rol asignado.");
            } else {
                alert("Error del servidor. Intente más tarde.");
            }
            return;
        }

        // Obtener datos del usuario
        const datosUsuario = await response.json();

        // ✅ GUARDADO DE SESIÓN CRÍTICO: 
        // 1. Guardamos el objeto completo
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));
        // 2. Guardamos el rol por separado para las validaciones rápidas
        localStorage.setItem("rol", datosUsuario.rol);

        // ✅ REDIRECCIÓN UNIFICADA
        if (datosUsuario.rol === "ADMINISTRADOR") {
            window.location.href = "./perfil-administrador/perfil-administrador.html"; 
        } else {
            // Empleados y Usuarios van al mismo Home unificado
            window.location.href = "./home/home.html";
        }

    } catch (error) {
        console.error("Error crítico al iniciar sesión:", error);
        alert("No se pudo conectar con el servidor. Verifica que el backend esté corriendo (node server.js).");
    }
}