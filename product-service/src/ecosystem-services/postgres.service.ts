import { Pool } from 'pg';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import dbConfig from '../config/db.config';

@Injectable()
export class PostgresService {
  public pool: Pool;

  constructor(
    @Inject(dbConfig.KEY)
    private config: ConfigType<typeof dbConfig>,
  ) {
    this.connect();
  }

  async connect() {
    this.pool = new Pool(this.config);
  }
}
