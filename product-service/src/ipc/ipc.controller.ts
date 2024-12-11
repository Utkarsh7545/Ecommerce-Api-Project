/* eslint-disable no-empty-function */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from '../product/product.service';

@Controller('ipc')
export class IpcController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get_product_by_id' })
  async getProduct(data: { productId: number }) {
    console.log('Received request for product ID:', data.productId);
    const product = await this.productService.getProductById(data.productId);
    console.log('Fetched product:', product);
    return product;
  }
}
