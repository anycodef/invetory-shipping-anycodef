const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3003;

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servicio de Inventario está activo' });
});

// --- Endpoints CRUD para StockProducto ---

// Crear un nuevo registro de stock
app.post('/stock', async (req, res) => {
  try {
    const nuevoStock = await prisma.stockProducto.create({ data: req.body });
    res.status(201).json(nuevoStock);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el registro de stock', details: error.message });
  }
});

// Obtener todo el stock
app.get('/stock', async (req, res) => {
  const stock = await prisma.stockProducto.findMany();
  res.json(stock);
});

// --- Endpoints CRUD para Movimientos ---

// Crear un nuevo movimiento
app.post('/movimientos', async (req, res) => {
  try {
    const nuevoMovimiento = await prisma.movimiento.create({ data: req.body });
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el movimiento', details: error.message });
  }
});

// Obtener todos los movimientos de un producto en stock
app.get('/stock/:stockId/movimientos', async (req, res) => {
  const { stockId } = req.params;
  const movimientos = await prisma.movimiento.findMany({
    where: { id_stock_producto: parseInt(stockId) },
  });
  res.json(movimientos);
});

app.listen(PORT, () => {
  console.log(`Servicio de Inventario corriendo en el puerto ${PORT}`);
});