import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
} from "@mui/material";

interface Conversation {
  id: number;
  user: string;
  last_message: string;
}

interface ListConversationProps {
  onConvSelect: (conv: Conversation) => void;
}

export default function ListConversation({
  onConvSelect,
}: ListConversationProps) {
  const conversations = [
    { id: 1, user: "Mahmoud", last_message: "Salut, est-ce que tu vas bien ?" },
    { id: 2, user: "Clément", last_message: "Rends mon argent !!!" },
    { id: 3, user: "Jean-Michel", last_message: "Tu es très jolie <3..." },
  ];

  return (
    <Grid
      item
      xs={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "86vh",
        overflowY: "auto",
        paddingRight: "10px",
        marginTop: "0",
        minWidth: "30vw",
        paddingLeft: "5px",
        paddingTop: "5px",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#1c1c1c",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#AC5FE9",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#8e44ad",
        },
      }}
    >
      <Box>
        {conversations.map((conv) => (
          <Card
            key={conv.id}
            sx={{
              backgroundColor: "black",
              border: "2px solid rgb(71, 138, 220)",
              marginBottom: 2,
              borderRadius: "10px",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 8px 16px rgba(66, 122, 241, 0.5)",
              },
            }}
          >
            <CardActionArea onClick={() => onConvSelect(conv)}>
              <CardContent>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {conv.user}
                </Typography>
                <Typography variant="body2" color="gray">
                  {conv.last_message}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Grid>
  );
}
