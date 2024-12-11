/* eslint-disable radix */
import { registerAs } from '@nestjs/config';

export default registerAs('dbConfig', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));
