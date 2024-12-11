import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService {
  client: RedisClientType | undefined;

  constructor(private readonly configService: ConfigService) {
    this.connect().catch((error) =>
      console.log('Error connecting to redis', error),
    );
  }

  async connect(): Promise<void> {
    const client: RedisClientType = createClient({
      url: this.configService.get('redisConfig').url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 10000),
        connectTimeout: this.configService.get('redisConfig').connectTimeout,
      },
    });
    this.client = client;
    await client.connect();
  }
}
