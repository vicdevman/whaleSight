const InsightCard = ({ count, isLoading }) => {
  return (
    <div className="w-full relative overflow-hidden rounded-3xl mb-4 p-10 flex flex-col items-center justify-center border border-white/20 shadow-2xl transition-all duration-300 hover:shadow-primary/20" style={{ background: 'var(--primary-gradient)' }}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-5xl font-black text-white tracking-tighter mb-1 drop-shadow-xl">
          {isLoading ? (<span>...</span>) : count.toLocaleString()}
        </h2>
        <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em] leading-none">
          Wallets Tracked
        </p>
      </div>
      
      {/* Decorative glass elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px]" />
      <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default InsightCard;
