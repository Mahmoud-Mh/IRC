// src/context/messageContext.ts
import React, { createContext, useState } from 'react';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  channel?: string;
  recipient?: string;
  localId?: string;
}

interface MessageContextProps {
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
}

export const MessageContext = createContext<MessageContextProps>({
  messages: {},
  setMessages: () => {},
});

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  return (
    <MessageContext.Provider value={{ messages, setMessages }}>
      {children}
    </MessageContext.Provider>
  );
};
