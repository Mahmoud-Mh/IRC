import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socketService.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, []);

  const sendMessage = () => {
    socketService.sendMessage('general', input);
    setInput('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;
