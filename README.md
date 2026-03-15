# Gestión de Incidencias - Fullstack

Este proyecto es una aplicación fullstack para la gestión de incidencias en planta, centralizada en un único repositorio para facilitar el desarrollo y despliegue.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

-   `src/`: Código fuente del frontend (React + Vite).
-   `public/`: Archivos estáticos del frontend.
-   `routes/`: Definiciones de rutas de la API (Express).
-   `services/`: Servicios de lógica de negocio (Cloudinary, Reportes Word, etc.).
-   `server.js`: Punto de entrada del servidor backend.
-   `docker-compose.yml`: Configuración de la base de datos MySQL en Docker.
-   `.env`: Variables de entorno para configuración local.

## Requisitos Previos

-   [Node.js](https://nodejs.org/) (v20+)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-   [pnpm](https://pnpm.io/) (recomendado) o npm.

## Configuración Inicial

1.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

2.  **Iniciar la Base de Datos:**
    Asegúrate de tener Docker corriendo y ejecuta:
    ```bash
    docker-compose up -d
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz (puedes usar los valores por defecto si usas el Docker incluido):
    ```env
    DB_HOST_GI=localhost
    DB_USER_GI=user_gi
    DB_PASSWORD_GI=pass_gi
    DB_NAME_GI=gestion_incidencias
    PORT_GI=3000
    VITE_API_BASE_URL=http://localhost:3000/api
    
    # Cloudinary (Requerido para imágenes)
    CLOUDINARY_NAME=tu_nombre
    CLOUDINARY_API_KEY=tu_key
    CLOUDINARY_API_SECRET=tu_secret
    ```

## Inicialización de la Base de Datos y Admin

Dado que el sistema es aislado y no tiene función de registro pública, se debe inicializar la base de datos y crear el primer usuario administrador manualmente.

Para esto, puedes crear un archivo temporal `init_db.js` con el siguiente contenido y ejecutarlo con `node init_db.js`:

```javascript
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function init() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST_GI,
        user: process.env.DB_USER_GI,
        password: process.env.DB_PASSWORD_GI,
        database: process.env.DB_NAME_GI
    });

    // Crear tablas y usuario admin...
    // (Consulta el código de inicialización en la documentación del proyecto)
}
```
*Nota: Si ya has ejecutado el script de inicialización durante el setup, no es necesario repetirlo.*

## Ejecución en Desarrollo

Para ejecutar tanto el frontend como el backend simultáneamente:

```bash
pnpm dev
```

-   **Frontend:** `http://localhost:5173`
-   **Backend (API):** `http://localhost:3000/api`

## Tecnologías Principales

-   **Frontend:** React, Vite, Axios, Recharts (Estadísticas), Tailwind CSS.
-   **Backend:** Node.js (ES Modules), Express, MySQL2.
-   **Servicios:** Cloudinary (Almacenamiento de fotos), Docx (Generación de reportes).
-   **Infraestructura:** Docker Compose (MySQL).
