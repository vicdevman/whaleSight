import { Trash2, ExternalLink } from 'lucide-react';

const WalletList = ({ wallets, onDelete }) => {
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
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Your Watchlist</h3>
      {wallets.map((wallet, index) => (
        <div 
          key={index}
          className="group flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/5 rounded-xl hover:bg-[#252525] transition-colors"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="text-white font-medium text-sm truncate max-w-[200px] mb-1">
              {wallet.label || `Wallet ${index + 1}`}
            </span>
            <span className="text-white/40 text-xs truncate max-w-[200px] font-mono">
              {wallet.address}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/30 hover:text-white transition-colors">
              <ExternalLink size={18} />
            </button>
            {onDelete && (
               <button 
               onClick={() => onDelete(wallet.address)}
               className="p-2 text-white/30 hover:text-red-400 transition-colors"
             >
               <Trash2 size={18} />
             </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletList;
