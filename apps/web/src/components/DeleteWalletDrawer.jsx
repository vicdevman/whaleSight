import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useState } from "react";

const DeleteWalletDrawer = ({ isOpen, onClose, onDelete, wallet }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(wallet?.id);
    setIsDeleting(false);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40  "
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-white/10 rounded-t-[32px] p-6 pb-10 shadow-2xl max-w-xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Remove Wallet
              </h2>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 rounded-full text-white/60 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-white/70">
                Are you sure you want to stop tracking{" "}
                <span className="text-white font-medium">
                  {wallet?.label || wallet?.wallet_address}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 bg-[#1e1e1e] border border-white/5 text-white font-semibold py-4 rounded-xl hover:bg-[#252525] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                 <> <span className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> Removing...</>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Remove
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteWalletDrawer;
