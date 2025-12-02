document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar las semanas disponibles (esto llama a cargarResumenDeEmpleados y Detalle al final)
    cargarSemanasDisponibles();
    
    // 2. Carga la tabla de pedidos Express (siempre es para hoy, no necesita selector)
    cargarGestionDeComunes();

    // Recargar pedidos express cuando se active la pestaña
    const tabComunes = document.getElementById('comunes-tab');
    if (tabComunes) {
        tabComunes.addEventListener('shown.bs.tab', cargarGestionDeComunes);
    }
    
    // Añadir listener para el selector de semana
    const selectorSemana = document.getElementById('selector-semana');
    if (selectorSemana) {
        // Al cambiar el selector, recargamos ambos reportes de empleados
        selectorSemana.addEventListener('change', () => {
            cargarResumenDeEmpleados();
            cargarDetallePedidosEmpleados();
        });
    }
});

// ==========================================================
// FUNCIÓN PARA CARGAR SEMANAS EN EL SELECT
// ==========================================================
async function cargarSemanasDisponibles() {
    const selector = document.getElementById('selector-semana');
    if (!selector) return;

    try {
        // Usamos /menu/todos que devuelve todos los menús y su semana
        const response = await fetch("http://localhost:3000/api/administrador/menu/todos");
        if (!response.ok) throw new Error('No se pudieron cargar los menús.');
        const menus = await response.json();

        // Obtener solo números de semana únicos y ordenarlos de mayor a menor
        const semanasMap = new Map();
        menus.forEach(m => {
            if (!semanasMap.has(m.semana)) {
                semanasMap.set(m.semana, m.es_actual);
            }
        });

        const semanasUnicas = Array.from(semanasMap.keys()).sort((a, b) => b - a);

        let htmlOptions = '';
        let semanaActiva = Array.from(semanasMap.entries()).find(([sem, es_actual]) => es_actual == 1)?.[0];
        let semanaPorDefecto = semanaActiva || semanasUnicas[0];


        semanasUnicas.forEach(sem => {
            const esActiva = sem === semanaActiva;
            const texto = `Semana ${sem} ${esActiva ? '(ACTIVA)' : ''}`;
            const selected = sem === semanaPorDefecto ? 'selected' : '';

            htmlOptions += `<option value="${sem}" ${selected}>${texto}</option>`;
        });

        selector.innerHTML = htmlOptions;
        
        // Disparar carga de reportes para la semana seleccionada por defecto
        cargarResumenDeEmpleados(); 
        cargarDetallePedidosEmpleados();

    } catch (error) {
        selector.innerHTML = `<option value="">Error al cargar semanas</option>`;
        console.error("Error al cargar semanas:", error);
    }
}


/* ==========================================================
    1. RESUMEN EMPLEADOS (AGRUPADO PARA COCINA)
    ========================================================== */
