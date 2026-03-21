import { motion } from "framer-motion";
import {
  Activity,
  Shield,
  TrendingUp,
  ArrowRight,
  Zap,
  Target,
  BookOpen,
} from "lucide-react";
import UserManual from "./UserManual";
import { useState } from "react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="text-indigo-400" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-white/60 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = ({ onEnter }) => {
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-6 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />

      <main className="max-w-2xl mx-auto pt-12 pb-24 relative z-10 flex flex-col justify-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} />
            On-Chain Intelligence
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            Catch the Next 100x.
          </h1>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-tight mb-8">
            Track whales, analyze PnL, and spot 100x alpha before the market
            catches up.
          </p>

          <button
            onClick={() => setManualOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <BookOpen size={18} className="text-indigo-400" />
            User Manual
          </button>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid gap-4 mb-20">
          <FeatureCard
            icon={Target}
            delay={0.2}
            title="Whale Tracking"
            description="Real-time alerts when high-conviction wallets make a move. Never miss a pivot."
          />
          <FeatureCard
            icon={TrendingUp}
            delay={0.3}
            title="PnL Deep Dives"
            description="Professional-grade analytics for any wallet. Filter noise, see terminal-quality data."
          />
          <FeatureCard
            icon={Shield}
            delay={0.4}
            title="Rug Protection"
            description="Institutional-level risk assessment built-in. Stay safe while hunting high-yield alpha."
          />
        </div>

        {/* Industry Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <Activity className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold">Why WhaleSight?</h2>
          </div>
          <ul className="space-y-4">
            {[
              "Detect insider entries with sub-second latency.",
              "Analyze winning patterns of top Solana traders.",
              "Automate your tracking with personalized alerts.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-white/70">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Get Started Steps */}
        <div className="mb-20 px-4">
          <h3
            className="text-sm font-bold text-white/40 uppercase tracking-widest mb-8 text-center"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            How to start
          </h3>
          <div className="flex flex-col gap-8 ">
            {[
              {
                step: "01",
                text: "Add a high-conviction wallet to your tracking list.",
              },
              {
                step: "02",
                text: "Receive real-time alerts directly in Telegram.",
              },
              {
                step: "03",
                text: "Analyze performance and replicate winning alpha.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-center">
                <span className="text-4xl font-black text-white/10">
                  {item.step}
                </span>
                <p className="text-white/80 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Wrapper */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-[#0b0b0b]/80 backdrop-blur-xl border-t border-white/5">
          {window.Telegram?.WebApp?.initData ? (
            <button
              onClick={onEnter}
              className="w-full max-w-md bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/20 mx-auto"
            >
              GET STARTED
              <ArrowRight size={20} />
            </button>
          ) : (
            <a
              href="https://t.me/WhaleSightBot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-md bg-[#24A1DE] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#208bbf] active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/20 mx-auto"
            >
              OPEN IN TELEGRAM
              <ArrowRight size={20} />
            </a>
          )}
        </div>
      </main>

      <UserManual isOpen={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
};

export default LandingPage;
