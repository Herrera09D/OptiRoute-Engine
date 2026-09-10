import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { DeliveryPoint } from '../entities/delivery-point.entity';
import { Client } from '../entities/client.entity';
import { CreateOrderDto, UpdateOrderRouteDto } from '../dto/order.dto';
import { RabbitMQService, OrderCreatedEvent } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(DeliveryPoint)
    private readonly deliveryPointRepository: Repository<DeliveryPoint>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Verificar que el cliente existe
    const client = await this.clientRepository.findOne({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${dto.clientId} no encontrado`);
    }

    // Crear el pedido en estado PENDING
    const order = this.orderRepository.create({
      clientId: dto.clientId,
      status: 'PENDING',
      deliveryPoints: dto.deliveryPoints.map((point, index) =>
        this.deliveryPointRepository.create({
          address: point.address,
          latitude: point.latitude,
          longitude: point.longitude,
          sequence: index,
          nodeId: point.nodeId || null,
        }),
      ),
    });

    const savedOrder = await this.orderRepository.save(order);

    // Publicar evento order.created en RabbitMQ
    const event: OrderCreatedEvent = {
      orderId: savedOrder.id,
      clientId: savedOrder.clientId,
      deliveryPoints: savedOrder.deliveryPoints.map((point) => ({
        id: point.id,
        address: point.address,
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        sequence: point.sequence,
        nodeId: point.nodeId,
      })),
      createdAt: savedOrder.createdAt,
    };

    await this.rabbitMQService.publishOrderCreated(event);

    this.logger.log(`Pedido creado: ${savedOrder.id} - Cliente: ${savedOrder.clientId}`);

    return savedOrder;
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['client', 'deliveryPoints'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['client', 'deliveryPoints'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderRoute(orderId: string, routeData: UpdateOrderRouteDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${orderId} no encontrado`);
    }

    // Actualizar el pedido con la ruta optimizada
    order.status = 'OPTIMIZED';
    order.optimizedRoute = routeData.optimizedRoute;
    order.totalDistance = routeData.totalDistance;
    order.estimatedTime = routeData.estimatedTime;

    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(
      `Pedido ${orderId} actualizado con ruta optimizada - Distancia: ${routeData.totalDistance}km, Tiempo: ${routeData.estimatedTime}min`,
    );

    return updatedOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${orderId} no encontrado`);
    }

    order.status = status as any;
    return this.orderRepository.save(order);
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.getOrder(id);
    await this.orderRepository.remove(order);
    this.logger.log(`Pedido eliminado: ${id}`);
  }
}
