import { INode, IEdge } from '@app/common';

/**
 * Cola de Prioridad implementada con Heap Binario
 * Complejidad: O(log n) para enqueue/dequeue
 * Usada en algoritmos de Dijkstra y A*
 */
export class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  /**
   * Agrega un elemento con su prioridad
   * @param element Elemento a agregar
   * @param priority Prioridad del elemento (menor valor = mayor prioridad)
   */
  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  /**
   * Remueve y retorna el elemento con mayor prioridad
   */
  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const minItem = this.items[0];
    const lastItem = this.items.pop();

    if (this.items.length > 0 && lastItem) {
      this.items[0] = lastItem;
      this.bubbleDown(0);
    }

    return minItem.element;
  }

  /**
   * Retorna el elemento con mayor prioridad sin removerlo
   */
  peek(): T | null {
    return this.isEmpty() ? null : this.items[0].element;
  }

  /**
   * Verifica si la cola está vacía
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Retorna el tamaño de la cola
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Mueve un elemento hacia arriba para mantener la propiedad del heap
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[index].priority >= this.items[parentIndex].priority) {
        break;
      }
      [this.items[index], this.items[parentIndex]] = [
        this.items[parentIndex],
        this.items[index],
      ];
      index = parentIndex;
    }
  }

  /**
   * Mueve un elemento hacia abajo para mantener la propiedad del heap
   */
  private bubbleDown(index: number): void {
    const length = this.items.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.items[leftChild].priority < this.items[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild < length && this.items[rightChild].priority < this.items[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      [this.items[index], this.items[smallest]] = [
        this.items[smallest],
        this.items[index],
      ];
      index = smallest;
    }
  }
}
