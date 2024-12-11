/* eslint-disable no-empty-function */
/* eslint-disable no-return-await */
import { Controller, Post, Put, Body, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { LoginRequestDto } from './dto/login.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    return await this.userService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    return await this.userService.updateUser(id, createUserDto);
  }

  @ApiOperation({ summary: 'Retrieve user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<CreateUserDto> {
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'User  login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() body: LoginRequestDto): Promise<string> {
    return await this.userService.login(body);
  }
}
