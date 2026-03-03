import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import InsightCard from "./components/InsightCard";
import WalletList from "./components/WalletList";
import AddWalletDrawer from "./components/AddWalletDrawer";
import WalletScanModal from "./components/WalletScanModal";
import QuickActions from "./components/QuickActions";
import ManualScanModal from "./components/ManualScanModal";
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

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanTargetWallet, setScanTargetWallet] = useState(null);
  const [manualScanModalOpen, setManualScanModalOpen] = useState(false);
  const [prefillAddress, setPrefillAddress] = useState("");

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
        toast.success("Wallet tracked successfully!");
        fetchTrackedWallets();
        setIsDrawerOpen(false);
        return true;
      }

      if (result.msg.includes("unique_user_wallet_chain")) {
        toast.error("Wallet already exist!");
      } else toast.error(result.msg || "Wallet may already exist!");
      return false;
    } catch (err) {
      console.log(err);
      toast.error("Failed to add wallet");
      return false;
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
        fetchTrackedWallets();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleScanWallet = async (wallet) => {
    setScanTargetWallet(wallet);
    setScanData(null);
    setScanModalOpen(true);
    setScanLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/scan?address=${wallet.wallet_address}`,
      );
      const data = await res.json();

      if (res.ok) {
        setScanData(data.data);
        return true;
      } else {
        toast.error(data.error || "Failed to fetch wallet analytics");
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
      return false;
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="app bg-[#0b0b0b] min-h-dvh">
      <Toaster richColors position="top-center" />
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col h-full">
        <InsightCard count={wallets.length} isLoading={isLoading} />

        <QuickActions
          onTrackClick={() => setIsDrawerOpen(true)}
          onScanClick={() => setManualScanModalOpen(true)}
        />

        <WalletList
          wallets={wallets}
          isLoading={isLoading}
          onDelete={handleDeleteWallet}
          onScan={handleScanWallet}
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

      <WalletScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        data={scanData}
        isLoading={scanLoading}
        wallet={scanTargetWallet}
        trackedWallets={wallets}
        onTrack={(address) => {
          setScanModalOpen(false);
          setPrefillAddress(address);
          setIsDrawerOpen(true);
        }}
      />

      <ManualScanModal
        isOpen={manualScanModalOpen}
        onClose={() => setManualScanModalOpen(false)}
        onScan={async (address) => {
          const success = await handleScanWallet({ wallet_address: address });
          return success;
        }}
      />

      <AddWalletDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setPrefillAddress("");
        }}
        onAdd={handleAddWallet}
        initialAddress={prefillAddress}
      />
    </div>
  );
}

export default App;
