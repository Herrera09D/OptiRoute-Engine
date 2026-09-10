/**
 * Estructura de Datos: Grafo Dirigido Ponderado (Weighted Directed Graph)
 * 
 * Implementación usando Lista de Adyacencia con Map/Dictionary
 * 
 * Complejidad Temporal:
 * - addNode: O(1)
 * - addEdge: O(1)
 * - getNeighbors: O(1)
 * - getEdgeWeight: O(1)
 * - hasNode: O(1)
 * 
 * Complejidad Espacial: O(V + E) donde V = vértices, E = aristas
 * 
 * @template T - Tipo de dato para el peso de la arista (default: number)
 */
export interface IEdge<T = number> {
  to: string;           // ID del nodo destino
  weight: T;            // Peso de la arista (distancia/tiempo)
  label?: string;       // Etiqueta opcional (nombre de calle)
}

export interface INode {
  id: string;           // Identificador único del nodo
  label: string;        // Etiqueta descriptiva
  latitude: number;     // Coordenada latitud
  longitude: number;    // Coordenada longitud
}

export class Graph<T = number> {
  // Lista de adyacencia: Map<nodeId, { node: INode, edges: IEdge[] }>
  private adjacencyList: Map<string, { node: INode; edges: IEdge<T>[] }> = new Map();

  /**
   * Agrega un nodo al grafo
   * @param id - Identificador único del nodo
   * @param label - Etiqueta descriptiva
   * @param latitude - Coordenada latitud
   * @param longitude - Coordenada longitud
   * @returns true si se agregó, false si ya existe
   */
  addNode(id: string, label: string, latitude: number, longitude: number): boolean {
    if (this.hasNode(id)) {
      return false; // El nodo ya existe
    }

    this.adjacencyList.set(id, {
      node: { id, label, latitude, longitude },
      edges: [],
    });

    return true;
  }

  /**
   * Agrega una arista dirigida desde fromId hacia toId
   * @param fromId - ID del nodo origen
   * @param toId - ID del nodo destino
   * @param weight - Peso de la arista (distancia o tiempo)
   * @param label - Etiqueta opcional (ej: nombre de calle)
   * @returns true si se agregó, false si algún nodo no existe
   */
  addEdge(fromId: string, toId: string, weight: T, label?: string): boolean {
    const fromNode = this.adjacencyList.get(fromId);
    const toNode = this.adjacencyList.get(toId);

    if (!fromNode || !toNode) {
      return false; // Alguno de los nodos no existe
    }

    // Verificar si ya existe la arista
    const existingEdge = fromNode.edges.find(e => e.to === toId);
    if (existingEdge) {
      return false; // La arista ya existe
    }

    fromNode.edges.push({ to: toId, weight, label });
    return true;
  }

  /**
   * Obtiene los vecinos (nodos adyacentes) de un nodo dado
   * @param nodeId - ID del nodo
   * @returns Array de aristas salientes o null si el nodo no existe
   */
  getNeighbors(nodeId: string): IEdge<T>[] | null {
    const nodeData = this.adjacencyList.get(nodeId);
    return nodeData ? nodeData.edges : null;
  }

  /**
   * Obtiene el peso de una arista específica
   * @param fromId - ID del nodo origen
   * @param toId - ID del nodo destino
   * @returns El peso de la arista o null si no existe
   */
  getEdgeWeight(fromId: string, toId: string): T | null {
    const nodeData = this.adjacencyList.get(fromId);
    if (!nodeData) return null;

    const edge = nodeData.edges.find(e => e.to === toId);
    return edge ? edge.weight : null;
  }

  /**
   * Verifica si un nodo existe en el grafo
   * @param nodeId - ID del nodo a verificar
   * @returns true si existe, false en caso contrario
   */
  hasNode(nodeId: string): boolean {
    return this.adjacencyList.has(nodeId);
  }

  /**
   * Obtiene un nodo por su ID
   * @param nodeId - ID del nodo
   * @returns El nodo o null si no existe
   */
  getNode(nodeId: string): INode | null {
    const nodeData = this.adjacencyList.get(nodeId);
    return nodeData ? nodeData.node : null;
  }

  /**
   * Obtiene todos los nodos del grafo
   * @returns Array de todos los nodos
   */
  getAllNodes(): INode[] {
    return Array.from(this.adjacencyList.values()).map(data => data.node);
  }

  /**
   * Obtiene el número de nodos (vértices) en el grafo
   * @returns Cantidad de vértices
   */
  nodeCount(): number {
    return this.adjacencyList.size;
  }

  /**
   * Obtiene el número total de aristas en el grafo
   * @returns Cantidad de aristas
   */
  edgeCount(): number {
    let count = 0;
    for (const nodeData of this.adjacencyList.values()) {
      count += nodeData.edges.length;
    }
    return count;
  }

  /**
   * Limpia el grafo eliminando todos los nodos y aristas
   */
  clear(): void {
    this.adjacencyList.clear();
  }

  /**
   * Exporta el grafo a formato JSON para serialización
   */
  toJSON(): object {
    const nodes: INode[] = [];
    const edges: Array<{ from: string; to: string; weight: T; label?: string }> = [];

    for (const [nodeId, data] of this.adjacencyList.entries()) {
      nodes.push(data.node);
      for (const edge of data.edges) {
        edges.push({
          from: nodeId,
          to: edge.to,
          weight: edge.weight,
          label: edge.label,
        });
      }
    }

    return { nodes, edges };
  }
}
