import { Pool } from 'pg';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import postgresConfig from '../config/postgres.config';

@Injectable()
export class PostgresService {
  public pool: Pool;

  constructor(
    @Inject(postgresConfig.KEY)
    private dbConfig: ConfigType<typeof postgresConfig>,
  ) {
    this.connect();
  }

  async connect() {
    this.pool = new Pool(this.dbConfig);
  }
}
