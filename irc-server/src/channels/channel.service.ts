import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './channel.schema';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
  ) { }

  async createChannel(name: string): Promise<Channel> {
    this.logger.log(`Creating channel: ${name}`);
    return new this.channelModel({ name }).save();
  }

  async getChannels(search?: string): Promise<Channel[]> {
    const query: any = {};

    if (search) {
      query.name = {
        $regex: search,
        $options: 'i',
      };
    }

    return this.channelModel.find(query).exec();
  }

  async deleteChannel(name: string): Promise<void> {
    this.logger.log(`Deleting channel: ${name}`);
    await this.channelModel.deleteOne({ name }).exec();
  }

  async renameChannel(oldName: string, newName: string): Promise<Channel> {
    return this.channelModel
      .findOneAndUpdate(
        { name: oldName },
        { $set: { name: newName } },
        { new: true },
      )
      .exec();
  }

  async addUserToChannel(
    channelName: string,
    nickname: string,
  ): Promise<Channel> {
    this.logger.log(`Adding user ${nickname} to channel: ${channelName}`);
    return this.channelModel
      .findOneAndUpdate(
        { name: channelName },
        { $addToSet: { users: nickname } },
        { new: true },
      )
      .exec();
  }

  async removeUserFromChannel(
    channelName: string,
    nickname: string,
  ): Promise<Channel> {
    this.logger.log(`Removing user ${nickname} from channel: ${channelName}`);
    return this.channelModel
      .findOneAndUpdate(
        { name: channelName },
        { $pull: { users: nickname } },
        { new: true },
      )
      .exec();
  }

  async getUsersInChannel(channelName: string): Promise<string[]> {
    const channel = await this.channelModel
      .findOne({ name: channelName })
      .exec();
    return channel ? channel.users : [];
  }

  async getChannelById(id: string): Promise<Channel | null> {
    this.logger.log(`Fetching channel by ID: ${id}`);
    return this.channelModel.findById(id).exec();
  }
}
