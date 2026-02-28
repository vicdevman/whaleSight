import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import InsightCard from "./components/InsightCard";
import WalletList from "./components/WalletList";
import AddWalletDrawer from "./components/AddWalletDrawer";
import "./App.css";
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

function App() {
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    WebApp.ready();
    setTelegramUser(WebApp.initDataUnsafe?.user);
  }, []);

  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isDev = false;
  // In development loop, we might not be in Telegram, so use a mock user if needed or handle null
  const userToFetch =
    telegramUser || (isDev ? { id: 844954314, first_name: "TestUser" } : null);

  const API_URL = isDev
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_URL;

  const fetchTrackedWallets = () => {
    fetch(`${API_URL}/api/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ telegramUser: userToFetch }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("Wallets fetched:", data);
        setWallets(data);
      })
      .catch((error) => {
        console.error("Error fetching wallets:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!userToFetch) {
      console.log("No Telegram user detected");
      setIsLoading(false);
      return;
    }

    console.log(
      `Fetching wallets from ${API_URL}/api/wallets for user:`,
      userToFetch,
    );

    fetchTrackedWallets();
  }, [telegramUser]);

  const handleAddWallet = async (newWallet) => {
    // setWallets([...wallets, newWallet]);

    try {
      const res = await fetch(`${API_URL}/api/addwallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramUser: userToFetch,
          address: newWallet.address,
          label: newWallet.label,
        }),
      });

      const result = await res.json();

      console.log(result);
      if (res.ok) {
        toast.success(result.msg);
      }

      toast.error(result.msg);
      fetchTrackedWallets();
    } catch (err) {
      console.log(err);
    }
  };

  //5za1ZKP55LzHhaDr9jbjQGXqp4GcM6umPzrogL45kDu3

  const handleDeleteWallet = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/deletewallet/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("wallet deleted successfully!");
        fetchTrackedWallets()
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="app bg-[#0b0b0b] min-h-dvh">
      <Toaster richColors position="top-center"/>
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col h-full">
        <InsightCard count={wallets.length} isLoading={isLoading} />

        <WalletList
          wallets={wallets}
          isLoading={isLoading}
          onDelete={handleDeleteWallet}
        />

        {/* Floating Action Button */}
        <motion.div
          className="fixed bottom-8 right-6 lg:absolute lg:bottom-8 lg:right-6 z-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-14 h-14 cursor-pointer rounded-full bg-white text-black shadow-lg shadow-white/10 flex items-center justify-center hover:bg-gray-100 transition-colors"
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
