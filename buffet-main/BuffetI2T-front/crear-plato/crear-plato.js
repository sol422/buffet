document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar Permisos al cargar
    validarSesionAdmin();
    
    // 2. Cargar lista
    cargarCatalogo();

    // 3. Configurar formulario
    const form = document.getElementById("form-crear-plato");
    if (form) {
        form.addEventListener("submit", guardarPlato);
    }
});

function validarSesionAdmin() {
    const usuarioStr = localStorage.getItem("usuario");
    
    if (!usuarioStr) {
        alert("No has iniciado sesión. Redirigiendo...");
        window.location.href = "../index.html";
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    
    // DEBUG: Ver qué rol tiene guardado el navegador
    console.log("Usuario actual:", usuario);

    if (usuario.rol !== "ADMINISTRADOR") {
        alert(`Acceso Denegado.\nTu rol actual es: ${usuario.rol || 'Indefinido'}.\nDebes ser ADMINISTRADOR.`);
        window.location.href = "../home/home.html";
    }
}

async function cargarCatalogo() {
    const container = document.getElementById("catalogo-container");
    if(!container) return;

    try {
        const res = await fetch("http://localhost:3000/api/administrador/items");
        
        if (!res.ok) {
            throw new Error(`Error servidor: ${res.status}`);
        }

        const platos = await res.json();

        if (platos.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay platos cargados.</div>';
            return;
        }

        let html = '';
        platos.forEach(p => {
            const img = p.imagen ? `../img/${p.imagen}` : '../img/default_plato.jpg';
            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm h-100 mb-3">
                        <div class="row g-0 h-100">
                            <div class="col-4">
                                <img src="${img}" class="img-fluid rounded-start h-100" style="object-fit: cover;">
                            </div>
                            <div class="col-8">
                                <div class="card-body p-2">
                                    <h6 class="card-title fw-bold">${p.nombre}</h6>
                                    <span class="badge bg-secondary">${p.categoria}</span>
                                    <p class="card-text small text-muted mt-1">${p.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        container.innerHTML = html;

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="alert alert-danger">Error al cargar catálogo: ${e.message}</div>`;
    }
}

async function guardarPlato(e) {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value,
        categoria: document.getElementById("categoria").value,
        stock: document.getElementById("stock").value,
        descripcion: document.getElementById("descripcion").value
    };

    try {
        const res = await fetch("http://localhost:3000/api/administrador/items/agregar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            // ✅ CORRECCIÓN: Redirigir al panel de administrador
            alert("✅ Plato guardado exitosamente. Redirigiendo al Panel de Control.");
            window.location.href = "../perfil-administrador/perfil-administrador.html"; 
        } else {
            const txt = await res.text();
            alert("Error al guardar: " + txt);
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor.");
    }
}