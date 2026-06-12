# MindSHED

Wellness app for university students — full rebuild (summer 2026).
Owned by Callum Wallace & Morag Powell, in partnership with the university.

## Stack

| Layer | Tech |
| --- | --- |
| Mobile app | Expo (React Native, TypeScript, expo-router) |
| API | Fastify + tRPC (end-to-end typesafe) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (planned) |
| Pet animation | Rive (planned — requires an Expo dev build) |

## Layout

```
apps/
  mobile/   Expo app (src/app = screens, expo-router file routing)
  api/      Fastify + tRPC server, Drizzle schema in src/db
packages/
  shared/   Zod schemas shared by app and API
```

npm workspaces — run `npm install` once at the repo root.

## Development

```sh
npm run api     # start the API on :3000 (hot reload)
npm run mobile  # start Expo — press i for iOS simulator, or scan the QR code
```

The home screen shows a live "API" row — it should read **connected** when the
API is running. On a physical phone, copy `apps/mobile/.env.example` to
`apps/mobile/.env` and point `EXPO_PUBLIC_API_URL` at your Mac's LAN IP.

Database (only needed once features touch Postgres): copy
`apps/api/.env.example` to `apps/api/.env`, set `DATABASE_URL`, then
`npm run db:generate && npm run db:migrate --workspace @mindshed/api`.

## Checks

```sh
npm run typecheck   # all workspaces
```

## Reference

Legacy app (Flutter + Firebase, feature reference only, no data migration):
`~/Documents/GitHub/MindSHED-Wellness`
