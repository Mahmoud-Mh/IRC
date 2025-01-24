import { useState } from "react";
import { Box, Grid, Typography, TextField, Button } from "@mui/material";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { socketService } from "../services/socketService";

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

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "white",
        overflow: "hidden", 
      }}
    >
      <Grid container>
        {/* Sidebar for channels and users */}
        <Grid
          item
          xs={12} 
          md={3} 
          sx={{
            height: "100vh", 
            overflowY: "auto", 
            borderRight: "1px solid #444",
          }}
        >
          <ListConversation
            onConvSelect={(id: string) => setSelectedId(id)}
            onTypeChange={(type: "channel" | "private") => setSelectedType(type)}
          />
        </Grid>

        {/* Main chat area */}
        <Grid
          item
          xs={12} 
          md={9} 
          sx={{
            height: "100vh", 
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", 
          }}
        >
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