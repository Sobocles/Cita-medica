# Dockerfile para Backend (Node.js + Express + TypeScript) - PRODUCCIÓN
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar caché e instalar dependencias
RUN npm cache clean --force && npm install

# Copiar el resto del código (incluyendo tsconfig.json)
COPY . .

# Limpiar dist viejo y compilar TypeScript a JavaScript
RUN rm -rf dist && npm run build

# Limpiar devDependencies para reducir tamaño
RUN npm prune --production

# Exponer el puerto
EXPOSE 8000

# Comando para producción
CMD ["npm", "start"]