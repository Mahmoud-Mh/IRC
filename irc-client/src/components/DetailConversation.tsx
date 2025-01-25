import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Chip
} from "@mui/material";
import { socketService } from "../services/socketService";
import { v4 as uuidv4 } from "uuid";

interface DetailConversationProps {
  conversationType: "channel" | "private";
  conversationId: string;
  currentUser: string;
}

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

export default function DetailConversation({
  conversationType,
  conversationId,
  currentUser,
}: DetailConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channelName, setChannelName] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channelUsers, setChannelUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (conversationType === "channel") {
        try {
          const channelRes = await fetch(`http://localhost:3000/channels/${conversationId}`);
          const channelData = await channelRes.json();
          setChannelName(channelData.name);

          const usersRes = await fetch(`http://localhost:3000/channels/${conversationId}/users`);
          const usersData = await usersRes.json();
          setChannelUsers(usersData);
        } catch (error) {
          console.error("Error fetching channel data:", error);
        }
      }
    };

    const fetchMessages = async () => {
      const endpoint = conversationType === "channel"
        ? `http://localhost:3000/messages/${conversationId}`
        : `http://localhost:3000/messages/private?sender=${currentUser}&recipient=${conversationId}`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchInitialData();
    fetchMessages();

    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        const existingIndex = prev.findIndex(m => m.localId === message.localId);
        if (existingIndex > -1) {
          const newMessages = [...prev];
          newMessages[existingIndex] = message;
          return newMessages;
        }
        return [...prev, message];
      });
    };

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onNewPrivateMessage(handleNewMessage);
    socketService.onNotification(handleNotification);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offNewPrivateMessage(handleNewMessage);
      socketService.offNotification(handleNotification);
    };
  }, [conversationType, conversationId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const localId = uuidv4();
    const optimisticMessage: Message = {
      sender: currentUser,
      content: newMessage,
      timestamp: new Date().toISOString(),
      channel: conversationType === "channel" ? conversationId : undefined,
      recipient: conversationType === "private" ? conversationId : undefined,
      localId,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    if (conversationType === "channel") {
      socketService.sendMessage(conversationId, newMessage, currentUser, localId);
    } else {
      socketService.sendPrivateMessage(conversationId, newMessage, currentUser, localId);
    }

    setNewMessage("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2, bgcolor: "#1e1e1e" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          {conversationType === "channel" ? `#${channelName}` : `@${conversationId}`}
        </Typography>
        {conversationType === "channel" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {channelUsers.map(user => (
              <Chip key={user} label={user} size="small" />
            ))}
          </Box>
        )}
      </Box>

      {notifications.map((notification, i) => (
        <Typography key={i} color="textSecondary" sx={{ fontSize: 12, textAlign: 'center' }}>
          {notification.message}
        </Typography>
      ))}

      <List sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#222', borderRadius: 1, p: 1 }}>
        {messages.map((message, i) => (
          <ListItem key={i} sx={{ alignItems: 'flex-start' }}>
            <ListItemText
              primary={
                <Typography variant="body2" color="textPrimary">
                  <strong>{message.sender}</strong>: {message.content}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="textSecondary">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>
    </Box>
  );
}