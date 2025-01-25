import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  TextField,
  Dialog
} from "@mui/material";
import { socketService } from "../services/socketService";

interface ListConversationProps {
  onConvSelect: (id: string) => void;
}

interface Channel {
  _id: string;
  name: string;
}

interface User {
  nickname: string;
}

export default function ListConversation({ onConvSelect }: ListConversationProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<"channel" | "private">("channel");
  const [newChannelName, setNewChannelName] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (view === "channel") {
          const response = await fetch("http://localhost:3000/channels");
          setChannels(await response.json());
        } else {
          const response = await fetch("http://localhost:3000/users");
          setUsers(await response.json());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const handleChannelUpdate = () => fetchData();
    socketService.onNotification(handleChannelUpdate);

    return () => {
      socketService.offNotification(handleChannelUpdate);
    };
  }, [view]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      await fetch("http://localhost:3000/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannelName })
      });
      setOpenCreateDialog(false);
      setNewChannelName("");
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await fetch(`http://localhost:3000/channels/${channelId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };

  return (
    <Box sx={{ bgcolor: "#1e1e1e", height: "100%", p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant={view === "channel" ? "contained" : "outlined"}
          onClick={() => setView("channel")}
        >
          Channels
        </Button>
        <Button
          variant={view === "private" ? "contained" : "outlined"}
          onClick={() => setView("private")}
        >
          Users
        </Button>
      </Box>

      {view === "channel" && (
        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Channel
        </Button>
      )}

      <List>
        {view === "channel"
          ? channels.map((channel) => (
            <ListItem
              key={channel._id}
              sx={{
                bgcolor: "#333",
                mb: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "#444" },
              }}
              secondaryAction={
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteChannel(channel._id)}
                >
                  Delete
                </Button>
              }
            >
              <ListItemText
                primary={`#${channel.name}`}
                onClick={() => onConvSelect(channel._id)}
                sx={{ cursor: "pointer" }}
              />
            </ListItem>
          ))
          : users.map((user) => (
            <ListItem
              key={user.nickname}
              sx={{
                bgcolor: "#333",
                mb: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "#444" },
              }}
            >
              <ListItemText
                primary={`@${user.nickname}`}
                onClick={() => onConvSelect(user.nickname)}
                sx={{ cursor: "pointer" }}
              />
            </ListItem>
          ))}
      </List>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <Box sx={{ p: 2 }}>
          <TextField
            label="Channel Name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleCreateChannel}
            fullWidth
          >
            Create
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}