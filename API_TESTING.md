# Guía de Pruebas de la API

Esta guía proporciona ejemplos de `curl` para probar los endpoints del servicio de `almacen`. Todos los endpoints están prefijados con `/api`.

**URL Base**: `http://localhost:3002`

---

### 1. Endpoint de Salud

Verifica si el servicio está activo.

```bash
curl http://localhost:3002/health
```
**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Servicio de Almacén está activo"
}
```

---

### 2. Endpoints de Ubicación

#### Obtener todos los Departamentos
```bash
curl http://localhost:3002/api/departamentos
```

#### Obtener Provincias (opcionalmente filtrando por departamento)
```bash
# Obtener todas las provincias
curl http://localhost:3002/api/provincias

# Obtener provincias del departamento con ID 1 (Lima)
curl "http://localhost:3002/api/provincias?id_departamento=1"
```

#### Obtener Distritos (opcionalmente filtrando por provincia)
```bash
# Obtener todos los distritos
curl http://localhost:3002/api/distritos

# Obtener distritos de la provincia con ID 1 (Lima)
curl "http://localhost:3002/api/distritos?id_provincia=1"
```

---

### 3. Endpoints de Almacenes (`/api/almacenes`)

#### Obtener lista paginada de Almacenes
```bash
# Obtener la primera página (10 por página por defecto)
curl http://localhost:3002/api/almacenes

# Obtener la página 2, con 5 resultados por página
curl "http://localhost:3002/api/almacenes?page=2&per_page=5"
```

#### Crear un nuevo Almacén
**Nota**: Se asume que ya existe una `Direccion` con `id=1`. El script de seeding crea varias.
```bash
curl -X POST http://localhost:3002/api/almacenes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Almacen Sur",
    "id_direccion": 1
  }'
```

#### Actualizar un Almacén (ID 1)
```bash
curl -X PUT http://localhost:3002/api/almacenes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Almacen Central (Renombrado)",
    "estado": "INACTIVO"
  }'
```

#### Eliminar un Almacén (ID 2)
**Nota**: Esto fallará si el almacén tiene tiendas asociadas.
```bash
curl -X DELETE http://localhost:3002/api/almacenes/2
```

---

### 4. Endpoint de Tiendas (`/api/tiendas`)

#### Obtener lista de Tiendas (con filtros)
```bash
# Obtener todas las tiendas
curl http://localhost:3002/api/tiendas

# Filtrar por nombre
curl "http://localhost:3002/api/tiendas?nombre=Centro"

# Filtrar por distrito (ID 1 = Miraflores)
curl "http://localhost:3002/api/tiendas?distrito=1"

# Filtrar por almacén asociado (ID 1 = Almacen Central)
curl "http://localhost:3002/api/tiendas?almacen=1"

# Combinar filtros (tiendas en San Isidro (ID=2) asociadas al Almacen Central (ID=1))
curl "http://localhost:3002/api/tiendas?almacen=1&distrito=2"
```
**Respuesta esperada (ejemplo):**
```json
{
    "data": [
        {
            "id": 1,
            "imagen": "https://via.placeholder.com/150/0000FF/808080?Text=TiendaCentro",
            "nombre": "Tienda Centro",
            "almacen": "Almacen Central",
            "estado": "ACTIVO",
            "direccion": "Av. Comercio 100",
            "distrito": "Miraflores",
            "provincia": "Lima",
            "departamento": "Lima"
        }
    ],
    "meta": {
        "total": 1,
        "page": 1,
        "perPage": 10,
        "lastPage": 1
    }
}
```