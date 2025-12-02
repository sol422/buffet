document.addEventListener('DOMContentLoaded', () => {
    cargarPlatosDisponibles();
    cargarSemanasDisponibles(); // ✅ NUEVA LÍNEA: Cargamos las semanas reales de la BD
    
    const platoSelect = document.getElementById('nombre');
    platoSelect.addEventListener('change', actualizarCampos);
});

let platosData = []; // Guardaremos los datos de los platos aquí

async function cargarPlatosDisponibles() {
    const platoSelect = document.getElementById('nombre');
    
    try {
        const response = await fetch('http://localhost:3000/api/administrador/items');
        if (!response.ok) {
            throw new Error('No se pudieron cargar los platos.');
        }
        const platos = await response.json();
        platosData = platos; // Guardamos los datos en la variable global

        platoSelect.innerHTML = '<option value="">Seleccione un plato existente...</option>';

        platos.forEach(plato => {
            const option = document.createElement('option');
            option.value = plato.id;
            option.textContent = plato.nombre;
            platoSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar platos:", error);
        platoSelect.innerHTML = '<option value="">Error al cargar platos</option>';
    }
}

// ✅ NUEVA FUNCIÓN: Obtiene los menús creados para llenar el select con IDs válidos
async function cargarSemanasDisponibles() {
    const semanaSelect = document.getElementById('semana');
    
    try {
        const response = await fetch('http://localhost:3000/api/administrador/menu/todos');
        if (!response.ok) throw new Error('Error al cargar semanas');
        
        const menus = await response.json();
        
        // Limpiamos y llenamos el select
        semanaSelect.innerHTML = '<option value="" selected disabled>Seleccione una semana</option>';
        
        // Filtramos para mostrar solo una opción por semana única
        const semanasVistas = new Set();
        
        menus.forEach(menu => {
            // Verificamos que no hayamos agregado ya esta semana visualmente
            if (!semanasVistas.has(menu.semana)) {
                semanasVistas.add(menu.semana);
                
                const option = document.createElement('option');
                // IMPORTANTE: Usamos menu.id_menu (el ID real de la BD) en el value
                option.value = menu.id_menu; 
                option.textContent = `Semana ${menu.semana}`;
                semanaSelect.appendChild(option);
            }
        });

    } catch (error) {
        console.error("Error cargando semanas:", error);
        semanaSelect.innerHTML = '<option value="">Error de carga</option>';
    }
}

function actualizarCampos() {
    const platoSelect = document.getElementById('nombre');
    const selectedId = platoSelect.value;

    const categoriaInput = document.getElementById('categoria');
    const descripcionTextarea = document.getElementById('descripcion');

    if (selectedId) {
        const platoSeleccionado = platosData.find(p => p.id == selectedId);
        if (platoSeleccionado) {
            categoriaInput.value = platoSeleccionado.categoria || '';
            descripcionTextarea.value = platoSeleccionado.descripcion || '';
        }
    } else {
        categoriaInput.value = 'Se rellenará automáticamente';
        descripcionTextarea.value = '';
    }
}

async function validarDatos() {
    const idItemMenu = document.getElementById('nombre').value;
    const idMenu = document.getElementById('semana').value;
    const checkboxes = document.querySelectorAll('input[name="dias"]:checked');
    
    if (!idItemMenu || !idMenu || checkboxes.length === 0) {
        alert('Por favor, selecciona un plato, una semana y al menos un día.');
        return;
    }

    const diaMap = { 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5 };
    const diasSeleccionados = Array.from(checkboxes).map(chk => diaMap[chk.value]);

    const datosAsignacion = {
        id_menu: parseInt(idMenu),
        id_item_menu: parseInt(idItemMenu),
        dias: diasSeleccionados
    };

    try {
        const response = await fetch('http://localhost:3000/api/administrador/menu/asignar-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosAsignacion)
        });

        if (response.ok) {
            alert('¡Plato asignado al menú con éxito!');
            window.location.href = '../gestionar-menu/gestionar-menu.html';
        } else {
            throw new Error('Falló la asignación del plato.');
        }
    } catch (error) {
        console.error('Error al asignar:', error);
        alert('Hubo un error al asignar el plato al menú. Revisa la consola del navegador y la del servidor de Node.js.');
    }
}