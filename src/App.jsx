import { BrowserRouter } from "react-router";
import "./App.css";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter basename="/stroke-befast">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
