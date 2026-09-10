export interface IDeliveryPoint {
  id?: string;
  orderId: string;
  address: string;
  latitude: number;
  longitude: number;
  sequence?: number;
  nodeId?: string;
}
