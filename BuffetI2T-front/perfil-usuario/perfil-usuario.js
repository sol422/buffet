let seleccionUsuario = {};
let menuCompleto = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Validar y cargar datos de saludo y contacto
    const nombre = localStorage.getItem("nombre");
    const email = localStorage.getItem("email");
    if (nombre) {
        document.getElementById("user-greeting").textContent = `👋 Hola, ${nombre}`;
        document.getElementById("user-email").textContent = `${email}`;
    } else {
        window.location.href = "../index.html"; // Redirige al login si no hay usuario
        return;
    }
    
    // 2. Cargar estado guardado y eventos
    const guardado = localStorage.getItem("pedidoActual");
    if (guardado) seleccionUsuario = JSON.parse(guardado);

    document.getElementById("confirmarPedidoBtn").addEventListener("click", revisarPedido);
    
    // 3. Evento de navegación entre Menú y Favoritos
    document.getElementById("menu-link").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("content-title").textContent = "Menú de Platos Disponibles";
        document.getElementById("content-subtitle").textContent = "Menú completo para todos los días hábiles. Selecciona la cantidad.";
        document.getElementById("menu-link").classList.add("active");
        document.getElementById("favoritos-link").classList.remove("active");
        renderMenus(menuCompleto);
    });

    document.getElementById("favoritos-link").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("content-title").textContent = "Mis Platos Favoritos";
        document.getElementById("content-subtitle").textContent = "Platos marcados como favoritos.";
        document.getElementById("menu-link").classList.remove("active");
        document.getElementById("favoritos-link").classList.add("active");
        renderFavoritos();
    });

    
    
    fetchMenuCompleto();
    actualizarResumen();
});

// Función de Cierre de Sesión (usada en el HTML y Globalmente)
function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '../index.html';
    }
}

