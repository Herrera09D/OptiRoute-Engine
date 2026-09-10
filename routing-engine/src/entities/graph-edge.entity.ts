import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GraphNode } from './graph-node.entity';

/**
 * Entidad GraphEdge - Representa una arista dirigida ponderada en el grafo
 * 
 * Estructura Discreta: Arista (Edge)
 * - Conexión dirigida desde un nodo origen a un nodo destino
 * - Peso (weight): distancia en metros y tiempo estimado en segundos
 * - Permite modelar calles de sentido único o bidireccionales
 */
@Entity('graph_edges')
export class GraphEdge {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  fromNodeId: string;

  @Column('uuid')
  toNodeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  distance: number; // Distancia en metros

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  time: number; // Tiempo estimado en segundos

  @Column({ type: 'varchar', length: 50, default: 'street' })
  type: string; // street, highway, avenue, etc.

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
