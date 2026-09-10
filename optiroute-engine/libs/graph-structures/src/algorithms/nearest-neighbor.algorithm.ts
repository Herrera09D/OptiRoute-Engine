import { Graph } from '../graph/graph.class';
import { haversineDistance } from './a-star.algorithm';

/**
 * Algoritmo Nearest Neighbor (Vecino Más Cercano) para TSP
 * Heurística greedy que selecciona el nodo más cercano no visitado
 * 
 * Complejidad: O(n²) donde n es el número de nodos a visitar
 * 
 * @param graph Grafo dirigido ponderado
 * @param nodeIds Lista de IDs de nodos a visitar
 * @param startNodeId ID del nodo de inicio (depósito/almacén)
 * @returns Orden óptimo de visitas y distancia total estimada
 */
export interface TSPResult {
  route: string[];
  totalDistance: number;
  distances: number[];
}

export function nearestNeighbor(
  graph: Graph,
  nodeIds: string[],
  startNodeId: string
): TSPResult | null {
  if (nodeIds.length === 0) {
    return null;
  }

  const unvisited = new Set(nodeIds);
  const route: string[] = [startNodeId];
  const distances: number[] = [];
  let currentId = startNodeId;
  let totalDistance = 0;

  // Mientras haya nodos sin visitar
  while (unvisited.size > 0) {
    let nearestNode: string | null = null;
    let nearestDistance = Infinity;

    // Buscar el nodo más cercano no visitado
    for (const nodeId of unvisited) {
      const distance = getGraphDistance(graph, currentId, nodeId);
      
      if (distance !== null && distance < nearestDistance) {
        nearestDistance = distance;
        nearestNode = nodeId;
      }
    }

    // Si no se encontró un nodo alcanzable, salir
    if (nearestNode === null) {
      break;
    }

    // Moverse al nodo más cercano
    route.push(nearestNode);
    distances.push(nearestDistance);
    totalDistance += nearestDistance;
    currentId = nearestNode;
    unvisited.delete(nearestNode);
  }

  // Retornar al punto de inicio (opcional, depende del caso de uso)
  const returnDistance = getGraphDistance(graph, currentId, startNodeId);
  if (returnDistance !== null) {
    route.push(startNodeId);
    distances.push(returnDistance);
    totalDistance += returnDistance;
  }

  return {
    route,
    totalDistance,
    distances,
  };
}

/**
 * Obtiene la distancia más corta entre dos nodos usando Dijkstra
 */
function getGraphDistance(graph: Graph, from: string, to: string): number | null {
  if (from === to) {
    return 0;
  }

  const result = dijkstraSingleSource(graph, from, to);
  return result;
}

/**
 * Implementación simplificada de Dijkstra para un solo destino
 */
function dijkstraSingleSource(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): number | null {
  const distances = new Map<string, number>();
  const visited = new Set<string>();
  const pq: { id: string; dist: number }[] = [];

  // Inicializar
  for (const node of graph.getAllNodes()) {
    distances.set(node.id, Infinity);
  }
  distances.set(startNodeId, 0);
  pq.push({ id: startNodeId, dist: 0 });

  while (pq.length > 0) {
    // Ordenar y obtener el de menor distancia
    pq.sort((a, b) => a.dist - b.dist);
    const current = pq.shift();

    if (!current || visited.has(current.id)) {
      continue;
    }

    visited.add(current.id);

    if (current.id === endNodeId) {
      return distances.get(endNodeId) ?? null;
    }

    const edges = graph.getOutgoingEdges(current.id);
    if (!edges) {
      continue;
    }

    for (const [neighborId, weight] of edges.entries()) {
      const newDist = (distances.get(current.id) ?? Infinity) + weight;
      if (newDist < (distances.get(neighborId) ?? Infinity)) {
        distances.set(neighborId, newDist);
        pq.push({ id: neighborId, dist: newDist });
      }
    }
  }

  return null;
}

/**
 * Versión mejorada con 2-Opt para refinar la ruta del TSP
 * @param route Ruta inicial obtenida por Nearest Neighbor
 * @param graph Grafo para calcular distancias
 * @returns Ruta optimizada
 */
export function twoOptImprove(route: string[], graph: Graph): string[] {
  if (route.length <= 3) {
    return route;
  }

  let improved = true;
  let bestRoute = [...route];

  while (improved) {
    improved = false;
    
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        const newRoute = swap2Opt(bestRoute, i, j);
        
        if (calculateRouteDistance(newRoute, graph) < calculateRouteDistance(bestRoute, graph)) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

/**
 * Realiza un swap 2-Opt en la ruta
 */
function swap2Opt(route: string[], i: number, j: number): string[] {
  const newRoute = [
    ...route.slice(0, i),
    ...route.slice(i, j + 1).reverse(),
    ...route.slice(j + 1),
  ];
  return newRoute;
}

/**
 * Calcula la distancia total de una ruta
 */
function calculateRouteDistance(route: string[], graph: Graph): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const dist = getGraphDistance(graph, route[i], route[i + 1]);
    if (dist !== null) {
      total += dist;
    }
  }
  return total;
}
