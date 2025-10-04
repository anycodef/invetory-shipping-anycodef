const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware para manejo de errores
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Endpoints de Ubicación ---

// GET /api/departamentos
router.get('/departamentos', asyncHandler(async (req, res) => {
  const departamentos = await prisma.departamento.findMany();
  res.json(departamentos);
}));

// GET /api/provincias
router.get('/provincias', asyncHandler(async (req, res) => {
  const { id_departamento } = req.query;
  const where = id_departamento ? { id_departamento: parseInt(id_departamento) } : {};
  const provincias = await prisma.provincia.findMany({ where });
  res.json(provincias);
}));

// GET /api/distritos
router.get('/distritos', asyncHandler(async (req, res) => {
  const { id_provincia } = req.query;
  const where = id_provincia ? { id_provincia: parseInt(id_provincia) } : {};
  const distritos = await prisma.distrito.findMany({ where });
  res.json(distritos);
}));

// --- Endpoints de Almacenes ---

// Helper para obtener el ID del tipo de local "Almacén"
const getAlmacenTypeId = async () => {
  const tipoLocal = await prisma.tipoLocal.findFirst({ where: { nombre: 'Almacen' } });
  if (!tipoLocal) throw new Error('El tipo de local "Almacen" no existe. Asegúrese de poblar la base de datos.');
  return tipoLocal.id;
};

// GET /api/almacenes
router.get('/almacenes', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;
  const skip = (page - 1) * perPage;

  const almacenTypeId = await getAlmacenTypeId();

  const almacenes = await prisma.local.findMany({
    where: { id_tipo_local: almacenTypeId },
    skip,
    take: perPage,
    include: {
      direccion: {
        include: {
          distrito: {
            include: {
              provincia: {
                include: {
                  departamento: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const total = await prisma.local.count({ where: { id_tipo_local: almacenTypeId } });

  res.json({
    data: almacenes,
    meta: {
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    },
  });
}));

// POST /api/almacenes
router.post('/almacenes', asyncHandler(async (req, res) => {
  const { nombre, id_direccion } = req.body;
  const almacenTypeId = await getAlmacenTypeId();

  // Simplificado: asumimos que id_direccion ya existe.
  // En una implementación completa, aquí se crearía la Dirección y el Geopoint.
  const nuevoAlmacen = await prisma.local.create({
    data: {
      nombre,
      id_direccion,
      id_tipo_local: almacenTypeId,
      estado: 'ACTIVO',
    },
  });
  res.status(201).json(nuevoAlmacen);
}));

// PUT /api/almacenes/:id
router.put('/almacenes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const almacenTypeId = await getAlmacenTypeId();

  const almacenActualizado = await prisma.local.updateMany({
    where: {
      id: parseInt(id),
      id_tipo_local: almacenTypeId,
    },
    data,
  });

  if (almacenActualizado.count === 0) {
    return res.status(404).json({ error: 'Almacén no encontrado o no es del tipo correcto.' });
  }
  res.json({ message: 'Almacén actualizado correctamente' });
}));

// DELETE /api/almacenes/:id
router.delete('/almacenes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const almacenTypeId = await getAlmacenTypeId();

  try {
    const result = await prisma.local.deleteMany({
      where: {
        id: parseInt(id),
        id_tipo_local: almacenTypeId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Almacén no encontrado o no es del tipo correcto.' });
    }

    res.status(204).send();
  } catch (error) {
    // Si el almacén tiene tiendas asociadas, la eliminación podría fallar
    // si no se ha configurado la acción en cascada adecuada.
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'No se puede eliminar el almacén porque tiene tiendas asociadas.' });
    }
    throw error;
  }
}));


// --- Endpoint de Tiendas ---

// Helper para obtener el ID del tipo de local "Tienda"
const getTiendaTypeId = async () => {
    const tipoLocal = await prisma.tipoLocal.findFirst({ where: { nombre: 'Tienda' } });
    if (!tipoLocal) throw new Error('El tipo de local "Tienda" no existe. Asegúrese de poblar la base de datos.');
    return tipoLocal.id;
};

// GET /api/tiendas
router.get('/tiendas', asyncHandler(async (req, res) => {
    const { nombre, almacen, distrito, provincia, departamento } = req.query;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const skip = (page - 1) * perPage;

    const tiendaTypeId = await getTiendaTypeId();

    const where = {
        id_tipo_local: tiendaTypeId,
    };

    if (nombre) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (almacen) {
        where.almacenId = parseInt(almacen);
    }
    if (distrito) {
        where.direccion = { distrito: { id: parseInt(distrito) } };
    }
    if (provincia) {
        where.direccion = { ...where.direccion, distrito: { ...where.direccion?.distrito, provincia: { id: parseInt(provincia) } } };
    }
    if (departamento) {
        where.direccion = { ...where.direccion, distrito: { ...where.direccion?.distrito, provincia: { ...where.direccion?.distrito?.provincia, departamento: { id: parseInt(departamento) } } } };
    }


    const tiendas = await prisma.local.findMany({
        where,
        skip,
        take: perPage,
        include: {
            almacen: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
            direccion: {
                include: {
                    distrito: {
                        include: {
                            provincia: {
                                include: {
                                    departamento: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            id: 'asc'
        }
    });

    const total = await prisma.local.count({ where });

    // Mapear el resultado para que coincida con la vista de la imagen
    const resultadoMapeado = tiendas.map(tienda => ({
        id: tienda.id,
        imagen: tienda.imagen,
        nombre: tienda.nombre,
        almacen: tienda.almacen?.nombre || 'N/A',
        estado: tienda.estado,
        direccion: tienda.direccion.referencia,
        distrito: tienda.direccion.distrito.nombre,
        provincia: tienda.direccion.distrito.provincia.nombre,
        departamento: tienda.direccion.distrito.provincia.departamento.nombre,
    }));

    res.json({
        data: resultadoMapeado,
        meta: {
            total,
            page,
            perPage,
            lastPage: Math.ceil(total / perPage),
        },
    });
}));


module.exports = router;