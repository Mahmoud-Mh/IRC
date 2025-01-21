import { useState } from "react";
import DetailConversation from "../components/DetailConversation";
import ListConversation from "../components/ListConversation";
import { Box, Grid } from "@mui/material";

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
        height: "100vh",
        width: "100%",
        backgroundColor: "#1E1E1E",
        padding: "10px",
        overflow: "hidden", // Évite les débordements
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          flexGrow: 1,
          display: "flex",
        }}
      >
        {/* Liste des conversations */}
        <Grid
          item
          xs={4}
          sx={{
            backgroundColor: "#2C2C2C",
            borderRadius: "10px",
            padding: "10px",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <ListConversation onConvSelect={setSelectedConv} />
        </Grid>

        {/* Détail de la conversation */}
        <Grid
          item
          xs={8}
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#2C2C2C",
            borderRadius: "10px",
            height: "100%",
            padding: "10px",
            overflow: "hidden", // Évite les débordements horizontaux
          }}
        >
          <DetailConversation selectedConv={selectedConv} />
        </Grid>
      </Grid>
    </Box>
  );
}
