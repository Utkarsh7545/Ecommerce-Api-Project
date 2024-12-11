/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as Joiful from 'joiful';
import { RedisClientType } from 'redis';

export class ProductModel {
  @(Joiful.string().required())
  name: string;

  @(Joiful.string().required())
  description: string;

  @(Joiful.number().required())
  price: number;

  @(Joiful.string().optional())
  category?: string;

  @(Joiful.number().optional())
  id?: number;

  @(Joiful.date().optional())
  created_at?: Date;

  @(Joiful.date().optional())
  updated_at?: Date;

  public static build(data: any): ProductModel {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const model = Object.assign(new ProductModel(), data);
    const { error } = Joiful.validate(model);

    if (error) {
      throw new BadRequestException(
        `Validation failed: ${error.details.map((d) => d.message).join(', ')}`,
      );
    }
    return model;
  }

  async save(pool: Pool, redisClient: RedisClientType): Promise<void> {
    const query = this.id
      ? `
        UPDATE products
        SET name = $1, description = $2, price = $3, category = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `
      : `
        INSERT INTO products (name, description, price, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
      `;
    const values = this.id
      ? [this.name, this.description, this.price, this.category, this.id]
      : [this.name, this.description, this.price, this.category];

    const result = await pool.query(query, values).catch((error) => {
      throw new InternalServerErrorException(
        `Error saving product: ${error.message}`,
      );
    });

    const savedProduct = ProductModel.build(result.rows[0]);
    await redisClient
      .set(`product:${savedProduct.id}`, JSON.stringify(savedProduct))
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error caching product: ${error.message}`,
        );
      });
  }

  static async getAll(pool: Pool): Promise<ProductModel[]> {
    const query = `SELECT * FROM products`;
    const result = await pool.query(query).catch((error) => {
      throw new InternalServerErrorException(
        `Error fetching products: ${error.message}`,
      );
    });

    return result.rows.map((row) => ProductModel.build(row));
  }

  static async findById(
    pool: Pool,
    id: number,
    redisClient: RedisClientType,
  ): Promise<ProductModel | null> {
    const cachedProduct = await redisClient
      .get(`product:${id}`)
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error fetching product from cache: ${error.message}`,
        );
      });

    if (cachedProduct) {
      return ProductModel.build(JSON.parse(cachedProduct));
    }

    const query = `SELECT * FROM products WHERE id = $1`;
    const result = await pool.query(query, [id]).catch((error) => {
      throw new InternalServerErrorException(
        `Error fetching product by ID: ${error.message}`,
      );
    });

    if (result.rows.length === 0) {
      return null;
    }

    const product = ProductModel.build(result.rows[0]);
    await redisClient
      .set(`product:${id}`, JSON.stringify(product))
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error caching product by ID: ${error.message}`,
        );
      });

    return product;
  }

  static async findByName(pool: Pool, name: string): Promise<ProductModel[]> {
    const query = `SELECT * FROM products WHERE name = $1;`;
    const result = await pool.query(query, [name]).catch((error) => {
      throw new InternalServerErrorException(
        `Error fetching product by name: ${error.message}`,
      );
    });

    return result.rows.map((row) => ProductModel.build(row));
  }
}
