import React, { useEffect, useState } from "react";
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
    ListItemIcon,
    Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';

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
            console.log("All connected users: ", users);
        });
        return () => {
            socketService.offUsersUpdate(() => { });
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
        <Box sx={{ bgcolor: "#1e1e1e", height: "100%", p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant={view === "channel" ? "contained" : "outlined"}
                        onClick={() => setView("channel")}
                        startIcon={<PublicIcon />}
                        size="small"
                    >
                        Channels
                    </Button>
                    <Button
                        variant={view === "private" ? "contained" : "outlined"}
                        onClick={() => setView("private")}
                        startIcon={<PeopleIcon />}
                        size="small"
                    >
                        Users
                    </Button>
                </Box>
                {view === "channel" && (
                    <Button
                        variant="outlined"
                        sx={{ mb: 2 }}
                        onClick={() => setOpenCreateDialog(true)}
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        Create Channel
                    </Button>
                )}
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
                    bgcolor: "#292929",
                    "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "#333" },
                    },
                }}
            />
            <Divider sx={{ borderColor: '#333', mb: 1 }} />
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {view === "channel"
                    ? channels.map((channel) => (
                        <ListItem
                            key={channel._id}
                            secondaryAction={
                                <IconButton edge="end" aria-label="menu" onClick={(e) => handleMenuOpen(e, channel.name)}>
                                    <MenuIcon sx={{ color: "white" }} />
                                </IconButton>
                            }
                            onClick={() => onConvSelect(channel._id, "channel")}
                            sx={{
                                bgcolor: "#292929",
                                mb: 1,
                                borderRadius: 1,
                                "&:hover": { bgcolor: "#3d3d3d" },
                            }}
                        >
                            <ListItemIcon>
                                <ChatBubbleIcon sx={{ color: 'white' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={`#${channel.name}`}
                                primaryTypographyProps={{ color: 'white' }}
                            />
                        </ListItem>
                    ))
                    : Object.keys(allUsers).map((user) => (
                        <ListItem
                            key={user}
                            onClick={() => onConvSelect(user, "private")}
                            sx={{
                                bgcolor: "#292929",
                                mb: 1,
                                borderRadius: 1,
                                "&:hover": { bgcolor: "#3d3d3d" },
                            }}
                        >
                            <ListItemIcon>
                                <PersonIcon sx={{ color: 'white' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={`@${user}`}
                                primaryTypographyProps={{ color: 'white' }}
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

            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} PaperProps={{ style: { backgroundColor: '#1e1e1e' } }}>
                <Box sx={{ p: 3 }}>
                    <TextField
                        label="Channel Name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: 'grey' } }}
                        sx={{ bgcolor: '#292929' }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        color="primary"
                        onClick={async () => {
                            await fetch("http://localhost:3000/channels", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: newChannelName }),
                            });
                            setOpenCreateDialog(false);
                            setNewChannelName("");
                        }}
                        sx={{ mt: 2, py: 1.5 }}
                    >
                        Create
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}