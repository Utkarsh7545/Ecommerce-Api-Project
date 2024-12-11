/* eslint-disable radix */
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export class AuthConnection {
  static usersService: ClientProxy;

  static checkService(): boolean {
    if (this.usersService) return true;
    if (!this.usersService) {
      this.usersService = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: parseInt(process.env.AUTH_TCP_PORT),
        },
      });
    }
    return false;
  }
}
