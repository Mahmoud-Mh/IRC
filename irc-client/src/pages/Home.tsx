import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    AppBar,
    Toolbar,
    Grid,
    Container
} from "@mui/material";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { socketService } from "../services/socketService";
import { MessageProvider } from "../context/messageContext";
import Logo from '../assets/epitech-logo.svg';

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
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <img src={Logo} alt="Epitech Logo" style={{ height: 80, marginBottom: 2 }} />
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
                        Welcome to IRC
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 3, textAlign: 'center' }}>
                        Enter your nickname to join the chat.
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="nickname-input"
                        label="Nickname"
                        placeholder="Your Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        autoFocus
                        sx={{ backgroundColor: '#292929', input: { color: 'white' } }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSetNickname}
                        sx={{ mt: 2, py: 1.5 }}
                    >
                        Join Chat
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <MessageProvider>
            <Box sx={{ display: "flex", flexDirection: 'column', height: "100vh", bgcolor: "#121212" }}>
                <AppBar position="static" color="default" elevation={1}>
                    <Toolbar>
                        <img src={Logo} alt="Epitech Logo" style={{ height: 40, marginRight: 1 }} />
                        <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
                            IRC Chat - Welcome, <span style={{ fontWeight: 'bold', color: '#bb86fc' }}>{nickname}</span>!
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Grid container component="main" sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={3} sx={{ borderRight: "1px solid #333", display: 'flex', flexDirection: 'column' }}>
                        <ListConversation
                            onConvSelect={(id: string, type: "channel" | "private") => {
                                setSelectedId(id);
                                setSelectedType(type);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={9} sx={{ display: 'flex', flexDirection: 'column' }}>
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
                                <Typography variant="h6" color="textSecondary">
                                    Select a channel or user to start chatting
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </MessageProvider>
    );
}