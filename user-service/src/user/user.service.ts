/* eslint-disable import/no-unresolved */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RedisService } from 'src/ecosystem-services/redis.service';
import { firstValueFrom } from 'rxjs';
import { AuthConnection } from 'src/data-models/auth.connection';
import { PostgresService } from '../ecosystem-services/postgres.service';
import { CreateUserDto } from './dto/user.dto';
import { UserModel } from '../data-models/user.model';
import { LoginRequestDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly redisService: RedisService,
    private readonly pool: PostgresService,
  ) {
    UserModel.redisService = this.redisService.client;
  }

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserDto> {
    return UserModel.build(createUserDto)
      .save(this.pool.pool, 'create')
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to create user: ${error.message}`,
        );
      });
  }

  async updateUser(
    id: number,
    createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    return UserModel.build({ ...createUserDto, id })
      .save(this.pool.pool, 'update')
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to update user: ${error.message}`,
        );
      });
  }

  async getUserById(id: number): Promise<CreateUserDto> {
    return UserModel.findById(this.pool.pool, id).catch((error) => {
      throw new InternalServerErrorException(
        `Failed to retrieve user: ${error.message}`,
      );
    });
  }

  async login(data: LoginRequestDto): Promise<string> {
    AuthConnection.checkService();
    if (!AuthConnection.usersService) {
      throw new InternalServerErrorException(
        'Authorization service is unavailable',
      );
    }

    return firstValueFrom(
      AuthConnection.usersService.send(
        { cmd: 'create-token' },
        {
          username: data.username,
          password: data.password,
          role: data.role,
        },
      ),
    ).catch((error) => {
      console.error('Login Error:', error.message);
      throw new InternalServerErrorException(
        'An error occurred during login. Please try again later.',
      );
    });
  }
}
