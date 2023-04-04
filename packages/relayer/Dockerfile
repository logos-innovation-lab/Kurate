# Build
FROM node:18-alpine AS build

WORKDIR /usr/src/app

RUN corepack enable && \
  corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /usr/src/app/
COPY packages/contracts/package.json /usr/src/app/packages/contracts/
COPY packages/relayer/package.json /usr/src/app/packages/relayer/
RUN pnpm install

COPY packages/contracts/ /usr/src/app/packages/contracts
COPY packages/relayer/ /usr/src/app/packages/relayer
RUN pnpm run --filter contracts compile && \
  pnpm run --filter relayer typechain && \
  pnpm run --filter relayer build:ts

# Final image
FROM node:18-alpine

ENV NODE_ENV production
USER node
WORKDIR /usr/src/app/packages/relayer

COPY --from=build /usr/local/bin/pnpm /usr/local/bin/pnpm
COPY --chown=node:node --from=build /usr/src/app/ /usr/src/app/

CMD ["pnpm", "exec", "fastify", "start", "-l", "info", "dist/app.js"]
