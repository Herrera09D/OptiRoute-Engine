import { Graph } from '../graph/graph.class';
import { PriorityQueue } from '../graph/priority-queue.class';
import { IPathResult } from '@app/common';

/**
 * Algoritmo de Dijkstra para camino más corto desde un origen a todos los destinos
 * Complejidad: O((V + E) log V) usando cola de prioridad
 * 
 * @param graph Grafo dirigido ponderado
 * @param startNodeId ID del nodo de origen
 * @returns Objeto con distancias y caminos más cortos
 */
export function dijkstra(
  graph: Graph,
  startNodeId: string
): { distances: Map<string, number>; paths: Map<string, string[]> } {
  const distances = new Map<string, number>();
  const paths = new Map<string, string[]>();
  const visited = new Set<string>();
  const pq = new PriorityQueue<string>();

  // Inicializar distancias
  for (const node of graph.getAllNodes()) {
    distances.set(node.id, Infinity);
    paths.set(node.id, []);
  }
  distances.set(startNodeId, 0);
  paths.set(startNodeId, [startNodeId]);

  // Agregar nodo inicial a la cola
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue();
    
    if (!currentId || visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);

    // Obtener vecinos y pesos
    const edges = graph.getOutgoingEdges(currentId);
    if (!edges) {
      continue;
    }

    for (const [neighborId, weight] of edges.entries()) {
      const newDistance = (distances.get(currentId) ?? Infinity) + weight;

      if (newDistance < (distances.get(neighborId) ?? Infinity)) {
        distances.set(neighborId, newDistance);
        paths.set(neighborId, [...(paths.get(currentId) ?? []), neighborId]);
        pq.enqueue(neighborId, newDistance);
      }
    }
  }

  return { distances, paths };
}

/**
 * Obtiene el camino más corto entre dos nodos específicos
 * @param graph Grafo dirigido ponderado
 * @param startNodeId ID del nodo de origen
 * @param endNodeId ID del nodo de destino
 * @returns Resultado con distancia y path, o null si no hay camino
 */
export function dijkstraShortestPath(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): IPathResult | null {
  const { distances, paths } = dijkstra(graph, startNodeId);
  const distance = distances.get(endNodeId);

  if (distance === undefined || distance === Infinity) {
    return null;
  }

  return {
    distance,
    path: paths.get(endNodeId) ?? [],
  };
}
