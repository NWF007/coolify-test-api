# Coolify Test Application

A simple .NET Web API with React frontend designed for testing CI/CD pipelines using GitHub Actions and deployment to Coolify.

## 🏗️ Architecture

- **Backend**: .NET 9 Web API with minimal APIs
- **Frontend**: React 18 with TypeScript
- **Containerization**: Docker containers for both services
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Deployment**: Coolify for container orchestration

## 🚀 Quick Start

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd coolify-test-api
   ```

2. **Run with Docker Compose**

   ```bash
   # Production build
   docker-compose up --build

   # Development mode (with hot reload)
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Run services separately**

   **API (Terminal 1):**

   ```bash
   cd api
   dotnet restore
   dotnet run
   ```

   API will be available at: http://localhost:5000

   **Frontend (Terminal 2):**

   ```bash
   cd frontend
   npm install
   npm start
   ```

   Frontend will be available at: http://localhost:3000

## 📋 API Endpoints

- `GET /health` - Health check endpoint
- `GET /weatherforecast` - Sample weather data
- `GET /users` - List of sample users
- `GET /users/{id}` - Get specific user by ID

## 🐳 Docker Configuration

### API Container

- Base image: `mcr.microsoft.com/dotnet/aspnet:9.0`
- Exposed port: 5000
- Multi-stage build for optimized image size

### Frontend Container

- Base image: `nginx:alpine`
- Exposed port: 80
- Optimized nginx configuration with gzip compression

## 🔄 CI/CD Pipeline

The project includes two GitHub Actions workflows:

### Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Triggers on:

- Push to `main` or `develop` branches
- Pull requests to `main`

**Steps:**

1. **Test**: Run .NET and React tests
2. **Build**: Create Docker images and push to GitHub Container Registry
3. **Deploy**: Deploy to Coolify (main branch only)

### Manual Deployment (`.github/workflows/manual-deploy.yml`)

- Manually triggered workflow
- Allows deployment to staging or production

## 🛠️ Setup for Coolify Deployment

### 1. GitHub Repository Setup

**Required Secrets:**

- `COOLIFY_WEBHOOK_API`: Webhook URL for API deployment
- `COOLIFY_WEBHOOK_FRONTEND`: Webhook URL for frontend deployment

**Required Variables:**

- `API_URL`: Your API domain (e.g., `https://api.yourdomain.com`)
- `FRONTEND_URL`: Your frontend domain (e.g., `https://yourdomain.com`)

### 2. Coolify Configuration

**For the API Service:**

1. Create a new service in Coolify
2. Set source to: GitHub Container Registry
3. Image: `ghcr.io/yourusername/coolify-test-api-api:main`
4. Port: 5000
5. Environment variables:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `ASPNETCORE_URLS=http://+:5000`

**For the Frontend Service:**

1. Create a new service in Coolify
2. Set source to: GitHub Container Registry
3. Image: `ghcr.io/yourusername/coolify-test-api-frontend:main`
4. Port: 80
5. Environment variables:
   - `REACT_APP_API_URL=https://your-api-domain.com`

### 3. GitHub Actions Setup

1. Go to your repository settings
2. Navigate to Secrets and Variables → Actions
3. Add the required secrets and variables mentioned above
4. The webhooks can be found in your Coolify service settings

## 🧪 Testing

### Run API Tests

```bash
cd api
dotnet test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

### Integration Testing

```bash
# Start services
docker-compose up -d

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/users

# Test frontend
curl http://localhost:3000
```

## 📝 Environment Variables

### API

- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ASPNETCORE_URLS`: Binding URLs

### Frontend

- `REACT_APP_API_URL`: Backend API URL

## 🔧 Development Tips

### Hot Reload Development

Use `docker-compose.dev.yml` for development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

### Building for Production

```bash
# Build API
cd api
dotnet publish -c Release -o publish

# Build Frontend
cd frontend
npm run build
```

### Docker Development

```bash
# Build individual containers
docker build -t coolify-api ./api
docker build -t coolify-frontend ./frontend

# Run containers
docker run -p 5000:5000 coolify-api
docker run -p 3000:80 coolify-frontend
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check API CORS configuration in `Program.cs`
   - Verify `REACT_APP_API_URL` is correctly set

2. **API Connection Failed**

   - Ensure API is running on correct port
   - Check Docker network configuration
   - Verify environment variables

3. **Build Failures**
   - Check .NET SDK version compatibility
   - Verify Node.js version (18+)
   - Clear Docker cache: `docker system prune`

### Health Checks

- API Health: `GET /health`
- Frontend: Check browser console for errors

## 📚 Project Structure

```
coolify-test-api/
├── api/                          # .NET Web API
│   ├── Program.cs               # Main application entry point
│   ├── appsettings.json         # Configuration
│   ├── Dockerfile              # API container configuration
│   └── .dockerignore           # Docker ignore rules
├── frontend/                    # React application
│   ├── src/
│   │   └── App.tsx             # Main React component
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend container configuration
│   ├── nginx.conf              # Nginx configuration
│   └── .env                    # Environment variables
├── .github/workflows/          # GitHub Actions
│   ├── ci-cd.yml              # Main CI/CD pipeline
│   └── manual-deploy.yml      # Manual deployment
├── docker-compose.yml          # Production Docker setup
├── docker-compose.dev.yml     # Development Docker setup
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
