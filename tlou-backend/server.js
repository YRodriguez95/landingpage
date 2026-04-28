const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const DB   = path.join(__dirname, 'data', 'pedidos.json');
const ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT));
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ────────────────────────────────────────────────────────────────
function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return 'TLU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function validate(body) {
  const errors = {};
  if (!body.nombre || body.nombre.trim().length < 3)
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.email = 'El email no es válido.';
  if (!body.plataforma)
    errors.plataforma = 'La plataforma es obligatoria.';
  if (!body.edicion)
    errors.edicion = 'La edición es obligatoria.';
  return errors;
}

// ── RUTAS ──────────────────────────────────────────────────────────────────

// GET /api/pedidos — listar todos (con filtros opcionales)
app.get('/api/pedidos', (req, res) => {
  const db = readDB();
  let pedidos = [...db.pedidos];

  const { nombre, plataforma, edicion, estado } = req.query;
  if (nombre)     pedidos = pedidos.filter(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()));
  if (plataforma) pedidos = pedidos.filter(p => p.plataforma === plataforma);
  if (edicion)    pedidos = pedidos.filter(p => p.edicion === edicion);
  if (estado)     pedidos = pedidos.filter(p => p.estado === estado);

  res.json({ total: pedidos.length, pedidos });
});

// GET /api/pedidos/:id — obtener uno
app.get('/api/pedidos/:id', (req, res) => {
  const db = readDB();
  const pedido = db.pedidos.find(p => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(pedido);
});

// POST /api/pedidos — crear nuevo pedido
app.post('/api/pedidos', (req, res) => {
  const errors = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const db = readDB();
  const pedido = {
    id:         generateId(),
    nombre:     req.body.nombre.trim(),
    email:      req.body.email.trim().toLowerCase(),
    plataforma: req.body.plataforma,
    edicion:    req.body.edicion,
    notas:      req.body.notas?.trim() || null,
    fecha:      new Date().toISOString(),
    estado:     'pendiente'
  };

  db.pedidos.push(pedido);
  writeDB(db);

  console.log(`[POST] Pedido creado: ${pedido.id} — ${pedido.nombre}`);
  res.status(201).json({ message: 'Pedido registrado correctamente.', pedido });
});

// PATCH /api/pedidos/:id/estado — cambiar estado
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const estadosValidos = ['pendiente', 'completado', 'cancelado'];
  const { estado } = req.body;

  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });

  const db = readDB();
  const pedido = db.pedidos.find(p => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });

  pedido.estado = estado;
  pedido.updatedAt = new Date().toISOString();
  writeDB(db);

  console.log(`[PATCH] Pedido ${pedido.id} → estado: ${estado}`);
  res.json({ message: 'Estado actualizado.', pedido });
});

// DELETE /api/pedidos/:id — eliminar pedido
app.delete('/api/pedidos/:id', (req, res) => {
  const db = readDB();
  const index = db.pedidos.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const [eliminado] = db.pedidos.splice(index, 1);
  writeDB(db);

  console.log(`[DELETE] Pedido eliminado: ${eliminado.id}`);
  res.json({ message: `Pedido ${eliminado.id} eliminado.`, pedido: eliminado });
});

// GET /api/db — descargar el JSON completo
app.get('/api/db', (req, res) => {
  res.download(DB, 'pedidos.json');
});

// GET /api/stats — estadísticas rápidas
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const pedidos = db.pedidos;
  res.json({
    total:       pedidos.length,
    pendientes:  pedidos.filter(p => p.estado === 'pendiente').length,
    completados: pedidos.filter(p => p.estado === 'completado').length,
    cancelados:  pedidos.filter(p => p.estado === 'cancelado').length,
    porPlataforma: pedidos.reduce((acc, p) => {
      acc[p.plataforma] = (acc[p.plataforma] || 0) + 1; return acc;
    }, {}),
    porEdicion: pedidos.reduce((acc, p) => {
      acc[p.edicion] = (acc[p.edicion] || 0) + 1; return acc;
    }, {})
  });
});

// ── START ──────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`\n🎮 TLOU Backend corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Red local habilitada en http://TU-IP-LOCAL:${PORT}`);
  console.log(`📁 Base de datos: ${DB}\n`);
  console.log('Rutas disponibles:');
  console.log('  GET    /api/pedidos              — listar pedidos');
  console.log('  GET    /api/pedidos?nombre=Joel  — filtrar');
  console.log('  GET    /api/pedidos/:id          — obtener uno');
  console.log('  POST   /api/pedidos              — crear pedido');
  console.log('  PATCH  /api/pedidos/:id/estado   — cambiar estado');
  console.log('  DELETE /api/pedidos/:id          — eliminar');
  console.log('  GET    /api/stats                — estadísticas');
  console.log('  GET    /api/db                   — descargar JSON\n');
});
