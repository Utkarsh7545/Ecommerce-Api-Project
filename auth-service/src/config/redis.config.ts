/* eslint-disable radix */
import { registerAs } from '@nestjs/config';

export default registerAs('redisConfig', () => ({
  url: process.env.REDIS_URL,
  connectTimeout: parseInt(process.env.REDIS_TIMEOUT),
}));
