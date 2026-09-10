# Order Service

Servicio de gestión de pedidos y clientes para OptiRoute-Engine.

## Funcionalidades

- CRUD de Clientes
- CRUD de Pedidos (Orders)
- Gestión de Puntos de Entrega (DeliveryPoints)
- Publicación de eventos `order.created` en RabbitMQ
- Actualización de rutas optimizadas desde Routing Engine

## Endpoints API

### Clients
- `POST /clients` - Crear cliente
- `GET /clients` - Listar clientes
- `GET /clients/:id` - Obtener cliente por ID
- `PATCH /clients/:id` - Actualizar cliente
- `DELETE /clients/:id` - Eliminar cliente

### Orders
- `POST /orders` - Crear pedido (publica evento en RabbitMQ)
- `GET /orders` - Listar pedidos
- `GET /orders/:id` - Obtener pedido por ID
- `PATCH /orders/:id/route` - Actualizar ruta optimizada
- `PATCH /orders/:id/status` - Actualizar estado del pedido
- `DELETE /orders/:id` - Eliminar pedido

## Estados del Pedido

1. **PENDING** - Pedido creado, esperando cálculo de ruta
2. **CALCULATING** - Ruta siendo calculada por Routing Engine
3. **OPTIMIZED** - Ruta optimizada recibida
4. **COMPLETED** - Pedido completado

## Swagger UI

Accede a `http://localhost:8081/api` para ver la documentación interactiva.

## Desarrollo

```bash
npm install
npm run start:dev
```

## Docker

```bash
docker build -t order-service .
docker run -p 8081:8081 --env-file .env order-service
```
