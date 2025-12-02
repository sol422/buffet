document.addEventListener("DOMContentLoaded", () => {
    validarAccesoAdministrador();
    cargarYMostrarMenus();
});

// ✅ RESTRICCIÓN SOLO PARA ADMIN (CORREGIDA)
function validarAccesoAdministrador() {
    const usuarioStr = localStorage.getItem('usuario');
    
    if (!usuarioStr) {
        // Caso 1: No hay sesión (localStorage vacío)
        alert('Acceso denegado. No has iniciado sesión.');
        window.location.href = '../index.html';
        return;
    }
    
    const usuario = JSON.parse(usuarioStr);
    
    // Leemos el rol del objeto completo, que ahora es garantizado por index.js
    const rol = usuario.rol; 

    if (rol !== 'ADMINISTRADOR') {
        // Caso 2: Hay sesión, pero no es ADMIN
        alert(`Acceso denegado.\nEsta vista es solo para administradores. Tu rol es: ${rol || 'Indefinido'}`);
        window.location.href = '../index.index.html'; // Redirigir al inicio, no al home
    }
}

async function crearNuevoMenu() {
    // Usamos prompt() para la simplicidad, pero modal es mejor
    const semanaInput = prompt("Ingrese el número de la semana a crear (1, 2, 3 o 4):");
    
    // Si el usuario presiona Cancelar en el prompt
    if (semanaInput === null) {
        return;
    }
    
    const semana = parseInt(semanaInput);
    
    // --- VALIDACIÓN CORREGIDA ---
    if (isNaN(semana) || semana < 1 || semana > 4) {
        alert("Número de semana inválido. Debe ser un número entre 1 y 4.");
        return;
    }
    // ---------------------------

    try {
        const response = await fetch("http://localhost:3000/api/administrador/menu/crear", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semana: semana }) // Ya es un número entero
        });

        if (response.ok) {
            alert(`✅ Semana ${semana} creada con éxito!`);
            cargarYMostrarMenus(); // Recarga para ver la nueva tarjeta de menú
        } else {
            const errorText = await response.json().catch(() => ({ error: 'Error desconocido' }));
            // Mensaje de error más específico si la semana ya existe
            alert(`❌ Error al crear la semana: La semana ${semana} ya existe o hubo un error del servidor.`);
        }
    } catch (error) {
        console.error("Error al crear menú:", error);
        alert("Error de conexión con el servidor.");
    }
}

// =========================================================================
// 🚀 CORRECCIÓN CLAVE: Agrupamiento para mostrar días vacíos
// =========================================================================
async function cargarYMostrarMenus() {
    const menusContainer = document.getElementById("menus-container");
    
    // Lista de los días en MAYÚSCULAS tal como vienen de la base de datos
    const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']; 

    try {
        const response = await fetch("http://localhost:3000/api/administrador/menu/todos");
        if (!response.ok) throw new Error("No se pudieron cargar los datos de los menús.");
        const data = await response.json();

        if (data.length === 0) {
            menusContainer.innerHTML = '<div class="alert alert-info text-center">No hay menús creados. Usa "+ Nueva Semana" para empezar.</div>';
            return;
        }

        const menusAgrupados = {};
        
        // 1. Agrupar la data e inicializar todos los días
        data.forEach(item => {
            const idMenu = item.id_menu;
            const nombreDia = item.nombre_dia ? item.nombre_dia.toUpperCase() : null; // Aseguramos MAYÚSCULAS

            if (!menusAgrupados[idMenu]) {
                menusAgrupados[idMenu] = { 
                    semana: item.semana, 
                    es_actual: item.es_actual, 
                    dias: {} 
                };
                
                // Inicializar todos los días del menú con arrays vacíos
                ordenDias.forEach(dia => {
                    menusAgrupados[idMenu].dias[dia] = [];
                });
            }
            
            // 2. Solo añadir el plato si realmente existe (id_item_menu no es NULL)
            if (item.id_item_menu !== null && nombreDia) {
                // Verificar que el día sea uno de los esperados
                if (menusAgrupados[idMenu].dias[nombreDia]) {
                    menusAgrupados[idMenu].dias[nombreDia].push(item);
                }
            }
        });

        let html = '';

        // 3. Iterar sobre los menús agrupados y renderizar
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
                // Formatear el nombre del día para mostrar (Ej: LUNES -> Lunes)
                const nombreDia = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
                const platosDelDia = menu.dias[dia] || []; // Usar el array inicializado o uno vacío
                
                html += `
                    <div class="col">
                        <div class="day-column">
                            <h6 class="day-header">${nombreDia}</h6>
                `;
                
                // 4. Renderizar platos o el mensaje "Sin platos"
                if (platosDelDia.length > 0) {
                    platosDelDia.forEach(plato => {
                        // Aquí nos aseguramos de que plato.id_item_menu y plato.id_dia existan para el botón de remover
                        if (plato.id_item_menu && plato.id_dia) {
                            html += `
                                <div class="dish-card">
                                    <span class="dish-name">${plato.nombre_plato}</span>
                                    <small class="dish-category text-muted">${plato.categoria}</small>
                                    <button class="btn-remove" title="Eliminar asignación" onclick="removerPlatoDeMenu(${idMenu}, ${plato.id_item_menu}, ${plato.id_dia}, '${plato.nombre_plato.replace(/'/g, "\\'")}')">&times;</button>
                                </div>
                            `;
                        }
                    });
                } else {
                    html += `<small class="text-muted fst-italic">Sin platos</small>`;
                }
                
                html += `</div> </div>
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
// =========================================================================
// 👆 FIN DE LA CORRECCIÓN CLAVE
// =========================================================================

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
    // NOTA: Esta función requiere que el endpoint `/api/menu/{id}/items` devuelva 
    // una lista de platos que incluya el nombre del día (ej: dia_semana: 'LUNES').
    try {
        const response = await fetch(`http://localhost:3000/api/menu/${idMenu}/items`);
        // Si no existe este endpoint, debes usar la misma lógica de /menu/todos 
        // para verificar si el menú tiene platos para los 5 días.
        if (!response.ok) {
            console.warn("El endpoint de validación no está disponible o falló.");
            return true; // Asumimos que es válido para no bloquear
        }

        const items = await response.json();

        const diasHabiles = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
        const diasConPlatos = new Set(items.map(item => item.dia_semana ? item.dia_semana.toUpperCase() : null));

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
        
        // La validación antes de publicar puede ser una función asíncrona que debes asegurar que exista
        // Si no tienes el endpoint de validación, podrías comentar las siguientes dos líneas
        // y descomentar la línea de 'publicarMenu(idMenu);'
        // const esValido = await validarMenuAntesDePublicar(idMenu);
        // if (!esValido) return;

        publicarMenu(idMenu);
    }
});

// ✅ PUBLICAR MENÚ
async function publicarMenu(idMenu) {
    // Usamos el endpoint de administrador que ya enviaste
    try {
        const response = await fetch(`http://localhost:3000/api/administrador/menu/establecer-actual/${idMenu}`, { method: 'POST' }); 
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