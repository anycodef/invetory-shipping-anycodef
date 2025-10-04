const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding con el método "create"...');

  // 1. Crear Tipos de Local
  console.log('Creando Tipos de Local...');
  const tipoAlmacen = await prisma.tipoLocal.create({
    data: { nombre: 'Almacen', descripcion: 'Lugar para almacenar productos' },
  });

  const tipoTienda = await prisma.tipoLocal.create({
    data: { nombre: 'Tienda', descripcion: 'Punto de venta directo al público' },
  });

  // 2. Crear data geográfica
  console.log('Creando data geográfica...');
  const limaDep = await prisma.departamento.create({ data: { nombre: 'Lima' } });
  const limaProv = await prisma.provincia.create({
    data: { nombre: 'Lima', id_departamento: limaDep.id },
  });
  const mirafloresDist = await prisma.distrito.create({
    data: { nombre: 'Miraflores', id_provincia: limaProv.id },
  });
  const sanIsidroDist = await prisma.distrito.create({
    data: { nombre: 'San Isidro', id_provincia: limaProv.id },
  });

  // 3. Crear Direcciones y Geopoints
  console.log('Creando Direcciones...');
  const geoAlmacen = await prisma.geopoint.create({ data: { latitud: -12.12, longitud: -77.02 } });
  const dirAlmacen = await prisma.direccion.create({
    data: { referencia: 'Av. Principal 123', id_distrito: mirafloresDist.id, id_geopoint: geoAlmacen.id },
  });

  const geoTienda1 = await prisma.geopoint.create({ data: { latitud: -12.125, longitud: -77.03 } });
  const dirTienda1 = await prisma.direccion.create({
    data: { referencia: 'Av. Comercio 100', id_distrito: mirafloresDist.id, id_geopoint: geoTienda1.id },
  });

  const geoTienda2 = await prisma.geopoint.create({ data: { latitud: -12.08, longitud: -77.05 } });
  const dirTienda2 = await prisma.direccion.create({
    data: { referencia: 'Calle Norte 200', id_distrito: sanIsidroDist.id, id_geopoint: geoTienda2.id },
  });

  // 4. Crear Almacenes
  console.log('Creando Almacenes...');
  const almacenCentral = await prisma.local.create({
    data: {
      nombre: 'Almacen Central',
      estado: 'ACTIVO',
      id_tipo_local: tipoAlmacen.id,
      id_direccion: dirAlmacen.id,
    },
  });

  // 5. Crear Tiendas
  console.log('Creando Tiendas...');
  await prisma.local.create({
    data: {
      nombre: 'Tienda Centro',
      estado: 'ACTIVO',
      imagen: 'https://via.placeholder.com/150/0000FF/808080?Text=TiendaCentro',
      id_tipo_local: tipoTienda.id,
      id_direccion: dirTienda1.id,
      almacenId: almacenCentral.id,
    },
  });

  await prisma.local.create({
    data: {
      nombre: 'Tienda Norte',
      estado: 'INACTIVO',
      imagen: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=TiendaNorte',
      id_tipo_local: tipoTienda.id,
      id_direccion: dirTienda2.id,
      almacenId: almacenCentral.id,
    },
  });

  console.log('Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });