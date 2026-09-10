import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Entidad GraphNode - Representa un vértice en el grafo de la red vial
 * 
 * Estructura Discreta: Vértice (Node)
 * - Contiene coordenadas geográficas para cálculos de distancia
 * - El label permite identificación humana (ej: "Calle 50 con Av. Central")
 */
@Entity('graph_nodes')
export class GraphNode {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
