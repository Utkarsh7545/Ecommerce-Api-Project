import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'create-token' })
  createToken(data: { username: string; password: string; role: string }): {
    token: string;
  } {
    const payload = { username: data.username, role: data.role };
    const token = this.authService.createToken(payload);
    return { token };
  }

  @MessagePattern({ cmd: 'verify-token' })
  verifyToken(data: { token: string }): {
    valid: boolean;
    payload?: object;
    error?: string;
  } {
    const payload = this.authService.verifyToken(data.token);
    console.log(data.token);
    console.log(payload);
    return { valid: true, payload };
  }

  @MessagePattern({ cmd: 'decode-token' })
  decodeToken(data: { token: string }): { payload: object } {
    const payload = this.authService.decodeToken(data.token);
    return { payload };
  }
}
