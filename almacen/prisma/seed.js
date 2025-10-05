const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// --- Constantes para la Generación de Datos ---
const NUMERO_DE_ALMACENES = 20;
const NUMERO_DE_TIENDAS = 200;
const LATITUD_MIN = -18.35; // Sur de Perú
const LATITUD_MAX = -0.03;  // Norte de Perú
const LONGITUD_MIN = -81.33; // Oeste de Perú
const LONGITUD_MAX = -68.65; // Este de Perú

// --- Funciones de Ayuda ---

/**
 * Genera un número aleatorio dentro de un rango.
 * @param {number} min - El valor mínimo.
 * @param {number} max - El valor máximo.
 * @returns {number} - Un número aleatorio.
 */
const random = (min, max) => Math.random() * (max - min) + min;

/**
 * Genera coordenadas geográficas aleatorias dentro de los límites de Perú.
 * @returns {{latitud: number, longitud: number}} - Un objeto con latitud y longitud.
 */
const generarGeopointAleatorio = () => ({
  latitud: random(LATITUD_MIN, LATITUD_MAX),
  longitud: random(LONGITUD_MIN, LONGITUD_MAX),
});

/**
 * Selecciona un elemento aleatorio de un array.
 * @param {Array<T>} array - El array del que se seleccionará un elemento.
 * @returns {T} - Un elemento aleatorio del array.
 */
const seleccionarElementoAleatorio = (array) => array[Math.floor(Math.random() * array.length)];

// --- Lógica de Seeding ---

/**
 * Lee y procesa el archivo CSV para poblar la base de datos con datos geográficos.
 */
async function seedGeographicalData() {
  const csvFilePath = path.join(__dirname, '../../data/Data_Muestra_ubigeos.csv');
  const geographicalData = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => geographicalData.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Se encontraron ${geographicalData.length} registros en el CSV. Procediendo a la inserción...`);

  for (const record of geographicalData) {
    const departmentName = record.NOMBDEP;
    const provinceName = record.NOMBPROV;
    const districtName = record.NOMBDIST;

    if (departmentName && provinceName && districtName) {
      const department = await prisma.departamento.upsert({
        where: { nombre: departmentName },
        update: {},
        create: { nombre: departmentName },
      });

      const province = await prisma.provincia.upsert({
        where: { nombre_id_departamento: { nombre: provinceName, id_departamento: department.id } },
        update: {},
        create: { nombre: provinceName, id_departamento: department.id },
      });

      await prisma.distrito.upsert({
        where: { nombre_id_provincia: { nombre: districtName, id_provincia: province.id } },
        update: {},
        create: { nombre: districtName, id_provincia: province.id },
      });
    }
  }

  console.log('Los datos geográficos han sido poblados exitosamente.');
}

/**
 * Genera y puebla los datos de locales (almacenes y tiendas).
 */
async function seedLocalData() {
  console.log('Iniciando la creación de datos de locales...');

  // 1. Obtener los tipos de local y todos los distritos.
  const tipoAlmacen = await prisma.tipoLocal.findUnique({ where: { nombre: 'Almacen' } });
  const tipoTienda = await prisma.tipoLocal.findUnique({ where: { nombre: 'Tienda' } });
  const distritos = await prisma.distrito.findMany();

  if (!tipoAlmacen || !tipoTienda) {
    throw new Error('Los tipos de local "Almacen" o "Tienda" no se encontraron. Asegúrate de que existan.');
  }
  if (distritos.length === 0) {
    throw new Error('No se encontraron distritos. Asegúrate de que los datos geográficos se hayan poblado.');
  }

  // 2. Crear almacenes.
  console.log(`Creando ${NUMERO_DE_ALMACENES} almacenes...`);
  const almacenesCreados = [];
  for (let i = 0; i < NUMERO_DE_ALMACENES; i++) {
    const distritoAleatorio = seleccionarElementoAleatorio(distritos);
    const geopoint = await prisma.geopoint.create({ data: generarGeopointAleatorio() });
    const direccion = await prisma.direccion.create({
      data: {
        referencia: `Calle Falsa ${i + 1}, Almacén Principal`,
        id_distrito: distritoAleatorio.id,
        id_geopoint: geopoint.id,
      },
    });
    const almacen = await prisma.local.create({
      data: {
        nombre: `Almacén Central ${i + 1}`,
        estado: 'ACTIVO',
        id_tipo_local: tipoAlmacen.id,
        id_direccion: direccion.id,
      },
    });
    almacenesCreados.push(almacen);
  }
  console.log('Almacenes creados exitosamente.');

  // 3. Crear tiendas y asignarlas a un almacén.
  console.log(`Creando ${NUMERO_DE_TIENDAS} tiendas...`);
  for (let i = 0; i < NUMERO_DE_TIENDAS; i++) {
    const distritoAleatorio = seleccionarElementoAleatorio(distritos);
    const almacenAsociado = seleccionarElementoAleatorio(almacenesCreados);
    const geopoint = await prisma.geopoint.create({ data: generarGeopointAleatorio() });
    const direccion = await prisma.direccion.create({
      data: {
        referencia: `Avenida Siempreviva ${i + 1}`,
        id_distrito: distritoAleatorio.id,
        id_geopoint: geopoint.id,
      },
    });

    await prisma.local.create({
      data: {
        nombre: `Tienda Express ${i + 1}`,
        estado: Math.random() > 0.2 ? 'ACTIVO' : 'INACTIVO', // 80% activas
        imagen: `https://via.placeholder.com/150?text=Tienda${i + 1}`,
        id_tipo_local: tipoTienda.id,
        id_direccion: direccion.id,
        almacenId: almacenAsociado.id,
      },
    });
  }
  console.log('Tiendas creadas exitosamente.');
}

/**
 * Función principal que orquesta el proceso de seeding.
 */
async function main() {
  console.log('Iniciando el proceso de seeding...');

  // 1. Poblar los datos geográficos desde el CSV.
  await seedGeographicalData();

  // 2. Crear los tipos de locales.
  console.log('Creando/verificando Tipos de Local...');
  await prisma.tipoLocal.upsert({
    where: { nombre: 'Almacen' },
    update: {},
    create: { nombre: 'Almacen', descripcion: 'Lugar para almacenar productos' },
  });
  await prisma.tipoLocal.upsert({
    where: { nombre: 'Tienda' },
    update: {},
    create: { nombre: 'Tienda', descripcion: 'Punto de venta directo al público' },
  });
  console.log('Tipos de Local creados/verificados.');

  // 3. Generar datos de locales (almacenes y tiendas).
  await seedLocalData();

  console.log('Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });