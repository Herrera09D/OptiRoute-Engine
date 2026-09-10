import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderRouteDto } from '../dto/order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiBearerAuth()
  create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Solicitud POST /orders - Cliente: ${createOrderDto.clientId}`);
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos obtenida exitosamente' })
  @ApiBearerAuth()
  findAll() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrder(id);
  }

  @Patch(':id/route')
  @ApiOperation({ summary: 'Actualizar ruta optimizada de un pedido' })
  @ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiBearerAuth()
  updateRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderRouteDto: UpdateOrderRouteDto,
  ) {
    this.logger.log(`Solicitud PATCH /orders/${id}/route`);
    return this.ordersService.updateOrderRoute(id, updateOrderRouteDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de un pedido' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiBearerAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido' })
  @ApiResponse({ status: 200, description: 'Pedido eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
