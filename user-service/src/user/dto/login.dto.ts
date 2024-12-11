import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Username',
    example: 'utkarsh123',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'utkarsh',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Role',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
