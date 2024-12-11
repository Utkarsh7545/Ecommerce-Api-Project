import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresService } from './ecosystem-services/postgres.service';
import { RedisService } from './ecosystem-services/redis.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import postgresConfig from './config/postgres.config';
import redisConfig from './config/redis.config';
import { IpcController } from './ipc/ipc.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [redisConfig, postgresConfig],
    }),
  ],
  controllers: [UserController, IpcController],
  providers: [PostgresService, RedisService, UserService],
})
export class AppModule {}
