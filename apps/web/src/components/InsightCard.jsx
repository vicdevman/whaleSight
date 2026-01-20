

const InsightCard = ({ count }) => {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl mb-6 p-8 py-6 flex justify-center" style={{ background: 'var(--primary-gradient)' }}>
      <div className="relative z-10 flex flex-col items-start gap-2">
        <div className='flex items-center gap-2 flex-col'>
          <h2 className="text-3xl font-bold text-white mb-1">{count}</h2>
          <p className="text-white/80 font-medium text-sm">Wallets Tracked</p>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
    </div>
  );
};

export default InsightCard;
