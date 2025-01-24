import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.schema';
import { UsersModule } from '../users/user.module';
import { SocketModule } from '../socket/socket.module'; // Import SocketModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    UsersModule,
    SocketModule, // Import SocketModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelsModule {}