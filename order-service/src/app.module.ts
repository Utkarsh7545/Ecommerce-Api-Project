/* eslint-disable import/no-extraneous-dependencies */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderController } from './orders/order.controller';
import { OrderService } from './orders/order.service';
import { PostgresService } from './ecosystem-services/postgres.service';
import dbConfig from './config/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [dbConfig],
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, PostgresService],
})
export class AppModule {}
