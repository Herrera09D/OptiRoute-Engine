import { OrderStatus } from '../enums/order-status.enum';

export interface IOrder {
  id?: string;
  clientId: string;
  status: OrderStatus;
  totalDistance?: number;
  estimatedTime?: number;
  optimizedRoute?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
