import { Trash2, ExternalLink } from "lucide-react";

const WalletList = ({ wallets, isLoading, onDelete }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pb-24">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2 animate-pulse bg-white/10 h-4 w-32 rounded"></h3>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/5 rounded-xl"
          >
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-md border-2 border-dashed border-white/30" />
        </div>
        <p className="text-white/50 text-sm">No wallets tracked yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
        Your Watchlist
      </h3>
      {wallets.map((wallet, index) => (
        <div
          key={index}
          className="group flex items-center justify-between p-2 pl-4 bg-[#1a1a1a] border border-white/5 rounded-xl hover:bg-[#252525] transition-colors"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="text-white font-medium text-sm truncate max-w-[200px] mb-1">
              {wallet.label || `Wallet ${index + 1}`}
            </span>
            <span className="text-white/40 text-xs truncate max-w-[200px] font-mono">
              {wallet.wallet_address}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* <button className="p-4 text-white/30 hover:text-white transition-colors cursor-pointer">
              <ExternalLink size={20} />
            </button> */}
            {onDelete && (
              <button
                onClick={() => onDelete(wallet.id)}
                className="p-4 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletList;
