document.addEventListener("DOMContentLoaded", () => {
    validarAccesoAdministrador();
    cargarYMostrarMenus();
});

// ✅ RESTRICCIÓN SOLO PARA ADMIN
function validarAccesoAdministrador() {
    const rol = localStorage.getItem('rol');
    if (rol !== 'ADMINISTRADOR') {
        alert('Acceso denegado. Esta vista es solo para administradores.');
        window.location.href = '../index.html';
    }
}

// ✅ Cargar menús y mostrarlos
async function cargarYMostrarMenus() {
    const menusContainer = document.getElementById("menus-container");
    try {
        const response = await fetch("http://localhost:3000/api/administrador/menu/todos");
        if (!response.ok) throw new Error("No se pudieron cargar los datos de los menús.");
        const data = await response.json();

        if (data.length === 0) {
            menusContainer.innerHTML = '<div class="alert alert-info text-center">No hay platos asignados a ningún menú. Usa la sección "Asignar Plato a Menú" para empezar.</div>';
            return;
        }

        const menusAgrupados = {};
        data.forEach(item => {
            if (!menusAgrupados[item.id_menu]) {
                menusAgrupados[item.id_menu] = { semana: item.semana, es_actual: item.es_actual, dias: {} };
            }
            if (!menusAgrupados[item.id_menu].dias[item.nombre_dia]) {
                menusAgrupados[item.id_menu].dias[item.nombre_dia] = [];
            }
            menusAgrupados[item.id_menu].dias[item.nombre_dia].push(item);
        });

        let html = '';
        const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

        for (const idMenu in menusAgrupados) {
            const menu = menusAgrupados[idMenu];
            html += `
                <div class="card shadow-sm mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Menú Semana ${menu.semana} ${menu.es_actual ? '<span class="badge bg-success ms-2">ACTUAL</span>' : ''}</h4>
                        ${!menu.es_actual ? `<button class="btn btn-primary btn-sm btn-publicar-menu" data-id-menu="${idMenu}">Publicar Menú</button>` : ''}
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
            `;
            
            ordenDias.forEach(dia => {
                const nombreDia = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
                html += `
                    <div class="col">
                        <div class="day-column">
                            <h6 class="day-header">${nombreDia}</h6>
                `;
                if (menu.dias[dia]) {
                    menu.dias[dia].forEach(plato => {
                        html += `
                            <div class="dish-card">
                                <span class="dish-name">${plato.nombre_plato}</span>
                                <small class="dish-category text-muted">${plato.categoria}</small>
                                <button class="btn-remove" title="Eliminar asignación" onclick="removerPlatoDeMenu(${idMenu}, ${plato.id_item_menu}, ${plato.id_dia}, '${plato.nombre_plato.replace(/'/g, "\\'")}')">&times;</button>
                            </div>
                        `;
                    });
                } else {
                    html += `<small class="text-muted fst-italic">Sin platos</small>`;
                }
                html += `
                        </div>
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
                </div>
            `;
        }

        menusContainer.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar menús:", error);
        menusContainer.innerHTML = `<div class="alert alert-danger">Error al cargar los datos. Revisa la consola y que el servidor esté funcionando.</div>`;
    }
}

// ✅ ESTABLECER MENÚ COMO ACTUAL
async function establecerMenuActual(idMenu) {
    if (!confirm(`¿Seguro que quieres establecer este menú como el actual?`)) return;
    try {
        const response = await fetch(`http://localhost:3000/api/administrador/menu/establecer-actual/${idMenu}`, { method: 'POST' });
        if (response.ok) {
            alert('¡Menú actualizado con éxito!');
            cargarYMostrarMenus();
        } else {
            throw new Error('No se pudo actualizar el menú.');
        }
    } catch (error) {
        console.error("Error al establecer menú actual:", error);
        alert("Hubo un error al establecer el menú como actual.");
    }
}

// ✅ REMOVER PLATO
async function removerPlatoDeMenu(idMenu, idItemMenu, idDia, nombrePlato) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${nombrePlato}"?`)) return;
    
    try {
        const response = await fetch('http://localhost:3000/api/administrador/menu/remover-item', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_menu: idMenu, id_item_menu: idItemMenu, id_dia: idDia })
        });

        if (!response.ok) throw new Error('Falló la eliminación en el servidor.');

        alert(`"${nombrePlato}" fue eliminado del menú con éxito.`);
        cargarYMostrarMenus();

    } catch (error) {
        console.error("Error al eliminar la asignación:", error);
        alert("Hubo un error al intentar eliminar el plato del menú.");
    }
}

// ✅ VALIDACIÓN ANTES DE PUBLICAR
async function validarMenuAntesDePublicar(idMenu) {
    try {
        const response = await fetch(`http://localhost:3000/api/menu/${idMenu}/items`);
        const items = await response.json();

        const diasHabiles = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
        const diasConPlatos = new Set(items.map(item => item.dia_semana));

        const diasFaltantes = diasHabiles.filter(dia => !diasConPlatos.has(dia));

        if (diasFaltantes.length > 0) {
            alert(`No se puede publicar el menú. Faltan platos en: ${diasFaltantes.join(', ')}`);
            return false;
        }

        return true;

    } catch (error) {
        console.error("Error al validar el menú:", error);
        alert("Error al validar el menú. Intenta nuevamente.");
        return false;
    }
}

// ✅ DETECTAR CLIC EN BOTONES DE PUBLICAR (dinámicos)
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-publicar-menu')) {
        const idMenu = e.target.dataset.idMenu;
        const esValido = await validarMenuAntesDePublicar(idMenu);
        if (!esValido) return;

        publicarMenu(idMenu);
    }
});

// ✅ PUBLICAR MENÚ
async function publicarMenu(idMenu) {
    try {
        const response = await fetch(`http://localhost:3000/api/menu/${idMenu}/publicar`, { method: 'POST' });
        if (response.ok) {
            alert('✅ Menú publicado exitosamente.');
            cargarYMostrarMenus(); // refrescar para actualizar la marca de “actual”
        } else {
            alert('❌ Error al publicar el menú.');
        }
    } catch (error) {
        console.error('Error al publicar el menú:', error);
        alert('No se pudo conectar con el servidor.');
    }
};
