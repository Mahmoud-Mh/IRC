// src/socket/socket.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SocketService } from './socket.service';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/user.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [
    forwardRef(() => MessagesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ChannelsModule),
  ],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}