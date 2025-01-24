import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/user.module';
import { SocketModule } from './socket/socket.module'; // Import SocketModule

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    MongooseModule.forRoot(process.env.MONGODB_URI), // Use environment variable for MongoDB connection
    ChannelsModule,
    MessagesModule,
    UsersModule,
    SocketModule, // Import SocketModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe, // Enable global validation
    },
  ],
})
export class AppModule {}