import { useEffect, useState, useRef } from "react";
import { Box, Typography, List, ListItem, ListItemText, TextField, Button } from "@mui/material";
import { socketService } from "../services/socketService";
import { v4 as uuidv4 } from "uuid"; // Install UUID: `npm install uuid`

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
  localId?: string; // Temporary ID for optimistic messages
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

  // Join/leave channel when component mounts/unmounts
  useEffect(() => {
    if (conversationType === "channel") {
      socketService.joinChannel(conversationId);
    }

    return () => {
      if (conversationType === "channel") {
        socketService.leaveChannel(conversationId);
      }
    };
  }, [conversationType, conversationId]);

  // Fetch channel name (for channel conversations)
  useEffect(() => {
    if (conversationType === "channel") {
      const fetchChannelName = async () => {
        try {
          const response = await fetch(`http://localhost:3000/channels/${conversationId}`);
          const data = await response.json();
          setChannelName(data.name);
        } catch (error) {
          console.error("Error fetching channel name:", error);
        }
      };
      fetchChannelName();
    }
  }, [conversationType, conversationId]);

  // Fetch messages and listen for new ones
  useEffect(() => {
    const fetchMessages = async () => {
      const endpoint =
        conversationType === "channel"
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

    fetchMessages();

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      // Skip if this is the sender's own optimistic message
      const isSender = message.sender === currentUser;
      const isDuplicate = messages.some((m) => m.localId === message.localId);

      if (!isSender || !isDuplicate) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationType, conversationId, currentUser, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Generate a temporary ID for the optimistic message
    const localId = uuidv4();

    // Create an optimistic message
    const optimisticMessage: Message = {
      sender: currentUser,
      content: newMessage,
      timestamp: new Date().toISOString(),
      channel: conversationType === "channel" ? conversationId : undefined,
      recipient: conversationType === "private" ? conversationId : undefined,
      localId, // Add temporary ID
    };

    // Optimistically update the UI
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send the message via Socket.IO (include the localId)
    if (conversationType === "channel") {
      socketService.sendMessage(conversationId, newMessage, currentUser, localId);
    } else {
      socketService.sendPrivateMessage(conversationId, newMessage, currentUser, localId);
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
            marginLeft: "5px",
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
            marginRight: "5px",
            height: "56px",
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}