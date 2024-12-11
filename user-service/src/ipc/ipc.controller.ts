/* eslint-disable no-empty-function */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from '../user/user.service';

@Controller('ipc')
export class IpcController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUser(data: { id: number }) {
    const user = await this.userService.getUserById(data.id);
    console.log(user);
    return user;
  }
}
