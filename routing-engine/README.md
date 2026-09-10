# OptiRoute-Engine - Routing Engine

Servicio de optimización de rutas con algoritmos de teoría de grafos.

## Funcionalidades
- Implementación de estructuras de grafos (Lista de Adyacencia)
- Algoritmos de optimización: Dijkstra, A*, Nearest Neighbor (TSP)
- Consumo de eventos "order.created" desde RabbitMQ
- Caché de rutas en Redis
- Integración con PostgreSQL para nodos y aristas

## Puerto
8082

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
- PORT=8082
- DB_HOST=postgres-routing
- DB_PORT=5432
- DB_USER=optiroute
- DB_PASSWORD=optiroute123
- DB_NAME=routing_db
- RABBITMQ_URL=amqp://optiroute:optiroute123@rabbitmq:5672
- REDIS_URL=redis://redis:6379

## Estructuras Discretas Implementadas

### Graph (Grafo Dirigido Ponderado)
- Implementación con Lista de Adyacencia usando Map
- Nodes: id, label, coordinates (lat, lng)
- Edges: from, to, weight (distancia/tiempo)
- Métodos: addNode, addEdge, getNeighbors, getEdgeWeight

### PriorityQueue (Cola de Prioridad)
- Heap binario para algoritmos de búsqueda
- Métodos: enqueue, dequeue, isEmpty, peek

## Algoritmos

### Dijkstra
- Camino más corto desde origen a todos los destinos
- Complejidad: O((V + E) log V)
- Retorna: distancia total y path de nodos

### A* (A-Star)
- Búsqueda informada con heurística
- Función heurística: Distancia Haversine
- f(n) = g(n) + h(n)
- Más eficiente que Dijkstra para punto a punto

### Nearest Neighbor (Vecino Más Cercano)
- Heurística greedy para TSP
- Optimización de múltiples paradas
- Incluye mejora 2-Opt

### BFS/DFS
- Validación de conectividad del grafo
- Búsqueda en amplitud y profundidad

## Modelos de Datos

### Node
- id: string
- label: string
- latitude: number
- longitude: number
- createdAt: timestamp

### Edge
- id: UUID
- fromNodeId: string (FK)
- toNodeId: string (FK)
- weight: number
- distance: number
- estimatedTime: number

## Eventos Consumidos
- order.created - Para calcular ruta óptima

## Endpoints Principales
- POST /routing/calculate - Calcular ruta óptima
- GET /routing/graph - Obtener grafo completo
- POST /routing/nodes - Agregar nodos al grafo
- POST /routing/edges - Agregar aristas al grafo
- GET /routing/algorithms/dijkstra - Ejecutar Dijkstra
- GET /routing/algorithms/astar - Ejecutar A*
- GET /routing/algorithms/tsp - Ejecutar TSP
