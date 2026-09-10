import { Graph } from './graph';
import { AStarService } from './astar.service';

/**
 * Resultado del algoritmo Nearest Neighbor para TSP
 */
export interface TSPResult {
  route: string[];              // Orden óptimo de visitas (incluye inicio y fin)
  totalDistance: number;        // Distancia total del recorrido
  segments: TSPSegment[];       // Detalle de cada segmento del camino
  iterations: number;           // Número de iteraciones
  improved: boolean;            // Si se aplicó mejora 2-Opt
}

export interface TSPSegment {
  from: string;
  to: string;
  distance: number;
}

/**
 * Algoritmo Nearest Neighbor (Vecino Más Cercano) para TSP
 * 
 * Problema del Viajante de Comercio (Traveling Salesman Problem - TSP):
 * Dado un conjunto de ciudades y distancias entre ellas, encontrar el
 * camino más corto que visite cada ciudad exactamente una vez y regrese
 * al punto de origen.
 * 
 * Enfoque Implementado:
 * 1. Nearest Neighbor (Greedy): O(n²)
 *    - Comenzar desde un nodo
 *    - Siempre ir al nodo no visitado más cercano
 *    - Repetir hasta visitar todos
 *    - Regresar al inicio
 * 
 * 2. Mejora 2-Opt (Opcional): O(n²) por iteración
 *    - Eliminar cruces en el camino
 *    - Intercambiar aristas para reducir distancia
 * 
 * Complejidad Temporal:
 * - Nearest Neighbor: O(n²) donde n = número de paradas
 * - Con 2-Opt: O(n² * k) donde k = iteraciones de mejora
 * 
 * Complejidad Espacial: O(n)
 * 
 * Nota: Este es un algoritmo heurístico, no garantiza la solución óptima
 * pero proporciona una buena aproximación en tiempo razonable.
 * 
 * @param graph - Grafo con las distancias entre nodos
 * @param stops - Lista de IDs de nodos a visitar
 * @param startId - Nodo de inicio (depósito/almacén)
 * @returns Ruta optimizada y métricas
 */
export class NearestNeighborService {
  private readonly INF = Number.MAX_SAFE_INTEGER;

  /**
   * Ejecuta el algoritmo Nearest Neighbor para TSP
   * @param graph - Grafo con las distancias
   * @param stops - Nodos que deben ser visitados
   * @param startId - Nodo de inicio y fin (depósito)
   * @param use2Opt - Si aplicar mejora 2-Opt
   */
  findOptimalRoute(
    graph: Graph<number>,
    stops: string[],
    startId: string,
    use2Opt: boolean = true
  ): TSPResult {
    // Validaciones básicas
    if (stops.length === 0 || !graph.hasNode(startId)) {
      return {
        route: [startId],
        totalDistance: 0,
        segments: [],
        iterations: 0,
        improved: false,
      };
    }

    // Agregar startId a las paradas si no está
    const allStops = stops.includes(startId) ? stops : [startId, ...stops];
    const unvisited = new Set(allStops.filter(s => s !== startId));
    
    // Ruta resultante
    const route: string[] = [startId];
    let current = startId;
    let totalDistance = 0;
    const segments: TSPSegment[] = [];
    let iterations = 0;

    // Algoritmo Greedy: siempre elegir el vecino más cercano no visitado
    while (unvisited.size > 0) {
      iterations++;
      let nearest: string | null = null;
      let minDistance = this.INF;

      // Buscar el nodo no visitado más cercano
      for (const stopId of unvisited) {
        const distance = this.getDistance(graph, current, stopId);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = stopId;
        }
      }

      // Si encontramos un vecino válido
      if (nearest !== null && minDistance !== this.INF) {
        route.push(nearest);
        segments.push({
          from: current,
          to: nearest,
          distance: minDistance,
        });
        totalDistance += minDistance;
        unvisited.delete(nearest);
        current = nearest;
      } else {
        // No hay camino hacia ningún nodo no visitado
        break;
      }
    }

    // Regresar al punto de inicio (cerrar el ciclo)
    const returnDistance = this.getDistance(graph, current, startId);
    if (returnDistance !== this.INF) {
      route.push(startId);
      segments.push({
        from: current,
        to: startId,
        distance: returnDistance,
      });
      totalDistance += returnDistance;
    }

