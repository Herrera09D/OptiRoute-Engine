# OptiRoute-Engine - API Gateway

Servicio de API Gateway para el sistema de optimización de rutas logísticas.

## Funcionalidades
- Enrutamiento de peticiones a microservicios
- Autenticación JWT básica
- Rate limiting
- Logging centralizado
- Documentación Swagger UI

## Puerto
8080

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start:prod
```

## Variables de Entorno
- PORT=8080
- JWT_SECRET=tu-secreto-jwt
- ORDER_SERVICE_URL=http://order-service:8081
- ROUTING_SERVICE_URL=http://routing-engine:8082
- REDIS_URL=redis://redis:6379
- RABBITMQ_URL=amqp://user:pass@rabbitmq:5672

## Endpoints Principales
- GET /health - Health check
- GET /api/docs - Swagger UI
- POST /auth/login - Autenticación
- Proxy a Order Service: /api/orders/*
- Proxy a Routing Engine: /api/routing/*
