import { Box, Typography, Button } from "@mui/material";

interface Conversation {
  id: number;
  user: string;
  last_message: string;
}

interface ListConversationProps {
  onConvSelect: (conversation: Conversation) => void;
}

const conversations: Conversation[] = [
  { id: 1, user: "Mahmoud", last_message: "Salut, est-ce que tu vas bien ?" },
  { id: 2, user: "Clément", last_message: "Rends mon argent !!!" },
  {
    id: 3,
    user: "Jean-Michel",
    last_message: "Tu es très jolie <3...",
  },
];

export default function ListConversation({
  onConvSelect,
}: ListConversationProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {conversations.map((conv) => (
        <Button
          key={conv.id}
          onClick={() => onConvSelect(conv)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "15px",
            backgroundColor: "#1E1E1E",
            color: "white",
            border: "2px solid transparent",
            borderRadius: "10px",
            textAlign: "left",
            width: "100%",
            ":hover": {
              border: "2px solid #4A90E2",
              backgroundColor: "#2C2C2C",
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {conv.user}
          </Typography>
        </Button>
      ))}
    </Box>
  );
}
