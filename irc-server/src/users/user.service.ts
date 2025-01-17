import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(nickname: string): Promise<User> {
    return new this.userModel({ nickname }).save();
  }

  async getUserByNickname(nickname: string): Promise<User> {
    return this.userModel.findOne({ nickname }).exec();
  }

  async updateUserChannels(nickname: string, channel: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { nickname },
      { $addToSet: { channels: channel } }, // Add the channel if not already present
      { new: true },
    ).exec();
  }

  async getUsersInChannel(channel: string): Promise<User[]> {
    return await this.userModel.find({ channels: channel }).exec();
  }

  async getAllChannels(): Promise<string[]> {
    const users = await this.userModel.find().exec();
    const channels = new Set<string>();
  
    users.forEach((user) => {
      user.channels.forEach((channel) => channels.add(channel));
    });
  
    return Array.from(channels);
  }

  async removeUserFromChannel(nickname: string, channel: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { nickname },
      { $pull: { channels: channel } }, // Remove the channel from the user's channels array
      { new: true }, // Return the updated user document
    ).exec();
  }
  
  
  
  
}
