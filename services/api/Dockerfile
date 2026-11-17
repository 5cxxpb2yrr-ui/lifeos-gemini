FROM node:20-alpine

WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 8787
CMD ["pnpm", "--filter", "@lifeos/api", "start"]
