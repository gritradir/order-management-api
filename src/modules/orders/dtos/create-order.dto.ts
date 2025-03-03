import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
      description: 'Order number (must be unique)',
      example: 'ORD-12345'
    })
    orderNumber: string;
  
    @ApiProperty({
      description: 'Payment description',
      example: 'Monthly subscription'
    })
    paymentDescription: string;
  
    @ApiProperty({
      description: 'Street address',
      example: '123 Main St'
    })
    streetAddress: string;
  
    @ApiProperty({
      description: 'Town',
      example: 'Tallinn'
    })
    town: string;
  
    @ApiProperty({
      description: 'Country',
      example: 'Estonia'
    })
    country: string;
  
    @ApiProperty({
      description: 'Amount to be paid',
      example: 99.99,
      minimum: 0
    })
    amount: number;
  
    @ApiProperty({
      description: 'Currency code (3 letters)',
      example: 'EUR',
      minLength: 3,
      maxLength: 3
    })
    currency: string;
  
    @ApiProperty({
      description: 'Payment due date (ISO format)',
      example: '2023-12-31'
    })
    paymentDueDate: Date;
}