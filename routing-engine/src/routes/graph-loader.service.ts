import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraphNode } from '../entities/graph-node.entity';
import { GraphEdge } from '../entities/graph-edge.entity';
import { Graph } from '../algorithms/graph';

/**
 * Servicio para cargar y mantener el grafo en memoria desde PostgreSQL
 * 
 * Patrón: Carga completa al inicio (eager loading)
 * - Todos los nodos y aristas se cargan en memoria al iniciar
 * - Permite consultas rápidas sin acceder a la BD en cada petición
 * - Ideal para grafos que no cambian frecuentemente
 */
@Injectable()
export class GraphLoaderService implements OnModuleInit {
  private readonly logger = new Logger(GraphLoaderService.name);
  private graph: Graph<number> | null = null;
  private isLoaded = false;

  constructor(
    @InjectRepository(GraphNode)
    private nodeRepository: Repository<GraphNode>,
    @InjectRepository(GraphEdge)
    private edgeRepository: Repository<GraphEdge>,
  ) {}

  /**
   * Se ejecuta automáticamente cuando el módulo se inicializa
   * Carga todos los nodos y aristas desde PostgreSQL hacia memoria
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('🔄 Loading graph from database...');
    await this.loadGraph();
    this.logger.log(`✅ Graph loaded: ${this.graph?.nodeCount()} nodes, ${this.graph?.edgeCount()} edges`);
  }

  /**
   * Carga completa del grafo desde la base de datos
   */
  async loadGraph(): Promise<void> {
    try {
      // Crear nueva instancia del grafo
      this.graph = new Graph<number>();

      // Cargar todos los nodos activos
      const nodes = await this.nodeRepository.find({ where: { isActive: true } });
      for (const node of nodes) {
        this.graph.addNode(
          node.id,
          node.label,
          parseFloat(node.latitude as any),
          parseFloat(node.longitude as any),
        );
      }

      // Cargar todas las aristas activas
      const edges = await this.edgeRepository.find({ where: { isActive: true } });
      for (const edge of edges) {
        this.graph.addEdge(
          edge.fromNodeId,
          edge.toNodeId,
          parseFloat(edge.distance as any),
          edge.type,
        );
      }

      this.isLoaded = true;
      this.logger.log(`✅ Loaded ${nodes.length} nodes and ${edges.length} edges`);
    } catch (error) {
      this.logger.error('Failed to load graph:', error);
      throw error;
    }
  }

  /**
   * Obtiene el grafo cargado en memoria
   * @throws Error si el grafo no ha sido cargado
   */
  getGraph(): Graph<number> {
    if (!this.graph || !this.isLoaded) {
      throw new Error('Graph not loaded yet. Wait for onModuleInit to complete.');
    }
    return this.graph;
  }

  /**
   * Verifica si el grafo está cargado
   */
  isGraphLoaded(): boolean {
    return this.isLoaded && this.graph !== null;
  }

  /**
   * Recarga el grafo desde la base de datos
   * Útil cuando hay actualizaciones importantes en la red vial
   */
  async reloadGraph(): Promise<void> {
    this.logger.log('🔄 Reloading graph from database...');
    this.graph = new Graph<number>();
    await this.loadGraph();
    this.logger.log(`✅ Graph reloaded: ${this.graph?.nodeCount()} nodes, ${this.graph?.edgeCount()} edges`);
  }

  /**
   * Obtiene estadísticas del grafo
   */
  getStats(): { nodes: number; edges: number; loaded: boolean } {
    return {
      nodes: this.graph?.nodeCount() || 0,
      edges: this.graph?.edgeCount() || 0,
      loaded: this.isLoaded,
    };
  }
}
