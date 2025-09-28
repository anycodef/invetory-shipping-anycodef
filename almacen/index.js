const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3002;

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servicio de Almacén está activo' });
});

// --- Endpoints CRUD para Departamentos ---

// Crear un nuevo departamento
app.post('/departamentos', async (req, res) => {
  try {
    const nuevoDepartamento = await prisma.departamento.create({ data: req.body });
    res.status(201).json(nuevoDepartamento);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el departamento' });
  }
});

// Obtener todos los departamentos
app.get('/departamentos', async (req, res) => {
  const departamentos = await prisma.departamento.findMany();
  res.json(departamentos);
});

// --- Endpoints CRUD para Locales ---

// Crear un nuevo local
app.post('/locales', async (req, res) => {
  try {
    const nuevoLocal = await prisma.local.create({ data: req.body });
    res.status(201).json(nuevoLocal);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el local', details: error.message });
  }
});

// Obtener todos los locales
app.get('/locales', async (req, res) => {
  const locales = await prisma.local.findMany();
  res.json(locales);
});

// Obtener un local por ID
app.get('/locales/:id', async (req, res) => {
  const { id } = req.params;
  const local = await prisma.local.findUnique({ where: { id: parseInt(id) } });
  if (local) {
    res.json(local);
  } else {
    res.status(404).json({ error: 'Local no encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de Almacén corriendo en el puerto ${PORT}`);
});