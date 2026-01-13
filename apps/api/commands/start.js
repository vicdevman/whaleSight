import db from "../db/pool.js";

export default function registerStart(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const firstName = msg.chat.first_name;

    const welcomeMessage = `Welcome to WhaleSight! 🐋

I'm your crypto wallet tracking bot. I help you monitor whale movements, analyze wallet activity, and stay updated on blockchain transactions.

<b>Quick Start:</b>
• Use <b>/track</b> to monitor a wallet for new transactions 
• Use <b>/scan</b> to analyze any wallet's activity and holdings
• Use <b>/list</b> to see your tracked wallets
• Use <b>/help</b> for the full command list

Let's track some whales! 📈`;

    await bot.sendMessage(chatId, "Tracking Bot active!");
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });

    try {
      const res = await db`SELECT * FROM users WHERE chat_id=${chatId}`;

      const user = res[0]; // get the first match
      if (!user) {
        const res = await db`INSERT INTO users(chat_id, username, first_name) VALUES (${chatId}, ${username}, ${firstName})`;
        console.log("User Saved:", res);
      } else {
        console.log("Found user:", user);
      }
    } catch (error) {
      console.error("❌ Database error in start command:", error);
      // Don't notify user since welcome message was already sent
      // Just log the error for monitoring
    }
  });
}
