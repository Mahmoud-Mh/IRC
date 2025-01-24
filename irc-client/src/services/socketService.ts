// src/services/socketService.ts
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io("http://localhost:3000"); // Replace with your backend URL
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setNickname(nickname: string) {
    if (this.socket) {
      this.socket.emit("setNickname", { nickname });
    }
  }

  joinChannel(channel: string) {
    if (this.socket) {
      this.socket.emit("joinChannel", { channel });
    }
  }

  sendMessage(channel: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendMessage", { channel, content });
    }
  }

  sendPrivateMessage(recipient: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendPrivateMessage", { recipient, content });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  offNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off("newMessage", callback);
    }
  }

  onNewPrivateMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("newPrivateMessage", callback);
    }
  }

  offNewPrivateMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off("newPrivateMessage", callback);
    }
  }

  onChannelList(callback: (channels: string[]) => void) {
    if (this.socket) {
      this.socket.on("channelList", callback);
    }
  }

  offChannelList(callback: (channels: string[]) => void) {
    if (this.socket) {
      this.socket.off("channelList", callback);
    }
  }

  onUserList(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.on("userList", callback);
    }
  }

  offUserList(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.off("userList", callback);
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  offNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.off("notification", callback);
    }
  }
}

// Export an instance of SocketService
export const socketService = new SocketService();