import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const ManualScanModal = ({ isOpen, onClose, onScan }) => {
  const [address, setAddress] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) return;

    setError("");
    setIsScanning(true);

    try {
      const success = await onScan(address);
      if (success) {
        setAddress("");
        onClose();
      } else {
        setError("Could not analyze this wallet. Please check the address.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (isScanning) return;
    setAddress("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-70 bg-[#141414] border-t border-white/10 rounded-t-[32px] p-6 pb-10 shadow-2xl max-w-xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Search size={22} className="text-indigo-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Scan Wallet
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isScanning}
                className="p-3 bg-white/5 rounded-full text-white/60 hover:text-white cursor-pointer disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/40 ml-1">
                  Enter Solana Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="sol..."
                  disabled={isScanning}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm disabled:opacity-50"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 px-1 text-red-400 text-xs font-medium"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={!address || isScanning}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale"
              >
                {isScanning ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Launch Analysis
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManualScanModal;
