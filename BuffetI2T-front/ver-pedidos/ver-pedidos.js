document.addEventListener('DOMContentLoaded', () => {
    cargarResumenDePedidos();
});

async function cargarResumenDePedidos() {
    const container = document.getElementById('resumen-pedidos');
    
    try {
        const response = await fetch('http://localhost:3000/api/administrador/pedidos/resumen-semanal');
        if (!response.ok) {
            throw new Error("No se pudo cargar el resumen de pedidos.");
        }
        const pedidos = await response.json();

        if (pedidos.length === 0) {
            container.innerHTML = '<p class="placeholder">Aún no se ha confirmado ningún pedido para la semana actual.</p>';
            return;
        }

        // Agrupamos los pedidos por plato para sumar las cantidades
        const resumenPlatos = {};
        pedidos.forEach(item => {
            if (!resumenPlatos[item.nombre_plato]) {
                // Si es la primera vez que vemos este plato, lo inicializamos
                resumenPlatos[item.nombre_plato] = {
                    nombre: item.nombre_plato,
                    cantidad_total: 0,
                    pedidos_individuales: []
                };
            }
            // Sumamos la cantidad y guardamos el detalle de quién lo pidió
            resumenPlatos[item.nombre_plato].cantidad_total += item.cantidad;
            resumenPlatos[item.nombre_plato].pedidos_individuales.push(
                `${item.nombre_empleado} ${item.apellido_empleado} (pidió ${item.cantidad})`
            );
        });

        // Creamos la tabla HTML con el resumen
        let html = `
            <table class="resumen-table">
                <thead>
                    <tr>
                        <th>Plato</th>
                        <th>Cantidad Total Pedida</th>
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
                    <td>${data.pedidos_individuales.join('<br>')}</td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        `;
        container.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar el resumen:", error);
        container.innerHTML = `<p class="placeholder" style="color: red;">${error.message}</p>`;
    }
}