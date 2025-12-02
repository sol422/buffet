document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos el nombre y apellido del administrador desde el localStorage
    const nombre = localStorage.getItem('nombre') || 'Admin';
    const apellido = localStorage.getItem('apellido') || '';
    
    // Buscamos el elemento en el HTML donde mostraremos el nombre
    const adminNombreSpan = document.getElementById('admin-nombre');
    
    // Verificamos que el elemento exista antes de intentar modificarlo
    if (adminNombreSpan) {
        // Unimos nombre y apellido y lo mostramos
        adminNombreSpan.textContent = `${nombre} ${apellido}`.trim();
    }
});