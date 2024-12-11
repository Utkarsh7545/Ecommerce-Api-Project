/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: 'ID of the product',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Laptop',
  })
  @IsString()
  productName: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 49999,
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer ID placing the order',
    example: 1,
  })
  @IsNumber()
  customerId: number;

  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Total price of the order',
    example: 99998,
  })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({
    description: 'Order status',
    example: 'Pending',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main Street, India',
  })
  @IsString()
  shippingAddress: string;
}
