# 🔍 Advanced Search API

> Advanced product search system with Elasticsearch, Redis, and hexagonal architecture, built with NestJS.

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-9.2.2-005571?logo=elasticsearch)](https://www.elastic.co/)
[![Redis](https://img.shields.io/badge/Redis-8.4.0-DC382D?logo=redis)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technologies](#️-technologies)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
  - [Option 1: Docker (Recommended)](#option-1-docker-recommended)
  - [Option 2: Local Installation](#option-2-local-installation)
- [Configuration](#️-configuration)
- [API Endpoints](#-api-endpoints)
- [Usage Examples](#-usage-examples)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### Core Features

- 🔎 **Full-Text Search**: Advanced search with Elasticsearch and relevance-based ranking
- 🏷️ **Multi-Criteria Filtering**: By name, category, subcategories, geographic location, and price range
- 📊 **Faceted Search**: Dynamic aggregations by categories, subcategories, and price ranges
- ⚡ **Smart Autocomplete**: Real-time suggestions with Redis caching
- 🎯 **Relevance-based Ranking**: Intelligent sorting based on score and popularity
- 💡 **Search Suggestions**: Alternative queries when few results are found
- 📄 **Pagination**: Efficient pagination system with configurable limits
- 🔄 **Multiple Sorting Options**: By relevance, popularity, creation date, and price

### Technical Features

- 🏗️ **Hexagonal Architecture**: Clear separation between domain, application, and infrastructure
- 🛡️ **Robust Validation**: DTOs with class-validator for automatic validation
- 🔐 **Error Handling**: Global custom exception filters
- 📝 **Logging**: Structured logging system with NestJS Logger
- 🚀 **Smart Caching**: Redis to optimize frequent queries
- 🌍 **Geospatial Search**: Filtering by coordinates with customizable radius
- 📚 **Swagger Documentation**: Fully documented API with OpenAPI
- 🐳 **Docker Ready**: Complete configuration with docker-compose

## 🏛️ Architecture

This project implements **Hexagonal Architecture (Ports & Adapters)** to ensure:

- ✅ Framework independence
- ✅ Testability
- ✅ Maintainability
- ✅ Scalability

```
src/
└── product/
    ├── domain/              # 🎯 Business core
    │   ├── entities/        # Domain entities
    │   ├── ports/           # Interfaces (contracts)
    │   ├── contracts/       # Value Objects and types
    │   └── exceptions/      # Domain exceptions
    │
    ├── application/         # 📋 Use cases
    │   ├── use-cases/       # Application logic
    │   └── dtos/            # Data Transfer Objects
    │
    └── infrastructure/      # 🔌 Adapters
        ├── adapters/        # Concrete implementations
        │   ├── elasticsearch/
        │   ├── redis/
        │   └── typeorm/
        └── http/            # HTTP Controllers
```

## 🛠️ Technologies

| Category          | Technology      | Version | Purpose                           |
| ----------------- | --------------- | ------- | --------------------------------- |
| **Framework**     | NestJS          | 11.0.1  | Main framework                    |
| **Language**      | TypeScript      | 5.7.3   | Programming language              |
| **Database**      | PostgreSQL      | 18      | Primary storage                   |
| **ORM**           | TypeORM         | 0.3.28  | Object-Relational Mapping         |
| **Search Engine** | Elasticsearch   | 9.2.2   | Full-text search and aggregations |
| **Cache**         | Redis           | 8.4.0   | Autocomplete caching              |
| **Validation**    | class-validator | 0.14.3  | DTO validation                    |
| **Documentation** | Swagger/OpenAPI | 11.2.3  | API documentation                 |
| **Testing**       | Jest            | 30.0.0  | Testing framework                 |
| **Containers**    | Docker          | Latest  | Containerization                  |
| **Visualization** | Kibana          | 9.2.2   | Elasticsearch visualization       |

## 📦 Prerequisites

### To run with Docker (Recommended):

- Docker Engine 20.10+
- Docker Compose 2.0+

### For local execution:

- Node.js 20.x or higher
- pnpm 9.x
- PostgreSQL 18
- Elasticsearch 9.2.2
- Redis 8.4.0

## 🚀 Installation and Setup

### Option 1: Docker (Recommended)

This is the fastest and easiest way to run the project.

#### 1. Clone the repository

```bash
git clone <repository-url>
cd advanced-search-system
```

#### 2. Start all services

```bash
docker-compose up -d
```

This will start:

- ✅ NestJS API at `http://localhost:3000`
- ✅ PostgreSQL at `localhost:5432`
- ✅ Elasticsearch at `http://localhost:9200`
- ✅ Redis at `localhost:6379`
- ✅ Kibana at `http://localhost:5601`

#### 3. Run migrations and seeds

```bash
# Wait for all services to be healthy (30-60 seconds)
docker-compose exec app pnpm run migration:run
docker-compose exec app pnpm run seed:full
```

#### 4. Verify everything is working

```bash
# View logs
docker-compose logs -f app

# Access the API
curl http://localhost:3000/products
```

#### 5. Access the interfaces

- 🌐 **API**: http://localhost:3000
- 📚 **Swagger UI**: http://localhost:3000/api
- 🔍 **Kibana**: http://localhost:5601

#### Useful Docker commands

```bash
# Stop services
docker-compose down

# Stop and remove volumes (complete reset)
docker-compose down -v

# View logs of a specific service
docker-compose logs -f app
docker-compose logs -f elasticsearch

# Restart a service
docker-compose restart app

# Execute commands inside the container
docker-compose exec app pnpm run <command>
```

---

### Option 2: Local Installation

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Configure environment variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your local configurations
# Make sure the services are running locally
```

#### 3. Start external services

You must have PostgreSQL, Elasticsearch, and Redis running locally:

```bash
# PostgreSQL
createdb search_db

# Elasticsearch (must be running at http://localhost:9200)
# Redis (must be running at localhost:6379)
```

#### 4. Run migrations

```bash
pnpm run migration:run
```

#### 5. Load test data

```bash
pnpm run seed:full
```

This command:

1. Creates 100 test products in PostgreSQL
2. Syncs all products with Elasticsearch
3. Prepares the system to be used immediately

#### 6. Start the application

```bash
# Development mode (with hot-reload)
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The API will be available at `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=search_db

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=products

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600  # Cache TTL in seconds (1 hour)
```

### Docker Configuration

For Docker, variables are automatically configured in `docker-compose.yml`. You can override them by creating a `.env` file in the root.

## 📡 API Endpoints

### Base URL

```
http://localhost:3000
```

### Available Endpoints

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| `GET`  | `/products`              | Search products with filters |
| `GET`  | `/products/autocomplete` | Get autocomplete suggestions |
| `GET`  | `/products/:id`          | Get product by ID            |
| `GET`  | `/api`                   | Swagger documentation        |

### Search Parameters

#### `GET /products`

**Query Parameters:**

| Parameter       | Type     | Description                               | Example                          |
| --------------- | -------- | ----------------------------------------- | -------------------------------- |
| `text`          | string   | Full-text search                          | `?text=laptop`                   |
| `category`      | string   | Filter by category                        | `?category=Electronics`          |
| `subcategories` | string[] | Filter by subcategories (comma-separated) | `?subcategories=laptops,cameras` |
| `minPrice`      | number   | Minimum price                             | `?minPrice=100`                  |
| `maxPrice`      | number   | Maximum price                             | `?maxPrice=1000`                 |
| `lat`           | number   | Latitude (-90 to 90)                      | `?lat=40.7128`                   |
| `lon`           | number   | Longitude (-180 to 180)                   | `?lon=-74.006`                   |
| `radiusKm`      | number   | Radius in kilometers                      | `?radiusKm=10`                   |
| `page`          | number   | Page number (default: 1)                  | `?page=1`                        |
| `limit`         | number   | Results per page (max: 100, default: 20)  | `?limit=20`                      |
| `sort`          | string   | Sorting                                   | `?sort=relevance`                |

**Sort Options (`sort`):**

- `relevance` - By relevance (score + popularity) [default]
- `popularity` - By popularity
- `created_at` - By creation date
- `price_asc` - Ascending price
- `price_desc` - Descending price

#### `GET /products/autocomplete`

**Query Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `text`    | string | ✅       | Text to autocomplete               |
| `limit`   | number | ❌       | Number of suggestions (default: 5) |

## 💻 Usage Examples

### 1. Simple text search

```bash
curl "http://localhost:3000/products?text=laptop"
```

### 2. Search with multiple filters

```bash
curl "http://localhost:3000/products?text=phone&category=Electronics&minPrice=500&maxPrice=1500&page=1&limit=10&sort=price_asc"
```

### 3. Geographic search

```bash
# Products near New York (10km radius)
curl "http://localhost:3000/products?lat=40.7128&lon=-74.006&radiusKm=10"
```

### 4. Search with subcategories

```bash
curl "http://localhost:3000/products?category=Electronics&subcategories=laptops,cameras"
```

### 5. Autocomplete

```bash
curl "http://localhost:3000/products/autocomplete?text=lapt&limit=5"
```

**Response:**

```json
{
  "suggestions": ["Laptop Professional", "Gaming Laptop", "Laptop Ultrabook"]
}
```

### 6. Get product by ID

```bash
curl "http://localhost:3000/products/e84fd6c0-37a0-41e0-acfc-24a15f39f247"
```

### Search Response (example)

```json
{
  "items": [
    {
      "id": "e84fd6c0-37a0-41e0-acfc-24a15f39f247",
      "name": "Professional Laptop",
      "description": "High-performance laptop for professionals",
      "category": "Electronics",
      "subcategories": ["laptops", "computers"],
      "price": 1299.99,
      "latitude": 40.7128,
      "longitude": -74.006,
      "popularity": 150,
      "createdAt": "2024-12-11T10:00:00.000Z",
      "updatedAt": "2024-12-11T10:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "facets": {
    "categories": [
      { "key": "Electronics", "count": 35 },
      { "key": "Home", "count": 7 }
    ],
    "subcategories": [
      { "key": "laptops", "count": 20 },
      { "key": "cameras", "count": 15 }
    ],
    "price_ranges": [
      { "key": "0-50", "count": 5 },
      { "key": "500-1000", "count": 25 },
      { "key": "1000+", "count": 12 }
    ]
  },
  "suggestedQuery": null
}
```

## 📜 Available Scripts

### Development

```bash
# Start in development mode (hot-reload)
pnpm run start:dev

# Build the project
pnpm run build

# Start in production mode
pnpm run start:prod
```

### Database

```bash
# Generate migration
pnpm run migration:generate -- ./src/common/database/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert

# Load test data in PostgreSQL
pnpm run seed

# Sync data with Elasticsearch
pnpm run sync:elasticsearch

# Load data and sync (complete)
pnpm run seed:full
```

### Testing

```bash
# Unit tests
pnpm run test

# Tests in watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

### Linting and Formatting

```bash
# Lint
pnpm run lint

# Format
pnpm run format
```

## 📁 Project Structure

```
advanced-search-system/
├── src/
│   ├── product/                    # Products module
│   │   ├── domain/                 # Domain layer
│   │   │   ├── entities/           # Domain entities
│   │   │   │   └── product.entity.ts
│   │   │   ├── ports/              # Interfaces (ports)
│   │   │   │   ├── product-repository.port.ts
│   │   │   │   ├── product-search.port.ts
│   │   │   │   └── cache.port.ts
│   │   │   ├── contracts/          # Types and contracts
│   │   │   │   ├── product.props.ts
│   │   │   │   └── sort-options.ts
│   │   │   └── exceptions/         # Custom exceptions
│   │   │       └── product.exception.ts
│   │   │
│   │   ├── application/            # Application layer
│   │   │   ├── use-cases/          # Use cases
│   │   │   │   ├── search-products.usecase.ts
│   │   │   │   ├── autocomplete-products.usecase.ts
│   │   │   │   └── find-product-by-id.usecase.ts
│   │   │   └── dtos/               # Data Transfer Objects
│   │   │       ├── search-products.query.dto.ts
│   │   │       ├── search-products.response.dto.ts
│   │   │       ├── autocomplete.query.dto.ts
│   │   │       ├── autocomplete.response.dto.ts
│   │   │       └── product.response.dto.ts
│   │   │
│   │   ├── infrastructure/         # Infrastructure layer
│   │   │   ├── adapters/           # Port implementations
│   │   │   │   ├── elasticsearch/
│   │   │   │   │   ├── elasticsearch-product.adapter.ts
│   │   │   │   │   ├── elasticsearch-query.builder.ts
│   │   │   │   │   ├── product.document.ts
│   │   │   │   │   └── product.mapper.ts
│   │   │   │   ├── redis/
│   │   │   │   │   └── redis-cache.adapter.ts
│   │   │   │   └── typeorm/
│   │   │   │       ├── product.orm-entity.ts
│   │   │   │       ├── typeorm-product.repository.ts
│   │   │   │       └── product.mapper.ts
│   │   │   └── http/               # HTTP Controllers
│   │   │       └── product.controller.ts
│   │   │
│   │   └── product.module.ts       # NestJS module
│   │
│   ├── common/                     # Shared code
│   │   ├── database/
│   │   │   ├── migrations/         # Database migrations
│   │   │   └── seeds/              # Data seeds
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── app.module.ts               # Main module
│   └── main.ts                     # Entry point
│
├── scripts/                        # Utility scripts
│   ├── seed.ts                     # Seed script
│   ├── sync-elasticsearch.ts       # ES sync
│   └── seed-and-sync.ts            # Seed + sync
│
├── test/                           # Tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Development Dockerfile
├── .env.example                    # Example environment variables
├── package.json                    # npm dependencies
├── pnpm-lock.yaml                  # pnpm lockfile
├── tsconfig.json                   # TypeScript configuration
├── nest-cli.json                   # NestJS configuration
├── orm.config.ts                   # TypeORM configuration
└── README.md                       # This file
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
pnpm run test

# Tests in watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e

# Full coverage
pnpm run test:cov
```

### Test Structure

Tests follow the same code structure:

- Unit tests next to their files (`.spec.ts`)
- E2E tests in the `test/` folder

## 📚 API Documentation

### Swagger UI

Interactive documentation is available at:

```
http://localhost:3000/api
```

From Swagger you can:

- 📖 View all available endpoints
- 🧪 Test requests directly
- 📝 View DTO schemas
- 📊 View response examples

### Postman Collection

A preconfigured Postman collection is included: `Advanced Search API.postman_collection.json`

**To import it:**

1. Open Postman
2. Click on "Import"
3. Select the file `Advanced Search API.postman_collection.json`
4. The collection includes examples of all endpoints with preconfigured parameters

## 🔧 Troubleshooting

### Error: "Cannot connect to Elasticsearch"

**Solution:**

```bash
# Verify that Elasticsearch is running
curl http://localhost:9200

# With Docker
docker-compose ps elasticsearch
docker-compose logs elasticsearch

# Restart Elasticsearch
docker-compose restart elasticsearch
```

### Error: "Redis connection failed"

**Solution:**

```bash
# Verify that Redis is running
redis-cli ping

# With Docker
docker-compose ps redis
docker-compose logs redis
```

### Error: "Database connection failed"

**Solution:**

```bash
# Verify PostgreSQL
psql -U postgres -d search_db

# With Docker
docker-compose ps postgres
docker-compose logs postgres

# Check environment variables
cat .env
```

### No data in searches

**Solution:**

```bash
# Run seeds again
docker-compose exec app pnpm run seed:full

# Or locally
pnpm run seed:full
```

### Elasticsearch index doesn't exist

**Solution:**

```bash
# The index is created automatically when starting the app
# If there are problems, recreate:
curl -X DELETE http://localhost:9200/products
docker-compose restart app
docker-compose exec app pnpm run sync:elasticsearch
```

### Port 3000 already in use

**Solution:**

```bash
# Change port in .env
PORT=3001

# Or with Docker, edit docker-compose.yml
ports:
  - '3001:3000'
```

### Docker compose up fails

**Solution:**

```bash
# Clean everything and start over
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### View detailed logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f elasticsearch
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 🎓 Featured Technical Characteristics

### 1. Fuzzy Search

The system implements fuzzy search to tolerate typos:

```typescript
{
  multi_match: {
    query: "lapton",  // Will find "laptop"
    fuzziness: "AUTO"
  }
}
```

### 2. Field Boosting

Product names have greater weight in relevance:

```typescript
fields: ['name^2', 'description']; // name has 2x boost
```

### 3. Geolocation

Search by geographic proximity:

```typescript
{
  geo_distance: {
    distance: "10km",
    location: { lat: 40.7128, lon: -74.006 }
  }
}
```

### 4. Smart Caching

Redis caches autocomplete with a 5-minute TTL to optimize performance.

### 5. Faceted Search

Dynamic aggregations that allow progressive filtering.

## 👤 Author

Developed by Ariel Perez

---

<p align="center">
  Made with ❤️ using NestJS, Elasticsearch and Redis
</p>
