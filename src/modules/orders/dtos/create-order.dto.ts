import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
      description: 'Order number (must be unique)',
      example: 'ORD-12345'
    })
    @IsNotEmpty()
    orderNumber: string;
  
    @ApiProperty({
      description: 'Payment description',
      example: 'Monthly subscription'
    })
    @IsNotEmpty()
    paymentDescription: string;
  
    @ApiProperty({
      description: 'Street address',
      example: '123 Main St'
    })
    @IsNotEmpty()
    streetAddress: string;
  
    @ApiProperty({
      description: 'Town',
      example: 'Tallinn'
    })
    @IsNotEmpty()
    town: string;
  
    @ApiProperty({
      description: 'Country',
      example: 'Estonia'
    })
    @IsNotEmpty()
    country: string;
  
    @ApiProperty({
      description: 'Amount to be paid',
      example: 99.99,
      minimum: 0
    })
    @IsNotEmpty()
    amount: number;
  
    @ApiProperty({
      description: 'Currency code (3 letters)',
      example: 'EUR',
      minLength: 3,
      maxLength: 3
    })
    @IsNotEmpty()
    currency: string;
  
    @ApiProperty({
      description: 'Payment due date (ISO format)',
      example: '2023-12-31'
    })
    @IsNotEmpty()
    paymentDueDate: Date;
}