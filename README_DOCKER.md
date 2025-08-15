# CroweCad Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MichaelCrowe11/Crowecad.git
cd Crowecad
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Start with Docker Compose**
```bash
# Production mode
docker-compose up -d

# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

4. **Access CroweCad**
- Application: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Docker Services

### 1. CroweCad Application (`crowecad`)
- **Image**: Built from Dockerfile
- **Port**: 5000
- **Volumes**:
  - `./crowecad_skills.json`: Skills database
  - `./uploads`: File uploads
  - `./public`: Static files

### 2. PostgreSQL Database (`postgres`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Volume**: `postgres_data`
- **Credentials**: Set in `.env`

### 3. Redis Cache (`redis`)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: `redis_data`
- **Persistence**: AOF enabled

## Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://crowecad:password@postgres:5432/crowecad
PGUSER=crowecad
PGPASSWORD=your_secure_password
PGDATABASE=crowecad

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# GitHub (for skill mining)
GITHUB_TOKEN=ghp_...
```

## Common Commands

### Using Make
```bash
make help              # Show all commands
make docker-up         # Start services
make docker-down       # Stop services
make docker-logs       # View logs
make docker-dev        # Start development mode
make db-reset          # Reset database
make backup            # Backup data
make status            # Check service status
```

### Using Docker Compose Directly
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

## Development Mode

Development mode includes:
- Hot reloading
- Volume mounts for code changes
- Exposed debug ports
- Verbose logging

Start development:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Production Deployment

### 1. Security Checklist
- [ ] Change default passwords
- [ ] Use strong API keys
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set resource limits
- [ ] Enable backup schedule

### 2. Performance Tuning
```yaml
# docker-compose.yml
services:
  crowecad:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 3. Scaling
```bash
# Scale application instances
docker-compose up -d --scale crowecad=3
```

## Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:5000/api/health

# Check database
docker exec crowecad-db pg_isready

# Check Redis
docker exec crowecad-cache redis-cli ping
```

### Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs crowecad

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

## Backup and Restore

### Backup
```bash
# Automated backup
make backup

# Manual backup
docker exec crowecad-db pg_dump -U crowecad crowecad > backup.sql
cp crowecad_skills.json backup_skills.json
```

### Restore
```bash
# Restore database
docker exec -i crowecad-db psql -U crowecad crowecad < backup.sql

# Restore skills
cp backup_skills.json crowecad_skills.json
docker-compose restart crowecad
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs crowecad

# Verify environment
docker-compose config

# Check disk space
docker system df
```

### Database connection issues
```bash
# Test connection
docker exec crowecad-db psql -U crowecad -c "SELECT 1"

# Check network
docker network ls
docker network inspect crowecad-network
```

### Permission issues
```bash
# Fix volume permissions
sudo chown -R 1000:1000 ./uploads
sudo chmod -R 755 ./uploads
```

### Reset everything
```bash
# Stop and remove all
docker-compose down -v
docker system prune -a
rm -rf uploads/* crowecad_skills.json

# Start fresh
docker-compose up -d
```

## Advanced Configuration

### Custom Network
```yaml
networks:
  crowecad-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Persistent Storage
```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres
```

### SSL/TLS with Traefik
```yaml
services:
  traefik:
    image: traefik:v2.9
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik.yml:/traefik.yml
      - ./acme.json:/acme.json
      - /var/run/docker.sock:/var/run/docker.sock
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Deploy to Docker
  run: |
    docker-compose pull
    docker-compose up -d --build
    docker-compose exec -T crowecad npm run db:migrate
```

### GitLab CI
```yaml
deploy:
  script:
    - docker-compose down
    - docker-compose up -d --build
    - docker-compose exec -T crowecad npm run test
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/MichaelCrowe11/Crowecad/issues
- Documentation: https://crowecad.com/docs
- Email: support@crowecad.com