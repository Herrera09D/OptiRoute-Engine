import { Graph } from '../graph/graph.class';
import { PriorityQueue } from '../graph/priority-queue.class';
import { IPathResult, INode } from '@app/common';

/**
 * Calcula la distancia euclidiana entre dos puntos (heurística)
 * @param coord1 Coordenadas del primer punto
 * @param coord2 Coordenadas del segundo punto
 * @returns Distancia euclidiana
 */
function euclideanDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const dx = coord1.lat - coord2.lat;
  const dy = coord1.lng - coord2.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Fórmula de Haversine para calcular distancia entre coordenadas geográficas
 * @param coord1 Coordenadas del primer punto (lat, lng en grados)
 * @param coord2 Coordenadas del segundo punto (lat, lng en grados)
 * @returns Distancia en kilómetros
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Algoritmo A* (A-Star) para búsqueda informada de camino más corto
 * Utiliza heurística para explorar primero los nodos más prometedores
 * f(n) = g(n) + h(n) donde:
 *   g(n) = costo desde origen hasta n
 *   h(n) = heurística (distancia estimada) desde n hasta destino
 * 
 * Complejidad: O((V + E) log V) pero generalmente más rápido que Dijkstra
 * 
 * @param graph Grafo dirigido ponderado
 * @param startNodeId ID del nodo de origen
 * @param endNodeId ID del nodo de destino
 * @param heuristic Tipo de heurística: 'euclidean' o 'haversine'
 * @returns Resultado con distancia y path, o null si no hay camino
 */
export function aStar(
  graph: Graph,
  startNodeId: string,
  endNodeId: string,
  heuristic: 'euclidean' | 'haversine' = 'haversine'
): IPathResult | null {
  const openSet = new PriorityQueue<string>();
  const closedSet = new Set<string>();
  
  const gScore = new Map<string, number>(); // Costo desde inicio
  const fScore = new Map<string, number>(); // g + heurística
  const cameFrom = new Map<string, string>(); // Para reconstruir el path

  // Inicializar scores
  for (const node of graph.getAllNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }
  gScore.set(startNodeId, 0);

  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(endNodeId);

  if (!startNode || !endNode) {
    return null;
  }

  const heuristicValue = calculateHeuristic(startNode.coordinates, endNode.coordinates, heuristic);
  fScore.set(startNodeId, heuristicValue);

  openSet.enqueue(startNodeId, heuristicValue);

  while (!openSet.isEmpty()) {
    const currentId = openSet.dequeue();

    if (!currentId) {
      continue;
    }

    if (currentId === endNodeId) {
      // Reconstruir camino
      return reconstructPath(cameFrom, currentId, gScore.get(currentId) ?? 0);
    }

    closedSet.add(currentId);

    const edges = graph.getOutgoingEdges(currentId);
    if (!edges) {
      continue;
    }

    for (const [neighborId, weight] of edges.entries()) {
      if (closedSet.has(neighborId)) {
        continue;
      }

      const tentativeGScore = (gScore.get(currentId) ?? Infinity) + weight;

      if (tentativeGScore < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeGScore);

        const neighborNode = graph.getNode(neighborId);
        if (neighborNode) {
          const hScore = calculateHeuristic(neighborNode.coordinates, endNode.coordinates, heuristic);
          const f = tentativeGScore + hScore;
          fScore.set(neighborId, f);
          openSet.enqueue(neighborId, f);
        }
      }
    }
  }

  return null; // No se encontró camino
}

/**
 * Calcula la heurística entre dos puntos
 */
function calculateHeuristic(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
  type: 'euclidean' | 'haversine'
): number {
  if (type === 'haversine') {
    return haversineDistance(coord1, coord2);
  }
  return euclideanDistance(coord1, coord2);
}

/**
 * Reconstruye el camino desde el nodo final
 */
function reconstructPath(
  cameFrom: Map<string, string>,
  currentId: string,
  totalDistance: number
): IPathResult {
  const path: string[] = [currentId];
  let current = currentId;

  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(current);
  }

  return {
    distance: totalDistance,
    path,
  };
}
