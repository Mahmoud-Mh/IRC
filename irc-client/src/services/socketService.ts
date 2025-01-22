import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000"); // Adjust as needed

export const socketService = {
  connect: () => socket.connect(),
  disconnect: () => socket.disconnect(),
  setNickname: (nickname: string) => {
    socket.emit("setNickname", { nickname });
  },
  sendMessage: (channel: string, content: string, callback?: (response: any) => void) => {
    socket.emit("sendMessage", { channel, content }, callback);
  },
  sendPrivateMessage: (recipient: string, content: string, callback?: (response: any) => void) => {
    socket.emit("sendPrivateMessage", { recipient, content }, callback);
  },
  onNewMessage: (callback: (message: any) => void) => {
    socket.on("newMessage", callback);
  },
  offNewMessage: (callback?: (message: any) => void) => {
    if (callback) {
      socket.off("newMessage", callback);
    } else {
      socket.off("newMessage");
    }
  },
  onError: (callback: (error: any) => void) => {
    socket.on("error", callback);
  },
};