// ✅ FUNCIÓN DAR DE BAJA (CU004)
async function darDeBaja() {
    if (confirm("¿Estás seguro? Esta acción es permanente.")) {
        const idUsuario = localStorage.getItem("id"); 

        try {
            const response = await fetch("http://localhost:3000/api/usuario/eliminar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: idUsuario }), 
            });

            if (response.ok) {
                alert("Cuenta dada de baja correctamente.");
                localStorage.clear(); 
                window.location.href = "../index.html"; 
            } else {
                alert("Hubo un error al procesar tu solicitud de baja.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    }
}


async function fetchMenuCompleto() {
    try {
        // Usa la ruta de usuario común para ver TODO EL CATÁLOGO
        const res = await fetch("http://localhost:3000/api/usuario/platos");
        if (!res.ok) throw new Error("No se pudo cargar el menú.");

        menuCompleto = await res.json();
        renderMenus(menuCompleto);

    } catch (error) {
        console.error("Error al cargar menú completo:", error);
        document.getElementById("menu-container").innerHTML = `<div class="col-12"><p class="alert alert-danger">Error al cargar el menú: ${error.message}</p></div>`;
    }
}

function renderMenus(platos) {
    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    if (platos.length === 0) {
        container.innerHTML = `<div class="col-12"><p class="alert alert-info">No hay platos disponibles en este momento.</p></div>`;
        return;
    }

    platos.forEach(plato => {
        // Clave simplificada para Catálogo
        const clave = `${plato.id}`; 
        const cantidad = seleccionUsuario[clave]?.cantidad || 0;
        const esFavorito = favoritos.includes(plato.id);
        
        // El Catálogo no tiene día, usamos un marcador visual
        const diaEtiqueta = plato.nombre_dia || 'CAT'; 

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";
        card.innerHTML = `
            <div class="card h-100 ${cantidad > 0 ? 'border-success border-2' : ''}">
                <img src="../img/${plato.imagen_url}" class="card-img-top" alt="${plato.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x200/cccccc/333333?text=Plato'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${plato.nombre} <span class="badge bg-secondary ms-2">${diaEtiqueta}</span></h5>
                    <p class="text-muted small">${plato.categoria}</p>
                    <p class="card-text small">${plato.descripcion}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div class="input-group me-2" style="width: 120px;">
                            <input type="number" class="form-control" min="0" value="${cantidad}" id="cantidad-${clave}">
                        </div>
                        <button class="btn ${esFavorito ? 'btn-warning' : 'btn-outline-warning'} btn-sm" id="fav-${plato.id}" title="Marcar como Favorito">
                            ★
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);

        document.getElementById(`cantidad-${clave}`).addEventListener("input", e => {
            const val = parseInt(e.target.value, 10);
            const cardElement = e.target.closest(".card");

            if (val > 0) {
                // Guarda la información del plato con la cantidad en la selección
                seleccionUsuario[clave] = { ...plato, cantidad: val, nombre_dia: diaEtiqueta };
                cardElement.classList.add("border-success", "border-2");
            } else {
                delete seleccionUsuario[clave];
                cardElement.classList.remove("border-success", "border-2");
            }
            localStorage.setItem("pedidoActual", JSON.stringify(seleccionUsuario));
            actualizarResumen();
        });

        document.getElementById(`fav-${plato.id}`).addEventListener("click", () => {
            toggleFavorito(plato.id);
            const esVistaMenu = document.getElementById("menu-link").classList.contains("active");
            if (esVistaMenu) {
                renderMenus(platos);
            } else {
                renderFavoritos();
            }
        });
    });
}


function renderFavoritos() {
    const favPlatos = menuCompleto.filter(plato => favoritos.includes(plato.id));
    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    if (favPlatos.length === 0) {
        container.innerHTML = `<div class="col-12"><p class="alert alert-info">No tienes platos favoritos aún. ¡Marca el icono de estrella! ⭐</p></div>`;
        return;
    }
    
    renderMenus(favPlatos); 
}

function toggleFavorito(idPlato) {
    if (favoritos.includes(idPlato)) {
        favoritos = favoritos.filter(id => id !== idPlato);
    } else {
        favoritos.push(idPlato);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function actualizarResumen() {
    const container = document.getElementById("resumen-pedido");
    if (!container) return;

    const items = Object.values(seleccionUsuario);
    
    if (items.length === 0) {
        container.innerHTML = `<p class="text-muted small">Aún no seleccionaste platos.</p>`;
        return;
    }

    // Agrupación simple, ya que no hay días de asistencia fijos para el Usuario Común
    const resumenAgrupado = {};
    items.forEach(item => {
        // Usa una clave de agrupación simple si el día no está definido
        const dia = item.nombre_dia || 'PEDIDO'; 
        if (!resumenAgrupado[dia]) resumenAgrupado[dia] = [];
        resumenAgrupado[dia].push(item);
    });

    let html = '';
    
    // Renderizado simple de los ítems
    Object.keys(resumenAgrupado).forEach(dia => {
        // Solo muestra el título del día si realmente es un día de la semana
        if (dia !== 'CAT') {
             html += `<h6 class="mt-2 text-primary fw-bold">${dia}</h6>`;
        }
        
        html += `<ul class="list-group list-group-flush small">`;
        resumenAgrupado[dia].forEach(item => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center p-1 px-2">
                    <span>${item.nombre}</span>
                    <span class="badge bg-success">x${item.cantidad}</span>
                </li>
            `;
        });
        html += '</ul>';
    });
    
    container.innerHTML = html;
}

// Redirige al resumen de pedido para confirmar
function revisarPedido() {
    const selecciones = Object.values(seleccionUsuario);
    if (!selecciones.length) {
        alert("No seleccionaste ningún plato para revisar.");
        return;
    }
    
    // Guarda la selección actual y la envía a la vista de revisión unificada
    localStorage.setItem("pedidoActual", JSON.stringify(seleccionUsuario));
    window.location.href = "../modificar-pedido/modificar-pedido.html";
}