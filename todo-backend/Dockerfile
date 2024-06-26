# Verwende das offizielle Node.js 14 Alpine Image als Basis
FROM node:14-alpine

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Projektdateien in das Arbeitsverzeichnis kopieren
COPY . .

# Port, der im Container freigegeben werden soll
EXPOSE 3001

# Befehl, um die Anwendung auszuführen
CMD ["npm", "start"]
