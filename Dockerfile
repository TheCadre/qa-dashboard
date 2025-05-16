# FROM node:23-slim
FROM 447485723174.dkr.ecr.ap-south-1.amazonaws.com/node-23:latest

WORKDIR /usr/src/app

COPY server/package*.json ./

RUN npm install -g typescript

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN npx playwright install

RUN npm install

COPY server/ ./

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
