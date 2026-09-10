import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { GraphLoaderService } from './graph-loader.service';
import { AStarService } from '../algorithms/astar.service';
import { NearestNeighborService } from '../algorithms/nearest-neighbor.service';
import { RedisService } from '../redis/redis.service';

/**
 * Evento recibido desde Order Service cuando se crea un pedido
 */
interface OrderCreatedEvent {
  orderId: string;
  clientId: string;
  deliveryPoints: Array<{
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    sequence: number;
    nodeId?: string;
  }>;
  depotNodeId?: string; // Nodo del depósito/almacén
}

/**
 * Evento publicado hacia Order Service con la ruta optimizada
 */
interface RouteCalculatedEvent {
  orderId: string;
  status: 'OPTIMIZED' | 'FAILED';
  totalDistance?: number;
  estimatedTime?: number;
  optimizedRoute?: string[];
  routeDetails?: any;
  error?: string;
  algorithm: 'A*' | 'TSP' | 'DIJKSTRA';
  calculatedAt: Date;
}

/**
 * RoutesService - Servicio principal de optimización de rutas
 * 
 * Responsabilidades:
 * 1. Escuchar eventos 'order.created' desde RabbitMQ
 * 2. Ejecutar algoritmos de optimización (A* o TSP)
 * 3. Guardar resultados en Redis para caché
 * 4. Publicar evento 'route.calculated' de vuelta a RabbitMQ
 * 
 * Flujo:
 * order.created → RoutesService → [A* | TSP] → Redis cache → route.calculated
 */
@Injectable()
export class RoutesService implements OnModuleInit {
  private readonly logger = new Logger(RoutesService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    private configService: ConfigService,
    private graphLoaderService: GraphLoaderService,
    private redisService: RedisService,
    private astarService: AStarService,
    private tspService: NearestNeighborService,
  ) {}

  /**
   * Inicializa la conexión con RabbitMQ y suscribe a la cola de pedidos
   */
  async onModuleInit(): Promise<void> {
    await this.connectRabbitMQ();
  }

