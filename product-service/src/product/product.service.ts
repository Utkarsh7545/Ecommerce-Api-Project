/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-function */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PostgresService } from '../ecosystem-services/postgres.service';
import { RedisService } from '../ecosystem-services/redis.service';
import { CreateProductDto } from './dto/product.dto';
import { ProductModel } from '../data-models/product.model';

@Injectable()
export class ProductService {
  constructor(
    private readonly pool: PostgresService,
    private readonly redis: RedisService,
  ) {}

  async getAllProducts() {
    return await ProductModel.getAll(this.pool.pool).catch((error) => {
      throw new InternalServerErrorException(
        `Error retrieving products: ${error.message}`,
      );
    });
  }

  async createProduct(createProductDto: CreateProductDto) {
    const productModel = ProductModel.build(createProductDto);

    const existingProducts = await ProductModel.findByName(
      this.pool.pool,
      productModel.name,
    ).catch((error) => {
      throw new InternalServerErrorException(
        `Error checking existing products: ${error.message}`,
      );
    });

    if (existingProducts.length > 0) {
      throw new InternalServerErrorException(
        `A product with the name "${productModel.name}" already exists`,
      );
    }

    return await productModel
      .save(this.pool.pool, this.redis.client)
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error creating product: ${error.message}`,
        );
      });
  }

  async updateProduct(id: number, updateProductDto: CreateProductDto) {
    const productModel = ProductModel.build({ ...updateProductDto, id });

    const existingProduct = await ProductModel.findById(
      this.pool.pool,
      id,
      this.redis.client,
    ).catch((error) => {
      throw new InternalServerErrorException(
        `Error checking product existence: ${error.message}`,
      );
    });

    if (!existingProduct) {
      throw new InternalServerErrorException('Product not found');
    }

    return await productModel
      .save(this.pool.pool, this.redis.client)
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error updating product: ${error.message}`,
        );
      });
  }

  async getProductById(id: number) {
    return await ProductModel.findById(
      this.pool.pool,
      id,
      this.redis.client,
    ).catch((error) => {
      throw new InternalServerErrorException(
        `Error retrieving product by ID: ${error.message}`,
      );
    });
  }
}
