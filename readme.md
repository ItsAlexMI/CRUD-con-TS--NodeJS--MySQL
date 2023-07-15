# TaskFlow

![TaskFlow](https://github.com/ItsAlexMI/TaskFlow/raw/main/public/images/logo.png)

TaskFlow es una plataforma basada en TypeScript, Node.js, EJS y SQLite, diseñada para facilitar la comunicación y la gestión de tareas entre profesores y estudiantes. La aplicación permite a los profesores crear grupos de clases y enviar tareas a cada grupo, mientras que los estudiantes pueden unirse a los grupos y enviar sus tareas correspondientes. La comunicación entre profesores y estudiantes se realiza a través de correo electrónico.

## Características principales

- Creación y gestión de grupos de clases: Los profesores pueden crear grupos de clases y asignar tareas a cada grupo. Cada grupo tiene un nombre y una descripción para facilitar la identificación y la organización.

- Envío de tareas: Los profesores pueden enviar tareas a los grupos de clases. Cada tarea tiene un título, una descripción y una fecha límite de entrega. Los estudiantes pueden acceder a las tareas asignadas a su grupo y enviar sus respuestas correspondientes.

- Registro y autenticación de usuarios: Los usuarios (profesores y estudiantes) pueden registrarse en la plataforma utilizando su correo electrónico y una contraseña. Se implementa un sistema de autenticación seguro para proteger los datos de los usuarios.

- Notificaciones por correo electrónico: La plataforma utiliza el correo electrónico como medio de comunicación principal entre profesores y estudiantes. Se envían notificaciones a los usuarios cuando se crean grupos, se asignan tareas o se reciben respuestas a las tareas.

- Interfaz de usuario intuitiva: La interfaz de usuario está diseñada para ser fácil de usar y comprensible tanto para profesores como para estudiantes. Se utiliza el motor de plantillas EJS para generar vistas dinámicas y mostrar información relevante de manera clara.

## Tecnologías utilizadas

- TypeScript
- Node.js
- EJS
- SQLite

## Instalación

1. Clona este repositorio en tu máquina local:

- https://github.com/ItsAlexMI/TaskFlow.git

2. Ve al directorio del proyecto:
- cd TaskFlow

3. Instala las dependencias del proyecto:
- npm install
- npm install -g typescript

## Uso

1. Inicia el servidor desde la raiz del directorio:

node dist/app.js

2. Abre tu navegador web y accede a la siguiente URL:

http://localhost:3000

¡Listo! Ahora puedes empezar a utilizar TaskFlow.

## Contribución
Si deseas contribuir a TaskFlow, sigue estos pasos:

1. Crea un fork de este repositorio.

2. Crea una rama con la nueva funcionalidad:

- git checkout -b nueva-funcionalidad

3. Realiza tus cambios y realiza commit de los mismos:

- git commit -m "Agrega nueva funcionalidad"

4.Envía tus cambios al repositorio remoto:

- git push origin nueva-funcionalidad