    // Aplicar mejora 2-Opt si se solicita
    let improved = false;
    if (use2Opt && route.length > 3) {
      const improvedResult = this.twoOptImprovement(graph, route, totalDistance);
      if (improvedResult.totalDistance < totalDistance) {
        improved = true;
        route = improvedResult.route;
        totalDistance = improvedResult.totalDistance;
        // Recalcular segmentos
        segments.length = 0;
        for (let i = 0; i < route.length - 1; i++) {
          const dist = this.getDistance(graph, route[i], route[i + 1]);
          segments.push({ from: route[i], to: route[i + 1], distance: dist });
        }
      }
    }

    return {
      route,
      totalDistance,
      segments,
      iterations,
      improved,
    };
  }

  /**
   * Obtiene la distancia más corta entre dos nodos usando A*
   * @private
   */
  private getDistance(graph: Graph<number>, fromId: string, toId: string): number {
    if (fromId === toId) return 0;

    const astar = new AStarService();
    const result = astar.findPathWithTracking(graph, fromId, toId);
    
    return result.path.length > 0 ? result.totalDistance : this.INF;
  }

  /**
   * Mejora 2-Opt para TSP
   * 
   * Estrategia:
   * - Identificar dos aristas (i, i+1) y (j, j+1) que se cruzan
   * - Reemplazarlas por (i, j) y (i+1, j+1)
   * - Invertir el segmento entre i+1 y j
   * - Repetir hasta no encontrar mejoras
   * 
   * Esto elimina cruces en la ruta, reduciendo la distancia total.
   * 
   * @param graph - Grafo con distancias
   * @param route - Ruta actual
   * @param totalDistance - Distancia actual
   * @returns Ruta mejorada
   */
  private twoOptImprovement(
    graph: Graph<number>,
    route: string[],
    totalDistance: number
  ): { route: string[]; totalDistance: number } {
    let bestRoute = [...route];
    let bestDistance = totalDistance;
    let improved = true;
    let iterations = 0;
    const maxIterations = 100; // Prevención de bucles infinitos

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      // Probar todos los pares posibles de aristas
      for (let i = 1; i < bestRoute.length - 2; i++) {
        for (let j = i + 1; j < bestRoute.length - 1; j++) {
          // Calcular costo actual de las aristas
          const oldDist1 = this.getDistance(graph, bestRoute[i - 1], bestRoute[i]);
          const oldDist2 = this.getDistance(graph, bestRoute[j], bestRoute[j + 1]);
          const oldCost = oldDist1 + oldDist2;

          // Calcular costo nuevo después del intercambio
          const newDist1 = this.getDistance(graph, bestRoute[i - 1], bestRoute[j]);
          const newDist2 = this.getDistance(graph, bestRoute[i], bestRoute[j + 1]);
          const newCost = newDist1 + newDist2;

          // Si hay mejora, aplicar 2-Opt
          if (newCost < oldCost) {
            // Invertir segmento entre i y j
            const newRoute = [
              ...bestRoute.slice(0, i),
              ...bestRoute.slice(i, j + 1).reverse(),
              ...bestRoute.slice(j + 1),
            ];

            // Calcular nueva distancia total
            let newTotalDistance = 0;
            for (let k = 0; k < newRoute.length - 1; k++) {
              const dist = this.getDistance(graph, newRoute[k], newRoute[k + 1]);
              newTotalDistance += dist;
            }

            if (newTotalDistance < bestDistance) {
              bestRoute = newRoute;
              bestDistance = newTotalDistance;
              improved = true;
            }
          }
        }
      }
    }

    return {
      route: bestRoute,
      totalDistance: bestDistance,
    };
  }

  /**
   * Calcula el ahorro comparado con una ruta en orden secuencial
   * @param route - Ruta optimizada
   * @param originalOrder - Orden original de paradas
   * @param graph - Grafo con distancias
   */
  calculateSavings(
    route: string[],
    originalOrder: string[],
    graph: Graph<number>
  ): { originalDistance: number; optimizedDistance: number; savings: number } {
    const calcDistance = (path: string[]): number => {
      let total = 0;
      for (let i = 0; i < path.length - 1; i++) {
        total += this.getDistance(graph, path[i], path[i + 1]);
      }
      return total;
    };

    const originalDistance = calcDistance(originalOrder);
    const optimizedDistance = calcDistance(route);
    const savings = originalDistance > 0 
      ? ((originalDistance - optimizedDistance) / originalDistance) * 100 
      : 0;

    return {
      originalDistance,
      optimizedDistance,
      savings: Math.max(0, savings), // Evitar negativos
    };
  }
}
