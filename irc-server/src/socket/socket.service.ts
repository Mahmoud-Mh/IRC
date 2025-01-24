import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../messages/message.service';
import { UserService } from '../users/user.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class SocketService implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private users: Record<string, string> = {};

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`[Connection] Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        const nickname = this.users[socket.id];
        if (nickname) {
          console.log(`[Disconnection] Client disconnected: ${socket.id} (${nickname})`);
          delete this.users[socket.id];
        } else {
          console.log(`[Disconnection] Client disconnected: ${socket.id}`);
        }
      });

      socket.on('setNickname', async (payload: { nickname: string }) => {
        await this.handleSetNickname(socket, payload);
      });

      socket.on('joinChannel', async (payload: { channel: string }) => {
        await this.handleJoinChannel(socket, payload);
      });

      socket.on('sendMessage', async (payload: { channel: string; content: string }) => {
        await this.handleSendMessage(socket, payload);
      });

      socket.on('sendPrivateMessage', async (payload: { recipient: string; content: string }) => {
        await this.handleSendPrivateMessage(socket, payload);
      });

      socket.on('leaveChannel', async (payload: { channel: string }) => {
        await this.handleLeaveChannel(socket, payload);
      });
    });
  }

  private async handleSetNickname(socket: any, payload: { nickname: string }) {
    console.log(`[setNickname] Received payload:`, payload);
    try {
      const currentNickname = this.users[socket.id];

      // If the client already has this nickname
      if (currentNickname && currentNickname === payload.nickname) {
        console.log(`[setNickname] Client ${socket.id} already has this nickname: ${currentNickname}`);
        return socket.emit('nicknameSet', { success: true, message: `Nickname already set to ${currentNickname}` });
      }

      // If the nickname is in use by another client
      if (Object.values(this.users).includes(payload.nickname)) {
        console.log(`[setNickname] Nickname already in use: ${payload.nickname}`);
        return socket.emit('error', { success: false, message: 'Nickname is already in use by another user.' });
      }

      // Check if nickname exists in the database
      const existingUser = await this.userService.getUserByNickname(payload.nickname);
      if (existingUser && existingUser.nickname !== currentNickname) {
        console.log(`[setNickname] Nickname already exists in database: ${payload.nickname}`);
        return socket.emit('error', { success: false, message: 'Nickname exists in the database.' });
      }

      // Update nickname in case it's changing
      if (currentNickname) {
        console.log(`[setNickname] Updating nickname for ${socket.id}: ${currentNickname} -> ${payload.nickname}`);
        delete this.users[socket.id];
      }

      // Add to database if not present
      if (!existingUser) {
        await this.userService.createUser(payload.nickname);
        console.log(`[setNickname] New user saved in database: ${payload.nickname}`);
      }

      // Map nickname to client
      this.users[socket.id] = payload.nickname;
      console.log(`[setNickname] Current users:`, this.users);

      socket.emit('nicknameSet', { success: true, message: `Nickname set to ${payload.nickname}` });
    } catch (error) {
      console.error(`[setNickname] Error:`, error);
      socket.emit('error', { success: false, message: 'Failed to set nickname.' });
    }
  }

  private async handleJoinChannel(socket: any, payload: { channel: string }) {
    console.log(`[joinChannel] Received payload:`, payload);
    try {
      const nickname = this.users[socket.id];
      if (!nickname) {
        return socket.emit('error', { success: false, message: 'Please set a nickname first' });
      }

      // Add the channel to the user's list of channels in the database
      await this.userService.updateUserChannels(nickname, payload.channel);

      // Add the client to the Socket.IO room for the channel
      socket.join(payload.channel);

      // Fetch existing messages for the channel
      const existingMessages = await this.messageService.getMessagesByChannel(payload.channel);
      socket.emit('existingMessages', existingMessages);

      // Notify others in the channel that a new user has joined
      this.server.to(payload.channel).emit('notification', {
        type: 'userJoined',
        message: `${nickname} has joined the channel.`,
        timestamp: new Date(),
      });

      console.log(`[joinChannel] ${nickname} joined channel: ${payload.channel}`);

      // Acknowledge the client
      socket.emit('channelJoined', { success: true, message: `Joined channel ${payload.channel}` });
    } catch (error) {
      console.error(`[joinChannel] Error:`, error);
      socket.emit('error', { success: false, message: 'Failed to join the channel.' });
    }
  }

  private async handleSendMessage(socket: any, payload: { channel: string; content: string }) {
    console.log(`[sendMessage] Received payload:`, payload);
    try {
      const nickname = this.users[socket.id];
      if (!nickname) {
        return socket.emit('error', { success: false, message: 'Please set a nickname first' });
      }

      // Save the message in the database
      const message = await this.messageService.createMessage(
        nickname,
        payload.channel,
        payload.content,
      );

      // Broadcast the message to others in the channel
      this.server.to(payload.channel).emit('newMessage', {
        sender: nickname,
        content: payload.content,
        timestamp: new Date(),
      });

      console.log(`[sendMessage] Message sent in ${payload.channel}: ${payload.content}`);

      // Acknowledge the client with the saved message ID
      socket.emit('messageSent', {
        success: true,
        message: 'Message sent successfully',
        messageId: message._id,
      });
    } catch (error) {
      console.error(`[sendMessage] Error:`, error);
      socket.emit('error', { success: false, message: 'Failed to send the message.' });
    }
  }

  private async handleSendPrivateMessage(socket: any, payload: { recipient: string; content: string }) {
    const sender = this.users[socket.id];
    console.log(`[sendPrivateMessage] Sender: ${sender}`);
    try {
      if (!sender) {
        return socket.emit('error', { success: false, message: 'Please set a nickname first.' });
      }
      if (!payload.recipient || !payload.content) {
        console.log(`[sendPrivateMessage] Error: Invalid payload.`);
        return socket.emit('error', { success: false, message: 'Recipient and content are required.' });
      }

      console.log(`[sendPrivateMessage] Received payload: ${JSON.stringify(payload)}`);

      const recipientSocketId = Object.keys(this.users).find(
        (key) => this.users[key] === payload.recipient,
      );

      // Save the message in the database
      const message = await this.messageService.createPrivateMessage(
        sender,
        payload.recipient,
        payload.content,
      );

      if (recipientSocketId) {
        // Notify the recipient in real-time
        this.server.to(recipientSocketId).emit('newPrivateMessage', {
          sender,
          content: payload.content,
          timestamp: new Date(),
        });

        console.log(`[sendPrivateMessage] Delivered message to ${payload.recipient}`);
        socket.emit('privateMessageSent', {
          success: true,
          message: 'Message delivered successfully',
          messageId: message._id,
        });
      } else {
        // If the recipient is offline, notify the sender
        console.log(`[sendPrivateMessage] Recipient is offline. Message saved.`);
        socket.emit('privateMessageSent', {
          success: true,
          message: 'Message saved for offline recipient.',
          messageId: message._id,
        });
      }
    } catch (error) {
      console.error(`[sendPrivateMessage] Error:`, error);
      socket.emit('error', { success: false, message: 'Failed to send the private message.' });
    }
  }

  private async handleLeaveChannel(socket: any, payload: { channel: string }) {
    console.log(`[leaveChannel] Received payload:`, payload);
    try {
      const nickname = this.users[socket.id];
      if (!nickname) {
        return socket.emit('error', { success: false, message: 'Please set a nickname first' });
      }

      // Remove the user from the channel in the database
      await this.userService.removeUserFromChannel(nickname, payload.channel);

      // Remove the client from the Socket.IO room for the channel
      socket.leave(payload.channel);

      // Notify others in the channel that the user has left
      this.server.to(payload.channel).emit('notification', {
        type: 'userLeft',
        message: `${nickname} has left the channel.`,
        timestamp: new Date(),
      });

      console.log(`[leaveChannel] ${nickname} left channel: ${payload.channel}`);

      // Acknowledge the client
      socket.emit('channelLeft', { success: true, message: `Left channel ${payload.channel}` });
    } catch (error) {
      console.error(`[leaveChannel] Error:`, error);
      socket.emit('error', { success: false, message: 'Failed to leave the channel.' });
    }
  }
}