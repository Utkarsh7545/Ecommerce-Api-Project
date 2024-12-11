/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-await-in-loop */
import { Pool } from 'pg';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as Joiful from 'joiful';
import { ProductConnection } from './product-connection';
import { UserConnection } from './user-connection';

export class CheckoutItemModel {
  @(Joiful.number().required())
  productId: number;

  @(Joiful.number().required())
  quantity: number;
}

export class CheckoutModel {
  @(Joiful.number().required())
  customerId: number;

  @(Joiful.string().required())
  shippingAddress: string;

  @(Joiful.number().required())
  totalPrice: number;

  @(Joiful.array().required())
  items: CheckoutItemModel[];

  @(Joiful.number().optional())
  id?: number;

  public static build(data: any): CheckoutModel {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const model = Object.assign(new CheckoutModel(), data);
    const { error } = Joiful.validate(model);

    if (error) {
      throw new BadRequestException(
        `Validation failed: ${error.details.map((d) => d.message).join(', ')}`,
      );
    }
    return model;
  }

  async save(pool: Pool): Promise<void> {
    const query = this.id
      ? `
        UPDATE checkouts
        SET customer_id = $1, shipping_address = $2, total_price = $3
        WHERE id = $4
        RETURNING *;
      `
      : `
        INSERT INTO checkouts (customer_id, shipping_address, total_price)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
    const values = this.id
      ? [this.customerId, this.shippingAddress, this.totalPrice, this.id]
      : [this.customerId, this.shippingAddress, this.totalPrice];

    const result = await pool.query(query, values).catch((error) => {
      console.error('Error saving checkout:', error);
      throw new InternalServerErrorException('Error saving checkout');
    });

    this.id = result.rows[0]?.id;
  }

  async saveItems(pool: Pool): Promise<void> {
    const query = `
      INSERT INTO checkout_items (checkout_id, product_id, quantity)
      VALUES ($1, $2, $3);
    `;

    for (const item of this.items) {
      await pool
        .query(query, [this.id, item.productId, item.quantity])
        .catch((error) => {
          console.error('Error saving checkout items:', error);
          throw new InternalServerErrorException('Error saving checkout items');
        });
    }
  }

  async validateAndFetchUser() {
    UserConnection.checkService();

    const user = await firstValueFrom(
      UserConnection.checkoutService.send(
        { cmd: 'get_user_by_id' },
        { id: this.customerId },
      ),
    ).catch((error) => {
      console.error('Error fetching user details:', error);
      throw new InternalServerErrorException('Error fetching user details');
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async validateAndFetchProducts() {
    ProductConnection.checkService();

    for (const item of this.items) {
      await firstValueFrom(
        ProductConnection.checkoutService.send(
          { cmd: 'get_product_by_id' },
          { productId: item.productId },
        ),
      )
        .catch((error) => {
          console.error('Error fetching product details:', error);
          throw new InternalServerErrorException(
            'Error fetching product details',
          );
        })
        .then((product) => {
          if (!product) {
            throw new BadRequestException(
              `Product with ID ${item.productId} not found`,
            );
          }
        });
    }
  }
}
