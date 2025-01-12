import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './channel.schema';

@Injectable()
export class ChannelService {
  constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>) {}

  async createChannel(name: string): Promise<Channel> {
    return new this.channelModel({ name }).save();
  }

  async getChannels(): Promise<Channel[]> {
    return this.channelModel.find().exec();
  }
}
