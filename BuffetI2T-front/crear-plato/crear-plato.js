async function guardarPlato() {
    // 1. Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const stock = document.getElementById('stock').value;
    const descripcion = document.getElementById('descripcion').value.trim();

    // 2. Validar que los campos no estén vacíos
    if (!nombre || !categoria || !stock || !descripcion) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // 3. Crear el objeto con los datos del nuevo plato
    const datosNuevoPlato = {
        nombre: nombre,
        categoria: categoria,
        stock: parseInt(stock, 10), // Aseguramos que el stock sea un número
        descripcion: descripcion
    };

    // 4. Enviar los datos al backend usando fetch
    try {
        const response = await fetch("http://localhost:3000/api/administrador/items/agregar", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosNuevoPlato)
        });

        if (response.ok) {
            alert(`¡Plato "${nombre}" creado con éxito!`);
            // Opcional: Redirigir al perfil del admin después de crear el plato
            window.location.href = '../perfil-administrador/perfil-administrador.html';
        } else {
            // Si el backend devuelve un error
            const errorData = await response.text();
            alert(`Error al crear el plato: ${errorData}`);
        }
    } catch (error) {
        // Si hay un error de conexión
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor. Revisa que el backend esté funcionando.");
    }
}