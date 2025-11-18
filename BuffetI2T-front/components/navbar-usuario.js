// Contenido para: BuffetI2T-front/components/navbar-usuario.js

class UserHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Solo incluye enlaces relevantes para el usuario común
    this.innerHTML = `
      <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="../perfil-usuario/perfil-usuario.html">
              <img src="../img/buffet_logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top me-2">
              BUFFET
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#userNavbar">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="userNavbar">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link" href="../perfil-usuario/perfil-usuario.html">Menú</a></li>
                </ul>
              <div class="d-flex align-items-center">
                <span class="text-light me-3">👋 Hola, ${localStorage.getItem("nombre") || 'Usuario'}</span>
                <a href="#" onclick="cerrarSesion()" class="btn btn-outline-light">Cerrar Sesión</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    `;
  }
}

// Reutilizamos la función cerrarSesion que ya tienes
function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '../index.html'; 
    }
}

customElements.define('user-header', UserHeader); // Definimos el nuevo tag