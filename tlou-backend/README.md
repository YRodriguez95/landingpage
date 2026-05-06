# TLOU Backend - The Last of Us Supply Channel

Backend con Node.js y Express para registrar pedidos en `data/pedidos.json`.

## Requisitos

- Node.js

## Instalacion

```bash
npm install
```

## Datos

Los pedidos se guardan en:

```txt
tlou-backend/data/pedidos.json
```

## Arrancar el servidor

```bash
npm start
```

Abre el formulario en:

```txt
http://localhost:3000/tlou-backend/public/indexxx.html
```

## API REST

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos los pedidos |
| GET | `/api/pedidos?nombre=Joel` | Filtrar por nombre |
| GET | `/api/pedidos?plataforma=PlayStation 5` | Filtrar por plataforma |
| GET | `/api/pedidos?estado=pendiente` | Filtrar por estado |
| GET | `/api/pedidos/:id` | Obtener un pedido por ID |
| POST | `/api/pedidos` | Crear nuevo pedido en `pedidos.json` |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| DELETE | `/api/pedidos/:id` | Eliminar un pedido |
| GET | `/api/stats` | Estadisticas generales |
| GET | `/api/db` | Exportar el archivo JSON completo |

## Ejemplo POST

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Joel Miller",
    "email": "joel@zona.com",
    "plataforma": "PlayStation 5",
    "edicion": "Edicion Coleccionista",
    "notas": "Avisar cuando llegue"
  }'
```

## Documento de pedido

```json
{
  "id": "TLU-X4K2M9",
  "nombre": "Joel Miller",
  "email": "joel@zona.com",
  "plataforma": "PlayStation 5",
  "edicion": "Edicion Coleccionista",
  "notas": "Avisar cuando llegue",
  "fecha": "2026-04-30T10:30:00.000Z",
  "estado": "pendiente"
}
```

## Estados disponibles

- `pendiente`
- `completado`
- `cancelado`
