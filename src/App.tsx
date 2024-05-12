import React from "react";
import "./App.css";
import Planner from "./components/compounds/Planner";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Planner />;
    </ThemeProvider>
  );
}

export default App;
