/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({
    description: 'Customer ID making the purchase',
    example: 1,
  })
  @IsNumber()
  customerId: number;

  @ApiProperty({
    description: 'List of items in the checkout',
    type: [CheckoutItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main Street, Cityville',
  })
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'Total price of the checkout',
    example: 99998,
  })
  @IsNumber()
  @Min(0)
  totalPrice: number;
}
