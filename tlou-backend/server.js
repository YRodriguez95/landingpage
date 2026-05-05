const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tlou';
const ROOT = path.join(__dirname, '..');

mongoose.set('bufferCommands', false);

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT));
app.use(express.static(path.join(__dirname, 'public')));

const pedidoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  plataforma: {
    type: String,
    required: true
  },
  edicion: {
    type: String,
    required: true
  },
  notas: {
    type: String,
    default: null
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  updatedAt: Date
}, {
  collection: 'pedidos',
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret._id;
      return ret;
    }
  }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

function generateId() {
  return 'TLU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function cleanPedido(pedido) {
  const data = typeof pedido.toJSON === 'function' ? pedido.toJSON() : { ...pedido };
  delete data._id;
  delete data.__v;
  return data;
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

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Base de datos no disponible. Inicia MongoDB para usar la API.'
    });
  }

  next();
});

app.get('/', (req, res) => {
  res.send('API funcionando con MongoDB');
});

app.get('/api/pedidos', asyncRoute(async (req, res) => {
  const { nombre, plataforma, edicion, estado } = req.query;
  const query = {};

  if (nombre) {
    query.nombre = { $regex: nombre, $options: 'i' };
  }

  if (plataforma) {
    query.plataforma = plataforma;
  }

  if (edicion) {
    query.edicion = edicion;
  }

  if (estado) {
    query.estado = estado;
  }

  const pedidos = await Pedido.find(query).sort({ fecha: 1 });
  res.json({ total: pedidos.length, pedidos: pedidos.map(cleanPedido) });
}));

app.get('/api/pedidos/:id', asyncRoute(async (req, res) => {
  const pedido = await Pedido.findOne({ id: req.params.id });

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  res.json(cleanPedido(pedido));
}));

app.post('/api/pedidos', asyncRoute(async (req, res) => {
  const errors = validate(req.body);

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  const pedido = await Pedido.create({
    id: generateId(),
    nombre: req.body.nombre.trim(),
    email: req.body.email.trim().toLowerCase(),
    plataforma: req.body.plataforma,
    edicion: req.body.edicion,
    notas: req.body.notas?.trim() || null,
    estado: 'pendiente'
  });

  console.log(`[POST] Pedido creado en MongoDB: ${pedido.id} - ${pedido.nombre}`);
  res.status(201).json({
    message: 'Pedido registrado correctamente.',
    pedido: cleanPedido(pedido)
  });
}));

app.patch('/api/pedidos/:id/estado', asyncRoute(async (req, res) => {
  const estadosValidos = ['pendiente', 'completado', 'cancelado'];
  const { estado } = req.body;

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado invalido. Usa: ${estadosValidos.join(', ')}` });
  }

  const pedido = await Pedido.findOneAndUpdate(
    { id: req.params.id },
    { estado, updatedAt: new Date() },
    { new: true }
  );

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  console.log(`[PATCH] Pedido ${pedido.id} -> estado: ${estado}`);
  res.json({ message: 'Estado actualizado.', pedido: cleanPedido(pedido) });
}));

app.delete('/api/pedidos/:id', asyncRoute(async (req, res) => {
  const eliminado = await Pedido.findOneAndDelete({ id: req.params.id });

  if (!eliminado) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  console.log(`[DELETE] Pedido eliminado: ${eliminado.id}`);
  res.json({
    message: `Pedido ${eliminado.id} eliminado.`,
    pedido: cleanPedido(eliminado)
  });
}));

app.get('/api/db', asyncRoute(async (req, res) => {
  const pedidos = await Pedido.find().sort({ fecha: 1 });

  res.json({
    canal: 'The Last of Us - Mercado Seguro',
    version: 'mongo',
    pedidos: pedidos.map(cleanPedido)
  });
}));

app.get('/api/stats', asyncRoute(async (req, res) => {
  const pedidos = await Pedido.find();

  res.json({
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    completados: pedidos.filter(p => p.estado === 'completado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
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
  app.listen(PORT, HOST, () => {
    console.log(`\nTLOU Backend corriendo en http://localhost:${PORT}`);
    console.log(`Red local habilitada en http://TU-IP-LOCAL:${PORT}`);
    console.log(`Landing disponible en http://localhost:${PORT}/index.html\n`);
    console.log('Rutas disponibles:');
    console.log('  GET    /api/pedidos              - listar pedidos');
    console.log('  GET    /api/pedidos?nombre=Joel  - filtrar');
    console.log('  GET    /api/pedidos/:id          - obtener uno');
    console.log('  POST   /api/pedidos              - crear pedido');
    console.log('  PATCH  /api/pedidos/:id/estado   - cambiar estado');
    console.log('  DELETE /api/pedidos/:id          - eliminar');
    console.log('  GET    /api/stats                - estadisticas');
    console.log('  GET    /api/db                   - exportar JSON desde MongoDB\n');
  });

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}\n`);
  } catch (err) {
    console.error('MongoDB no esta disponible.');
    console.error(`URI usada: ${MONGODB_URI}`);
    console.error(`${err.message}\n`);
    console.error('La landing se puede visualizar igualmente, pero la API devolvera 503 hasta iniciar MongoDB.\n');
  }
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor.');
  console.error(err.message);
  process.exit(1);
});
