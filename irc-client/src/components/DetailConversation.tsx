import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import { socketService } from "../services/socketService";

interface DetailConversationProps {
  conversationType: "channel" | "private";
  conversationId: string;
  currentUser: string;
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

export default function DetailConversation({
  conversationType,
  conversationId,
  currentUser,
}: DetailConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const endpoint =
        conversationType === "channel"
          ? `http://localhost:3000/messages/${conversationId}`
          : `http://localhost:3000/messages/private?sender=${currentUser}&recipient=${conversationId}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();

    // Listen for new messages
    if (conversationType === "channel") {
      socketService.onMessage((message) => {
        if (message.channel === conversationId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    } else {
      socketService.onPrivateMessage((message) => {
        if (
          (message.sender === conversationId && message.recipient === currentUser) ||
          (message.sender === currentUser && message.recipient === conversationId)
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }
  }, [conversationType, conversationId, currentUser]);

  const handleSendMessage = () => {
    if (conversationType === "channel") {
      socketService.sendMessage(conversationId, newMessage);
    } else {
      socketService.sendPrivateMessage(conversationId, newMessage);
    }
    setNewMessage("");
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        {conversationType === "channel"
          ? `Channel: ${conversationId}`
          : `Chat with ${conversationId}`}
      </Typography>

      <List
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          backgroundColor: "#222",
          padding: "10px",
        }}
      >
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${message.sender}: ${message.content}`}
              secondary={new Date(message.timestamp).toLocaleString()}
              sx={{ color: "white" }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", marginTop: "20px" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            marginRight: "10px",
            backgroundColor: "#fff",
            borderRadius: "5px",
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}
