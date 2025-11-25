async function validarDatos(event) {
  event.preventDefault(); // Para evitar que se recargue la página

  const nombre = document.getElementById('nombre');
  const apellido = document.getElementById('apellido');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const repetirPassword = document.getElementById('repetir-password');

  const nombreError = document.getElementById('nombre-error');
  const apellidoError = document.getElementById('apellido-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const repetirPasswordError = document.getElementById('repetir-password-error');

  let valido = true;

  if (nombre.value.trim() === "") {
    nombreError.textContent = "Nombre inválido";
    nombre.style.border = "2px solid red";
    valido = false;
  } else {
    nombreError.textContent = "";
    nombre.style.border = "";
  }

  if (apellido.value.trim() === "") {
    apellidoError.textContent = "Apellido inválido";
    apellido.style.border = "2px solid red";
    valido = false;
  } else {
    apellidoError.textContent = "";
    apellido.style.border = "";
  }

  const regex = /^[-\w.%+]{1,64}@(?:[A-Za-z0-9-]{1,63}\.){1,125}[A-Za-z]{2,63}$/;
  if (!regex.test(email.value)) {
    emailError.textContent = "E-mail inválido";
    email.style.border = "2px solid red";
    valido = false;
  } else {
    emailError.textContent = "";
    email.style.border = "";
  }

  if (password.value.length < 6) {
    passwordError.textContent = "La contraseña debe tener al menos 6 caracteres";
    password.style.border = "2px solid red";
    valido = false;
  } else {
    passwordError.textContent = "";
    password.style.border = "";
  }

  if (password.value !== repetirPassword.value) {
    repetirPasswordError.textContent = "Las contraseñas no coinciden";
    repetirPassword.style.border = "2px solid red";
    valido = false;
  } else {
    repetirPasswordError.textContent = "";
    repetirPassword.style.border = "";
  }

  if (!valido) return;

  const datos = {
    nombre: nombre.value.trim(),
    apellido: apellido.value.trim(),
    email: email.value.trim(),
    password: password.value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/empleado", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await response.text();

    if (resultado === "OK") {
      alert("Usuario registrado exitosamente.");
      window.location.href = "../index.html";
    } else if (resultado === "FAIL") {
      alert("El usuario ya está registrado.");
    } else {
      alert("Error desconocido al registrar el usuario.");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor.");
  }
}
