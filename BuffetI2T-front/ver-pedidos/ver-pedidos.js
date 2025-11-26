document.addEventListener('DOMContentLoaded', () => {
    cargarResumenDeEmpleados();

    document.getElementById('comunes-tab')
        .addEventListener('shown.bs.tab', cargarGestionDeComunes);
});

/* ==========================================================
   1. RESUMEN EMPLEADOS
   ========================================================== */

async function cargarResumenDeEmpleados() {
    const container = document.getElementById("resumen-pedidos-empleados");
    container.innerHTML = '<p class="text-center text-muted">Cargando...</p>';

    try {
        const response = await fetch(
            "http://localhost:3000/api/administrador/pedidos/resumen-semanal"
        );

        if (!response.ok) {
            throw new Error(`Error al cargar resumen (${response.status})`);
        }

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            container.innerHTML = '<p class="placeholder">No hay pedidos esta semana.</p>';
            return;
        }

        /* ==================================================
           ESTRUCTURA NUEVA:
           {
             empleadoNombre: {
                Lunes: [{ plato, cantidad }],
                Martes: [{ plato, cantidad }],
                ...
             }
           }
        ================================================== */

        const resumen = {};

        pedidos.forEach(p => {
            const empleado = p.nombre_empleado;
            const diaNombre = convertirDia(p.dia); // función abajo

            if (!resumen[empleado]) resumen[empleado] = {};
            if (!resumen[empleado][diaNombre]) resumen[empleado][diaNombre] = [];

            resumen[empleado][diaNombre].push({
                plato: p.nombre_plato,
                cantidad: p.cantidad
            });
        });

        /* ==========================
           GENERAR HTML LIMPIO
        ========================== */

        let html = `<div class="empleado-resumen-list">`;

        Object.keys(resumen).forEach(empleado => {
            html += `
                <div class="empleado-card">
                    <div class="empleado-header">
                        👤 <strong>${empleado}</strong>
                    </div>
            `;

            Object.keys(resumen[empleado]).forEach(dia => {
                html += `
                    <div class="empleado-dia">
                        <div class="empleado-dia-titulo">📅 ${dia}</div>
                `;

                resumen[empleado][dia].forEach(p => {
                    html += `
                        <div class="empleado-item">
                            • ${p.plato} — <strong>${p.cantidad}</strong>
                        </div>
                    `;
                });

                html += `</div>`;
            });

            html += `</div>`;
        });

        html += `</div>`;

        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `<p style="color:red;">${err.message}</p>`;
        console.error(err);
    }
}

/* ==========================================================
   Convierte número de día → nombre
   ========================================================== */
function convertirDia(n) {
    const dias = {
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes"
    };
    return dias[n] || "Día desconocido";
}

/* ==========================================================
   2. GESTIÓN USUARIOS COMUNES
   ========================================================== */

async function cargarGestionDeComunes() {
    const container = document.getElementById('gestion-pedidos-comunes');
    container.innerHTML = '<p class="text-center text-muted">Cargando pedidos...</p>';

    try {
        const response = await fetch('http://localhost:3000/api/administrador/pedidos/comunes');

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            container.innerHTML = '<p class="placeholder">No hay pedidos de usuarios comunes.</p>';
            return;
        }

        let html = `
            <p class="lead text-dark">Pedidos de usuarios con gestión de estado</p>
            <table class="resumen-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Platos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pedidos.forEach(pedido => {
            const estado = pedido.estado.trim().toUpperCase();  // 🔥 CORRECCIÓN CRÍTICA

            const esTerminal = estado === 'FINALIZADO' || estado === 'CANCELADO';

            const disable = esTerminal ? "disabled" : "";

            const detalle = pedido.items.map(item =>
                `<strong>${item.nombre_plato}</strong> (Cant: ${item.cantidad})`
            ).join('');

            html += `
                <tr data-pedido-id="${pedido.id}">
                    <td>#${pedido.id}</td>
                    <td>${pedido.nombre_usuario}
                        <br><small class="text-muted">${new Date(pedido.fecha).toLocaleDateString()}</small>
                    </td>

                    <td class="detalle-platos">${detalle}</td>

                    <td>
                        <span class="badge-estado estado-${estado}">
                            ${estado}
                        </span>
                    </td>

                    <td>
                        <button class="btn-estado btn-to-PENDIENTE"
                            data-nuevo-estado="PENDIENTE" ${disable}>
                            <i class="fas fa-undo"></i> Pendiente
                        </button>

                        <button class="btn-estado btn-to-PROCESO"
                            data-nuevo-estado="PROCESO" ${disable}>
                            <i class="fas fa-play"></i> Proceso
                        </button>

                        <button class="btn-estado btn-to-FINALIZADO"
                            data-nuevo-estado="FINALIZADO" ${disable}>
                            <i class="fas fa-check"></i> Finalizado
                        </button>

                        <button class="btn-estado btn-to-CANCELADO"
                            data-nuevo-estado="CANCELADO" ${disable}>
                            <i class="fas fa-times"></i> Cancelar
                        </button>

                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        document.querySelectorAll(".btn-estado")
            .forEach(b => b.addEventListener("click", manejarCambioDeEstado));

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML =
            `<p style="color:red;">No se pudo cargar pedidos comunes.<br>${error.message}</p>`;
    }
}

/* ==========================================================
   3. CAMBIO DE ESTADO
   ========================================================== */

async function manejarCambioDeEstado(event) {
    const btn = event.currentTarget;
    const pedidoId = btn.closest("tr").dataset.pedidoId;
    const nuevoEstado = btn.dataset.nuevoEstado.trim();

    btn.closest("tr").querySelectorAll(".btn-estado").forEach(b => b.disabled = true);

    const badge = btn.closest("tr").querySelector(".badge-estado");
    badge.textContent = `${nuevoEstado}`;
    badge.className = `badge-estado estado-${nuevoEstado.toUpperCase()}`;


    try {
        const response = await fetch(`http://localhost:3000/api/administrador/pedidos/comunes/${pedidoId}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) {
            throw new Error("No se pudo actualizar el estado.");
        }

        cargarGestionDeComunes();

    } catch (err) {
        alert("Error al actualizar estado: " + err.message);
        cargarGestionDeComunes();
    }
}
