# MindSHED

Wellness app for university students — full rebuild (summer 2026).
Owned by Callum Wallace & Morag Powell, in partnership with the university.

## Stack

| Layer | Tech |
| --- | --- |
| Mobile app | Expo (React Native, TypeScript, expo-router) |
| API | Fastify + tRPC (end-to-end typesafe) |
| Database | PostgreSQL + Drizzle ORM |
| Pilot access | No-account pseudonymous participant and deletion credentials |
| Companion animation | Repository-native React Native SVG animation |

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

On a physical phone, copy `apps/mobile/.env.example` to `apps/mobile/.env` and
point `EXPO_PUBLIC_API_URL` at your Mac's LAN IP. Pilot connectivity and queue
state are visible under **You → Privacy and data → Pilot connection**.

Database (only needed once features touch Postgres): copy
`apps/api/.env.example` to `apps/api/.env`, set `DATABASE_URL`, then
`npm run db:generate --workspace @mindshed/api` and then
`npm run db:migrate --workspace @mindshed/api`.

## Checks

```sh
npm run verify      # types, lint and mobile/API policy tests
```

## Reference

Legacy app (Flutter + Firebase, feature reference only, no data migration):
`~/Documents/GitHub/MindSHED-Wellness`
