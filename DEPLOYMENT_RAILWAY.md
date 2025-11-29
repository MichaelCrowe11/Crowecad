# Deploying CroweCAD to Railway

Use this guide to ship CroweCAD to Railway using the repository's container build. The `railway.json` file already defines the Nixpacks build and health checks so deployment can be done from the CLI or the dashboard.

## Prerequisites
- Railway account and installed CLI (`npm i -g @railway/cli`)
- PostgreSQL connection string (for `DATABASE_URL`)
- Autodesk Platform Services credentials (`APS_CLIENT_ID`, `APS_CLIENT_SECRET`)
- Session secret (`SESSION_SECRET`, at least 32 characters)
- Optional: `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`

## One-Time Project Setup
```bash
# Authenticate
railway login

# Initialize a new project (creates project and sets remote)
railway init

# Link the project to this repository
railway link
```

## Deploy with Nixpacks
The provided `railway.json` uses Nixpacks to install dependencies, build the client, and start the server with `npm run start`.

```bash
# Prepare environment variables (copy .env.railway.example and fill it in)
cp .env.railway.example .env.railway
$EDITOR .env.railway

# Push env vars and deploy using the helper script
./scripts/deploy-railway.sh .env.railway
```

## Health Checks and Logs
- Health endpoint: `/health` (used by Railway health checks)
- View logs: `railway logs`
- Open the deployed app: `railway open`

## Notes
- The server binds to `PORT=8080` by default to match Railway's suggested port mapping.
- Ensure `npm run build` succeeds locally before deploying to catch missing environment variables early.
