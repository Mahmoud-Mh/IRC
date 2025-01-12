import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/user.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/irc'),
    ChannelsModule,
    MessagesModule,
    UsersModule,
  ],
  providers: [AppGateway],
})
export class AppModule {}
