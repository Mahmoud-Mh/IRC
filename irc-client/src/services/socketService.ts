import { io, Socket } from "socket.io-client";

// Define TypeScript interfaces for better type safety
interface Message {
  sender: string;
  content: string;
  timestamp: string;
  channel?: string;
  recipient?: string;
  localId?: string;
}

interface Notification {
  type: string;
  message: string;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;

  // Connection to sockets
  connect() {
    this.socket = io("http://localhost:3000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Log connections
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

  // Disconnection from sockets
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
      console.log(`Setting nickname: ${nickname}`); // Add logging
      this.socket.emit("setNickname", { nickname });
    }
  }

  // Join a channel
  joinChannel(channel: string) {
    if (this.socket) {
      console.log(`Joining channel: ${channel}`); // Add logging
      this.socket.emit("joinChannel", { channel });
    }
  }

  // Send a message to a channel
  sendMessage(
    channel: string,
    content: string,
    sender: string,
    localId: string
  ) {
    if (this.socket) {
      console.log(`Sending message to channel ${channel}: ${content}`); 
      this.socket.emit("sendMessage", { channel, content, sender, localId });
    }
  }

  // Send a private message to a user
  sendPrivateMessage(
    recipient: string,
    content: string,
    sender: string,
    localId: string
  ) {
    if (this.socket) {
      console.log(`Sending private message to ${recipient}: ${content}`); 
      this.socket.emit("sendPrivateMessage", {
        recipient,
        content,
        sender,
        localId,
      });
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

  // Leave a channel
  leaveChannel(channel: string) {
    if (this.socket) {
      this.socket.emit("leaveChannel", { channel });
    }
  }
}

// Export an instance of SocketService
export const socketService = new SocketService();
