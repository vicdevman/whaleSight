import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import InsightCard from "./components/InsightCard";
import WalletList from "./components/WalletList";
import AddWalletDrawer from "./components/AddWalletDrawer";
import "./App.css";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";

function App() {
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    WebApp.ready();
    setTelegramUser(WebApp.initDataUnsafe?.user);
  }, []);

  useEffect(() => {
    fetch("https://whalesight.onrender.com/api/wallets",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ telegramUser }),
    }
  ) 
    .then((response) => response.json())
    .then((data) => {
      setWallets(data);
    })
    .catch((error) => {
      console.error("Error fetching wallets:", error);
    });
  }, [telegramUser]);

  const [wallets, setWallets] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddWallet = (newWallet) => {
    setWallets([...wallets, newWallet]);
  };

  const handleDeleteWallet = (address) => {
    setWallets(wallets.filter((w) => w.address !== address));
  };

  return (
    <div className="app bg-[#0b0b0b] min-h-dvh">
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col relative h-full">
        <InsightCard count={wallets.length} />

        <WalletList wallets={wallets} onDelete={handleDeleteWallet} />

        {/* Floating Action Button */}
        <motion.div
          className="fixed bottom-8 right-6 lg:absolute lg:bottom-8 lg:right-6 z-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-14 h-14 rounded-full bg-white text-black shadow-lg shadow-white/10 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </motion.div>
      </main>

      <AddWalletDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAdd={handleAddWallet}
      />
    </div>
  );
}

export default App;
