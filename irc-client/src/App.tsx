import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(71, 138, 220)",
    },
    background: {
      default: "#1E1E1E",
    },
  },
});

const Layout = () => {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box component="main" sx={{ flexGrow: 1, height: "100%" }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
