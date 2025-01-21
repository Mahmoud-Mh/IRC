import { useState } from "react";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import { Grid, Box } from "@mui/material";

// Props de base pour le composant Home
export default function Home() {
  const [selectedType, setSelectedType] = useState<"channel" | "private">(
    "channel"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentUser = "MonNomUtilisateur"; // Remplace par le nom de l'utilisateur connecté

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
        {/* Liste des conversations */}
        <Grid item xs={4}>
          <ListConversation
            onConvSelect={(id: string) => setSelectedId(id)}
            onTypeChange={(type: "channel" | "private") =>
              setSelectedType(type)
            }
          />
        </Grid>

        {/* Détails de la conversation */}
        <Grid item xs={8}>
          {selectedId && (
            <DetailConversation
              conversationType={selectedType} // Nom de prop ajusté pour correspondre
              conversationId={selectedId} // ID de la conversation sélectionnée
              currentUser={currentUser}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
