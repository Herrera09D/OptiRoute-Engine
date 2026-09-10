import { Graph } from '../graph/graph.class';

/**
 * Búsqueda en Profundidad (DFS - Depth First Search)
 * Recorre el grafo explorando lo más profundo posible antes de retroceder
 * 
 * Complejidad: O(V + E) donde V = vértices, E = aristas
 * 
 * Usos:
 * - Recorrido completo del grafo
 * - Detectar ciclos
 * - Ordenamiento topológico
 * - Componentes conexas
 * 
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @returns Array de nodos visitados en orden DFS
 */
export function dfs(graph: Graph, startNodeId: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  if (!graph.hasNode(startNodeId)) {
    return result;
  }

  dfsVisit(graph, startNodeId, visited, result);
  return result;
}

/**
 * Función recursiva auxiliar para DFS
 */
function dfsVisit(
  graph: Graph,
  nodeId: string,
  visited: Set<string>,
  result: string[]
): void {
  visited.add(nodeId);
  result.push(nodeId);

  const neighbors = graph.getNeighbors(nodeId);
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor.id)) {
      dfsVisit(graph, neighbor.id, visited, result);
    }
  }
}

/**
 * DFS iterativo usando stack explícito
 * Útil para grafos muy profundos donde la recursión podría causar stack overflow
 * 
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @returns Array de nodos visitados en orden DFS
 */
export function dfsIterative(graph: Graph, startNodeId: string): string[] {
  const visited = new Set<string>();
  const stack: string[] = [startNodeId];
  const result: string[] = [];

  while (stack.length > 0) {
    const currentId = stack.pop()!;

    if (!visited.has(currentId)) {
      visited.add(currentId);
      result.push(currentId);

      // Agregar vecinos en orden inverso para mantener orden consistente
      const neighbors = graph.getNeighbors(currentId);
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!visited.has(neighbors[i].id)) {
          stack.push(neighbors[i].id);
        }
      }
    }
  }

  return result;
}

/**
 * Detecta si el grafo tiene ciclos empezando desde un nodo
 * @param graph Grafo dirigido
 * @param startNodeId ID del nodo de inicio
 * @returns true si hay ciclo, false en caso contrario
 */
export function hasCycle(graph: Graph, startNodeId: string): boolean {
  const visiting = new Set<string>(); // Nodos en el stack actual
  const visited = new Set<string>(); // Nodos completamente procesados

  function detectCycle(nodeId: string): boolean {
    if (visiting.has(nodeId)) {
      return true; // Ciclo detectado
    }

    if (visited.has(nodeId)) {
      return false; // Ya procesado sin ciclo
    }

    visiting.add(nodeId);

    const neighbors = graph.getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      if (detectCycle(neighbor.id)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return detectCycle(startNodeId);
}

/**
 * Encuentra todos los componentes conexos en un grafo no dirigido
 * (Para grafos dirigidos, usar componentes fuertemente conexos)
 * 
 * @param graph Grafo
 * @returns Array de arrays, cada uno con los nodos de un componente conexo
 */
export function findConnectedComponents(graph: Graph): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  const allNodes = graph.getAllNodes();

  for (const node of allNodes) {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      dfsComponent(graph, node.id, visited, component);
      components.push(component);
    }
  }

  return components;
}

/**
 * Función auxiliar para encontrar componentes conexos
 */
function dfsComponent(
  graph: Graph,
  nodeId: string,
  visited: Set<string>,
  component: string[]
): void {
  visited.add(nodeId);
  component.push(nodeId);

  const neighbors = graph.getNeighbors(nodeId);
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor.id)) {
      dfsComponent(graph, neighbor.id, visited, component);
    }
  }
}
