# Crowecad

Web app for laying out mycology facilities as projects, zones, and equipment, with a Three.js CAD workspace and an Autodesk model viewer.

## Status

archived

Development stopped on 2025-09-06 (last commit on `main`, from `git log`). The code is kept for reference. On 2026-09-10 the dependencies installed and the browser bundle built, but the server did not start, the tests did not run, and the command line scripts did not run. Details below.

## Install and first run

Not maintained. No supported install path.

What was tried on 2026-09-10 with Node 26.5.0 and npm 11.17.0, from a fresh clone:

```
npm ci             # completed in 8 s
npm run build      # vite build completed; wrote dist/public (index.html + assets, main bundle 3.9 MB)
npx vite preview   # served dist/public on http://localhost:4173, HTTP 200
npm run dev        # failed: SyntaxError: The requested module '@aps_sdk/oss' does not provide
                   #   an export named 'CreateBucketsPayloadPolicyKey' (server/routes/aps.ts:4)
npx tsc --noEmit   # 106 type errors
npx vitest run     # failed: Cannot find package 'vitest' (it is not in package.json)
node crowecad-cli.cjs --help     # failed: Cannot find module 'ora' (not in package.json)
node crowecad-simple.cjs --help  # failed: Cannot find module 'figlet' (not in package.json)
```

Not run: the Docker images (`Dockerfile`, `Dockerfile.fly`, `docker-compose.yml`), the Fly.io configs, database setup (`init.sql`, `drizzle-kit push`), the Playwright tests, and the `packages/codex` sub-package.

The server needs `DATABASE_URL` (Postgres). The viewer and chat routes need Autodesk APS (the `@aps_sdk` packages), OpenAI, or Anthropic keys. See `.env.example`. None were supplied for this run.

## What runs today

Nothing is maintained.

The browser bundle builds and serves as static files, but every page calls the Express API, and the API does not start.

What the code contains, for reference:

- `server/routes.ts`: Express routes for projects, facilities, zones, equipment types and instances, typed commands, and report generation. Rows are stored in Postgres through Drizzle (`shared/schema.ts`).
- `server/seed.ts`: seeded equipment types (stirred tank bioreactor, wave reactor, incubator, laminar flow hood, centrifuge, cold storage, and others).
- `server/routes/aps.ts`: token, upload, translate, and manifest calls to Autodesk APS (the `@aps_sdk` packages) for the model viewer.
- `server/routes/openai.ts`: chat, image analysis, and code interpreter calls to the OpenAI API.
- `client/src/pages/`: facility designer, CAD workspace (Three.js), Autodesk viewer demo, datasets browser, and a landing page.
- `client/src/lib/dxf-renderer.ts`: draws DXF files parsed with `dxf-parser`.
- `packages/codex`: a separate command line tool that calls the OpenAI and Anthropic APIs to generate code. Not built or run here.

## Limits

- This is not a CAD program. It stores layouts as database rows and draws them in the browser. It does not read or write DWG files.
- Export is not implemented. `exportToSTEP`, `exportToDXF`, `exportToSTL`, and `exportToGLTF` in `client/src/lib/crowecad-core.ts` return the model object unchanged.
- The `/api/commands` handler matches keywords in the command text (`server/routes.ts`, comment: "Simple command processing"). It is not a language model.
- The old README described npm packages `crowecad-cli` and `crowecad`. Neither exists on the npm registry (checked 2026-09-10).
- `fly.backend.toml` and `fly.frontend.toml` name the apps `crowecad-backend` and `crowecad-frontend`. Neither hostname resolves (checked 2026-09-10).
- `.github/workflows/ci.yml` calls `npm run lint`, `npm run type-check`, and `npm run format:check`. None of those scripts exist in `package.json`.
- `Crowe.py` and `package.json.new` are empty files.
- The old README's badges claimed an MIT license, a passing build, and 98% coverage. There is no license file, the CI scripts do not exist, and no coverage report is in the repository.
- Do not use this to plan a real facility. Equipment sizes and placements are not checked against any standard.

## License and contact

No license file. All rights reserved by default.

Contact: michael@crowelogic.com
