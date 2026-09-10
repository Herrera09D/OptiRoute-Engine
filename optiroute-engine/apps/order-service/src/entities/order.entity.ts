import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeliveryPoint } from './delivery-point.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CALCULATING = 'CALCULATING',
  OPTIMIZED = 'OPTIMIZED',
  COMPLETED = 'COMPLETED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  clientId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalDistance: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedTime: number | null;

  @Column('jsonb', { nullable: true })
  optimizedRoute: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DeliveryPoint, (deliveryPoint) => deliveryPoint.order, {
    cascade: true,
  })
  deliveryPoints: DeliveryPoint[];
}
