class AdminHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #343a40;">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="../perfil-administrador/perfil-administrador.html">
              <img src="../img/buffet_logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top me-2">
              BUFFET (ADMIN)
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="adminNavbar">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                
                <li class="nav-item">
                    <a class="nav-link" href="../perfil-administrador/perfil-administrador.html">Panel Principal</a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link" href="../gestionar-menu/gestionar-menu.html">Gestionar Menús</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="../agregar-menu/agregar-menu.html">Asignar Plato</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="../ver-pedidos/ver-pedidos.html">Ver Pedidos</a>
                </li>

              </ul>
              <a href="#" onclick="cerrarSesionAdmin()" class="btn btn-outline-light">Cerrar Sesión</a>
            </div>
          </div>
        </nav>
      </header>
    `;
  }
}

function cerrarSesionAdmin() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '../index.html'; 
    }
}

customElements.define('admin-header', AdminHeader);