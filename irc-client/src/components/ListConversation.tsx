import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  TextField,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { socketService } from "../services/socketService";

interface ListConversationProps {
  onConvSelect: (id: string, type: "channel" | "private") => void;
}

interface Channel {
  _id: string;
  name: string;
}

interface UsersList {
  [key: string]: string;
}

export default function ListConversation({ onConvSelect }: ListConversationProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [view, setView] = useState<"channel" | "private">("channel");
  const [newChannelName, setNewChannelName] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [allUsers, setAllUsers] = useState<UsersList>({});

  useEffect(() => {
    socketService.onUsersUpdate((users: UsersList) => {
      setAllUsers(users);
       console.log("All connected users: ", users)
    });
    return () => {
      socketService.offUsersUpdate(() => {});
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint;
        if (view === "channel") {
          endpoint = `http://localhost:3000/channels?search=${searchQuery}`;
        } else {
          endpoint = `http://localhost:3000/users?search=${searchQuery}`;
        }

        if (endpoint) {
          const response = await fetch(endpoint);
          const data = await response.json();
          if (view === "channel") {
              setChannels(data);
          }
        } else {
          console.error("Endpoint is undefined.");
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
  }, [view, searchQuery]);

  const handleRenameChannel = async (newName: string) => {
    try {
      await fetch(`http://localhost:3000/channels/${selectedChannel}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });
    } catch (error) {
      console.error("Error renaming channel:", error);
    } finally {
      setAnchorEl(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, channelName: string) => {
    setSelectedChannel(channelName);
    setAnchorEl(event.currentTarget);
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
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={view === "channel" ? "Search channels..." : "Search users..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          bgcolor: "#333",
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": { borderColor: "#444" },
          },
        }}
      />

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
                secondaryAction={
                  <IconButton onClick={(e) => handleMenuOpen(e, channel.name)}>
                    <MenuIcon sx={{ color: "white" }} />
                  </IconButton>
                }
                sx={{
                  bgcolor: "#333",
                  mb: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#444" },
                }}
              >
                <ListItemText
                  primary={`#${channel.name}`}
                    onClick={() => onConvSelect(channel._id, "channel")}
                  sx={{ cursor: "pointer", color: "white" }}
                />
              </ListItem>
            ))
              : Object.keys(allUsers).map((user) => (
                  <ListItem
                      key={user}
                    sx={{
                      bgcolor: "#333",
                      mb: 1,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "#444" },
                    }}
                  >
                    <ListItemText
                        primary={`@${user}`}
                        onClick={() => onConvSelect(user, "private")}
                      sx={{ cursor: "pointer", color: "white" }}
                  />
                </ListItem>
            ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            const newName = prompt("Enter new channel name:", selectedChannel);
            if (newName) handleRenameChannel(newName);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await fetch(`http://localhost:3000/channels/${selectedChannel}`, {
              method: "DELETE",
            });
            setAnchorEl(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

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
            onClick={async () => {
              await fetch("http://localhost:3000/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newChannelName }),
              });
              setOpenCreateDialog(false);
              setNewChannelName("");
            }}
            fullWidth
          >
            Create
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}