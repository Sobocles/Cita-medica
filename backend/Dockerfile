# Dockerfile para Backend (Node.js + Express + TypeScript) - DESARROLLO
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Instalar nodemon globalmente para desarrollo
RUN npm install -g nodemon ts-node

# Copiar el resto del código
COPY . .

# Crear directorio dist si no existe
RUN mkdir -p dist

# Exponer el puerto
EXPOSE 8000

# Comando para desarrollo con tsc --watch y nodemon
CMD ["sh", "-c", "npx tsc --watch & sleep 3 && nodemon dist/app.js"]