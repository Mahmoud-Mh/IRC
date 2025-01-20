import { Box, Typography, Grid } from "@mui/material";

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
      <Grid item xs={6} sx={{ padding: 3 }}>
        <Typography variant="h6" sx={{ color: "gray" }}>
          Veuillez s&#233;lectionner une conversation.
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid
      item
      xs={6}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: "0",
      }}
    >
      <Box
        sx={{
          border: "2px solid rgb(71, 138, 220)",
          borderRadius: "10px",
          padding: 3,
          height: "83vh",
          overflowY: "auto",
          marginLeft: "auto",
          backgroundColor: "black",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
            {selectedConv.user}
          </Typography>
        </Box>
        <Typography variant="body2" color="gray">
          {selectedConv.last_message}
        </Typography>
      </Box>
    </Grid>
  );
}
