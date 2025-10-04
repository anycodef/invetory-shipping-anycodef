# Guía de Inicio Rápido con Docker

Esta guía explica cómo levantar y ejecutar el servicio de `almacen` y su base de datos PostgreSQL utilizando Docker y Docker Compose.

## Prerrequisitos

- Docker instalado en tu máquina.
- Docker Compose (generalmente incluido en las instalaciones modernas de Docker).
- Un clon de este repositorio.

## Pasos para Levantar el Entorno

### 1. Navegar al Directorio `infra`

Todos los comandos de Docker Compose deben ejecutarse desde el directorio que contiene el archivo `docker-compose.yml`.

```bash
cd infra
```

### 2. Crear el Archivo de Entorno

El entorno de Docker Compose requiere un archivo `.env` para configurar las credenciales de la base de datos. Se proporciona un archivo de ejemplo. Cópialo para crear tu propio archivo de configuración local:

```bash
cp .env.example .env
```

*Nota: El archivo `.env` es ignorado por Git y no debe ser versionado.*

### 3. Levantar los Contenedores

Ejecuta el siguiente comando para construir las imágenes (si es la primera vez) y levantar los servicios en segundo plano (`-d`):

```bash
sudo docker compose up --build -d
```

*   `sudo` puede ser necesario si tu usuario no pertenece al grupo `docker`.
*   `--build` asegura que la imagen del servicio `almacen` se reconstruya si ha habido cambios en su `Dockerfile` o en los archivos de la aplicación.

Después de unos momentos, tendrás dos contenedores en ejecución:
- `infra-almacen-service-1`: La aplicación de Node.js.
- `infra-postgres-db-1`: La base de datos PostgreSQL.

### 3. Verificar el Estado de los Contenedores

Puedes verificar que ambos contenedores estén en funcionamiento con el comando:

```bash
sudo docker compose ps
```

Deberías ver ambos servicios con el estado `running` o `up`.

### 4. Aplicar Migraciones de la Base de Datos

La primera vez que levantes el entorno (o si hay cambios en el esquema de la base de datos), necesitas aplicar las migraciones.

```bash
sudo docker compose exec almacen-service npx prisma migrate dev
```

Este comando ejecuta las migraciones de Prisma dentro del contenedor del servicio, creando todas las tablas necesarias en la base de datos.

### 5. Poblar la Base de Datos con Datos de Prueba (Seeding)

Para llenar la base de datos con datos iniciales, ejecuta el script de seeding:

```bash
sudo docker compose exec almacen-service npm run prisma:seed
```

Con esto, la base de datos estará lista y poblada con datos de ejemplo.

## Acceso al Servicio

Una vez que todo esté en funcionamiento, el servicio de `almacen` estará disponible en:

- **URL del servicio**: `http://localhost:3002`
- **Endpoint de salud**: `http://localhost:3002/health`

## Cómo Detener el Entorno

Para detener los contenedores, ejecuta el siguiente comando desde el directorio `infra`:

```bash
sudo docker compose down
```

Si además deseas eliminar los volúmenes (lo que borrará permanentemente los datos de la base de datos), puedes usar:

```bash
sudo docker compose down -v
```