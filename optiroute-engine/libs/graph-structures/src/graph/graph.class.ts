import { INode, IEdge, IGraph } from '@app/common';

/**
 * Grafo Dirigido Ponderado implementado con Lista de Adyacencia
 * Usando Map para almacenamiento eficiente
 * 
 * Complejidad:
 * - addNode: O(1)
 * - addEdge: O(1)
 * - getNeighbors: O(1)
 * - getEdgeWeight: O(1)
 */
export class Graph implements IGraph {
  private nodes: Map<string, INode>;
  private adjacencyList: Map<string, Map<string, number>>;

  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
  }

  /**
   * Agrega un nodo al grafo
   * @param node Nodo a agregar
   */
  addNode(node: INode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, new Map());
    }
  }

  /**
   * Agrega una arista dirigida ponderada
   * @param edge Arista con origen, destino y peso
   */
  addEdge(edge: IEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`Both nodes must exist in the graph`);
    }

    const neighbors = this.adjacencyList.get(edge.from);
    if (neighbors) {
      neighbors.set(edge.to, edge.weight);
    }
  }

  /**
   * Obtiene los vecinos de un nodo
   * @param nodeId ID del nodo
   * @returns Array de nodos vecinos
   */
  getNeighbors(nodeId: string): INode[] {
    const neighbors = this.adjacencyList.get(nodeId);
    if (!neighbors) {
      return [];
    }

    const neighborNodes: INode[] = [];
    for (const [neighborId] of neighbors.entries()) {
      const node = this.nodes.get(neighborId);
      if (node) {
        neighborNodes.push(node);
      }
    }
    return neighborNodes;
  }

  /**
   * Obtiene el peso de una arista
   * @param from Nodo origen
   * @param to Nodo destino
   * @returns Peso de la arista o null si no existe
   */
  getEdgeWeight(from: string, to: string): number | null {
    const neighbors = this.adjacencyList.get(from);
    if (!neighbors) {
      return null;
    }
    return neighbors.get(to) ?? null;
  }

  /**
   * Obtiene todos los nodos del grafo
   * @returns Array de todos los nodos
   */
  getAllNodes(): INode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Verifica si un nodo existe en el grafo
   * @param nodeId ID del nodo
   * @returns true si existe, false en caso contrario
   */
  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Obtiene un nodo por su ID
   * @param nodeId ID del nodo
   * @returns El nodo o undefined si no existe
   */
  getNode(nodeId: string): INode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Obtiene todas las aristas salientes de un nodo
   * @param nodeId ID del nodo
   * @returns Map de vecinos con sus pesos
   */
  getOutgoingEdges(nodeId: string): Map<string, number> | undefined {
    return this.adjacencyList.get(nodeId);
  }

  /**
   * Retorna el número de nodos en el grafo
   */
  nodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Retorna el número total de aristas
   */
  edgeCount(): number {
    let count = 0;
    for (const neighbors of this.adjacencyList.values()) {
      count += neighbors.size;
    }
    return count;
  }

  /**
   * Elimina un nodo y todas sus aristas
   * @param nodeId ID del nodo a eliminar
   */
  removeNode(nodeId: string): void {
    // Eliminar aristas salientes
    this.adjacencyList.delete(nodeId);
    
    // Eliminar aristas entrantes
    for (const neighbors of this.adjacencyList.values()) {
      neighbors.delete(nodeId);
    }
    
    // Eliminar el nodo
    this.nodes.delete(nodeId);
  }
}
