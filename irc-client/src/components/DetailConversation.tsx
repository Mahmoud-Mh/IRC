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
  }, [conversationType, conversationId, currentUser]);

  const handleSendMessage = async () => {
    const endpoint =
      conversationType === "channel"
        ? "http://localhost:3000/messages"
        : "http://localhost:3000/messages/private";

    const payload = {
      sender: currentUser,
      content: newMessage,
      ...(conversationType === "channel"
        ? { channel: conversationId }
        : { recipient: conversationId }),
    };

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setNewMessage("");
    // Recharge les messages
    const response = await fetch(endpoint);
    const data = await response.json();
    setMessages(data);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        {conversationType === "channel"
          ? `Channel: ${conversationId}`
          : `Chat avec ${conversationId}`}
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
          placeholder="Écrire un message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            marginRight: "10px",
            backgroundColor: "#fff",
            borderRadius: "5px",
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Envoyer
        </Button>
      </Box>
    </Box>
  );
}
