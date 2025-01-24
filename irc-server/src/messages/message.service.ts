import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  // Save a message to a channel
  async createMessage(sender: string, channel: string, content: string): Promise<Message> {
    return this.messageModel.create({
      sender,
      channel,
      content,
      timestamp: new Date(),
    });
  }

  // Save a private message
  async createPrivateMessage(sender: string, recipient: string, content: string): Promise<Message> {
    return this.messageModel.create({
      sender,
      recipient,
      content,
      timestamp: new Date(),
    });
  }

  // Get all messages for a specific channel
  async getMessagesByChannel(channel: string): Promise<Message[]> {
    return this.messageModel.find({ channel }).sort({ timestamp: 1 }).exec();
  }

  // Get private messages between two users
  async getPrivateMessages(sender: string, recipient: string): Promise<Message[]> {
    console.log(`[getPrivateMessages] Query: sender=${sender}, recipient=${recipient}`);
    const messages = await this.messageModel
      .find({
        $or: [
          { sender, recipient },
          { sender: recipient, recipient: sender },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();
    console.log(`[getPrivateMessages] Retrieved messages:`, messages);
    return messages;
  }
  
}
