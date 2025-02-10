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

  // Maps socket IDs to nicknames
  private users: Record<string, string> = {};
  // A list of users to broadcast to clients
  private usersList: Record<string, string> = {};

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
          delete this.usersList[nickname];
          // Notify all clients about updated users list
          this.server.emit('usersUpdated', this.usersList);
        } else {
          console.log(`[Disconnection] Client disconnected: ${socket.id}`);
        }
      });

      // Handle setting a nickname
      socket.on('setNickname', async (payload: { nickname: string }) => {
        await this.handleSetNickname(socket, payload);
      });

      // Handle joining a channel
      socket.on('joinChannel', async (payload: { channelId: string }) => {
        await this.handleJoinChannel(socket, payload);
      });

      // Handle sending a message to a channel (with localId)
      socket.on(
        'sendMessage',
        async (payload: {
          channelId: string;
          content: string;
          sender: string;
          localId: string;
          conversationType: 'channel' | 'private';
        }) => {
          console.log('[sendMessage] Received payload:', payload);
          const { channelId, content, sender, localId, conversationType } =
            payload;
          if (conversationType === 'channel') {
            // Ensure the sender is in the room
            if (!socket.rooms.has(channelId)) {
              console.log(
                `[sendMessage] Adding sender ${sender} to room ${channelId}`,
              );
              socket.join(channelId);
            }
            // Create the message including the localId
            const message = await this.messageService.createMessage(
              sender,
              channelId,
              content,
              localId,
            );
            // Broadcast the message (including localId) to everyone in the channel
            this.server
              .to(channelId)
              .emit('newMessage', { ...message.toObject(), localId });
          }
        },
      );

      // Handle sending a private message
      socket.on(
        'sendPrivateMessage',
        async (payload: {
          recipient: string;
          content: string;
          sender: string;
          localId: string;
          conversationType: 'channel' | 'private';
        }) => {
          const { recipient, content, sender, localId, conversationType } =
            payload;
          if (conversationType === 'private') {
            // Save the private message
            const message = await this.messageService.createPrivateMessage(
              sender,
              recipient,
              content,
            );
            // Find the recipient's socket and send the message
            const recipientSocketId = Object.keys(this.users).find(
              (key) => this.users[key] === recipient,
            );
            if (recipientSocketId) {
              this.server.to(recipientSocketId).emit('newPrivateMessage', {
                ...message.toObject(),
                localId,
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
          }
        },
      );

      // Handle leaving a channel
      socket.on('leaveChannel', async (payload: { channel: string }) => {
        await this.handleLeaveChannel(socket, payload);
      });

      // Log any other event
      socket.onAny((event, ...args) => {
        console.log('Socket event:', event, args);
      });
    });
  }

  // Helper method to handle setting a nickname
  private async handleSetNickname(socket: any, payload: { nickname: string }) {
    console.log('[setNickname] Received payload:', payload);
    try {
      const currentNickname = this.users[socket.id];

      // If the nickname is already set to the same value, just return
      if (currentNickname && currentNickname === payload.nickname) {
        console.log(
          `[setNickname] Client ${socket.id} already has this nickname: ${currentNickname}`,
        );
        return socket.emit('nicknameSet', {
          success: true,
          message: `Nickname already set to ${currentNickname}`,
        });
      }

      // Check if the nickname is already in use by another socket
      if (Object.values(this.users).includes(payload.nickname)) {
        console.log(
          `[setNickname] Nickname already in use: ${payload.nickname}`,
        );
        return socket.emit('error', {
          success: false,
          message: 'Nickname is already in use by another user.',
        });
      }

      // Check if user exists in the database
      const existingUser = await this.userService.getUserByNickname(
        payload.nickname,
      );

      if (currentNickname) {
        console.log(
          `[setNickname] Updating nickname for ${socket.id}: ${currentNickname} -> ${payload.nickname}`,
        );
        delete this.users[socket.id];
        delete this.usersList[currentNickname];
      }

      // Create or update the user in the database
      if (!existingUser) {
        await this.userService.createUser(payload.nickname);
        console.log(
          `[setNickname] New user saved in database: ${payload.nickname}`,
        );
      } else {
        await this.userService.updateUserNickname(
          existingUser.nickname,
          payload.nickname,
        );
        console.log(
          `[setNickname] Existing user updated in database: ${payload.nickname}`,
        );
      }

      // Set the nickname for the current socket
      this.users[socket.id] = payload.nickname;
      this.usersList[payload.nickname] = payload.nickname;
      console.log('[setNickname] Current users:', this.users);

      // Notify all clients about the updated users list
      this.server.emit('usersUpdated', this.usersList);
      socket.emit('nicknameSet', {
        success: true,
        message: `Nickname set to ${payload.nickname}`,
      });
    } catch (error) {
      console.error('[setNickname] Error:', error);
      socket.emit('error', {
        success: false,
        message: 'Failed to set nickname.',
      });
    }
  }

  // Helper method to handle joining a channel
  private async handleJoinChannel(socket: any, payload: { channelId: string }) {
    const nickname = this.users[socket.id];
    if (!nickname) {
      return socket.emit('error', {
        success: false,
        message: 'Please set a nickname first',
      });
    }

    try {
      const channel = await this.channelService.getChannelById(
        payload.channelId,
      );
      if (!channel) {
        return socket.emit('error', {
          success: false,
          message: 'Channel not found',
        });
      }
      console.log(
        `[handleJoinChannel] Socket ${socket.id} joining channel: ${payload.channelId}`,
      );

      // Add the user to the channel in the database
      await this.channelService.addUserToChannel(channel.name, nickname);
      await this.userService.updateUserChannels(nickname, channel.name);

      // Join the socket room for the channel
      socket.join(payload.channelId);
      const socketsInRoom = await this.server
        .in(payload.channelId)
        .allSockets();
      console.log(
        `[handleJoinChannel] Sockets in room ${payload.channelId}:`,
        socketsInRoom,
      );

      // Send existing messages to the client
      const existingMessages = await this.messageService.getMessagesByChannel(
        payload.channelId,
      );
      socket.emit('existingMessages', existingMessages);

      // Notify others in the channel that a new user has joined
      this.server.to(payload.channelId).emit('notification', {
        type: 'userJoined',
        message: `${nickname} has joined the channel.`,
        timestamp: new Date(),
      });
      console.log(
        `[handleJoinChannel] ${nickname} joined channel: ${channel.name}`,
      );
      socket.emit('channelJoined', {
        success: true,
        message: `Joined channel ${channel.name}`,
      });
    } catch (error) {
      console.error('[handleJoinChannel] Error joining channel:', error);
      socket.emit('error', {
        success: false,
        message: `Failed to join channel ${payload.channelId}`,
      });
    }
  }

  // Helper method to handle leaving a channel
  private async handleLeaveChannel(socket: any, payload: { channel: string }) {
    const nickname = this.users[socket.id];
    if (!nickname) {
      return socket.emit('error', {
        success: false,
        message: 'Please set a nickname first',
      });
    }
    const channel = await this.channelService.getChannelById(payload.channel);
    if (channel) {
      await this.channelService.removeUserFromChannel(channel.name, nickname);
      await this.userService.removeUserFromChannel(nickname, channel.name);
      socket.leave(payload.channel);
      this.server.to(payload.channel).emit('notification', {
        type: 'userLeft',
        message: `${nickname} has left the channel.`,
        timestamp: new Date(),
      });
      console.log(
        `[handleLeaveChannel] ${nickname} left channel: ${channel.name}`,
      );
      socket.emit('channelLeft', {
        success: true,
        message: `Left channel ${channel.name}`,
      });
    }
  }
}
