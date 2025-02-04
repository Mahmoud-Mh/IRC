import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createMessage(
    sender: string,
    channelId: string,
    content: string,
    localId?: string, 
  ): Promise<Message> {
    console.log('[createMessage] Saving message:', { sender, channelId, content, localId });
    return this.messageModel.create({
      sender,
      channel: channelId,
      content,
      timestamp: new Date(),
      localId, 
    });
  }

  async createPrivateMessage(
    sender: string,
    recipient: string,
    content: string,
  ): Promise<Message> {
    console.log('[createPrivateMessage] Saving private message:', { sender, recipient, content });
    return this.messageModel.create({
      sender,
      recipient,
      content,
      timestamp: new Date(),
    });
  }

  async getMessagesByChannel(channel: string): Promise<Message[]> {
    return this.messageModel.find({ channel }).sort({ timestamp: 1 }).exec();
  }

  async getPrivateMessages(sender: string, recipient: string) {
    return this.messageModel
      .find({
        $or: [
          { sender, recipient },
          { sender: recipient, recipient: sender },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();
  }
}
