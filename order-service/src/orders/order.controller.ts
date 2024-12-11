/* eslint-disable no-empty-function */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 409, description: 'Order already exists' })
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const result = await this.orderService.createOrUpdateOrder(createOrderDto);
    return {
      message: 'Order created successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @Get()
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    const result = await this.orderService.getOrderById(id);
    if (!result) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
