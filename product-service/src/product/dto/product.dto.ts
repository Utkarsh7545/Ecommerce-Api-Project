import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Laptop',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'A high-performance laptop with 16GB RAM.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 49999,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Category of the product',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
