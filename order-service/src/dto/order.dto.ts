import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryPointDto {
  @ApiProperty({ description: 'Dirección de entrega', example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Latitud', example: 4.6097 })
  @IsNumber()
  @Min(-90)
  latitude: number;

  @ApiProperty({ description: 'Longitud', example: -74.0817 })
  @IsNumber()
  @Min(-180)
  longitude: number;

  @ApiPropertyOptional({ description: 'ID del nodo en el grafo', example: 'node_1' })
  @IsString()
  nodeId?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID del cliente', example: 'uuid-del-cliente' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Puntos de entrega',
    type: [DeliveryPointDto],
    example: [
      {
        address: 'Calle 123 #45-67',
        latitude: 4.6097,
        longitude: -74.0817,
        nodeId: 'node_1',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryPointDto)
  deliveryPoints: DeliveryPointDto[];
}

export class UpdateOrderRouteDto {
  @ApiProperty({
    description: 'Ruta optimizada (array de IDs de nodos)',
    example: ['node_1', 'node_3', 'node_2', 'node_4'],
  })
  @IsArray()
  @IsString({ each: true })
  optimizedRoute: string[];

  @ApiProperty({ description: 'Distancia total en km', example: 15.5 })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({ description: 'Tiempo estimado en minutos', example: 45 })
  @IsNumber()
  @Min(0)
  estimatedTime: number;
}
