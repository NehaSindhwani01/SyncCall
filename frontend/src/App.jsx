import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeet from "./pages/VideoMeet";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/:url" element={<VideoMeet />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
