import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../messages/message.service';
import { UserService } from '../users/user.service';
import { ChannelService } from '../channels/channel.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class SocketService implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private users: Record<string, string> = {}; // Maps socket IDs to nicknames

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`[Connection] Client connected: ${socket.id}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        const nickname = this.users[socket.id];
        if (nickname) {
          console.log(
            `[Disconnection] Client disconnected: ${socket.id} (${nickname})`,
          );
          delete this.users[socket.id];
        } else {
          console.log(`[Disconnection] Client disconnected: ${socket.id}`);
        }
      });

      // Handle setting a nickname
      socket.on('setNickname', async (payload: { nickname: string }) => {
        await this.handleSetNickname(socket, payload);
      });

      // Handle joining a channel
      socket.on('joinChannel', async (payload: { channel: string }) => {
        await this.handleJoinChannel(socket, payload);
      });

      // Handle sending a message to a channel
      socket.on(
        'sendMessage',
        async (payload: {
          channel: string;
          content: string;
          sender: string;
        }) => {
          console.log(`[sendMessage] Received payload:`, payload);
          const { channel, content, sender } = payload;

          // Ensure the sender is in the channel room
          if (!socket.rooms.has(channel)) {
            console.log(
              `[sendMessage] Adding sender ${sender} to room ${channel}`,
            );
            socket.join(channel);
          }

          const message = await this.messageService.createMessage(
            sender,
            channel,
            content,
          );
          console.log(
            `[sendMessage] Broadcasting to room ${channel}:`,
            message,
          );
          this.server.to(channel).emit('newMessage', message); // Broadcast to everyone in the room
        },
      );

      // Handle sending a private message
      socket.on(
        'sendPrivateMessage',
        async (payload: {
          recipient: string;
          content: string;
          sender: string;
          localId: string; // Temporary ID for optimistic updates
        }) => {
          const { recipient, content, sender, localId } = payload;

          // Save the private message to the database
          const message = await this.messageService.createPrivateMessage(
            sender,
            recipient,
            content,
          );

          // Find the recipient's socket ID
          const recipientSocketId = Object.keys(this.users).find(
            (key) => this.users[key] === recipient,
          );

          if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('newPrivateMessage', {
              ...message.toObject(),
              localId, // Include the localId for duplicate filtering
            });
          }

          // Also send the message back to the sender
          const senderSocketId = Object.keys(this.users).find(
            (key) => this.users[key] === sender,
          );
          if (senderSocketId) {
            this.server.to(senderSocketId).emit('newPrivateMessage', {
              ...message.toObject(),
              localId,
            });
          }
        },
      );

      // Handle leaving a channel
      socket.on('leaveChannel', async (payload: { channel: string }) => {
        await this.handleLeaveChannel(socket, payload);
      });
    });
  }

  // Helper method to set a nickname
  private async handleSetNickname(socket: any, payload: { nickname: string }) {
    console.log(`[setNickname] Received payload:`, payload);
    try {
      const currentNickname = this.users[socket.id];

      // If the nickname is already set, return early
      if (currentNickname && currentNickname === payload.nickname) {
        console.log(
          `[setNickname] Client ${socket.id} already has this nickname: ${currentNickname}`,
        );
        return socket.emit('nicknameSet', {
          success: true,
          message: `Nickname already set to ${currentNickname}`,
        });
      }

      // Check if the nickname is already in use
      if (Object.values(this.users).includes(payload.nickname)) {
        console.log(
          `[setNickname] Nickname already in use: ${payload.nickname}`,
        );
        return socket.emit('error', {
          success: false,
          message: 'Nickname is already in use by another user.',
        });
      }

      // Check if the nickname exists in the database
      const existingUser = await this.userService.getUserByNickname(
        payload.nickname,
      );
      if (existingUser && existingUser.nickname !== currentNickname) {
        console.log(
          `[setNickname] Nickname already exists in database: ${payload.nickname}`,
        );
        return socket.emit('error', {
          success: false,
          message: 'Nickname exists in the database.',
        });
      }

      // If the user already has a nickname, update it
      if (currentNickname) {
        console.log(
          `[setNickname] Updating nickname for ${socket.id}: ${currentNickname} -> ${payload.nickname}`,
        );
        delete this.users[socket.id];
      }

      // If the user doesn't exist, create a new user
      if (!existingUser) {
        await this.userService.createUser(payload.nickname);
        console.log(
          `[setNickname] New user saved in database: ${payload.nickname}`,
        );
      }

      // Set the nickname for the socket
      this.users[socket.id] = payload.nickname;
      console.log(`[setNickname] Current users:`, this.users);

      // Notify the client that the nickname was set
      socket.emit('nicknameSet', {
        success: true,
        message: `Nickname set to ${payload.nickname}`,
      });
    } catch (error) {
      console.error(`[setNickname] Error:`, error);
      socket.emit('error', {
        success: false,
        message: 'Failed to set nickname.',
      });
    }
  }

  // Helper method to join a channel
  private async handleJoinChannel(socket: any, payload: { channel: string }) {
    const nickname = this.users[socket.id];
    if (!nickname) {
      return socket.emit('error', {
        success: false,
        message: 'Please set a nickname first',
      });
    }

    // Add the user to the channel
    await this.channelService.addUserToChannel(payload.channel, nickname);
    await this.userService.updateUserChannels(nickname, payload.channel);

    // Join the channel
    socket.join(payload.channel);

    // Fetch existing messages in the channel
    const existingMessages = await this.messageService.getMessagesByChannel(
      payload.channel,
    );
    socket.emit('existingMessages', existingMessages);

    // Notify other users in the channel
    this.server.to(payload.channel).emit('notification', {
      type: 'userJoined',
      message: `${nickname} has joined the channel.`,
      timestamp: new Date(),
    });

    console.log(`[joinChannel] ${nickname} joined channel: ${payload.channel}`);

    // Notify the client that they joined the channel
    socket.emit('channelJoined', {
      success: true,
      message: `Joined channel ${payload.channel}`,
    });
  }

  // Helper method to leave a channel
  private async handleLeaveChannel(socket: any, payload: { channel: string }) {
    const nickname = this.users[socket.id];
    if (!nickname) {
      return socket.emit('error', {
        success: false,
        message: 'Please set a nickname first',
      });
    }

    // Remove the user from the channel
    await this.channelService.removeUserFromChannel(payload.channel, nickname);
    await this.userService.removeUserFromChannel(nickname, payload.channel);

    // Leave the channel
    socket.leave(payload.channel);

    // Notify other users in the channel
    this.server.to(payload.channel).emit('notification', {
      type: 'userLeft',
      message: `${nickname} has left the channel.`,
      timestamp: new Date(),
    });

    console.log(`[leaveChannel] ${nickname} left channel: ${payload.channel}`);

    // Notify the client that they left the channel
    socket.emit('channelLeft', {
      success: true,
      message: `Left channel ${payload.channel}`,
    });
  }
}
