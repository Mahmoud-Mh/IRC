import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UserService } from '../users/user.service';
import { SocketService } from '../socket/socket.service';

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
  ) {}

  @Post()
  async create(@Body('name') name: string) {
    const channel = await this.channelService.createChannel(name);
    this.socketService.server.emit('notification', {
      type: 'channelCreated',
      message: `Channel ${name} has been created.`,
      timestamp: new Date(),
    });
    return channel;
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.channelService.getChannels(search);
  }

  @Delete(':name')
  async delete(@Param('name') name: string) {
    await this.channelService.deleteChannel(name);
    this.socketService.server.emit('notification', {
      type: 'channelDeleted',
      message: `Channel ${name} has been deleted.`,
      timestamp: new Date(),
    });
  }

  @Get(':id')
  async getChannelById(@Param('id') id: string) {
    return this.channelService.getChannelById(id);
  }

  @Patch(':name/rename')
  async rename(
    @Param('name') oldName: string,
    @Body('newName') newName: string,
  ) {
    return this.channelService.renameChannel(oldName, newName);
  }
}
