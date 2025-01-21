import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
} from "@mui/material";

interface ListConversationProps {
  onConvSelect: (id: string) => void;
  onTypeChange: (type: "channel" | "private") => void;
}

interface Channel {
  _id: string;
  name: string;
}

interface User {
  nickname: string;
}

export default function ListConversation({
  onConvSelect,
  onTypeChange,
}: ListConversationProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<"channel" | "private">("channel");

  useEffect(() => {
    const fetchChannels = async () => {
      const response = await fetch("http://localhost:3000/users/channels");
      const data = await response.json();
      setChannels(data);
    };

    const fetchUsers = async () => {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      setUsers(data);
    };

    if (view === "channel") {
      fetchChannels();
    } else {
      fetchUsers();
    }
  }, [view]);

  const handleViewChange = (type: "channel" | "private") => {
    setView(type);
    onTypeChange(type);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1e1e1e",
        height: "100vh",
        padding: "10px",
        color: "white",
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        {view === "channel" ? "Channels" : "Utilisateurs"}
      </Typography>
      <Divider sx={{ marginBottom: "10px", backgroundColor: "#444" }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            cursor: "pointer",
            color: view === "channel" ? "#478ADC" : "#aaa",
          }}
          onClick={() => handleViewChange("channel")}
        >
          Channels
        </Typography>
        <Typography
          variant="body1"
          sx={{
            cursor: "pointer",
            color: view === "private" ? "#478ADC" : "#aaa",
          }}
          onClick={() => handleViewChange("private")}
        >
          Utilisateurs
        </Typography>
      </Box>

      <List>
        {view === "channel" &&
          channels.map((channel) => (
            <ListItem
              key={channel._id}
              onClick={() => onConvSelect(channel._id)}
              sx={{
                backgroundColor: "#333",
                marginBottom: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              <ListItemText primary={channel.name} sx={{ color: "white" }} />
            </ListItem>
          ))}

        {view === "private" &&
          users.map((user) => (
            <ListItem
              key={user.nickname}
              onClick={() => onConvSelect(user.nickname)}
              sx={{
                backgroundColor: "#333",
                marginBottom: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              <ListItemText primary={user.nickname} sx={{ color: "white" }} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
}
