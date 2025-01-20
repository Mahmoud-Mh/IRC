import { useState } from "react";
import DetailConversation from "../components/DetailConversation";
import ListConversation from "../components/ListConversation";
import { Grid, Box } from "@mui/material";

interface Conversation {
  id: number;
  user: string;
  last_message: string;
}

export default function Home() {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "90vw",
        backgroundColor: "#1e1E1E",
        color: "white",
        padding: "20px",
      }}
    >
      <Grid
        container
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
          padding: "0 80px 0 40px",
        }}
      >
        {/* Récupérer la liste des conversations */}
        <ListConversation onConvSelect={setSelectedConv} />

        {/* Reçoit la conversation sélectionnée */}
        <DetailConversation selectedConv={selectedConv} />
      </Grid>
    </Box>
  );
}
