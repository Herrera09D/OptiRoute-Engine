import { Graph } from '../graph/graph.class';

/**
 * Búsqueda en Anchura (BFS - Breadth First Search)
 * Recorre el grafo nivel por nivel desde un nodo inicial
 * 
 * Complejidad: O(V + E) donde V = vértices, E = aristas
 * 
 * Usos:
 * - Verificar conectividad del grafo
 * - Encontrar camino más corto en grafos no ponderados
 * - Detectar ciclos en grafos dirigidos
 * 
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @returns Array de nodos visitados en orden BFS
 */
export function bfs(graph: Graph, startNodeId: string): string[] {
  const visited = new Set<string>();
  const queue: string[] = [];
  const result: string[] = [];

  if (!graph.hasNode(startNodeId)) {
    return result;
  }

  queue.push(startNodeId);
  visited.add(startNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    result.push(currentId);

    const neighbors = graph.getNeighbors(currentId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor.id);
      }
    }
  }

  return result;
}

/**
 * Verifica si existe un camino entre dos nodos usando BFS
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @param endNodeId ID del nodo de destino
 * @returns true si existe camino, false en caso contrario
 */
export function hasPath(graph: Graph, startNodeId: string, endNodeId: string): boolean {
  if (startNodeId === endNodeId) {
    return true;
  }

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === endNodeId) {
      return true;
    }

    const neighbors = graph.getNeighbors(currentId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor.id);
      }
    }
  }

  return false;
}

/**
 * Encuentra el camino más corto en un grafo no ponderado usando BFS
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @param endNodeId ID del nodo de destino
 * @returns Array de IDs representando el camino, o null si no existe
 */
export function bfsShortestPath(graph: Graph, startNodeId: string, endNodeId: string): string[] | null {
  if (startNodeId === endNodeId) {
    return [startNodeId];
  }

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  const parent = new Map<string, string>();
  visited.add(startNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === endNodeId) {
      // Reconstruir camino
      return reconstructPath(parent, startNodeId, endNodeId);
    }

    const neighbors = graph.getNeighbors(currentId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        parent.set(neighbor.id, currentId);
        queue.push(neighbor.id);
      }
    }
  }

  return null;
}

/**
 * Reconstruye el camino desde el mapa de padres
 */
function reconstructPath(parent: Map<string, string>, start: string, end: string): string[] {
  const path: string[] = [end];
  let current = end;

  while (parent.has(current)) {
    current = parent.get(current)!;
    path.unshift(current);
  }

  return path[0] === start ? path : [];
}
