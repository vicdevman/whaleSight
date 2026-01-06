import { db } from "../db/pool.js";

export default function registerStart(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const firstName = msg.chat.first_name;

    const welcomeMessage = `Welcome to WhaleSight! 🐋

I'm your crypto wallet tracking bot. I help you monitor whale movements, analyze wallet activity, and stay updated on blockchain transactions.

<b>Quick Start:</b>
• Use /track to monitor a wallet for new transactions
• Use /scan to analyze any wallet's activity and holdings  
• Use /list to see your tracked wallets
• Use /help for the full command list

Let's track some whales! 📈`;

    await bot.sendMessage(chatId, "Tracking Bot active!");
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });

    const res = await db.query("SELECT * FROM users WHERE chat_id=$1", [
      chatId,
    ]);

    const user = res.rows[0]; // get the first match
    if (!user) {
      const res = await db.query(
        "INSERT INTO users(chat_id, username, first_name) VALUES ($1, $2, $3)",
        [chatId, username, firstName]
      );
      console.log("User Saved:", res.rows[0]);
    } else {
      console.log("Found user:", user);
    }
  });
}
