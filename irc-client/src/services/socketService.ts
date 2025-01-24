import { io, Socket } from "socket.io-client";

// Define TypeScript interfaces for better type safety
interface Message {
  sender: string;
  content: string;
  timestamp: string;
  channel?: string;
  recipient?: string;
}

interface Notification {
  type: string;
  message: string;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;

  // Connect to the Socket.IO server
  connect() {
    this.socket = io("http://localhost:3000", {
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Delay between reconnection attempts
    });

    // Log connection events
    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    this.socket.on("reconnect", (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed");
    });
  }

  // Disconnect from the Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Disconnected from Socket.IO server");
    }
  }

  // Set the user's nickname
  setNickname(nickname: string) {
    if (this.socket) {
      this.socket.emit("setNickname", { nickname });
    }
  }

  // Join a channel
  joinChannel(channel: string) {
    if (this.socket) {
      this.socket.emit("joinChannel", { channel });
    }
  }

  // Send a message to a channel
  sendMessage(channel: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendMessage", { channel, content });
    }
  }

  // Send a private message to a user
  sendPrivateMessage(recipient: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendPrivateMessage", { recipient, content });
    }
  }

  // Listen for new messages
  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  // Stop listening for new messages
  offNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.off("newMessage", callback);
    }
  }

  // Listen for new private messages
  onNewPrivateMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on("newPrivateMessage", callback);
    }
  }

  // Stop listening for new private messages
  offNewPrivateMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.off("newPrivateMessage", callback);
    }
  }

  // Listen for channel list updates
  onChannelList(callback: (channels: string[]) => void) {
    if (this.socket) {
      this.socket.on("channelList", callback);
    }
  }

  // Stop listening for channel list updates
  offChannelList(callback: (channels: string[]) => void) {
    if (this.socket) {
      this.socket.off("channelList", callback);
    }
  }

  // Listen for user list updates
  onUserList(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.on("userList", callback);
    }
  }

  // Stop listening for user list updates
  offUserList(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.off("userList", callback);
    }
  }

  // Listen for notifications
  onNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  // Stop listening for notifications
  offNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.off("notification", callback);
    }
  }
}

// Export an instance of SocketService
export const socketService = new SocketService();