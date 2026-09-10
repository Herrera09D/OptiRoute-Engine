import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export interface OrderCreatedEvent {
  orderId: string;
  clientId: string;
  deliveryPoints: {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    sequence: number;
    nodeId?: string | null;
  }[];
  createdAt: Date;
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private isConnected = false;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitClient.connect();
      this.isConnected = true;
      console.log('✅ Conectado a RabbitMQ');
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error.message);
    }
  }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    if (!this.isConnected) {
      console.warn('⚠️ RabbitMQ no está conectado, evento no publicado');
      return;
    }

    try {
      await this.rabbitClient.emit('order.created', event).toPromise();
      console.log(`📤 Evento order.created publicado para pedido: ${event.orderId}`);
    } catch (error) {
      console.error('❌ Error publicando evento order.created:', error.message);
      throw error;
    }
  }

  isConnectedToRabbitMQ(): boolean {
    return this.isConnected;
  }
}
