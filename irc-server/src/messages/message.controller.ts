import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @Body('sender') sender: string,
    @Body('channel') channel: string,
    @Body('content') content: string,
  ) {
    return this.messageService.createMessage(sender, channel, content);
  }

  @Get(':channel')
  async findAll(@Param('channel') channel: string) {
    return this.messageService.getMessagesByChannel(channel);
  }

  @Get('private')
  async getPrivateMessages(
      @Query('sender') sender: string,
      @Query('recipient') recipient: string,
  ) {
    return this.messageService.getPrivateMessages(sender, recipient);
  }
}