  /**
   * Establece conexión con RabbitMQ
   */
  private async connectRabbitMQ(): Promise<void> {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost';

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Configurar colas
      const orderQueue = 'order_queue';
      const routeQueue = 'route_queue';

      await this.channel.assertQueue(orderQueue, { durable: true });
      await this.channel.assertQueue(routeQueue, { durable: true });

      // Consumir eventos de pedidos creados
      this.channel.consume(orderQueue, async (msg) => {
        if (msg) {
          try {
            const event: OrderCreatedEvent = JSON.parse(msg.content.toString());
            await this.processOrder(event);
            this.channel!.ack(msg);
          } catch (error) {
            this.logger.error('Error processing order:', error);
            this.channel!.nack(msg, false, false); // No requeue
          }
        }
      });

      this.logger.log('✅ RabbitMQ connected and listening for orders');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      // Reintentar en 5 segundos
      setTimeout(() => this.connectRabbitMQ(), 5000);
    }
  }

  /**
   * Procesa un pedido creado y calcula la ruta óptima
   */
  private async processOrder(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`📦 Processing order: ${event.orderId}`);

    try {
      // Verificar que el grafo esté cargado
      if (!this.graphLoaderService.isGraphLoaded()) {
        throw new Error('Graph not loaded yet');
      }

      const graph = this.graphLoaderService.getGraph();
      const depotId = event.depotNodeId || event.deliveryPoints[0]?.nodeId;

      if (!depotId) {
        throw new Error('No depot node specified');
      }

      // Extraer nodos de los puntos de entrega
      const stopNodes = event.deliveryPoints
        .map(dp => dp.nodeId)
        .filter((nodeId): nodeId is string => !!nodeId);

      if (stopNodes.length === 0) {
        throw new Error('No delivery points with valid node IDs');
      }

      let result: any;
      let algorithm: 'A*' | 'TSP' | 'DIJKSTRA';

      // Decidir algoritmo basado en número de paradas
      if (stopNodes.length <= 2) {
        // Punto a punto: usar A*
        algorithm = 'A*';
        const destination = stopNodes[stopNodes.length - 1];
        result = this.astarService.findPathWithTracking(graph, depotId, destination);
      } else {
        // Múltiples paradas: usar TSP con Nearest Neighbor
        algorithm = 'TSP';
        result = this.tspService.findOptimalRoute(graph, stopNodes, depotId, true);
      }

      // Validar que se encontró una ruta
      if (!result.path || result.path.length === 0 || !result.route || result.route.length === 0) {
        throw new Error('No valid path found');
      }

      const optimizedRoute = result.route || result.path;
      const totalDistance = result.totalDistance || 0;
      
      // Estimar tiempo (asumiendo velocidad promedio de 30 km/h = 8.33 m/s)
      const estimatedTime = totalDistance / 8.33;

      // Preparar evento de respuesta
      const routeEvent: RouteCalculatedEvent = {
        orderId: event.orderId,
        status: 'OPTIMIZED',
        totalDistance: Math.round(totalDistance),
        estimatedTime: Math.round(estimatedTime),
        optimizedRoute,
        routeDetails: result,
        algorithm,
        calculatedAt: new Date(),
      };

      // Guardar en Redis para caché (TTL: 24 horas)
      const cacheKey = `route:${event.orderId}`;
      await this.redisService.set(cacheKey, JSON.stringify(routeEvent), 86400);

      // Publicar resultado de vuelta a RabbitMQ
      await this.publishRouteCalculated(routeEvent);

      this.logger.log(`✅ Route calculated for order ${event.orderId}: ${totalDistance}m using ${algorithm}`);
    } catch (error) {
      this.logger.error(`❌ Failed to calculate route for order ${event.orderId}:`, error);

      // Publicar evento de fallo
      const errorEvent: RouteCalculatedEvent = {
        orderId: event.orderId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        algorithm: 'A*',
        calculatedAt: new Date(),
      };

      await this.publishRouteCalculated(errorEvent);
    }
  }

  /**
   * Publica evento de ruta calculada hacia Order Service
   */
  private async publishRouteCalculated(event: RouteCalculatedEvent): Promise<void> {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not available');
      return;
    }

    const routeQueue = 'route_queue';
    this.channel.sendToQueue(routeQueue, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });

    this.logger.log(`📤 Published route.calculated event for order: ${event.orderId}`);
  }

  /**
   * Método público para calcular ruta manualmente (desde controller)
   */
  async calculateRoute(
    depotNodeId: string,
    deliveryNodeIds: string[]
  ): Promise<{
    success: boolean;
    route?: string[];
    distance?: number;
    time?: number;
    algorithm?: string;
    error?: string;
  }> {
    try {
      if (!this.graphLoaderService.isGraphLoaded()) {
        return { success: false, error: 'Graph not loaded' };
      }

      const graph = this.graphLoaderService.getGraph();

      // Seleccionar algoritmo
      const algorithm = deliveryNodeIds.length > 2 ? 'TSP' : 'A*';
      let result: any;

      if (algorithm === 'A*') {
        result = this.astarService.findPathWithTracking(
          graph,
          depotNodeId,
          deliveryNodeIds[deliveryNodeIds.length - 1]
        );
      } else {
        result = this.tspService.findOptimalRoute(graph, deliveryNodeIds, depotNodeId, true);
      }

      const route = result.route || result.path;
      const distance = result.totalDistance || 0;
      const time = distance / 8.33;

      return {
        success: route && route.length > 0,
        route,
        distance: Math.round(distance),
        time: Math.round(time),
        algorithm,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtiene ruta desde caché Redis
   */
  async getCachedRoute(orderId: string): Promise<RouteCalculatedEvent | null> {
    const cacheKey = `route:${orderId}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }

  /**
   * Obtiene estadísticas del grafo
   */
  getGraphStats(): { nodes: number; edges: number; loaded: boolean } {
    return this.graphLoaderService.getStats();
  }
}
