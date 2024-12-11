/* eslint-disable no-return-await */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-empty-function */
import { Controller, Get, Param, Post, Put, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product already exists' })
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const result = await this.productService.createProduct(createProductDto);
    return {
      message: 'Product created successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: CreateProductDto,
  ) {
    const result = await this.productService.updateProduct(
      id,
      updateProductDto,
    );
    return {
      message: 'Product updated successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'All products retrieved successfully',
  })
  @Roles('admin')
  @Get()
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return await this.productService.getProductById(id);
  }
}
