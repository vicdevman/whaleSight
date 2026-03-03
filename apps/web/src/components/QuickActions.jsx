import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

const QuickActions = ({ onTrackClick, onScanClick }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onTrackClick}
        className="flex items-center gap-3 p-3 cursor-pointer bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group"
      >
        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
          <Plus size={18} className="text-blue-400" />
        </div>
        <div className="flex flex-col items-start translate-y-px">
          <span className="text-sm font-bold leading-tight">Track Wallet</span>
          {/* <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
            Wallet
          </span> */}
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onScanClick}
        className="flex items-center gap-3 p-3 cursor-pointer bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group"
      >
        <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
          <Search size={18} className="text-indigo-400" />
        </div>
        <div className="flex flex-col items-start translate-y-px">
          <span className="text-sm font-bold leading-tight">Scan Wallet</span>
          {/* <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
            Any Wallet
          </span> */}
        </div>
      </motion.button>
    </div>
  );
};

export default QuickActions;
