# Usa a imagem oficial do Playwright (já vem com navegadores e dependências)
FROM mcr.microsoft.com/playwright:v1.41.0-focal

# Instala o Xvfb (Monitor Virtual) para rodar headless: false
RUN apt-get update && apt-get install -y xvfb

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos (seus scripts)
COPY . .

# Expõe a porta que você usa no server.js
EXPOSE 3000

# O COMANDO MÁGICO:
# Inicia o servidor com o monitor virtual ligado
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "node", "server.js"]