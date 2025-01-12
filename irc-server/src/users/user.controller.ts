import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body('nickname') nickname: string) {
    return this.userService.createUser(nickname);
  }

  @Patch(':nickname/channels')
  async addChannel(
    @Param('nickname') nickname: string,
    @Body('channel') channel: string,
  ) {
    return this.userService.updateUserChannels(nickname, channel);
  }

  @Get('channels/:channel/users')
  async getUsersInChannel(@Param('channel') channel: string) {
    return this.userService.getUsersInChannel(channel);
  }

  @Get(':nickname')
  async findOne(@Param('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }
}
