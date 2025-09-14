# Dockerfile para Frontend (Angular)
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@16

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 4200

# Comando para ejecutar la aplicación
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]