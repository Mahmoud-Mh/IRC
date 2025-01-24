import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Replace with your server URL

const ChatComponent = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Join the channel when the component mounts or the channel changes
    socket.emit('joinChannel', { channel });

    // Listen for existing messages when joining the channel
    socket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages);
    });

    // Listen for new messages in the current channel
    socket.on('newMessage', (message) => {
      if (message.channel === channel) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Clean up listeners when the component unmounts or the channel changes
    return () => {
      socket.off('existingMessages');
      socket.off('newMessage');
    };
  }, [channel]);

  const sendMessage = () => {
    if (inputValue.trim()) {
      socket.emit('sendMessage', { channel, content: inputValue });
      setInputValue('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;