import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Zap,
  TrendingUp,
  Shield,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const ManualSection = ({ icon: Icon, title, children }) => (
  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-500/20 rounded-xl">
        <Icon size={20} className="text-indigo-400" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <div className="text-sm text-white/60 leading-relaxed font-medium">
      {children}
    </div>
  </div>
);

const UserManual = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-80 bg-[#141414] border-t border-white/10 rounded-t-[32px] p-6 pb-1 pt-0 pr-2 shadow-2xl max-w-xl mx-auto h-[95vh] overflow-y-auto flex flex-col custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-0 sticky top-0 bg-[#141414]/80 backdrop-blur-sm py-4 pb-3">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white tracking-tighter">
                  WhaleSight Manual
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-3 mr-3 bg-white/5 rounded-full text-white/60 hover:text-white cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pb-4 custom-scrollbar pr-3">
                <div className=" flex flex-col gap-3">
              <ManualSection icon={Search} title="1. Instant Wallet Scanning">
                Paste any Solana public address into the{" "}
                <span className="text-white font-bold">Manual Scan</span> modal.
                Instantly see win rates and total PnL. This is how you verify if
                a source is actually profitable before following.
              </ManualSection>

              <ManualSection icon={Zap} title="2. Whale Tracking & Alerts">
                Click <span className="text-white font-bold">Track Wallet</span>{" "}
                to monitor high-conviction traders. Our backend watches the
                chain 24/7. When they swap, you get a real-time notification in
                the **Telegram Bot**.
              </ManualSection>

              <ManualSection icon={TrendingUp} title="3. Interpreting PnL Data">
                <ul className="space-y-2 mt-2">
                  <li>
                    •{" "}
                    <span className="text-green-400 font-bold">
                      Realized PnL
                    </span>
                    : Profit from closed trades. High values mean they know when
                    to exit.
                  </li>
                  <li>
                    •{" "}
                    <span className="text-blue-400 font-bold">
                      Unrealized PnL
                    </span>
                    : Current "paper" gains. High values mean they are long-term
                    holders.
                  </li>
                  <li>
                    •{" "}
                    <span className="text-indigo-400 font-bold">Win Rate</span>:
                    Accuracy percentage. Look for 60%+ for consistent
                    strategies.
                  </li>
                </ul>
              </ManualSection>

              <ManualSection icon={Shield} title="4. Security (Rugcheck)">
                If a wallet is trading suspicious, low-liquidity pairs, use
                caution. Our analysis provides risk levels based on liquidity
                and holder diversity.
              </ManualSection>

              <ManualSection
                icon={MessageCircle}
                title="5. Telegram Bot Commands"
              >
                While the Mini App is your dashboard, the{" "}
                <span className="text-indigo-400 font-bold">Bot</span> allows
                for quick command-based management.
                <ul className="space-y-2 mt-2">
                  <li>
                    •{" "}
                    <span className="text-white font-bold">/track [addr]</span>:
                    Monitor a new wallet.
                  </li>
                  <li>
                    • <span className="text-white font-bold">/scan [addr]</span>
                    : Instant PnL analysis in-chat.
                  </li>
                  <li>
                    • <span className="text-white font-bold">/list</span>: View
                    all tracked addresses.
                  </li>
                  <li>
                    •{" "}
                    <span className="text-white font-bold">/remove [addr]</span>
                    : Stop receiving alerts.
                  </li>
                </ul>
              </ManualSection>

              <div className="p-6 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 mt-8">
                <h4 className="text-white font-bold mb-2">Pro Tip</h4>
                <p className="text-indigo-200/60 text-sm">
                  Track multiple "Smart Money" wallets and look for overlapping
                  entries. When multiple whale traders enter the same token,
                  that's high-conviction alpha.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-8 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                GOT IT
                <ArrowRight size={20} />
              </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserManual;
