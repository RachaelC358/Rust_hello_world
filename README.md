# Hello World Rust Web Server

A simple Rust web server that serves HTTP requests and can be deployed to AWS ECS using Pulumi infrastructure-as-code.

## Features

- 🦀 **Rust Web Server**: Built with Warp framework, serves on port 8080
- 🐳 **Docker Support**: Multi-stage build for optimized container images
- ☁️ **AWS ECS Deployment**: Complete Fargate setup with Pulumi
- 📋 **Infrastructure as Code**: All AWS resources managed with Pulumi
- 🔒 **Security Groups**: Configurable network access controls
- 📊 **Monitoring**: CloudWatch logging integration
- 🏥 **Health Checks**: Built-in health endpoint

## Prerequisites

- [Rust](https://rustup.rs/) (for local development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [Node.js](https://nodejs.org/) (for Pulumi TypeScript)

## Project Structure

```
hello__world/
├── rust_project/          # Rust web server application
│   ├── src/main.rs       # Web server code
│   ├── Cargo.toml        # Rust dependencies
│   └── Dockerfile        # Container build instructions
├── infra/                # Pulumi infrastructure code
│   ├── index.ts          # AWS ECS/ECR infrastructure
│   ├── Pulumi.yaml       # Pulumi project configuration
│   └── package.json      # Node.js dependencies
└── README.md
```

## Quick Start - Local Development

1. **Navigate to the Rust project**
   ```bash
   cd rust_project
   ```

2. **Run locally with Cargo**
   ```bash
   cargo run
   ```
   Server will be available at `http://localhost:8080`

3. **Or build and run with Docker**
   ```bash
   docker build -t rust-hello-world .
   docker run -p 8080:8080 rust-hello-world
   ```

## AWS Deployment

### Deploy to ECS

1. **Deploy infrastructure**
   ```bash
   cd infra
   npm install
   pulumi up --yes
   ```

2. **Build and push Docker image**
   ```bash
   cd ../rust_project
   
   # Get repository URL from Pulumi output
   REPO_URL=$(cd ../infra && pulumi stack output repositoryUrl)
   
   # Authenticate Docker with ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REPO_URL
   
   # Build, tag, and push
   docker build -t rust-hello-world .
   docker tag rust-hello-world:latest $REPO_URL:latest
   docker push $REPO_URL:latest
   ```

3. **Access your deployed application**
   - Find the public IP of your ECS task in the AWS Console
   - Visit `http://[PUBLIC_IP]:8080`

### Tear Down

```bash
cd infra
pulumi destroy --yes
```

**Note**: If ECR repository deletion fails due to images, run:
```bash
aws ecr delete-repository --repository-name rust-hello-world --force
pulumi destroy --yes
```

## API Endpoints

- **GET /** - Returns HTML greeting
- **GET /health** - Health check endpoint (returns JSON)

## Infrastructure Components

The Pulumi infrastructure creates:

- 🏗️ **ECS Fargate Cluster** - Serverless container hosting
- 📦 **ECR Repository** - Private Docker registry
- 🔐 **IAM Roles** - Task execution permissions
- 🛡️ **Security Groups** - Network access controls
- 📝 **CloudWatch Logs** - Container logging
- 🌐 **VPC Integration** - Uses default VPC for simplicity

## Development Notes

- Built for **AWS Free Tier** compatibility (0.25 vCPU, 0.5GB RAM)
- Uses **multi-stage Docker build** for smaller images
- **Security group** allows configurable IP access restrictions
- **CloudWatch logs** retain for 7 days to minimize costs
