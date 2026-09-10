import { IsString, IsNotEmpty, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryPointDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryPointDto)
  deliveryPoints: DeliveryPointDto[];
}
