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

    // Set a nickname
    @SubscribeMessage('setNickname')
    async setNickname(client: Socket, payload: { nickname: string }) {
      console.log(`[setNickname] Received payload:`, payload);
    
      // Prevent the client from setting a nickname if one is already set
      if (this.users[client.id]) {
        console.log(`[setNickname] Client ${client.id} already has a nickname: ${this.users[client.id]}`);
        return client.emit('error', { message: 'You have already set a nickname.' });
      }
    
      // Check if the nickname is already in use by another connected client
      if (Object.values(this.users).includes(payload.nickname)) {
        console.log(`[setNickname] Nickname already in use by another client: ${payload.nickname}`);
        return client.emit('error', { message: 'Nickname already in use by another client.' });
      }
    
      // Check if the nickname exists in the database
      const existingUser = await this.userService.getUserByNickname(payload.nickname);
      if (existingUser) {
        console.log(`[setNickname] Nickname already exists in database: ${payload.nickname}`);
      } else {
        // Save the user in the database if it doesn't exist
        await this.userService.createUser(payload.nickname);
        console.log(`[setNickname] New user saved in database: ${payload.nickname}`);
      }
    
      // Assign the nickname to the client
      this.users[client.id] = payload.nickname;
      console.log(`[setNickname] Current users:`, this.users);
    
      client.emit('nicknameSet', { success: true, message: `Nickname set to ${payload.nickname}` });
    }    
    
    // Join a channel
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, payload: { channel: string }) {
      console.log(`[joinChannel] Received payload:`, payload);

      const nickname = this.users[client.id];
      if (!nickname) {
        return client.emit('error', { message: 'Please set a nickname first' });
      }

      // Add the channel to the user's list of channels in the database
      await this.userService.updateUserChannels(nickname, payload.channel);

      // Add the client to the Socket.IO room for the channel
      client.join(payload.channel);

      // Notify others in the channel that a new user has joined
      this.server.to(payload.channel).emit('userJoined', { nickname });
      console.log(`[joinChannel] ${nickname} joined channel: ${payload.channel}`);

      // Acknowledge the client
      client.emit('channelJoined', { success: true, message: `Joined channel ${payload.channel}` });
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

    // Send a private message to another user
  @SubscribeMessage('sendPrivateMessage')
  async sendPrivateMessage(client: Socket, payload: { recipient: string; content: string }) {
    const sender = this.users[client.id];
    console.log(`[sendPrivateMessage] Sender: ${sender}`);
    if (!sender) {
      console.log(`[sendPrivateMessage] Error: Sender has no nickname.`);
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

    if (!recipientSocketId) {
      console.log(`[sendPrivateMessage] Recipient ${payload.recipient} not found. Saving message.`);
      await this.messageService.createPrivateMessage(sender, payload.recipient, payload.content);
      return client.emit('privateMessageSent', { success: true, message: 'Message saved for offline recipient.' });
    }

    console.log(`[sendPrivateMessage] Delivering message to ${payload.recipient}`);
    await this.messageService.createPrivateMessage(sender, payload.recipient, payload.content);

    this.server.to(recipientSocketId).emit('newPrivateMessage', {
      sender,
      content: payload.content,
      timestamp: new Date(),
    });
    console.log(`[sendPrivateMessage] Delivered message to ${payload.recipient}`);

    client.emit('privateMessageSent', { success: true, message: 'Message delivered successfully.' });
  }

  }    