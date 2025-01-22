import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { MessageService } from './messages/message.service';
  import { UserService } from './users/user.service';

  @WebSocketGateway({ cors: true }) // Enable CORS for client connections
  export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // In-memory storage of connected users (socketId -> nickname)
    private users: Record<string, string> = {};

    constructor(
      private readonly messageService: MessageService,
      private readonly userService: UserService,
    ) {}

    // Handle client connection
    handleConnection(client: Socket) {
      console.log(`[Connection] Client connected: ${client.id}`);
    }

    // Handle client disconnection
    handleDisconnect(client: Socket) {
      const nickname = this.users[client.id];
      if (nickname) {
        console.log(`[Disconnection] Client disconnected: ${client.id} (${nickname})`);
        delete this.users[client.id];
      } else {
        console.log(`[Disconnection] Client disconnected: ${client.id}`);
      }
    }

    @SubscribeMessage('setNickname')
    async setNickname(client: Socket, payload: { nickname: string }) {
      console.log(`[setNickname] Received payload:`, payload);
    
      const currentNickname = this.users[client.id];
    
      // If the client already has this nickname
      if (currentNickname && currentNickname === payload.nickname) {
        console.log(`[setNickname] Client ${client.id} already has this nickname: ${currentNickname}`);
        return client.emit('nicknameSet', { success: true, message: `Nickname already set to ${currentNickname}` });
      }
    
      // If the nickname is in use by another client
      if (Object.values(this.users).includes(payload.nickname)) {
        console.log(`[setNickname] Nickname already in use: ${payload.nickname}`);
        return client.emit('error', { message: 'Nickname is already in use by another user.' });
      }
    
      // Check if nickname exists in the database
      const existingUser = await this.userService.getUserByNickname(payload.nickname);
      if (existingUser && existingUser.nickname !== currentNickname) {
        console.log(`[setNickname] Nickname already exists in database: ${payload.nickname}`);
        return client.emit('error', { message: 'Nickname exists in the database.' });
      }
    
      // Update nickname in case it's changing
      if (currentNickname) {
        console.log(`[setNickname] Updating nickname for ${client.id}: ${currentNickname} -> ${payload.nickname}`);
        delete this.users[client.id];
      }
    
      // Add to database if not present
      if (!existingUser) {
        await this.userService.createUser(payload.nickname);
        console.log(`[setNickname] New user saved in database: ${payload.nickname}`);
      }
    
      // Map nickname to client
      this.users[client.id] = payload.nickname;
      console.log(`[setNickname] Current users:`, this.users);
    
      client.emit('nicknameSet', { success: true, message: `Nickname set to ${payload.nickname}` });
    }
    

      @SubscribeMessage('changeNickname')
  async changeNickname(client: Socket, payload: { oldNickname: string; newNickname: string }) {
      const user = await this.userService.updateUserNickname(payload.oldNickname, payload.newNickname);
      if (user) {
          this.users[client.id] = payload.newNickname;
          client.emit('nicknameChanged', { success: true, newNickname: payload.newNickname });
      } else {
          client.emit('error', { message: 'Failed to update nickname' });
      }
  }

    
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, payload: { channel: string }) {
      console.log(`[joinChannel] Received payload:`, payload);
    
      const nickname = this.users[client.id];
      if (!nickname) {
        return client.emit('error', { message: 'Please set a nickname first' });
      }
    
      try {
        // Add the channel to the user's list of channels in the database
        await this.userService.updateUserChannels(nickname, payload.channel);
    
        // Add the client to the Socket.IO room for the channel
        client.join(payload.channel);
    
        // Notify others in the channel that a new user has joined
        this.server.to(payload.channel).emit('notification', {
          type: 'userJoined',
          message: `${nickname} has joined the channel.`,
          timestamp: new Date(),
        });
    
        console.log(`[joinChannel] ${nickname} joined channel: ${payload.channel}`);
    
        // Acknowledge the client
        client.emit('channelJoined', { success: true, message: `Joined channel ${payload.channel}` });
      } catch (error) {
        console.error(`[joinChannel] Error:`, error);
        client.emit('error', { message: 'Failed to join the channel.' });
      }
    }
    
    // Send a message to a channel
    @SubscribeMessage('sendMessage')
    async sendMessage(client: Socket, payload: { channel: string; content: string }) {
      console.log(`[sendMessage] Received payload:`, payload);

      const nickname = this.users[client.id];
      if (!nickname) {
        return client.emit('error', { message: 'Please set a nickname first' });
      }

      // Save the message in the database
      await this.messageService.createMessage(nickname, payload.channel, payload.content);

      // Broadcast the message to others in the channel
      this.server.to(payload.channel).emit('newMessage', {
        sender: nickname,
        content: payload.content,
        timestamp: new Date(),
      });
      console.log(`[sendMessage] Message sent in ${payload.channel}: ${payload.content}`);

      // Acknowledge the client
      client.emit('messageSent', { success: true, message: 'Message sent successfully' });
    }

    @SubscribeMessage('sendPrivateMessage')
    async sendPrivateMessage(client: Socket, payload: { recipient: string; content: string }) {
      const sender = this.users[client.id];
      console.log(`[sendPrivateMessage] Sender: ${sender}`);
      if (!sender) {
        return client.emit('error', { message: 'Please set a nickname first.' });
      }
    
      if (!payload.recipient || !payload.content) {
        console.log(`[sendPrivateMessage] Error: Invalid payload.`);
        return client.emit('error', { message: 'Recipient and content are required.' });
      }
    
      console.log(`[sendPrivateMessage] Received payload: ${JSON.stringify(payload)}`);
    
      const recipientSocketId = Object.keys(this.users).find(
        (key) => this.users[key] === payload.recipient,
      );
      console.log(`[sendPrivateMessage] Recipient socket ID resolved: ${recipientSocketId}`);
    
      try {
        // Save the message in the database
        await this.messageService.createPrivateMessage(sender, payload.recipient, payload.content);
    
        if (recipientSocketId) {
          // Notify the recipient in real-time
          this.server.to(recipientSocketId).emit('notification', {
            type: 'privateMessage',
            message: `New message from ${sender}: ${payload.content}`,
            timestamp: new Date(),
          });
    
          console.log(`[sendPrivateMessage] Delivered message to ${payload.recipient}`);
          client.emit('privateMessageSent', { success: true, message: 'Message delivered successfully.' });
        } else {
          // If the recipient is offline, notify the sender
          console.log(`[sendPrivateMessage] Recipient is offline. Message saved.`);
          client.emit('privateMessageSent', { success: true, message: 'Message saved for offline recipient.' });
        }
      } catch (error) {
        console.error(`[sendPrivateMessage] Error:`, error);
        client.emit('error', { message: 'Failed to send the message.' });
      }
    }
  }    