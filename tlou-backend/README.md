# TLOU Backend - The Last of Us Supply Channel

Backend con Node.js, Express y MongoDB para registrar pedidos desde el formulario.

## Requisitos

- Node.js
- MongoDB local o MongoDB Atlas

## Instalacion

```bash
npm install
```

## Configurar MongoDB

Por defecto usa una base de datos local:

```txt
mongodb://127.0.0.1:27017/tlou
```

Si quieres usar MongoDB Atlas u otra base de datos, arranca el servidor con `MONGODB_URI`:

```bash
$env:MONGODB_URI="mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/tlou"
npm start
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
| POST | `/api/pedidos` | Crear nuevo pedido en MongoDB |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| DELETE | `/api/pedidos/:id` | Eliminar un pedido |
| GET | `/api/stats` | Estadisticas generales |
| GET | `/api/db` | Exportar pedidos desde MongoDB como JSON |

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
