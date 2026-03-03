import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, ArrowRight } from "lucide-react";

const InfoItem = ({ label, value, isCurrency, isPositive }) => (
  <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-white/5">
    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
      {label}
    </span>
    <span
      className={`font-semibold ${isPositive === true ? "text-green-400" : isPositive === false ? "text-red-400" : "text-white"}`}
    >
      {isCurrency && "$"}
      {typeof value === "number"
        ? value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : value || "0.00"}
    </span>
  </div>
);

const WalletScanModal = ({
  isOpen,
  onClose,
  data,
  isLoading,
  wallet,
  onTrack,
  trackedWallets = [],
}) => {
  console.log("in wallet scanModal data:--------", data);

  const address = wallet?.wallet_address || data?.address;
  const isAlreadyTracked = trackedWallets.some(
    (w) => w.wallet_address?.toLowerCase() === address?.toLowerCase(),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-white/10 rounded-t-[32px] p-6 pb-1 shadow-2xl max-w-xl mx-auto h-[85vh] overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center mb-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Activity size={24} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white leading-tight">
                    Wallet Analysis
                  </h2>
                  <p className="text-white/40 text-xs font-mono truncate max-w-[200px]">
                    {wallet?.label || wallet?.wallet_address}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 rounded-full text-white/60 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-4">
                <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-white/50 text-sm animate-pulse">
                  Analyzing blockchain activity...
                </p>
              </div>
            ) : data ? (
              <div className="space-y-6 flex-1 overflow-y-auto pb-4 custom-scrollbar pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    label="Current Value"
                    value={data.summary?.cashflow_usd?.current_value}
                    isCurrency={true}
                  />
                  <InfoItem
                    label="Tokens Traded"
                    value={data.summary?.unique_tokens}
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/80">
                    Profit & Loss
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem
                      label="Realized PnL"
                      value={data.summary?.pnl?.realized_profit_usd}
                      isCurrency={true}
                      isPositive={data.summary?.pnl?.realized_profit_usd > 0}
                    />
                    <InfoItem
                      label="Realized PnL %"
                      value={`${typeof data.summary?.pnl?.realized_profit_percent === "number" ? data.summary.pnl.realized_profit_percent.toFixed(2) : "0.00"}%`}
                      isPositive={
                        data.summary?.pnl?.realized_profit_percent > 0
                      }
                    />
                    <InfoItem
                      label="Unrealized PnL"
                      value={data.summary?.pnl?.unrealized_usd}
                      isCurrency={true}
                      isPositive={data.summary?.pnl?.unrealized_usd > 0}
                    />
                    <InfoItem
                      label="Total PnL"
                      value={data.summary?.pnl?.total_usd}
                      isCurrency={true}
                      isPositive={data.summary?.pnl?.total_usd > 0}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/80">
                    Trading Activity
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <InfoItem
                      label="Total Buys"
                      value={data.summary?.counts?.total_buy}
                    />
                    <InfoItem
                      label="Total Sells"
                      value={data.summary?.counts?.total_sell}
                    />
                    <InfoItem
                      label="Total Trades"
                      value={data.summary?.counts?.total_trade}
                    />

                    <InfoItem
                      label="Winning Trades"
                      value={data.summary?.counts?.total_win}
                      isPositive={true}
                    />
                    <InfoItem
                      label="Losing Trades"
                      value={data.summary?.counts?.total_loss}
                      isPositive={false}
                    />
                    <InfoItem
                      label="Win Rate"
                      value={`${typeof data.summary?.counts?.win_rate === "number" ? (data.summary.counts.win_rate * 100).toFixed(1) : "0.0"}%`}
                    />
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
                  <h4 className="text-sm font-medium text-blue-400 mb-1">
                    Avg Profit Per Trade
                  </h4>
                  <p
                    className={`text-xl font-bold ${data.summary?.pnl?.avg_profit_per_trade_usd > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    $
                    {typeof data.summary?.pnl?.avg_profit_per_trade_usd ===
                    "number"
                      ? Math.abs(
                          data.summary.pnl.avg_profit_per_trade_usd,
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                    <span className="text-xs font-normal text-white/40 ml-2">
                      {data.summary?.pnl?.avg_profit_per_trade_usd > 0
                        ? "(Profit)"
                        : "(Loss)"}
                    </span>
                  </p>
                </div>

                {!isAlreadyTracked && (
                  <div className="pt-4 mt-2 shrink-0">
                    <button
                      onClick={() => onTrack(address)}
                      className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                    >
                      Track this Wallet
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 opacity-50">
                <Activity size={48} />
                <p>No data available</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletScanModal;
