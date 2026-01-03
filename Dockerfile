# Usa a imagem base
FROM mcr.microsoft.com/playwright:v1.41.0-focal

# Instala o Xvfb (Monitor Virtual)
RUN apt-get update && apt-get install -y xvfb

WORKDIR /app

COPY package*.json ./

# Instala dependências do Node
RUN npm install

# 🔥 LINHA NOVA OBRIGATÓRIA: Garante que o navegador certo seja baixado
RUN npx playwright install chromium

COPY . .

EXPOSE 3000

# Inicia com o monitor virtual
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "node", "server.js"]
