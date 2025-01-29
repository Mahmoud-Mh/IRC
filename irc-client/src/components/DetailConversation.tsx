import React, { useEffect, useState, useRef, useContext } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    TextField,
    Chip,
    Alert,
    Snackbar,
    Typography
} from "@mui/material";
import { socketService } from "../services/socketService";
import { v4 as uuidv4 } from "uuid";
import { MessageContext } from "../context/messageContext";

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
    localId?: string;
}

interface Notification {
    type: string;
    message: string;
    timestamp: Date;
}

export default function DetailConversation({
    conversationType,
    conversationId,
    currentUser,
}: DetailConversationProps) {
    const [newMessage, setNewMessage] = useState("");
    const [channelName, setChannelName] = useState("");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [channelUsers, setChannelUsers] = useState<string[] | undefined>(undefined);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const { messages, setMessages } = useContext(MessageContext);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (conversationType === "channel") {
                try {
                    const channelRes = await fetch(
                        `http://localhost:3000/channels/${conversationId}`
                    );
                    const channelData = await channelRes.json();
                    setChannelName(channelData.name);

                    const usersRes = await fetch(
                        `http://localhost:3000/users/channels/${conversationId}/users`
                    );
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        setChannelUsers(usersData);
                    } else {
                        console.log(`[fetchInitialData] Error fetching users for channel ${conversationId}`);
                        setChannelUsers(undefined);
                    }

                } catch (error) {
                    console.error("Error fetching channel data:", error);
                    setChannelUsers(undefined);
                }
            }
        };

        const fetchMessages = async () => {
            const endpoint =
                conversationType === "channel"
                    ? `http://localhost:3000/messages/${conversationId}`
                    : `http://localhost:3000/messages/private?sender=${currentUser}&recipient=${conversationId}`;

            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                setMessages((prevMessages: any) => ({
                    ...prevMessages,
                    [conversationId]: data,
                }));
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        if (conversationType === 'channel') {
            console.log('Joining channel:', conversationId);
            socketService.joinChannel(conversationId);
        }


        fetchInitialData();
        fetchMessages();

        const handleNewMessage = (message: Message) => {
            setMessages((prevMessages: any) => {
                const conversationMessages = prevMessages[conversationId] || [];
                const existingIndex = conversationMessages.findIndex((m: any) => m.localId === message.localId);

                if (existingIndex > -1) {
                    const newMessages = [...conversationMessages];
                    newMessages[existingIndex] = message;
                    return {
                        ...prevMessages,
                        [conversationId]: newMessages,
                    };
                }
                return {
                    ...prevMessages,
                    [conversationId]: [...conversationMessages, message]
                };
            });
        };


        const handleNotification = (notification: Notification) => {
            setNotifications((prev) => [...prev, notification]);
            setTimeout(() => setNotifications((prev) => prev.slice(1)), 5000);
        };

        socketService.onNewMessage(handleNewMessage);
        socketService.onNewPrivateMessage(handleNewMessage);
        socketService.onNotification(handleNotification);

        return () => {
            socketService.offNewMessage(handleNewMessage);
            socketService.offNewPrivateMessage(handleNewMessage);
            socketService.offNotification(handleNotification);
        };
    }, [conversationType, conversationId, currentUser, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const currentMessages = messages[conversationId] || [];

    const handleCommand = (command: string, args: string[]) => {
        switch (command.toLowerCase()) {
            case "/nick":
                if (args[0]) {
                    socketService.setNickname(args[0]);
                } else {
                    setError("Usage: /nick NEW_NICKNAME");
                }
                break;
            case "/join":
                if (args[0]) {
                    socketService.joinChannel(args[0]);
                    setChannelName(args[0]);
                } else {
                    setError("Usage: /join CHANNEL_NAME");
                }
                break;
            case "/leave":
                if (args[0]) {
                    socketService.leaveChannel(args[0]);
                    setChannelName("");
                } else {
                    setError("Usage: /leave CHANNEL_NAME");
                }
                break;
            case "/users":
                socketService.sendMessage(
                    conversationId,
                    `Users in channel: ${channelUsers ? channelUsers.join(", ") : 'No users in channel'}`,
                    "System",
                    uuidv4(),
                    conversationType
                );
                break;
            case "/msg":
                if (args.length >= 2) {
                    const [recipient, ...messageParts] = args;
                    const content = messageParts.join(" ");
                    socketService.sendPrivateMessage(
                        recipient,
                        content,
                        currentUser,
                        uuidv4(),
                        conversationType
                    );
                } else {
                    setError("Usage: /msg USERNAME MESSAGE");
                }
                break;
            default:
                setError(`Unknown command: ${command}`);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        if (newMessage.startsWith("/")) {
            const [command, ...args] = newMessage.split(" ");
            handleCommand(command, args);
            setNewMessage("");
            return;
        }

        const localId = uuidv4();
        const optimisticMessage: Message = {
            sender: currentUser,
            content: newMessage,
            timestamp: new Date().toISOString(),
            channel: conversationType === "channel" ? conversationId : undefined,
            recipient: conversationType === "private" ? conversationId : undefined,
            localId,
        };
        setMessages((prevMessages: any) => ({
            ...prevMessages,
            [conversationId]: [...(prevMessages[conversationId] || []), optimisticMessage],
        }));


        if (conversationType === "channel") {
            socketService.sendMessage(conversationId, newMessage, currentUser, localId, conversationType);
        } else if (conversationType === "private") {
            socketService.sendPrivateMessage(conversationId, newMessage, currentUser, localId, conversationType);
        }

        setNewMessage("");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2, bgcolor: "#1e1e1e" }}>
            <Snackbar
                open={!!error}
                autoHideDuration={3000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            {/* Notifications Display */}
            <Box sx={{ mb: 1 }}>
                {notifications.map((notification, i) => (
                    <Alert
                        key={i}
                        severity="info"
                        sx={{
                            width: '100%',
                            mb: 1,
                            backgroundColor: '#292929',
                            color: '#ffffff',
                            '& .MuiAlert-icon': { color: '#90caf9' }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{notification.message}</span>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                        </Box>
                    </Alert>
                ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, paddingLeft: 1, paddingRight: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                    <Chip
                        label={conversationType === "channel" ? `#${channelName}` : `@${conversationId}`}
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                    />
                    {conversationType === "channel" && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            {channelUsers && channelUsers.map(user => (
                                <Chip
                                    key={user}
                                    label={user}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#888' }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#1e1e1e', borderRadius: 1, p: 1, paddingLeft: 1, paddingRight: 1 }}>
                {currentMessages.map((message, i) => (
                    <ListItem key={i} sx={{ alignItems: 'flex-start', flexDirection: 'column', mb: 1, borderRadius: 2, padding: 1.5, bgcolor: '#292929' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#bb86fc' }}>{message.sender}</Typography>
                            <Typography variant="caption" sx={{ color: '#666', ml: 1 }}>
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                        </Box>
                        <ListItemText
                            primary={message.content}
                            primaryTypographyProps={{ color: 'white' }}
                        />
                    </ListItem>
                ))}
                <div ref={messagesEndRef} />
            </List>

            <Box sx={{ mt: 2, paddingLeft: 1, paddingRight: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type message or command..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    InputProps={{ style: { color: 'white' } }}
                    sx={{
                        bgcolor: '#292929',
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#555' },
                            '&.Mui-focused fieldset': { borderColor: '#bb86fc' }
                        }
                    }}
                />
            </Box>
        </Box>
    );
}