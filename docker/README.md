# docker/

Archivos de configuración para desplegar el proyecto en contenedores (backend, frontend, base de datos).



Para cambiar de modo tienes que correr el comando en la terminal (PowerShell, desde la carpeta docker). Esa terminal es la que crea el contenedor con una configuración u otra:



Modo desarrollo (guramaonline):

powershell

&#x20; docker compose up -d

Modo pruebas (gurama\_test):

powershell

&#x20; docker compose -f docker-compose.yml -f docker-compose.test.yml up -d

