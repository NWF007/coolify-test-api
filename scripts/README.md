# Development Scripts

This folder contains helpful scripts for development and deployment.

## Quick Start Scripts

### start-dev.bat (Windows)

```batch
@echo off
echo Starting Coolify Test Application in Development Mode...
docker-compose -f docker-compose.dev.yml up --build
```

### start-dev.sh (Linux/Mac)

```bash
#!/bin/bash
echo "Starting Coolify Test Application in Development Mode..."
docker-compose -f docker-compose.dev.yml up --build
```

### build-all.bat (Windows)

```batch
@echo off
echo Building API...
cd api
dotnet build --configuration Release
cd ..

echo Building Frontend...
cd frontend
npm install
npm run build
cd ..

echo Build completed successfully!
```

### deploy-local.sh (Linux/Mac)

```bash
#!/bin/bash
echo "Deploying locally with Docker Compose..."
docker-compose up --build -d

echo "Waiting for services to start..."
sleep 10

echo "Testing endpoints..."
curl -f http://localhost:5000/health && echo "✅ API is healthy"
curl -f http://localhost:3000 && echo "✅ Frontend is accessible"

echo "🚀 Local deployment complete!"
echo "API: http://localhost:5000"
echo "Frontend: http://localhost:3000"
```
