/* eslint-disable radix */
/* eslint-disable import/no-extraneous-dependencies */
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export class ProductConnection {
  static checkoutService: ClientProxy;

  static checkService(): boolean {
    if (this.checkoutService) return true;
    if (!this.checkoutService) {
      this.checkoutService = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: parseInt(process.env.PRODUCT_TCP_PORT),
        },
      });
    }
    return false;
  }
}
