# Sistema de Gestión de Pedidos de Buffet

Proyecto final para la materia "PRACTICA PROFESIONALIZANTE 1". Es una aplicación web full-stack que simula un sistema de pedidos para un servicio de buffet de almuerzos en una empresa.

El sistema permite a un administrador gestionar el menú semanal y a los empleados realizar sus pedidos según los días que asisten a la oficina.

# Vista Previa del Proyecto

[Panel de Administrador](https://i.imgur.com/83u4c83.png)
Panel de control del Administrador con diseño Bootstrap._

[Menú del Empleado](https://i.imgur.com/5V3M25c.png)
Vista del empleado, mostrando el menú filtrado por sus días de asistencia._

# Tecnologías Utilizadas

* Backend: Node.js, Express.js, `mysql2`, `cors`.
* Frontend: HTML5, CSS3, JavaScript (Vanilla JS), Bootstrap 5.
* Base de Datos: MySQL.
* Versionado: Git y GitHub.

# Cómo Ejecutar el Proyecto

Requisitos
- Tener instalado [Node.js](https://nodejs.org/) (que incluye npm).
- Tener un servidor de base de datos MySQL (se recomienda usar [XAMPP](https://www.apachefriends.org/index.html)).

# Pasos para la Instalación

1. Descargar el Proyecto:
    -  Ve a la página principal de este repositorio en GitHub.
    -  Haz clic en el botón verde `< > Code`.
    -  Selecciona la opción `Download ZIP`.
    -  Descomprime el archivo ZIP en una ubicación de tu computadora (por ejemplo, en el Escritorio). Se creará una carpeta llamada `proyecto-buffet-main`.

2. Configurar la Base de Datos:
    -  Inicia los servicios de Apache y MySQL en el panel de control de XAMPP.
    - Abre phpMyAdmin en tu navegador (normalmente en `http://localhost/phpmyadmin`).
    - Crea una base de datos nueva llamada `buffet`.
    - Ve a la pestaña "Importar", selecciona el archivo `buffet.sql` que se encuentra dentro de la carpeta `BuffetI2T-back/db` del proyecto que descargaste, y haz clic en "Importar".

3.  Instalar y Ejecutar el Backend:
    - Abre una terminal o consola (puedes usar la que viene integrada en Visual Studio Code).
    - Navega hasta la carpeta principal del proyecto que descomprimiste.
    bash
    - cd buffet-main
        
    Una vez dentro de la carpeta principal, navega a la carpeta del backend:
    bash
    - cd BuffetI2T-back
   
    Instala las dependencias necesarias:
    bash
    - npm install

    Inicia el servidor:
    bash
    - node server.js
    
    El servidor estará corriendo en `http://localhost:3000`. 
    Deja esta terminal abierta.

4.  Ejecutar el Frontend:
    - Abre la carpeta principal del proyecto (`proyecto-buffet-main`) en Visual Studio Code.
    - En el explorador de archivos, busca el archivo `BuffettI2T-front/index.html`.
    - Haz clic derecho sobre él y selecciona "Open with Live Server".

# Usuarios de Prueba

Administrador:
    - Email:`admin@buffet.com`
    - Contraseña:`admin123`
Empleado:
    - Email:`empleado@test.com`
    - Contraseña:`123456`
