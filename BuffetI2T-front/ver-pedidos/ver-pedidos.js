document.addEventListener('DOMContentLoaded', () => {
    cargarResumenDeEmpleados();

    document.getElementById('comunes-tab')
        .addEventListener('shown.bs.tab', cargarGestionDeComunes);
});

/* ==========================================================
   1. RESUMEN EMPLEADOS
   ========================================================== */

async function cargarResumenDeEmpleados() {
    const container = document.getElementById('resumen-pedidos-empleados');
    container.innerHTML = '<p class="text-center text-muted">Cargando resumen de pedidos de empleados...</p>';

    try {
        const response = await fetch('http://localhost:3000/api/administrador/pedidos/resumen-semanal');

        if (!response.ok) {
            throw new Error(`No se pudo cargar el resumen de empleados. (Error: ${response.status})`);
        }

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            container.innerHTML = '<p class="placeholder">Aún no se ha confirmado ningún pedido de empleado para la semana actual.</p>';
            return;
        }

        const resumenPlatos = {};

        pedidos.forEach(item => {
            const key = item.nombre_plato;
            if (!resumenPlatos[key]) {
                resumenPlatos[key] = {
                    nombre: item.nombre_plato,
                    cantidad_total: 0,
                    pedidos_individuales: []
                };
            }

            resumenPlatos[key].cantidad_total += item.cantidad;
            resumenPlatos[key].pedidos_individuales.push(
                `${item.nombre_empleado} ${item.apellido_empleado} (pidió ${item.cantidad})`
            );
        });

        let html = `
            <p class="lead text-dark">Total de platos a preparar en la semana activa.</p>
            <table class="resumen-table">
                <thead>
                    <tr>
                        <th>Plato</th>
                        <th class="text-center">Cantidad Total</th>
                        <th>Detalle</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const plato in resumenPlatos) {
            const data = resumenPlatos[plato];
            html += `
                <tr>
                    <td>${data.nombre}</td>
                    <td class="cantidad-total">${data.cantidad_total}</td>
                    <td class="detalle-pedidos-empleados">${data.pedidos_individuales.join('\n')}</td>
                </tr>
            `;
        }

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar resumen empleados:", error);
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
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
