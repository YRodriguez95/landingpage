# 🎮 TLOU Backend — The Last of Us Supply Channel

Backend real con Node.js + Express que lee y escribe en `data/pedidos.json`.

## Estructura del proyecto

```
tlou-backend/
├── server.js          ← Servidor Express (API REST)
├── data/
│   └── pedidos.json   ← Base de datos JSON real
├── public/
│   ├── index.html     ← Formulario nuevo pedido
│   ├── viewer.html    ← JSON Viewer
│   └── pedidos.html   ← Lista de pedidos
└── package.json
```

## Instalación

```bash
npm install
```

## Arrancar el servidor

```bash
node server.js
```

Abre el navegador en: **http://localhost:3000**

---

## API REST — Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos los pedidos |
| GET | `/api/pedidos?nombre=Joel` | Filtrar por nombre |
| GET | `/api/pedidos?plataforma=PlayStation 5` | Filtrar por plataforma |
| GET | `/api/pedidos?estado=pendiente` | Filtrar por estado |
| GET | `/api/pedidos/:id` | Obtener un pedido por ID |
| POST | `/api/pedidos` | Crear nuevo pedido |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| DELETE | `/api/pedidos/:id` | Eliminar un pedido |
| GET | `/api/stats` | Estadísticas generales |
| GET | `/api/db` | Descargar el JSON completo |

---

## Ejemplo POST

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Joel Miller",
    "email": "joel@zona.com",
    "plataforma": "PlayStation 5",
    "edicion": "Edición Coleccionista",
    "notas": "Avisar cuando llegue"
  }'
```

## Ejemplo PATCH (cambiar estado)

```bash
curl -X PATCH http://localhost:3000/api/pedidos/TLU-XXXXX/estado \
  -H "Content-Type: application/json" \
  -d '{ "estado": "completado" }'
```

## Estructura de un pedido en pedidos.json

```json
{
  "id": "TLU-X4K2M9",
  "nombre": "Joel Miller",
  "email": "joel@zona.com",
  "plataforma": "PlayStation 5",
  "edicion": "Edición Coleccionista",
  "notas": "Avisar cuando llegue",
  "fecha": "2026-04-27T10:30:00.000Z",
  "estado": "pendiente"
}
```

## Estados disponibles
- `pendiente` (por defecto al crear)
- `completado`
- `cancelado`
