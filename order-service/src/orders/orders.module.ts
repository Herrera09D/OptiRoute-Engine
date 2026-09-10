import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Order } from '../entities/order.entity';
import { DeliveryPoint } from '../entities/delivery-point.entity';
import { Client } from '../entities/client.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, DeliveryPoint, Client]),
    RabbitMQModule,
  ],
  controllers: [OrdersController, ClientsController],
  providers: [OrdersService, ClientsService],
  exports: [OrdersService, ClientsService],
})
export class OrdersModule {}
