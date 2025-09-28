const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servicio de Reservas está activo' });
});

// --- Endpoints CRUD para Reservas ---

// Crear una nueva reserva
app.post('/reservas', async (req, res) => {
  try {
    const nuevaReserva = await prisma.reserva.create({
      data: req.body,
    });
    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear la reserva', details: error.message });
  }
});

// Obtener todas las reservas
app.get('/reservas', async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

// Obtener una reserva por ID
app.get('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
    });
    if (reserva) {
      res.json(reserva);
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
});

// Actualizar una reserva
app.put('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservaActualizada = await prisma.reserva.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(reservaActualizada);
  } catch (error) {
    res.status(404).json({ error: 'Reserva no encontrada o datos inválidos' });
  }
});

// Eliminar una reserva
app.delete('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.reserva.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Reserva no encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de Reservas corriendo en el puerto ${PORT}`);
});