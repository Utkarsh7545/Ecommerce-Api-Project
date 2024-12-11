/* eslint-disable radix */
/* eslint-disable dot-notation */
/* eslint-disable import/no-extraneous-dependencies */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private authClient: ClientProxy;

  constructor() {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(process.env.AUTH_TCP_PORT),
      },
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token is missing or invalid',
      );
    }

    const token = authHeader.split(' ')[1];

    firstValueFrom(
      this.authClient.send<{ valid: boolean; payload?: any }>(
        { cmd: 'verify-token' },
        { token },
      ),
    )
      .then((result) => {
        if (!result.valid) {
          throw new UnauthorizedException('Invalid token');
        }

        req['user'] = result.payload;
        next();
      })
      .catch((error) => {
        throw new UnauthorizedException(error.message);
      });
  }
}
