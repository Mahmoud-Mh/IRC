import { useEffect, useState, useCallback } from "react";
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
  channel?: string;
  recipient?: string;
}

export default function DetailConversation({
  conversationType,
  conversationId,
  currentUser,
}: DetailConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
   const [, updateState] = useState({});
   const forceUpdate = useCallback(() => updateState({}), []);


  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([]); // Clear messages on conversation change
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
      }
    };

    fetchMessages();

    const handleNewMessage = (message: Message) => {
      const isRelevant =
        (conversationType === "channel" && message.channel === conversationId) ||
        (conversationType === "private" &&
          (message.sender === conversationId || message.recipient === conversationId));
      if (isRelevant) {
        console.log("NEW MESSAGE RECEIVED:", message);
        setMessages((prev) => {
          console.log("Previous messages:", prev);
          console.log("New message:", message);
          const updatedMessages = [...prev, message];
          console.log("Updated messages:", updatedMessages);
           forceUpdate();
           return updatedMessages;
        });
      }
    };


    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationType, conversationId, currentUser, forceUpdate]);


  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

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
        {messages.map((message, index) => {
          console.log("Rendering Message:", message);
           return (
             <ListItem key={index}>
              <ListItemText
                primary={`${message.sender}: ${message.content}`}
                secondary={new Date(message.timestamp).toLocaleString()}
                sx={{ color: "white" }}
              />
            </ListItem>
         );
        })}
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