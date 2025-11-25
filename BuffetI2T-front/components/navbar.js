// Contenido para: BuffettI2T-front/components/navbar.js

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Obtenemos la ruta de la página actual para marcar el enlace activo
    const currentPage = window.location.pathname;
    const nombreUsuario = localStorage.getItem("nombre");
    const rol = localStorage.getItem("ROL"); // <-- importa el rol

    // Mostrar Perfil Usuario SOLO si es ADMIN
    const mostrarPerfilUsuario = rol === "ADMIN";

    this.innerHTML = `
      <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="../home/home.html">
              <img src="../img/buffet_logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top me-2">
              BUFFET
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNavbar">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link ${currentPage.includes('home.html') ? 'active' : ''}" href="../home/home.html">Inicio</a></li>
                <li class="nav-item"><a class="nav-link ${currentPage.includes('modificar-pedido.html') ? 'active' : ''}" href="../modificar-pedido/modificar-pedido.html">Pedido</a></li>
                <li class="nav-item"><a class="nav-link ${currentPage.includes('historial.html') ? 'active' : ''}" href="../historial/historial.html">Historial</a></li>
                <li class="nav-item"><a class="nav-link ${currentPage.includes('perfil.html') ? 'active' : ''}" href="../perfil/perfil.html">Perfil</a></li>

                <!-- PERFIL USUARIO SOLO SI ES ADMIN -->
                ${mostrarPerfilUsuario ? `
                <li class="nav-item">
                  <a class="nav-link ${currentPage.includes('perfil-usuario.html') ? 'active' : ''}" 
                     href="../perfil-usuario/perfil-usuario.html">Perfil Usuario</a>
                </li>
                ` : ""}
              </ul>

              <div class="d-flex align-items-center">
                ${nombreUsuario ? `<span class="text-light me-3">👋 Hola, ${nombreUsuario}</span>` : ""}
                <a href="#" onclick="cerrarSesion()" class="btn btn-outline-light">Cerrar Sesión</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    `;
  }
}

function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '../index.html'; 
    }
}

customElements.define('main-header', Header);
