import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { RoutesService } from './routes.service';

/**
 * DTO para solicitar cálculo de ruta óptima
 */
export class CalculateRouteDto {
  @ApiProperty({ description: 'ID del nodo depósito/almacén', example: 'depot-001' })
  depotNodeId: string;

  @ApiProperty({ 
    description: 'Array de IDs de nodos a visitar', 
    example: ['node-1', 'node-2', 'node-3'],
    type: [String]
  })
  deliveryNodeIds: string[];
}

/**
 * Controller para operaciones de ruteo y optimización
 * 
 * Endpoints disponibles:
 * - POST /routes/optimal: Calcular ruta óptima manualmente
 * - GET /routes/cache/:orderId: Obtener ruta desde caché Redis
 * - GET /routes/stats: Estadísticas del grafo y algoritmos
 */
@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name);

  constructor(private routesService: RoutesService) {}

  /**
   * Calcula la ruta óptima para un conjunto de paradas
   * 
   * Algoritmo seleccionado automáticamente:
   * - A*: Para 1-2 paradas (punto a punto)
   * - TSP (Nearest Neighbor + 2-Opt): Para 3+ paradas
   */
  @Post('optimal')
  @ApiOperation({ summary: 'Calcular ruta óptima' })
  @ApiResponse({ status: 200, description: 'Ruta calculada exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiBody({ type: CalculateRouteDto })
  async calculateOptimalRoute(@Body() dto: CalculateRouteDto) {
    this.logger.log(`Calculating route from ${dto.depotNodeId} to ${dto.deliveryNodeIds.length} stops`);

    const result = await this.routesService.calculateRoute(
      dto.depotNodeId,
      dto.deliveryNodeIds,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: {
        route: result.route,
        totalDistance: result.distance,
        estimatedTime: result.time,
        algorithm: result.algorithm,
        stopsCount: dto.deliveryNodeIds.length,
      },
    };
  }

  /**
   * Obtiene una ruta previamente calculada desde el caché de Redis
   */
  @Get('cache/:orderId')
  @ApiOperation({ summary: 'Obtener ruta desde caché' })
  @ApiResponse({ status: 200, description: 'Ruta encontrada en caché' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada en caché' })
  async getCachedRoute(@Param('orderId') orderId: string) {
    const cached = await this.routesService.getCachedRoute(orderId);

    if (!cached) {
      return {
        success: false,
        message: 'Route not found in cache',
      };
    }

    return {
      success: true,
      data: cached,
    };
  }

  /**
   * Obtiene estadísticas del grafo cargado en memoria
   */
  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas del grafo' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getGraphStats() {
    const stats = this.routesService.getGraphStats();
    return {
      success: true,
      data: stats,
    };
  }
}
