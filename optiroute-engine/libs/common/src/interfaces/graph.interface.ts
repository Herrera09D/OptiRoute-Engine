export interface INode {
  id: string;
  label: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IEdge {
  from: string;
  to: string;
  weight: number;
}

export interface IGraph {
  addNode(node: INode): void;
  addEdge(edge: IEdge): void;
  getNeighbors(nodeId: string): INode[];
  getEdgeWeight(from: string, to: string): number | null;
  getAllNodes(): INode[];
  hasNode(nodeId: string): boolean;
}

export interface IPathResult {
  distance: number;
  path: string[];
}
