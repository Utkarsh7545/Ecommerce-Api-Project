/* eslint-disable no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-unresolved */
import { Pool } from 'pg';
import * as jf from 'joiful';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

class OrderItem {
  @(jf.number().required())
  productId!: number;

  @(jf.string().required())
  productName!: string;

  @(jf.number().min(1).required())
  quantity!: number;

  @(jf.number().min(0).required())
  price!: number;

  static build(data: Partial<OrderItem>): OrderItem {
    const { error, value } = jf.validateAsClass(data, OrderItem, {
      allowUnknown: false,
    });
    if (error) {
      throw new BadRequestException(
        `Validation failed for OrderItem: ${error.message}`,
      );
    }
    return value;
  }
}

export class Order {
  @(jf.number().required())
  customerId!: number;

  @(jf.array().required())
  items!: OrderItem[];

  @(jf.number().min(0).required())
  totalPrice!: number;

  @(jf.string().optional())
  status?: string;

  @(jf.string().required())
  shippingAddress!: string;

  static build(data: Partial<Order>): Order {
    const { error, value } = jf.validateAsClass(data, Order, {
      allowUnknown: false,
    });
    if (error) {
      throw new BadRequestException(
        `Validation failed for Order: ${error.message}`,
      );
    }
    return value;
  }
}

export class OrderModel {
  constructor(private readonly pool: Pool) {}

  async getAllOrders(): Promise<Order[]> {
    const query = `SELECT * FROM orders`;
    const result = await this.pool.query(query).catch((error) => {
      console.error('Error fetching orders:', error);
      throw new InternalServerErrorException('Failed to fetch orders');
    });

    return result.rows.map((row) => {
      const orderData: Partial<Order> = {
        customerId: row.customer_id,
        totalPrice: row.total_price,
        status: row.status,
        shippingAddress: row.shipping_address,
        items: [],
      };
      return Order.build(orderData);
    });
  }

  async getOrderById(id: number): Promise<Order | null> {
    const orderQuery = `SELECT * FROM orders WHERE id = $1`;
    const orderResult = await this.pool
      .query(orderQuery, [id])
      .catch((error) => {
        console.error('Error fetching order by ID:', error);
        throw new InternalServerErrorException('Failed to fetch order by ID');
      });

    if (orderResult.rows.length === 0) {
      return null;
    }

    const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1`;
    const itemsResult = await this.pool
      .query(itemsQuery, [id])
      .catch((error) => {
        console.error('Error fetching order items:', error);
        throw new InternalServerErrorException('Failed to fetch order items');
      });

    const items = itemsResult.rows.map((row) =>
      OrderItem.build({
        productId: row.product_id,
        productName: row.product_name,
        quantity: row.quantity,
        price: row.price,
      }),
    );

    const orderData: Partial<Order> = {
      customerId: orderResult.rows[0].customer_id,
      totalPrice: orderResult.rows[0].total_price,
      status: orderResult.rows[0].status,
      shippingAddress: orderResult.rows[0].shipping_address,
      items,
    };

    return Order.build(orderData);
  }

  async save(order: Order): Promise<number> {
    const { customerId, totalPrice, status, shippingAddress } = order;

    const selectQuery = `SELECT id FROM orders WHERE customer_id = $1`;
    const existingOrder = await this.pool
      .query(selectQuery, [customerId])
      .catch((error) => {
        console.error('Error checking existing order:', error);
        throw new InternalServerErrorException(
          'Failed to check existing orders',
        );
      });

    let query: string;
    let params: any[];

    if (existingOrder.rows.length > 0) {
      query = `
        UPDATE orders
        SET total_price = $2, status = $3, shipping_address = $4
        WHERE customer_id = $1
        RETURNING id
      `;
      params = [customerId, totalPrice, status || 'Pending', shippingAddress];
    } else {
      query = `
        INSERT INTO orders (customer_id, total_price, status, shipping_address)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      params = [customerId, totalPrice, status || 'Pending', shippingAddress];
    }

    const result = await this.pool.query(query, params).catch((error) => {
      console.error('Error saving order:', error);
      throw new InternalServerErrorException('Failed to save order');
    });

    return result.rows[0].id;
  }

  async insertOrderItems(orderId: number, items: OrderItem[]): Promise<void> {
    const selectQuery = `SELECT * FROM order_items WHERE order_id = $1 AND product_id = $2`;
    const insertQuery = `
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const updateQuery = `
      UPDATE order_items
      SET product_name = $3, quantity = $4, price = $5
      WHERE order_id = $1 AND product_id = $2
    `;

    for (const item of items) {
      const { productId, productName, quantity, price } = item;

      const existingItem = await this.pool
        .query(selectQuery, [orderId, productId])
        .catch((error) => {
          console.error('Error checking existing order item:', error);
          throw new InternalServerErrorException(
            'Failed to check existing order items',
          );
        });

      const query = existingItem.rows.length > 0 ? updateQuery : insertQuery;

      await this.pool
        .query(query, [orderId, productId, productName, quantity, price])
        .catch((error) => {
          console.error('Error saving order item:', error);
          throw new InternalServerErrorException('Failed to save order item');
        });
    }
  }

  async checkExistingOrder(
    customerId: number,
    totalPrice: number,
  ): Promise<boolean> {
    const query = `SELECT * FROM orders WHERE customer_id = $1 AND total_price = $2`;
    const result = await this.pool
      .query(query, [customerId, totalPrice])
      .catch((error) => {
        console.error('Error checking existing order:', error);
        throw new InternalServerErrorException(
          'Failed to check existing orders',
        );
      });
    return result.rows.length > 0;
  }
}
