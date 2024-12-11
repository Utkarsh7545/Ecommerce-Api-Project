/* eslint-disable import/no-extraneous-dependencies */
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as Joiful from 'joiful';
import { RedisClientType } from 'redis';

export class UserModel {
  @(Joiful.string().min(3).max(20).required())
  username: string;

  @(Joiful.string().email().required())
  email: string;

  @(Joiful.string().min(6).required())
  password: string;

  @(Joiful.number().optional())
  id?: number;

  static redisService: RedisClientType;

  static pool: Pool;

  public static build(data: any): UserModel {
    if (!data) {
      throw new BadRequestException('No data provided');
    }
    const model = Object.assign(new UserModel(), data);
    const { error } = Joiful.validate(model);
    if (error) {
      throw new BadRequestException(
        `Validation failed: ${error.details.map((d) => d.message).join(', ')}`,
      );
    }
    return model;
  }

  async save(pool: Pool, operation: 'create' | 'update'): Promise<UserModel> {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;

    const query =
      operation === 'create'
        ? `
          INSERT INTO users (username, email, password)
          VALUES ($1, $2, $3)
          RETURNING *;
        `
        : `
          UPDATE users
          SET username = $1, email = $2, password = $3
          WHERE id = $4
          RETURNING *;
        `;
    const values =
      operation === 'create'
        ? [this.username, this.email, this.password]
        : [this.username, this.email, this.password, this.id];

    const result = await pool.query(query, values).catch((error) => {
      throw new InternalServerErrorException(
        `User save operation failed: ${error.message}`,
      );
    });

    if (result.rows.length === 0) {
      throw new BadRequestException('User not found');
    }

    const savedUser = result.rows[0];

    await UserModel.redisService
      .set(`user:${savedUser.id}`, JSON.stringify(savedUser))
      .catch((error) => {
        throw new InternalServerErrorException(
          `Redis set operation failed: ${error.message}`,
        );
      });

    return UserModel.build(savedUser);
  }

  static async findById(pool: Pool, id: number): Promise<UserModel | null> {
    const cachedUser = await UserModel.redisService
      .get(`user:${id}`)
      .catch((error) => {
        throw new InternalServerErrorException(
          `Redis get operation failed: ${error.message}`,
        );
      });

    if (cachedUser) {
      return UserModel.build(JSON.parse(cachedUser));
    }

    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]).catch((error) => {
      throw new InternalServerErrorException(
        `Database query failed: ${error.message}`,
      );
    });

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    await UserModel.redisService
      .set(`user:${id}`, JSON.stringify(user))
      .catch((error) => {
        throw new InternalServerErrorException(
          `Redis set operation failed: ${error.message}`,
        );
      });

    return UserModel.build(user);
  }

  static async authenticate(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserModel> {
    const query = 'SELECT * FROM users WHERE username = $1 OR email = $2';
    const result = await UserModel.pool
      .query(query, [usernameOrEmail, usernameOrEmail])
      .catch((error) => {
        throw new InternalServerErrorException(
          `Error retrieving user: ${error.message}`,
        );
      });

    if (result.rows.length === 0) {
      throw new BadRequestException('Invalid credentials');
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return UserModel.build(user);
  }
}
