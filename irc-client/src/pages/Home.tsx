import { useEffect, useState } from "react";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { Grid, Box, Button, TextField, Typography } from "@mui/material";
import { socketService } from "../services/socketService";

// Main component for managing the chat application
export default function Home() {
  const [selectedType, setSelectedType] = useState<"channel" | "private">(
    "channel"
  ); // State for selecting conversation type
  const [selectedId, setSelectedId] = useState<string | null>(null); // State for selected conversation
  const [nickname, setNickname] = useState<string>(""); // Nickname input from the user
  const [isNicknameSet, setIsNicknameSet] = useState<boolean>(false); // Whether the nickname has been set

  // Effect to handle socket connection and nickname setup
  useEffect(() => {
    if (isNicknameSet) {
      socketService.connect();

      // Ensure nickname is set only once
      if (nickname) {
        console.log(`[Home] Setting nickname to: ${nickname}`);
        socketService.setNickname(nickname);
      }

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
        <Grid item xs={4}>
          <ListConversation
            onConvSelect={(id: string) => setSelectedId(id)}
            onTypeChange={(type: "channel" | "private") =>
              setSelectedType(type)
            }
          />
        </Grid>

        {/* Details of the selected conversation */}
        <Grid item xs={8}>
          {selectedId && (
            <DetailConversation
              conversationType={selectedType}
              conversationId={selectedId}
              currentUser={nickname}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
