# Lakebed App Instructions

This directory is for a Lakebed "capsule". Lakebed is an all-inclusive suite of tools to build web applications purely from code and a CLI.

Your role is to build software within this capsule. Lakebed is the runtime, the compiler, the database, and the hosting platform. You will be able to control all of this just by writing code and running commands through the CLI.

## Hard rules

- No installing node modules. You can use the built-in APIs. Write TypeScript for anything that is not included.
- Lakebed CLI should always be run through `npx`; it is not a global. Use the repository-pinned `npx lakebed@0.0.28 [command]`. Do not install Lakebed or create a local `node_modules` directory.
- The Lakebed capsule lives in `capsule/`. Client code goes in `capsule/client`, server code in `capsule/server`, and shared capsule code in `capsule/shared`.
- Use `lakebed/server` only from `capsule/server/*.ts`.
- Use `lakebed/client` only from `capsule/client/*.tsx`.
- Data needed on client should be fetched through queries. User-driven changes should be done via mutations. Endpoints should be treated as an "escape hatch" for exposing functionality over endpoints for HTTP-based flows.
- Styling must be done via raw CSS or Tailwind classes in the JSX.
- Do not add a CSS, PostCSS, or Tailwind build pipeline. They are built in.
- There is no file based routing. Use the built-in client router from `lakebed/client` when you need pages.
- All imports must be from Lakebed or from relative paths.
- Do not use Node built-ins in app code.
- Use auth through `ctx.auth` on the server and `useAuth()` on the client.
- Read server-only environment variables through `ctx.env`; define them in `capsule/.env.lakebed.server`.
- Auth can be added with a Google sign-in using `<SignInWithGoogle />` or `signInWithGoogle()` from `lakebed/client`.
- Keep `capsule/shared/` free of DOM, Node, env, and Lakebed runtime imports.
- Environment variables are only available on the server, and must be defined in `capsule/.env.lakebed.server`. They are not available during build time. If you need build-time environment variables, define them in code and do conditional logic based on them. They will be synced on `npx lakebed@0.0.28 deploy ./capsule` after the deploy is claimed.

## Pinned Lakebed release

This repository pins Lakebed `0.0.28`, the stable release verified to generate the database manifest and `maxIndexKeyBytes: 2048` required by the deploy service.

- Use exactly `npx lakebed@0.0.28 ...` for development, builds, database inspection, and deployment so clones remain reproducible.
- Do not replace the pin with `@latest` or `@staging` without building and deploying the capsule with the replacement first.
- A failure containing `Source-backed artifacts require a database manifest` or `Source-backed artifacts require maxIndexKeyBytes to be 2048` means an older CLI was used. Return to the pinned command; do not hand-edit generated artifacts.

## Database API requirements

New capsules must use Lakebed's indexed async database API. The legacy `where()`, `orderBy()`, and `all()` methods fail current builds.

- Declare indexes on tables, for example: `table({ ownerId: string() }).index("by_owner", ["ownerId"])`.
- Query with `.withIndex("by_owner", (q) => q.eq("ownerId", value)).order("desc").collect()`.
- Mark query and mutation handlers `async` when they perform database operations.
- Await writes such as `await ctx.db.todos.insert(value)`.

## Default project structure

- `capsule/server/index.ts`: minimal Lakebed server entry.
- `capsule/client/index.tsx`: Preact Atlas UI entrypoint.
- `capsule/shared/atlas.generated.ts`: generated, repository-safe Atlas data; never edit it manually.
- `.kiro/`: committed Kiro steering, specs, and hooks.
- `demo/`: fictional Quest Board TypeScript files.
- `scripts/generate_atlas.py`: standard-library generator and the only writer of Atlas data.

## Commands

Run locally:

```sh
npx lakebed@0.0.28 dev ./capsule
```

Deploy:

```sh
npx lakebed@0.0.28 deploy ./capsule
```

Build:

```sh
npx lakebed@0.0.28 build ./capsule --target anonymous --out .lakebed/atlas-artifact.json
```

Inspect local state while `npx lakebed@0.0.28 dev ./capsule` is running:

```sh
npx lakebed@0.0.28 db list --port 3000
npx lakebed@0.0.28 db dump --port 3000
npx lakebed@0.0.28 logs --port 3000
```

## External endpoints

Use `endpoint({ method, path }, handler)` from `lakebed/server` when the app needs to expose an HTTP route for webhooks or other non-Lakebed clients. Endpoint handlers receive request data including `headers.get(name)`, URL params, query params, and body helpers.

## Additional resources

- [Lakebed docs](https://docs.lakebed.dev/)
- [Capsule API docs](https://docs.lakebed.dev/capsule-api/)

## Current Limits

- One server entry.
- One client entry.
- Guest auth locally, with built-in Google sign-in through Shoo.
- No file storage.
- No outbound fetch in anonymous deploys. Claim the deploy before using server-side fetch.
- Non-empty `capsule/.env.lakebed.server` files sync only after a deploy is claimed.
- Local state resets when `npx lakebed@0.0.28 dev ./capsule` restarts.
- All production deploys are on 'lakebed.app'
