import { Graph, INode } from './graph';
import { PriorityQueue } from './priority-queue';

/**
 * Resultado del algoritmo de Dijkstra
 */
export interface DijkstraResult {
  distances: Map<string, number>;      // Distancia mínima desde origen a cada nodo
  previous: Map<string, string | null>; // Nodo anterior en el camino óptimo
  path: string[];                       // Camino más corto (si se especificó destino)
  totalDistance: number;                // Distancia total del camino
  visitedCount: number;                 // Número de nodos visitados
}

/**
 * Algoritmo de Dijkstra - Camino Más Corto desde un Origen
 * 
 * Descripción:
 * Encuentra el camino más corto desde un nodo origen a todos los demás nodos
 * en un grafo dirigido ponderado con pesos no negativos.
 * 
 * Complejidad Temporal: O((V + E) log V)
 * - V = número de vértices (nodos)
 * - E = número de aristas
 * - El factor log V viene de las operaciones en la PriorityQueue
 * 
 * Complejidad Espacial: O(V)
 * - Para almacenar distancias, previos y la cola de prioridad
 * 
 * Funcionamiento:
 * 1. Inicializar distancias: origen = 0, resto = infinito
 * 2. Usar PriorityQueue para extraer siempre el nodo con menor distancia
 * 3. Relajar aristas: si se encuentra un camino más corto, actualizar distancia
 * 4. Repetir hasta procesar todos los nodos alcanzables
 * 
 * @param graph - Grafo dirigido ponderado
 * @param startId - ID del nodo origen
 * @param endId - ID del nodo destino (opcional, para obtener solo el path)
 * @returns Objeto con distancias, camino previo y path óptimo
 */
export class DijkstraService {
  private readonly INF = Number.MAX_SAFE_INTEGER;

  /**
   * Ejecuta el algoritmo de Dijkstra
   * @param graph - Grafo sobre el cual calcular
   * @param startId - Nodo de inicio
   * @param endId - Nodo de fin (opcional)
   */
  findShortestPath(graph: Graph<number>, startId: string, endId?: string): DijkstraResult {
    // Inicialización de estructuras de datos
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Inicializar todos los nodos
    const allNodes = graph.getAllNodes();
    for (const node of allNodes) {
      distances.set(node.id, this.INF);
      previous.set(node.id, null);
    }

    // La distancia al origen es 0
    distances.set(startId, 0);
    pq.enqueue(startId, 0);

    let visitedCount = 0;

    // Procesar nodos mientras la cola no esté vacía
    while (!pq.isEmpty()) {
      // Extraer nodo con menor distancia (greedy)
      const currentId = pq.dequeue();

      if (!currentId || visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);
      visitedCount++;

      // Si llegamos al destino, podemos terminar temprano
      if (endId && currentId === endId) {
        break;
      }

      // Obtener vecinos (aristas salientes)
      const neighbors = graph.getNeighbors(currentId);
      if (!neighbors) continue;

      // Relajar aristas
      for (const edge of neighbors) {
        if (visited.has(edge.to)) continue;

        const alt = distances.get(currentId)! + edge.weight;
        const currentDist = distances.get(edge.to)!;

        // Si encontramos un camino más corto, actualizar
        if (alt < currentDist) {
          distances.set(edge.to, alt);
          previous.set(edge.to, currentId);
          pq.enqueue(edge.to, alt);
        }
      }
    }

    // Reconstruir el camino si se especificó destino
    const path = endId ? this.reconstructPath(previous, startId, endId) : [];
    const totalDistance = endId && path.length > 0 ? distances.get(endId)! : 0;

    return {
      distances,
      previous,
      path,
      totalDistance,
      visitedCount,
    };
  }

  /**
   * Reconstruye el camino desde el origen hasta el destino
   * usando el mapa de nodos previos
   * @private
   */
  private reconstructPath(
    previous: Map<string, string | null>,
    startId: string,
    endId: string
  ): string[] {
    const path: string[] = [];
    let current: string | null = endId;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;

      // Prevención de ciclos infinitos
      if (path.length > previous.size) {
        return []; // Ciclo detectado, retornar camino vacío
      }
    }

    // Verificar que el camino comienza en el origen
    if (path[0] !== startId) {
      return []; // No hay camino válido
    }

    return path;
  }

  /**
   * Calcula la distancia euclidiana entre dos nodos
   * Útil como función heurística para A*
   */
  static euclideanDistance(node1: INode, node2: INode): number {
    const dx = node1.longitude - node2.longitude;
    const dy = node1.latitude - node2.latitude;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calcula la distancia Haversine entre dos coordenadas
   * Retorna distancia en kilómetros
   * Más precisa para distancias geográficas reales
   */
  static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