// Usa el filtro de semana seleccionado en el Frontend y llama al Backend
async function cargarResumenDeEmpleados() {
    const container = document.getElementById("resumen-pedidos-empleados");
    const selectorSemana = document.getElementById('selector-semana');
    
    if (!container || !selectorSemana || !selectorSemana.value) {
        if (container) container.innerHTML = '<p class="text-center text-muted">Esperando datos de semanas...</p>';
        return;
    }

    const semanaSeleccionada = selectorSemana.value;
    // Llama al Backend con el parámetro de consulta 'semana'
    const apiUrl = `http://localhost:3000/api/administrador/pedidos/resumen-cocina?semana=${semanaSeleccionada}`;

    container.innerHTML = `<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Generando resumen para la Semana ${semanaSeleccionada}...</p></div>`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            container.innerHTML = `<div class="alert alert-danger text-center w-100">
                <strong>Error ${response.status} al cargar resumen.</strong> 
                <br><small>Revisa el servidor de Node.js. Detalle: ${errorText.substring(0, 50)}</small>
            </div>`;
            throw new Error(`Error conexión (${response.status})`);
        }
        
        const pedidosAgrupados = await response.json(); 

        if (pedidosAgrupados.length === 0) {
            container.innerHTML = `<div class="alert alert-warning text-center w-100">
                <h4>No hay pedidos registrados para la Semana ${semanaSeleccionada}.</h4>
                <p class="mb-0">Asegúrate de que los empleados hayan confirmado pedidos para esta semana.</p>
            </div>`;
            return;
        }

        /* --------------------------------------------------
            Agrupar y generar HTML
        -------------------------------------------------- */
        const resumenPorDia = {};
        pedidosAgrupados.forEach(p => {
            const dia = p.nombre_dia.toUpperCase();
            if (!resumenPorDia[dia]) resumenPorDia[dia] = [];
            resumenPorDia[dia].push({ plato: p.nombre_plato, cantidad: p.cantidad_total });
        });

        const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SIN DÍA']; 
        let html = `<div class="row g-3">`;
        
        ordenDias.forEach(dia => {
            const itemsDelDia = resumenPorDia[dia];
            
            if (itemsDelDia && itemsDelDia.length > 0) {
                const headerColor = dia === 'SIN DÍA' ? 'bg-secondary' : 'bg-primary'; 
                const cardClass = dia === 'SIN DÍA' ? 'text-bg-light' : 'text-bg-primary';

                html += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm ${cardClass}">
                            <div class="card-header ${headerColor} text-white fw-bold">
                                📅 ${dia}
                            </div>
                            <ul class="list-group list-group-flush">
                `;
                
                itemsDelDia.forEach(item => {
                    html += `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${item.plato}
                                    <span class="badge bg-secondary rounded-pill">${item.cantidad}</span>
                                </li>
                    `;
                });

                html += `
                            </ul>
                        </div>
                    </div>
                `;
            }
        });

        html += `</div>`;
        container.innerHTML = html;

    } catch (err) {
        console.error("Error al cargar resumen:", err);
        container.innerHTML = `<div class="alert alert-danger">Error al cargar el resumen para cocina: ${err.message}</div>`;
    }
}


/* ==========================================================
    2. DETALLE PEDIDOS EMPLEADOS (Tabla por Empleado/Día)
    ========================================================== */
// Llama a la API sin filtro y luego filtra por la semana seleccionada
async function cargarDetallePedidosEmpleados() {
    const container = document.getElementById("gestion-pedidos-empleados");
    const selectorSemana = document.getElementById('selector-semana');
    
    if (!container || !selectorSemana || !selectorSemana.value) {
        if (container) container.innerHTML = '<p class="text-center text-muted">Esperando datos de semanas para detalle...</p>';
        return;
    }
    
    const semanaSeleccionada = selectorSemana.value;

    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-secondary"></div><p class="mt-2 text-muted">Generando detalle de pedidos...</p></div>';

    try {
        // La API devuelve todos los pedidos semanales (sin filtro de semana)
        const response = await fetch("http://localhost:3000/api/administrador/pedidos/detalle-semanal");

        if (!response.ok) throw new Error(`Error conexión (${response.status})`);

        const pedidos = await response.json();
        
        // Filtramos en el Frontend por la semana seleccionada por el administrador
        const pedidosFiltrados = pedidos.filter(p => p.semana == semanaSeleccionada);
        
        if (pedidosFiltrados.length === 0) {
            container.innerHTML = `<div class="alert alert-info text-center w-100">No hay detalle de pedidos semanales para la Semana ${semanaSeleccionada}.</div>`;
            return;
        }

        /* --------------------------------------------------
            Agrupar datos para generar la tabla con rowspan (SOLO DE LA SEMANA SELECCIONADA)
        -------------------------------------------------- */
        const pedidosAgrupados = pedidosFiltrados.reduce((acc, pedido) => {
            const empleadoKey = `${pedido.nombre} ${pedido.apellido}`;
            
            if (!acc[empleadoKey]) acc[empleadoKey] = {};
            
            const diaKey = pedido.dia || 'SIN DÍA';
            if (!acc[empleadoKey][diaKey]) acc[empleadoKey][diaKey] = [];
            
            acc[empleadoKey][diaKey].push({ plato: pedido.plato, cantidad: pedido.cantidad });
            return acc;
        }, {});
        
        const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SIN DÍA'];

        let html = `
            <div class="table-responsive mb-4">
                <table class="table table-striped table-bordered align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Empleado</th>
                            <th>Día</th>
                            <th>Plato</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        Object.keys(pedidosAgrupados).sort().forEach(empleadoKey => {
            const diasDelEmpleado = pedidosAgrupados[empleadoKey];
            let totalRowsEmpleado = 0; 

            ordenDias.forEach(dia => {
                if (diasDelEmpleado[dia]) {
                    totalRowsEmpleado += diasDelEmpleado[dia].length;
                }
            });

            let empleadoPrinted = false;

            ordenDias.forEach(diaKey => {
                const itemsDelDia = diasDelEmpleado[diaKey];
                
                if (itemsDelDia && itemsDelDia.length > 0) {
                    const totalRowsDia = itemsDelDia.length;
                    let diaPrinted = false;
                    
                    itemsDelDia.forEach((item, index) => {
                        html += `<tr>`;
                        
                        if (!empleadoPrinted) {
                            html += `<td rowspan="${totalRowsEmpleado}"><strong>${empleadoKey}</strong></td>`;
                            empleadoPrinted = true;
                        }

                        if (!diaPrinted) {
                            const badgeClass = diaKey === 'SIN DÍA' ? 'bg-secondary' : 'bg-info text-dark';
                            html += `<td rowspan="${totalRowsDia}"><span class="badge ${badgeClass}">${diaKey}</span></td>`;
                            diaPrinted = true;
                        }

                        html += `
                            <td>${item.plato}</td>
                            <td><span class="badge bg-primary">${item.cantidad}</span></td>
                        </tr>`;
                    });
                }
            });
        });

        html += `</tbody></table></div>`;
        
        container.innerHTML = html;

    } catch (err) {
        console.error("Error al cargar el detalle de pedidos de empleados:", err);
        container.innerHTML = `<div class="alert alert-danger">Error al cargar el detalle de pedidos: ${err.message}</div>`;
    }
}


/* ==========================================================
    3. GESTIÓN DE PEDIDOS COMUNES / EXPRESS (Tabla con Estados)
    ========================================================== */

async function cargarGestionDeComunes() {
    const container = document.getElementById('gestion-pedidos-comunes');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-success"></div><p>Cargando pedidos express...</p></div>';

    try {
        const response = await fetch('http://localhost:3000/api/administrador/pedidos/express');

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const pedidos = await response.json();

        const pedidosAgrupadosExpress = pedidos.reduce((acc, current) => {
            const id = current.id;
            const item = { plato: current.plato, cantidad: current.cantidad };

            if (!acc[id]) { acc[id] = { ...current, items: [item] }; } 
            else { acc[id].items.push(item); }
            return acc;
        }, {});
        
        const pedidosParaMostrar = Object.values(pedidosAgrupadosExpress);


        if (pedidosParaMostrar.length === 0) {
            container.innerHTML = '<div class="alert alert-secondary text-center">No hay pedidos express pendientes para hoy.</div>';
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover align-middle border">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Detalle del Pedido</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        pedidosParaMostrar.forEach(pedido => {
            const estado = pedido.estado ? pedido.estado.toUpperCase() : 'PENDIENTE';
            
            let badgeClass = 'bg-secondary';
            if (estado === 'PENDIENTE') badgeClass = 'bg-warning text-dark';
            else if (estado === 'PROCESO') badgeClass = 'bg-info text-dark';
            else if (estado === 'CONFIRMADO') badgeClass = 'bg-success';
            else if (estado === 'CANCELADO') badgeClass = 'bg-danger';

            const esTerminal = (estado === 'CONFIRMADO' || estado === 'CANCELADO');
            const disabledAttr = esTerminal ? 'disabled' : '';

            const detalleHtml = pedido.items.map(i => 
                `<div>• <strong>${i.plato}</strong> (x${i.cantidad})</div>`
            ).join(''); 

            const nombreUsuario = pedido.nombre_usuario || `${pedido.nombre} ${pedido.apellido}`;
            const fechaHora = new Date(pedido.fecha_pedido).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

            html += `
                <tr data-pedido-id="${pedido.id}">
                    <td><strong>#${pedido.id}</strong></td>
                    <td>
                        ${nombreUsuario}
                        <br><small class="text-muted">${fechaHora}</small>
                    </td>
                    <td>${detalleHtml}</td>
                    <td>
                        <span class="badge ${badgeClass} badge-estado">${estado}</span>
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary btn-estado" 
                                    data-nuevo-estado="PROCESO" ${disabledAttr} title="En Proceso">
                                <i class="bi bi-play-fill"></i>
                            </button>
                            
                            <button class="btn btn-sm btn-outline-success btn-estado" 
                                    data-nuevo-estado="CONFIRMADO" ${disabledAttr} title="Finalizar/Entregar">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            
                            <button class="btn btn-sm btn-outline-danger btn-estado" 
                                    data-nuevo-estado="CANCELADO" ${disabledAttr} title="Cancelar">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;      
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        // Asignar eventos a los botones generados
        document.querySelectorAll(".btn-estado").forEach(btn => {
            btn.addEventListener("click", manejarCambioDeEstado);
        });

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<div class="alert alert-danger">Error al cargar la tabla: ${error.message}</div>`;
    }
}

async function manejarCambioDeEstado(event) {
    const btn = event.currentTarget;
    const row = btn.closest("tr");
    const pedidoId = row.dataset.pedidoId;
    const nuevoEstado = btn.dataset.nuevoEstado;

    console.log(`[ACCIÓN PENDIENTE] Intentando cambiar el estado del pedido #${pedidoId} a ${nuevoEstado}.`);

    try {
        const response = await fetch(`http://localhost:3000/api/administrador/pedidos/express/${pedidoId}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Error al actualizar");
        }

        cargarGestionDeComunes();
        console.log(`Pedido #${pedidoId} actualizado a ${nuevoEstado} correctamente.`);

    } catch (err) {
        console.error("ERROR AL ACTUALIZAR ESTADO:", err.message);
    }
}