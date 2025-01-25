import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(nickname: string): Promise<User> {
    this.logger.log(`Creating user with nickname: ${nickname}`);
    return new this.userModel({ nickname }).save();
  }

  async updateUserNickname(
    oldNickname: string,
    newNickname: string,
  ): Promise<User> {
    this.logger.log(`Updating nickname from ${oldNickname} to ${newNickname}`);
    return this.userModel
      .findOneAndUpdate(
        { nickname: oldNickname },
        { $set: { nickname: newNickname } },
        { new: true },
      )
      .exec();
  }

  async getUserByNickname(nickname: string): Promise<User> {
    this.logger.log(`Fetching user with nickname: ${nickname}`);
    return this.userModel.findOne({ nickname }).exec();
  }

  async updateUserChannels(nickname: string, channel: string): Promise<User> {
    this.logger.log(`Adding user ${nickname} to channel: ${channel}`);
    return this.userModel
      .findOneAndUpdate(
        { nickname },
        { $addToSet: { channels: channel } },
        { new: true },
      )
      .exec();
  }

  async getUsersInChannel(channel: string): Promise<User[]> {
    this.logger.log(`Fetching users in channel: ${channel}`);
    return await this.userModel.find({ channels: channel }).exec();
  }

  async getAllChannels(): Promise<string[]> {
    this.logger.log('Fetching all channels');
    const users = await this.userModel.find().exec();
    const channels = new Set<string>();

    users.forEach((user) => {
      user.channels.forEach((channel) => channels.add(channel));
    });

    return Array.from(channels);
  }

  async removeUserFromChannel(
    nickname: string,
    channel: string,
  ): Promise<User> {
    this.logger.log(`Removing user ${nickname} from channel: ${channel}`);
    return this.userModel
      .findOneAndUpdate(
        { nickname },
        { $pull: { channels: channel } },
        { new: true },
      )
      .exec();
  }

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.userModel.find().exec();
  }
}
