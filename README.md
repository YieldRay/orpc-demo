# orpctest

A minimal demo of the [oRPC](https://orpc.unnoq.com) framework — a TypeScript-first RPC library with built-in OpenAPI generation. Implements a simple Planet API with REST and RPC endpoints, schema validation via Zod, and an interactive Scalar API docs UI.

## Tech Stack

- [Bun](https://bun.sh) — runtime and package manager
- [TypeScript](https://www.typescriptlang.org) — strict mode
- [@orpc](https://orpc.unnoq.com) — RPC server, client, OpenAPI, and Zod adapter
- [Zod](https://zod.dev) — schema validation
- [Scalar](https://scalar.com) — OpenAPI reference UI

## Project Structure

```
├── src/
│   ├── main.ts      # Server entry point and request routing
│   ├── router.ts    # API procedure definitions (planet endpoints)
│   └── helper.ts    # WebServer utility
├── index.html       # Browser-based Scalar API reference (standalone)
├── fe.ts            # Intercepts Scalar's fetch calls and routes them to the oRPC server in-process
├── build.ts         # esbuild bundler script
└── dist/main.js     # Compiled output (generated)
```

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) installed.

```bash
# Install dependencies
bun install

# Build
bun build.ts

# Run
bun dist/main.js
```

## API Endpoints

| Method | Path            | Description                          | Auth     |
|--------|-----------------|--------------------------------------|----------|
| GET    | `/planets`      | List planets (`limit`, `cursor`)     | No       |
| GET    | `/planets/:id`  | Get a planet by ID                   | No       |
| POST   | `/planets`      | Create a planet (`name`, `description`) | Bearer JWT |

RPC variants are available at `/rpc/*` using the same procedure names.

## API Docs

Once the server is running, visit:

- **`/openapi/`** — Interactive Scalar API reference
- **`/openapi.json`** — Raw OpenAPI spec

## Notes

- All handlers return **mock data** — there is no database.
- JWT auth is a **demo-only** implementation (base64 decode, no signature verification). Do not use in production.
