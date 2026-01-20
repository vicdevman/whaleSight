import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const AddWalletDrawer = ({ isOpen, onClose, onAdd }) => {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) return;
    
    onAdd({ address, label });
    setAddress('');
    setLabel('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-white/10 rounded-t-[32px] p-6 pb-10 shadow-2xl"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">New Wallet</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60 ml-1">Label (Optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Main Trading"
                  className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60 ml-1">Wallet Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="sol..."
                  className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!address}
                className="mt-4 w-full bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Tracking
                <ArrowRight size={20} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddWalletDrawer;
