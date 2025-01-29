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

interface UsersList {
    [key: string]: string
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
    joinChannel(channelId: string) {
        if (this.socket) {
            console.log(`Joining channel: ${channelId}`); // Add logging
            this.socket.emit("joinChannel", { channelId });
        }
    }

    // Leave a channel
    leaveChannel(channel: string) {
        if (this.socket) {
            this.socket.emit("leaveChannel", { channel });
        }
    }

    // Send a message to a channel
    sendMessage(
        channelId: string, // Expect ID
        content: string,
        sender: string,
        localId: string,
        conversationType: "channel" | "private"
    ) {
        if (this.socket) {
            console.log(`Sending message to channel ${channelId}: ${content}`);
            this.socket.emit("sendMessage", { channelId, content, sender, localId, conversationType });
        }
    }

    // Send a private message to a user
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
                conversationType
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

    // Listen for user update
    onUsersUpdate(callback: (users: UsersList) => void) {
        if (this.socket) {
            this.socket.on("usersUpdated", callback);
        }
    }

    // Stop listening for user updates
    offUsersUpdate(callback: (users: UsersList) => void) {
        if (this.socket) {
            this.socket.off("usersUpdated", callback);
        }
    }
}

// Export an instance of SocketService
export const socketService = new SocketService();