/* eslint-disable import/no-extraneous-dependencies */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckoutController } from './checkout/checkout.controller';
import { CheckoutService } from './checkout/checkout.service';
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
  controllers: [CheckoutController],
  providers: [CheckoutService, PostgresService],
})
export class AppModule {}
