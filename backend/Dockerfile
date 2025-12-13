# Dockerfile para Backend (Node.js + Express + TypeScript) - PRODUCCIÓN
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Limpiar devDependencies para reducir tamaño
RUN npm prune --production

# Exponer el puerto
EXPOSE 8000

# Comando para producción
CMD ["npm", "start"]