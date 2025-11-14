let seleccionUsuario = {};
let menuCompleto = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  if (nombre) {
    document.querySelector(".sidebar h4").textContent = `👋 Hola, ${nombre}`;
  }

  const guardado = localStorage.getItem("pedidoActual");
  if (guardado) seleccionUsuario = JSON.parse(guardado);

  document.getElementById("confirmarPedidoBtn").addEventListener("click", revisarPedido);

  // ✅ Link para ver favoritos
  const favLink = document.getElementById("favoritos-link");
  if (favLink) {
    favLink.addEventListener("click", () => renderFavoritos());
  }

  fetchMenuCompleto();
});

async function fetchMenuCompleto() {
  try {
    const res = await fetch("http://localhost:3000/api/usuario/platos");
    if (!res.ok) throw new Error("No se pudo cargar el menú.");

    menuCompleto = await res.json();
    renderMenus(menuCompleto);

  } catch (error) {
    console.error(error);
    document.getElementById("menu-container").innerHTML = `<p class="alert alert-danger">${error.message}</p>`;
  }
}

function renderMenus(platos) {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";

  if (platos.length === 0) {
    container.innerHTML = `<p class="alert alert-info">No hay platos disponibles.</p>`;
    return;
  }

  platos.forEach(plato => {
    const clave = `${plato.nombre_dia}-${plato.id}`;
    const cantidad = seleccionUsuario[clave]?.cantidad || 0;
    const esFavorito = favoritos.includes(plato.id);

    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-4";
    card.innerHTML = `
      <div class="card h-100 ${cantidad > 0 ? 'border-success border-2' : ''}">
        <img src="${plato.imagen_url}" class="card-img-top" alt="${plato.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${plato.nombre}</h5>
          <p class="text-muted small">${plato.categoria}</p>
          <p>${plato.descripcion}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div class="input-group me-2">
              <span class="input-group-text">Cantidad:</span>
              <input type="number" class="form-control" min="0" value="${cantidad}" id="cantidad-${clave}">
            </div>
            <button class="btn ${esFavorito ? 'btn-warning' : 'btn-outline-warning'} btn-sm" id="fav-${plato.id}">
              ★
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);

    // ✅ Manejo de cantidad seleccionada
    document.getElementById(`cantidad-${clave}`).addEventListener("input", e => {
      const val = parseInt(e.target.value, 10);
      if (val > 0) {
        seleccionUsuario[clave] = { ...plato, cantidad: val, nombre_dia: plato.nombre_dia };
        e.target.closest(".card").classList.add("border-success", "border-2");
      } else {
        delete seleccionUsuario[clave];
        e.target.closest(".card").classList.remove("border-success", "border-2");
      }
      actualizarResumen();
    });

    // ✅ Manejo de favoritos
    document.getElementById(`fav-${plato.id}`).addEventListener("click", () => {
      toggleFavorito(plato.id);
      renderMenus(menuCompleto); // refrescar cards
    });
  });

  actualizarResumen();
}

function renderFavoritos() {
  const favPlatos = menuCompleto.filter(plato => favoritos.includes(plato.id));
  const container = document.getElementById("menu-container");
  container.innerHTML = "";

  if (favPlatos.length === 0) {
    container.innerHTML = `<p class="alert alert-info">No tenés platos favoritos aún.</p>`;
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

  if (Object.keys(seleccionUsuario).length === 0) {
    container.innerHTML = `<p class="text-muted">Aún no seleccionaste platos.</p>`;
    return;
  }

  let html = '<ul class="list-group list-group-flush">';
  const items = Object.values(seleccionUsuario);
  items.forEach(item => {
    html += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span><strong>${item.nombre_dia.substring(0,3)}:</strong> ${item.nombre}</span>
        <span class="badge bg-success">x${item.cantidad}</span>
      </li>
    `;
  });

  html += '</ul>';
  container.innerHTML = html;
}

function revisarPedido() {
  const detalles = Object.values(seleccionUsuario).map(item => ({
    id_item_menu: item.id,
    cantidad: item.cantidad
  }));

  const semana = obtenerSemanaActual();
  const id_usuario = localStorage.getItem("id");

  if (!detalles.length) {
    alert("No seleccionaste ningún plato.");
    return;
  }

  const pedido = { id_usuario, semana, detalles };
  localStorage.setItem("pedidoActual", JSON.stringify(seleccionUsuario));
  window.location.href = "../modificar-pedido/modificar-pedido.html";
}

function obtenerSemanaActual() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), 0, 1);
  const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  return Math.ceil((dias + inicio.getDay() + 1) / 7);
}
