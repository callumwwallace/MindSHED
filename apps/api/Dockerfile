FROM node:22.18.0-alpine3.22@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --ignore-scripts --audit=false \
  --workspace @mindshed/api \
  --workspace @mindshed/shared \
  --include-workspace-root=false

COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/shared packages/shared
RUN npm run build --workspace @mindshed/api

FROM node:22.18.0-alpine3.22@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/api/dist apps/api/dist

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/ready').then((response)=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "apps/api/dist/index.cjs"]
