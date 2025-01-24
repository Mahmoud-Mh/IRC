import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { MessagesModule } from '../messages/messages.module'; // Import MessagesModule
import { UsersModule } from '../users/user.module'; // Import UsersModule

@Module({
  imports: [MessagesModule, UsersModule], // Import required modules
  providers: [SocketService],
  exports: [SocketService], // Export SocketService
})
export class SocketModule {}