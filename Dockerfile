FROM ghcr.io/puppeteer/puppeteer:22.12.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*json tsconfig.json src ./

RUN npm ci && \
    npm run build && \
    npm prune --production

COPY . .

CMD ["node", "/app/dist/index.js"]