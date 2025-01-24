import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import { Box } from "@mui/material";

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
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;