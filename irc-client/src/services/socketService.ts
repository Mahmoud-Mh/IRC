import { io, Socket } from "socket.io-client";

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

interface UsersList {
  [key: string]: string;
}

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io("http://localhost:3000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });
    this.socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });
    this.socket.on("connect_error", (error: any) => {
      console.error("Connection error:", error);
    });
    this.socket.on("reconnect", (attempt: number) => {
      console.log(`Reconnected after ${attempt} attempts`);
    });
    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Disconnected from Socket.IO server");
    }
  }

  setNickname(nickname: string) {
    if (this.socket) {
      console.log(`Setting nickname: ${nickname}`);
      this.socket.emit("setNickname", { nickname });
    }
  }

  joinChannel(channelId: string) {
    if (this.socket) {
      console.log(`Joining channel: ${channelId}`);
      this.socket.emit("joinChannel", { channelId });
    }
  }

  leaveChannel(channel: string) {
    if (this.socket) {
      this.socket.emit("leaveChannel", { channel });
    }
  }

  sendMessage(
    channelId: string,
    content: string,
    sender: string,
    localId: string,
    conversationType: "channel" | "private"
  ) {
    if (this.socket) {
      console.log(`Sending message to channel ${channelId}: ${content}`);
      this.socket.emit("sendMessage", {
        channelId,
        content,
        sender,
        localId,
        conversationType,
      });
    }
  }

  sendPrivateMessage(
    recipient: string,
    content: string,
    sender: string,
    localId: string,
    conversationType: "channel" | "private"
  ) {
    if (this.socket) {
      console.log(`Sending private message to ${recipient}: ${content}`);
      this.socket.emit("sendPrivateMessage", {
        recipient,
        content,
        sender,
        localId,
        conversationType,
      });
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  offNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.off("newMessage", callback);
    }
  }

  onNewPrivateMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on("newPrivateMessage", callback);
    }
  }

  offNewPrivateMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.off("newPrivateMessage", callback);
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  offNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.off("notification", callback);
    }
  }

  onUsersUpdate(callback: (users: UsersList) => void) {
    if (this.socket) {
      this.socket.on("usersUpdated", callback);
    }
  }

  offUsersUpdate(callback: (users: UsersList) => void) {
    if (this.socket) {
      this.socket.off("usersUpdated", callback);
    }
  }
}

export const socketService = new SocketService();
