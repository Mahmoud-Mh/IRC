import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UserService } from '../users/user.service';

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService, // Inject UserService
  ) {}

  @Post()
  async create(@Body('name') name: string) {
    return this.channelService.createChannel(name);
  }

  @Get()
  async findAll() {
    return this.channelService.getChannels();
  }

  @Get('list') // Distinct route for listing channels from users
  async listChannels() {
    return this.userService.getAllChannels();
  }
}
