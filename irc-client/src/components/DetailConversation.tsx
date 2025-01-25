import { useEffect, useState, useRef } from "react";
import { Box, Typography, List, ListItem, ListItemText, TextField, Button } from "@mui/material";
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
  const [channelName, setChannelName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversationType === "channel") {
      const fetchChannelName = async () => {
        try {
          const response = await fetch(`http://localhost:3000/channels/${conversationId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch channel name: ${response.statusText}`);
          }
          const data = await response.json();
          setChannelName(data.name);
        } catch (error) {
          console.error("Error fetching channel name:", error);
        }
      };

      fetchChannelName();
    }
  }, [conversationType, conversationId]);

  useEffect(() => {
    const fetchMessages = async () => {
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
      }
    };

    fetchMessages();

    const handleNewMessage = (message: Message) => {
      const isRelevant =
        (conversationType === "channel" && message.channel === conversationId) ||
        (conversationType === "private" &&
          (message.sender === conversationId || message.recipient === conversationId));
      if (isRelevant) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationType, conversationId, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        padding: "20px",
        backgroundColor: "#1e1e1e",
        color: "white",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "#1e1e1e",
          paddingBottom: "10px",
        }}
      >
        <Typography variant="h5">
          {conversationType === "channel"
            ? `Channel: ${channelName}`
            : `Chat with ${conversationId}`}
        </Typography>
      </Box>

      {/* Message List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          backgroundColor: "#222",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          maxHeight: "calc(100vh - 200px)",
          paddingTop: "60px",
        }}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${message.sender}: ${message.content}`}
                secondary={new Date(message.timestamp).toLocaleString()}
                sx={{ color: "white" }}
              />
            </ListItem>
          ))}
          {/* Empty div for auto-scrolling to the bottom */}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          display: "flex",
          marginTop: "auto",
          padding: "10px",
          backgroundColor: "#1e1e1e",
          borderTop: "1px solid #444",
        }}
      >
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{
            minWidth: "100px",
            height: "56px",
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}