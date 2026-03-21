import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const isInTelegram = !!window.Telegram?.WebApp?.initData;

  // If in Telegram, always show the dashboard (the app)
  if (isInTelegram) {
    return <Dashboard />;
  }

  // Route matching for browser environment
  if (currentPath === "/app") {
    return <Dashboard />;
  }

  // Default to landing page for all other routes in browser
  return <LandingPage onEnter={() => navigate("/app")} />;
}

export default App;
