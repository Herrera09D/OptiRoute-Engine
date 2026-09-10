import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';
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

  @ManyToOne(() => Client, (client) => client.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'uuid', name: 'clientId' })
  clientId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalDistance: number | null;

  @Column({ type: 'integer', nullable: true })
  estimatedTime: number | null;

  @Column({ type: 'jsonb', nullable: true })
  optimizedRoute: string[] | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => DeliveryPoint, (point) => point.order, {
    cascade: true,
    eager: true,
  })
  deliveryPoints: DeliveryPoint[];
}
