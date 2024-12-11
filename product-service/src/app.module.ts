import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { PostgresService } from './ecosystem-services/postgres.service';
import { RedisService } from './ecosystem-services/redis.service';
import redisConfig from './config/redis.config';
import dbConfig from './config/db.config';
import { IpcController } from './ipc/ipc.controller';
import { AuthMiddleware } from './auth/auth.middleware';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [redisConfig, dbConfig],
    }),
  ],
  controllers: [ProductController, IpcController],
  providers: [
    ProductService,
    PostgresService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ProductController);
  }
}
