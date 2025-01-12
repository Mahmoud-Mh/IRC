import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service'; // Correct import
import { ChannelController } from './channel.controller'; // Correct import
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.schema';
import { UsersModule } from '../users/user.module'; // Import UsersModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    UsersModule, // Add UsersModule here
  ],
  controllers: [ChannelController], // Correct Controller
  providers: [ChannelService], // Correct Service
})
export class ChannelsModule {}
