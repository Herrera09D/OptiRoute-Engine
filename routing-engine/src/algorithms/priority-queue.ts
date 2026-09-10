/**
 * Estructura de Datos: PriorityQueue (Cola de Prioridad)
 * 
 * Implementación basada en Heap Binario (Min-Heap)
 * 
 * Complejidad Temporal:
 * - enqueue: O(log n)
 * - dequeue: O(log n)
 * - peek: O(1)
 * - isEmpty: O(1)
 * - size: O(1)
 * 
 * Complejidad Espacial: O(n)
 * 
 * Uso en Algoritmos de Grafos:
 * - Dijkstra: Extraer el nodo con menor distancia acumulada
 * - A*: Extraer el nodo con menor f(n) = g(n) + h(n)
 * 
 * @template T - Tipo de dato almacenado en la cola
 */

export interface IPriorityQueueItem<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: IPriorityQueueItem<T>[] = [];

  /**
   * Agrega un elemento con su prioridad
   * @param element - Elemento a agregar
   * @param priority - Prioridad (menor valor = mayor prioridad)
   */
  enqueue(element: T, priority: number): void {
    const item: IPriorityQueueItem<T> = { element, priority };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extrae y remueve el elemento con mayor prioridad (menor valor)
   * @returns El elemento o undefined si la cola está vacía
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    // El elemento con mayor prioridad está en la raíz (índice 0)
    const result = this.heap[0].element;
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return result;
  }

  /**
   * Obtiene el elemento con mayor prioridad sin removerlo
   * @returns El elemento o undefined si la cola está vacía
   */
  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.heap[0].element;
  }

  /**
   * Verifica si la cola está vacía
   * @returns true si está vacía, false en caso contrario
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Obtiene el tamaño de la cola
   * @returns Número de elementos
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Limpia la cola eliminando todos los elementos
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Mueve un elemento hacia arriba para mantener la propiedad del heap
   * @private
   * @param index - Índice del elemento a mover
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      // Si el padre tiene menor o igual prioridad, el heap está ordenado
      if (this.heap[parentIndex].priority <= this.heap[index].priority) {
        break;
      }

      // Intercambiar con el padre
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  /**
   * Mueve un elemento hacia abajo para mantener la propiedad del heap
   * @private
   * @param index - Índice del elemento a mover
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      // Encontrar el hijo con menor prioridad
      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      // Si el nodo actual es el más pequeño, el heap está ordenado
      if (smallest === index) {
        break;
      }

      // Intercambiar con el hijo más pequeño
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
