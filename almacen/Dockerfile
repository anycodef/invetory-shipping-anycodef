# Usar una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar los archivos de la aplicación
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Exponer el puerto en el que corre la aplicación
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "start"]