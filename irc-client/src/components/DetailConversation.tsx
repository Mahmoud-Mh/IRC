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
      // Clear previous messages when switching conversations
      setMessages([]);

      const endpoint =
        conversationType === "channel"
          ? `http://localhost:3000/messages/${conversationId}`
          : `http://localhost:3000/messages/private?sender=${currentUser}&recipient=${conversationId}`;
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Optionally, show an error message to the user
      }
    };

    fetchMessages();

    // Real-time message listener
    const handleNewMessage = (message: Message) => {
      const isRelevant =
        (conversationType === "channel" && message.channel === conversationId) ||
        (conversationType === "private" &&
          (message.sender === conversationId || message.recipient === conversationId));

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationType, conversationId, currentUser]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (conversationType === "channel") {
      socketService.sendMessage(conversationId, newMessage, (response: any) => {
        if (response.success) {
          console.log("Message sent successfully:", response);
        } else {
          console.error("Failed to send message:", response);
        }
      });
    } else {
      socketService.sendPrivateMessage(conversationId, newMessage, (response: any) => {
        if (response.success) {
          console.log("Private message sent successfully:", response);
        } else {
          console.error("Failed to send private message:", response);
        }
      });
    }

    setNewMessage(""); // Clear the input box
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
          placeholder="Type your message..."
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
