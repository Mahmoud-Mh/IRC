import { useState } from "react";
import { Box, Typography, TextField, Button, AppBar, Toolbar } from "@mui/material";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { socketService } from "../services/socketService";
import { MessageProvider } from "../context/messageContext";

export default function Home() {
    const [selectedType, setSelectedType] = useState<"channel" | "private">("channel");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>("");
    const [isNicknameSet, setIsNicknameSet] = useState<boolean>(false);

    const handleSetNickname = () => {
        if (nickname.trim()) {
            setIsNicknameSet(true);
            socketService.connect();
            socketService.setNickname(nickname);
        } else {
            alert("Nickname cannot be empty");
        }
    };

    if (!isNicknameSet) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    backgroundColor: "#1e1e1e",
                    color: "white",
                }}
            >
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Enter Your Nickname
                </Typography>
                <TextField
                    variant="outlined"
                    placeholder="Your Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    sx={{ mb: 2, bgcolor: "white", width: 300 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSetNickname}
                    sx={{ width: 300 }}
                >
                    Set Nickname
                </Button>
            </Box>
        );
    }

    return (
        <MessageProvider>
            <Box sx={{ display: "flex", flexDirection: 'column', height: "100vh", bgcolor: "#1e1e1e" }}>
                <AppBar position="static" sx={{ backgroundColor: "#333" }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Welcome, <span style={{ fontWeight: 'bold' }}>{nickname}</span>!
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Box sx={{ display: "flex", flexGrow: 1 }}>
                    <Box sx={{ width: 300, borderRight: "1px solid #444" }}>
                        <ListConversation
                            onConvSelect={(id: string, type: "channel" | "private") => {
                                setSelectedId(id);
                                setSelectedType(type);
                            }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        {selectedId ? (
                            <DetailConversation
                                conversationType={selectedType}
                                conversationId={selectedId}
                                currentUser={nickname}
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    color: "white"
                                }}
                            >
                                <Typography variant="h5">
                                    Select a channel or user to start chatting
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </MessageProvider>
    );
}