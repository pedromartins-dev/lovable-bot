# Usa a imagem oficial do Playwright
FROM mcr.microsoft.com/playwright:v1.41.0-focal

# Instala o monitor virtual (Xvfb)
RUN apt-get update && apt-get install -y xvfb

WORKDIR /app

COPY package*.json ./

# Instala as dependências do Node e força a instalação do navegador Chromium
RUN npm install && npx playwright install chromium

COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor com o monitor virtual
CMD ["tail", "-f", "/dev/null"]

