import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Grid } from "@mui/material";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { socketService } from "../services/socketService";

export default function Home() {
  const [selectedType, setSelectedType] = useState<"channel" | "private">("channel");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isNicknameSet, setIsNicknameSet] = useState<boolean>(false);

  // Connect to Socket.IO and set nickname
  useEffect(() => {
    if (isNicknameSet) {
      socketService.connect();
      socketService.setNickname(nickname);

      return () => {
        socketService.disconnect();
      };
    }
  }, [isNicknameSet, nickname]);

  // Handle setting the nickname
  const handleSetNickname = () => {
    if (nickname.trim()) {
      setIsNicknameSet(true);
    }
  };

  // If the nickname is not yet set, display the setup screen
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
        <Typography variant="h4" sx={{ marginBottom: "20px" }}>
          Enter Your Nickname
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Your Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          sx={{
            marginBottom: "20px",
            backgroundColor: "white",
            borderRadius: "5px",
            width: "300px",
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSetNickname}
          sx={{ width: "300px" }}
        >
          Set Nickname
        </Button>
      </Box>
    );
  }

  // Display the chat UI once the nickname is set
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "white",
      }}
    >
      <Grid container>
        {/* List of conversations */}
        <Grid item xs={3}>
          <ListConversation
            onConvSelect={(id: string) => setSelectedId(id)}
            onTypeChange={(type: "channel" | "private") => setSelectedType(type)}
          />
        </Grid>

        {/* Details of the selected conversation */}
        <Grid item xs={9}>
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
              }}
            >
              <Typography variant="h5">Select a channel or user to start chatting</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}