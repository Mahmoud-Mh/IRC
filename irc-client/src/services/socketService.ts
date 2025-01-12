import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adjust to match your backend URL

export const socketService = {
  connect: () => socket.connect(),
  disconnect: () => socket.disconnect(),
  sendMessage: (channel: string, message: string) => {
    socket.emit('message', { channel, message });
  },
  onMessage: (callback: (data: any) => void) => {
    socket.on('message', callback);
  },
};
