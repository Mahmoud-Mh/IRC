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

  @Post('private')
  async createPrivateMessage(
    @Body('sender') sender: string,
    @Body('recipient') recipient: string,
    @Body('content') content: string,
  ) {
    return this.messageService.createPrivateMessage(sender, recipient, content);
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
    console.log(`[Controller] sender: ${sender}, recipient: ${recipient}`);
    const messages = await this.messageService.getPrivateMessages(sender, recipient);
    console.log(`[Controller] Messages fetched:`, messages);
    return messages;
  }  
}
