import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'utkarsh123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email',
    example: 'utkarsh@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'utkarsh',
  })
  @IsString()
  password: string;
}
