# Build context: services/api
FROM node:22-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY src ./src
ENV NODE_ENV=production PORT=8787 SURREAL_URL=surrealkv:///data/lifeos
VOLUME /data
EXPOSE 8787
CMD ["npx", "tsx", "src/server.ts"]
