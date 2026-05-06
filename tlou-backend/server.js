const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'pedidos.json');

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT));
app.use(express.static(path.join(__dirname, 'public')));

function generateId() {
  return 'TLU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    await writeDatabase({
      canal: 'The Last of Us - Mercado Seguro',
      version: '1.0',
      pedidos: []
    });
  }
}

async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  const database = JSON.parse(raw || '{}');

  return {
    canal: database.canal || 'The Last of Us - Mercado Seguro',
    version: database.version || '1.0',
    pedidos: Array.isArray(database.pedidos) ? database.pedidos : []
  };
}

async function writeDatabase(database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(database, null, 2) + '\n', 'utf8');
}

function validate(body) {
  const errors = {};

  if (!body.nombre || body.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'El email no es valido.';
  }

  if (!body.plataforma) {
    errors.plataforma = 'La plataforma es obligatoria.';
  }

  if (!body.edicion) {
    errors.edicion = 'La edicion es obligatoria.';
  }

  return errors;
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function filterPedidos(pedidos, filters) {
  return pedidos.filter((pedido) => {
    if (filters.nombre && !String(pedido.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) {
      return false;
    }

    if (filters.plataforma && pedido.plataforma !== filters.plataforma) {
      return false;
    }

    if (filters.edicion && pedido.edicion !== filters.edicion) {
      return false;
    }

    if (filters.estado && pedido.estado !== filters.estado) {
      return false;
    }

    return true;
  });
}

app.get('/', (req, res) => {
  res.send('API funcionando con pedidos.json');
});

app.get('/api/pedidos', asyncRoute(async (req, res) => {
  const database = await readDatabase();
  const pedidos = filterPedidos(database.pedidos, req.query)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  res.json({ total: pedidos.length, pedidos });
}));

app.get('/api/pedidos/:id', asyncRoute(async (req, res) => {
  const database = await readDatabase();
  const pedido = database.pedidos.find((item) => item.id === req.params.id);

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  res.json(pedido);
}));

app.post('/api/pedidos', asyncRoute(async (req, res) => {
  const errors = validate(req.body);

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  const database = await readDatabase();
  let id = generateId();

  while (database.pedidos.some((pedido) => pedido.id === id)) {
    id = generateId();
  }

  const pedido = {
    id,
    nombre: req.body.nombre.trim(),
    email: req.body.email.trim().toLowerCase(),
    plataforma: req.body.plataforma,
    edicion: req.body.edicion,
    notas: req.body.notas?.trim() || null,
    fecha: new Date().toISOString(),
    estado: 'pendiente'
  };

  database.pedidos.push(pedido);
  await writeDatabase(database);

  console.log(`[POST] Pedido guardado en pedidos.json: ${pedido.id} - ${pedido.nombre}`);
  res.status(201).json({
    message: 'Pedido registrado correctamente.',
    pedido
  });
}));

app.patch('/api/pedidos/:id/estado', asyncRoute(async (req, res) => {
  const estadosValidos = ['pendiente', 'completado', 'cancelado'];
  const { estado } = req.body;

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado invalido. Usa: ${estadosValidos.join(', ')}` });
  }

  const database = await readDatabase();
  const pedido = database.pedidos.find((item) => item.id === req.params.id);

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  pedido.estado = estado;
  pedido.updatedAt = new Date().toISOString();
  await writeDatabase(database);

  console.log(`[PATCH] Pedido ${pedido.id} -> estado: ${estado}`);
  res.json({ message: 'Estado actualizado.', pedido });
}));

app.delete('/api/pedidos/:id', asyncRoute(async (req, res) => {
  const database = await readDatabase();
  const pedidoIndex = database.pedidos.findIndex((item) => item.id === req.params.id);

  if (pedidoIndex === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  const [pedido] = database.pedidos.splice(pedidoIndex, 1);
  await writeDatabase(database);

  console.log(`[DELETE] Pedido eliminado de pedidos.json: ${pedido.id}`);
  res.json({
    message: `Pedido ${pedido.id} eliminado.`,
    pedido
  });
}));

app.get('/api/db', asyncRoute(async (req, res) => {
  const database = await readDatabase();
  res.json(database);
}));

app.get('/api/stats', asyncRoute(async (req, res) => {
  const { pedidos } = await readDatabase();

  res.json({
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === 'pendiente').length,
    completados: pedidos.filter((p) => p.estado === 'completado').length,
    cancelados: pedidos.filter((p) => p.estado === 'cancelado').length,
    porPlataforma: pedidos.reduce((acc, p) => {
      acc[p.plataforma] = (acc[p.plataforma] || 0) + 1;
      return acc;
    }, {}),
    porEdicion: pedidos.reduce((acc, p) => {
      acc[p.edicion] = (acc[p.edicion] || 0) + 1;
      return acc;
    }, {})
  });
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

async function start() {
  await ensureDatabase();

  app.listen(PORT, HOST, () => {
    console.log(`\nTLOU Backend corriendo en http://localhost:${PORT}`);
    console.log(`Red local habilitada en http://TU-IP-LOCAL:${PORT}`);
    console.log(`Landing disponible en http://localhost:${PORT}/index.html`);
    console.log(`Pedidos guardandose en ${DB_FILE}\n`);
    console.log('Rutas disponibles:');
    console.log('  GET    /api/pedidos              - listar pedidos');
    console.log('  GET    /api/pedidos?nombre=Joel  - filtrar');
    console.log('  GET    /api/pedidos/:id          - obtener uno');
    console.log('  POST   /api/pedidos              - crear pedido');
    console.log('  PATCH  /api/pedidos/:id/estado   - cambiar estado');
    console.log('  DELETE /api/pedidos/:id          - eliminar');
    console.log('  GET    /api/stats                - estadisticas');
    console.log('  GET    /api/db                   - exportar JSON\n');
  });
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor.');
  console.error(err.message);
  process.exit(1);
});
