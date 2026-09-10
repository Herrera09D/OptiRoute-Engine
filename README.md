# OptiRoute-Engine

Sistema de optimización de rutas logísticas con microservicios y teoría de grafos.

## Descripción

Proyecto académico de Ingeniería de Sistemas que implementa una arquitectura de microservicios para optimización de rutas urbanas utilizando algoritmos de teoría de grafos (Dijkstra, A*, TSP).

## Arquitectura

```
┌─────────────────┐
│  API Gateway    │ :8080
│  (NestJS)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│Order  │ │ Routing   │
│Service│ │ Engine    │
│:8081  │ │ :8082     │
└───┬───┘ └──┬────────┘
    │         │
    │    ┌────▼────┐
    │    │ Redis   │
    │    │ :6379   │
    │    └─────────┘
    │
┌───▼────────────┐
│ PostgreSQL     │
│ Order: :5432   │
│ Routing: :5433 │
└────────────────┘
    │
┌───▼────────────┐
│ RabbitMQ       │
│ :5672 / :15672 │
└────────────────┘
```

## Microservicios

### 1. API Gateway (Puerto 8080)
- Enrutamiento de peticiones
- Autenticación JWT
- Rate limiting
- Logging centralizado
- Swagger UI

### 2. Order Service (Puerto 8081)
- CRUD de pedidos y clientes
- Gestión de puntos de entrega
- Publicación de eventos en RabbitMQ
- Base de datos PostgreSQL

### 3. Routing Engine (Puerto 8082)
- Algoritmos de grafos (Dijkstra, A*, TSP)
- Consumo de eventos desde RabbitMQ
- Caché en Redis
- Base de datos PostgreSQL para nodos y aristas

## Tecnologías

- **Runtime:** Node.js 20+
- **Framework:** NestJS 10+
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL 15+
- **Caché:** Redis 7+
- **Message Broker:** RabbitMQ 3.12+
- **ORM:** TypeORM
- **Contenedores:** Docker & Docker Compose

## Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd optiroute-engine
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

### 3. Iniciar infraestructura con Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 4. Acceder a los servicios

- **API Gateway:** http://localhost:8080
- **Order Service:** http://localhost:8081
- **Routing Engine:** http://localhost:8082
- **RabbitMQ Management:** http://localhost:15672 (optiroute/optiroute123)
- **PostgreSQL Order:** localhost:5432
- **PostgreSQL Routing:** localhost:5433
- **Redis:** localhost:6379

## Estructuras Discretas Implementadas

### Grafos
- Grafo dirigido ponderado con lista de adyacencia
- Nodos con coordenadas geográficas
- Aristas con pesos (distancia/tiempo)

### Algoritmos
- **Dijkstra:** Camino más corto O((V+E)logV)
- **A*:** Búsqueda informada con heurística Haversine
- **Nearest Neighbor:** Heurística greedy para TSP
- **BFS/DFS:** Validación de conectividad

## Desarrollo

### Instalar dependencias en todos los servicios

```bash
npm run install:all
```

### Ejecutar en modo desarrollo

```bash
# API Gateway
npm run dev:gateway

# Order Service
npm run dev:order

# Routing Engine
npm run dev:routing
```

### Build de todos los servicios

```bash
npm run build:all
```

## Comandos Docker Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f order-service

# Reiniciar un servicio
docker-compose restart routing-engine

# Reconstruir un servicio
docker-compose up -d --build api-gateway

# Limpiar volúmenes (cuidado: borra datos)
docker-compose down -v
```

## Documentación API

Cada servicio incluye documentación Swagger disponible en:
- API Gateway: http://localhost:8080/api/docs
- Order Service: http://localhost:8081/api/docs
- Routing Engine: http://localhost:8082/api/docs

## Contribución

1. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
2. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abrir Pull Request

## Licencia

MIT - Proyecto académico de Ingeniería de Sistemas
