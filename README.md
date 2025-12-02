

# 🍽️ Proyecto Buffet: Sistema de Pedidos de Almuerzo

## 📋 Descripción del Proyecto

El Proyecto Buffet es una aplicación web full-stack diseñada para gestionar la **planificación de menús semanales** y el **registro de pedidos de almuerzo** dentro de una empresa. El sistema soporta dos tipos de pedidos:
1.  **Planificación Semanal (Empleados):** Pedidos realizados con anticipación, filtrados por los días de asistencia presencial del empleado.
2.  **Pedido Express (Carta):** Pedidos individuales basados en el catálogo completo.

El sistema implementa **lógica transaccional** para asegurar la integridad del stock y los pedidos.

## 💻 Tecnologías Utilizadas

| Componente | Tecnología | Evidencia |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 (Bootstrap 5.3), JavaScript Nativo (ES6) | `BuffetI2T-front/` |
| **Backend** | Node.js (Express) | `BuffetI2T-back/server.js` |
| **Base de Datos** | MySQL / MariaDB | `BuffetI2T-back/db/buffet.sql` |

---

## 🚀 Configuración del Entorno Local

### Paso 1: Configuración de la Base de Datos (MySQL)

1.  **Iniciar Servidor:** Asegure que los servicios **Apache** y **MySQL** estén activos (ej. XAMPP/WAMP).
2.  **Crear DB:** Acceda a phpMyAdmin y cree una nueva base de datos llamada `buffet`.
3.  **Importar Esquema:** Importe el archivo **`BuffetI2T-back/db/buffet.sql`** a la base de datos `buffet`.
4.  **Verificar Conexión:** La aplicación está configurada para usar el host `localhost` con el usuario `root` y **sin contraseña**.

### Paso 2: Configuración e Inicio del Backend (Node.js)

1.  **Acceder a Carpeta:** Abra la terminal y navegue hasta la carpeta del backend (`BuffetI2T-main/BuffetI2T-back`).
2.  **Instalar Dependencias:** Ejecute `npm install` (requiere Node.js instalado).
3.  **Iniciar Servidor:** Ejecute `node server.js`.
    *Debería ver el mensaje `✅ Conexión exitosa a la base de datos buffet` y `Servidor corriendo en http://localhost:3000`*.

### Paso 3: Acceso al Frontend

1.  Abra su navegador y acceda al archivo de inicio:
    `http://localhost/ruta-del-proyecto/BuffetI2T-front/index.html`

---

## 🔑 Cuentas de Prueba Pre-Cargadas

| Rol | Email | Contraseña | Comentarios |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@buffet.com` | `admin123` | Acceso a gestión de menús y reportes. |
| **Empleado** | `empleado@test.com` | `123456` | Puede configurar días de asistencia y realizar pedidos. |

---

## ✅ Caso de Éxito Detallado para Revisión

Este caso de prueba demuestra el flujo completo y las validaciones críticas del sistema, cubriendo los escenarios de **Administrador**, **Registro de Usuario** y **Pedido Semanal** con control de stock.

### I. Flujo del Administrador: Preparación del Menú

| Paso | Acceso | Detalle de la Acción | Requisito / Ruta |
| :--- | :--- | :--- | :--- |
| **1. Login** | `admin@buffet.com` | Iniciar sesión y acceder al Panel de Administrador. | **Validación y Login** |
| **2. Publicar** | Gestionar Menús | Asegurar que el **Menú Semana 10** esté marcado como **ACTUAL** (o publicar el que se desee). | **Crear/Editar/Eliminar Menús** (`POST /menu/establecer-actual/:id`) |

### II. Flujo del Empleado: Registro y Pedido Semanal

| Paso | Acceso | Detalle de la Acción | Requisito Demostrado |
| :--- | :--- | :--- | :--- |
| **3. Registrar** | `register/register.html` | Registrar un **nuevo empleado** (ej. `nuevo@buffet.com`, `123456`). | **Registro**. **Evidencia de Escritura DB** (`INSERT` en `usuario` y `empleado`) |
| **4. Configurar** | Modificar Perfil | Marcar solo **Lunes** y **Miércoles** como días de asistencia. | **Configurar días de asistencia** (`PUT /api/empleado/:email`) |
| **5. Filtrado** | Inicio (Home) | El menú **solo debe mostrar los platos asignados para Lunes y Miércoles** (si existen en el menú activo). | **Ver menú según esos días** (`GET /api/empleado/menu-actual/:id`) |
| **6. Seleccionar** | Menú Semanal | Seleccionar **1 unidad** de un plato para el Lunes y **1 unidad** de otro plato para el Miércoles. | **Seleccionar pedido**. |
| **7. Confirmar** | Detalle de Pedido | Hacer clic en **"Confirmar Pedido"**. | **Confirmación de Pedido, Escritura DB y JSON**. El sistema realiza la transacción completa. |

### III. Demostración Técnica Final (Control de Stock)

| Paso | Acceso | Detalle de la Acción | Requisito Demostrado |
| :--- | :--- | :--- | :--- |
| **8. Verificar Stock** | phpMyAdmin (Tabla `item_menu`) | Comprobar que el `stock` de los platos seleccionados en el Paso 6 **se ha reducido en 1 unidad** por cada selección. | **Escritura DB y Transaccionalidad** (`UPDATE stock = stock - 1`) |
| **9. Reporte** | **ADMIN** / Ver Pedidos | Acceder al panel de **"Pedidos Empleados"** (Resumen para Cocina). | **Ver Confirmaciones de Pedidos** (El reporte debe reflejar el nuevo pedido de `nuevo@buffet.com`) |
| **10. Historial** | Historial | Acceder al Historial de Pedidos del nuevo empleado. | **Ver Historial** |
