import { useEffect, useState, useRef } from "react";
import ListConversation from "../components/ListConversation";
import DetailConversation from "../components/DetailConversation";
import {  Box,  Button, TextField, Typography, Grid } from "@mui/material";
import { socketService } from "../services/socketService";

// Main component for managing the chat application
export default function Home() {
    const [selectedType, setSelectedType] = useState<"channel" | "private">(
        "channel"
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>("");
    const [isNicknameSet, setIsNicknameSet] = useState<boolean>(false);
    const inputMessageRef = useRef<HTMLInputElement | null>(null);


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


   const handleMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const message = inputMessageRef.current?.value || '';
             if (message.trim() !== '') {
                inputMessageRef.current.value = '';
                  if (message.startsWith('/')) {
                      const parts = message.trim().split(' ');
                       const command = parts[0].substring(1);
                      const args = parts.slice(1).join(' ');
                     switch (command) {
                        case 'list':
                            socketService.sendMessage("general", message);
                          break;
                        case 'create':
                            socketService.sendMessage("general", message);
                           break;
                        case 'delete':
                           socketService.sendMessage("general", message);
                             break;
                       case 'join':
                           socketService.sendMessage("general", message);
                            break;
                      case 'quit':
                            socketService.sendMessage("general", message);
                            break;
                        case 'users':
                            socketService.sendMessage("general", message);
                           break;
                         case 'nick':
                              const newNickname = args
                            socketService.changeNickname(nickname, newNickname);
                           break;
                         case 'msg':
                            const [recipient, ...content] = args.split(' ');
                           socketService.sendPrivateMessage(recipient, content.join(' '))
                             break;
                        default:
                            console.warn(`[Home] Unknown command: ${command}`);
                           break;
                        }
                   } else {
                       socketService.sendMessage(selectedId || 'general', message);
                   }
                }
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
                     console.log('Props to DetailConversation:', {
                        conversationType: selectedType,
                        conversationId: selectedId,
                        currentUser: nickname,
                     }),
                 <DetailConversation
                      conversationType={selectedType}
                        conversationId={selectedId}
                        currentUser={nickname}
                    />
                )}
                <TextField
                    fullWidth
                   variant="outlined"
                    placeholder="Type your message..."
                  onKeyDown={handleMessage}
                    inputRef={inputMessageRef}
                  sx={{
                    marginTop: "20px",
                      backgroundColor: "#fff",
                     borderRadius: "5px",
                   }}
               />
          </Grid>
       </Grid>
   </Box>
   );
}