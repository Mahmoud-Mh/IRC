import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Adjust for production server URL

export const socketService = {
  // Connect to the WebSocket server
  connect: () => socket.connect(),

  // Disconnect from the WebSocket server
  disconnect: () => socket.disconnect(),

  // Set a user's nickname
  setNickname: (nickname: string) => {
    socket.emit("setNickname", { nickname });
  },

  // Join a channel
  joinChannel: (channel: string) => {
    socket.emit("joinChannel", { channel });
  },

  // Listen for notifications when a user joins a channel
  onUserJoined: (callback: (data: { nickname: string }) => void) => {
    socket.on("userJoined", callback);
  },

  // Listen for notifications when a user leaves a channel
  onUserLeft: (callback: (data: { nickname: string }) => void) => {
    socket.on("userLeft", callback);
  },

  // Send a message to a channel
  sendMessage: (channel: string, content: string) => {
    socket.emit("sendMessage", { channel, content });
  },

  // Listen for new messages in a channel
  onNewMessage: (callback: (data: { sender: string; content: string; timestamp: Date }) => void) => {
    socket.on("newMessage", callback);
  },

  // Send a private message to another user
  sendPrivateMessage: (recipient: string, content: string) => {
    socket.emit("sendPrivateMessage", { recipient, content });
  },

  // Listen for new private messages
  onNewPrivateMessage: (callback: (data: { sender: string; content: string; timestamp: Date }) => void) => {
    socket.on("newPrivateMessage", callback);
  },

  // Acknowledge successful private message delivery
  onPrivateMessageSent: (callback: (data: { success: boolean; message: string }) => void) => {
    socket.on("privateMessageSent", callback);
  },

  // Listen for error notifications
  onError: (callback: (data: { message: string }) => void) => {
    socket.on("error", callback);
  },
};
