import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'juan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Teléfono', example: '+57 300 123 4567' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class UpdateClientDto {
  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Pérez', required: false })
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'juan@example.com', required: false })
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Teléfono', example: '+57 300 123 4567', required: false })
  @IsString()
  phone?: string;
}
