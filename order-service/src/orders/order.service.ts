/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-empty-function */
/* eslint-disable no-restricted-syntax */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresService } from 'src/ecosystem-services/postgres.service';
import { CreateOrderDto } from './order.dto';
import { OrderModel, Order } from '../data-models/order.model';

@Injectable()
export class OrderService {
  private orderModel: OrderModel;

  constructor(private readonly poolClient: PostgresService) {
    const { pool } = this.poolClient;
    this.orderModel = new OrderModel(pool);
  }

  async getAllOrders() {
    return await this.orderModel.getAllOrders().catch(() => {
      throw new InternalServerErrorException('Failed to fetch all orders.');
    });
  }

  async createOrUpdateOrder(createOrderDto: CreateOrderDto) {
    const orderData = Order.build(createOrderDto);

    const isExistingOrder = await this.orderModel
      .checkExistingOrder(orderData.customerId, orderData.totalPrice)
      .catch(() => {
        throw new InternalServerErrorException(
          'Error occurred while checking for existing order.',
        );
      });

    if (isExistingOrder) {
      throw new BadRequestException(
        `Order with the same details already exists.`,
      );
    }

    const orderId = await this.orderModel.save(orderData).catch(() => {
      throw new InternalServerErrorException('Failed to save order.');
    });

    await this.orderModel
      .insertOrderItems(orderId, orderData.items)
      .catch(() => {
        throw new InternalServerErrorException('Failed to insert order items.');
      });

    return {
      orderId,
      ...orderData,
    };
  }

  async getOrderById(id: number) {
    const order = await this.orderModel.getOrderById(id).catch(() => {
      throw new InternalServerErrorException('Failed to fetch order.');
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }
}
