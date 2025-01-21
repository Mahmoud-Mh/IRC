import { Box, Typography, TextField, Button } from "@mui/material";

interface Conversation {
  id: number;
  user: string;
  last_message: string;
}

interface DetailConversationProps {
  selectedConv: Conversation | null;
}

export default function DetailConversation({
  selectedConv,
}: DetailConversationProps) {
  if (!selectedConv) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#2C2C2C",
          borderRadius: "10px",
        }}
      >
        <Typography variant="h6" sx={{ color: "gray" }}>
          Veuillez sélectionner une conversation.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        backgroundColor: "#2C2C2C",
        borderRadius: "10px",
        padding: "20px",
        overflowX: "hidden", // Empêche le défilement horizontal
        width: "100%", // S'adapte à la largeur disponible
      }}
    >
      {/* En-tête de la conversation */}
      <Box
        sx={{
          paddingBottom: "10px",
          borderBottom: "1px solid #444",
          marginBottom: "10px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: "white", marginBottom: "5px" }}
        >
          {selectedConv.user}
        </Typography>
      </Box>

      {/* Zone de messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "10px 0",
        }}
      >
        {/* Exemple de messages */}
        <Box
          sx={{
            alignSelf: "flex-start",
            backgroundColor: "#444",
            color: "white",
            padding: "10px 15px",
            borderRadius: "10px",
            maxWidth: "70%",
          }}
        >
          Salut, comment ça va ?
        </Box>
        <Box
          sx={{
            alignSelf: "flex-end",
            backgroundColor: "#4A90E2",
            color: "white",
            padding: "10px 15px",
            borderRadius: "10px",
            maxWidth: "70%",
          }}
        >
          Bien et toi ?
        </Box>
        <Box
          sx={{
            alignSelf: "flex-start",
            backgroundColor: "#444",
            color: "white",
            padding: "10px 15px",
            borderRadius: "10px",
            maxWidth: "70%",
          }}
        >
          Super, merci !
        </Box>
      </Box>

      {/* Barre de saisie */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "10px",
          backgroundColor: "#2C2C2C",
        }}
      >
        <TextField
          fullWidth
          placeholder="Écrivez votre message ici..."
          variant="outlined"
          sx={{
            backgroundColor: "#333",
            borderRadius: "5px",
            input: { color: "white" },
          }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4A90E2",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            ":hover": { backgroundColor: "#357ABD" },
          }}
        >
          Envoyer
        </Button>
      </Box>
    </Box>
  );
}
