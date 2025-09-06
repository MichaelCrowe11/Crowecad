# CroweCAD Deployment Instructions for Fly.io

## Prerequisites
- Fly.io account (create at https://fly.io)
- Fly CLI installed (already done)
- GitHub repository updated (✅ Complete)

## Deployment Steps

### 1. Authenticate with Fly.io
```bash
export PATH="/home/runner/.fly/bin:$PATH"
flyctl auth login
```

### 2. Deploy Backend
```bash
# Create the backend app
flyctl apps create crowecad-backend --org personal

# Set environment variables
flyctl secrets set \
  DATABASE_URL='your-postgresql-url' \
  APS_CLIENT_ID='your-aps-client-id' \
  APS_CLIENT_SECRET='your-aps-client-secret' \
  SESSION_SECRET='your-session-secret' \
  NODE_ENV='production' \
  -a crowecad-backend

# Deploy the backend
flyctl deploy --config fly.backend.toml --dockerfile Dockerfile.fly -a crowecad-backend
```

### 3. Deploy Frontend
```bash
# Create the frontend app
flyctl apps create crowecad-frontend --org personal

# Set backend API URL
flyctl secrets set VITE_API_URL='https://crowecad-backend.fly.dev' -a crowecad-frontend

# Deploy the frontend
flyctl deploy --config fly.frontend.toml --dockerfile Dockerfile.fly -a crowecad-frontend
```

### 4. Alternative: Use the Deployment Script
```bash
# Make the script executable (already done)
chmod +x scripts/deploy-fly.sh

# Run the deployment script
./scripts/deploy-fly.sh
```

## Environment Variables Needed

### Backend (.env for local, secrets for Fly.io)
- `DATABASE_URL` - PostgreSQL connection string
- `APS_CLIENT_ID` - Autodesk Platform Services Client ID
- `APS_CLIENT_SECRET` - Autodesk Platform Services Client Secret
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)
- `SESSION_SECRET` - Random 32-character string for sessions
- `NODE_ENV` - Set to 'production'

### Frontend
- `VITE_API_URL` - Backend API URL (https://crowecad-backend.fly.dev)

## Post-Deployment

### Verify Deployment
- Backend Health: https://crowecad-backend.fly.dev/health
- Frontend: https://crowecad-frontend.fly.dev
- API Docs: https://crowecad-backend.fly.dev/api

### Monitor Logs
```bash
# Backend logs
flyctl logs -a crowecad-backend

# Frontend logs
flyctl logs -a crowecad-frontend
```

### Scale if Needed
```bash
# Scale backend
flyctl scale count 2 -a crowecad-backend

# Scale frontend
flyctl scale count 2 -a crowecad-frontend
```

## GitHub Repository
Your code has been successfully pushed to:
https://github.com/MichaelCrowe11/Crowecad

## Troubleshooting

### If deployment fails:
1. Check logs: `flyctl logs -a app-name`
2. Verify environment variables: `flyctl secrets list -a app-name`
3. Check app status: `flyctl status -a app-name`

### Database Setup
If you need a PostgreSQL database, Fly.io provides managed Postgres:
```bash
flyctl postgres create
flyctl postgres attach -a crowecad-backend
```

## Next Steps
1. Login to Fly.io: `flyctl auth login`
2. Configure your environment variables
3. Run the deployment script or follow manual steps
4. Verify deployment at the provided URLs

## Support
- Fly.io Documentation: https://fly.io/docs
- CroweCAD Repository: https://github.com/MichaelCrowe11/Crowecad