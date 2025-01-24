import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UserService } from '../users/user.service';
import { SocketService } from '../socket/socket.service'; // Import SocketService

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly socketService: SocketService, // Inject SocketService
  ) {}

  @Post()
  async create(@Body('name') name: string) {
    const channel = await this.channelService.createChannel(name);
    // Notify all users that a new channel has been created
    this.socketService.server.emit('notification', {
      type: 'channelCreated',
      message: `Channel ${name} has been created.`,
      timestamp: new Date(),
    });
    return channel;
  }

  @Get()
  async findAll() {
    return this.channelService.getChannels();
  }

  @Get('list') // Distinct route for listing channels from users
  async listChannels() {
    return this.userService.getAllChannels();
  }

  @Delete(':name')
  async delete(@Param('name') name: string) {
    await this.channelService.deleteChannel(name);
    // Notify all users that a channel has been deleted
    this.socketService.server.emit('notification', {
      type: 'channelDeleted',
      message: `Channel ${name} has been deleted.`,
      timestamp: new Date(),
    });
  }

  @Patch(':name/rename')
  async rename(
    @Param('name') oldName: string,
    @Body('newName') newName: string,
  ) {
    return this.channelService.renameChannel(oldName, newName);
  }
}