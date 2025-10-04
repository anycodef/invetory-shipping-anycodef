const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3002;

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servicio de Almacén está activo' });
});

// Montar las rutas de la API bajo el prefijo /api
app.use('/api', apiRoutes);

// Middleware para manejar errores de la API
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Servicio de Almacén corriendo en el puerto ${PORT}`);
});