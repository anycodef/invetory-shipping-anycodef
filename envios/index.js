const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3004;

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servicio de Envíos está activo' });
});

// --- Endpoints CRUD para Envios ---

// Crear un nuevo envío
app.post('/envios', async (req, res) => {
  try {
    const nuevoEnvio = await prisma.envio.create({ data: req.body });
    res.status(201).json(nuevoEnvio);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el envío', details: error.message });
  }
});

// Obtener todos los envíos
app.get('/envios', async (req, res) => {
  const envios = await prisma.envio.findMany();
  res.json(envios);
});

// --- Endpoints CRUD para Carriers ---

// Crear un nuevo carrier
app.post('/carriers', async (req, res) => {
  try {
    const nuevoCarrier = await prisma.carrier.create({ data: req.body });
    res.status(201).json(nuevoCarrier);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el carrier', details: error.message });
  }
});

// Obtener todos los carriers
app.get('/carriers', async (req, res) => {
  const carriers = await prisma.carrier.findMany();
  res.json(carriers);
});

app.listen(PORT, () => {
  console.log(`Servicio de Envíos corriendo en el puerto ${PORT}`);
});