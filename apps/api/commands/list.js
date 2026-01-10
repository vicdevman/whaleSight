import { db } from "../db/pool.js";

export default function registerList(bot) {
  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;

    const trackedWallets = await db.query(
      "SELECT * from tracked_wallets WHERE user_chat_id=$1",
      [chatId]
    );
    const wallets = trackedWallets.rows.map((wallet) => {
      return `
🐳 *${wallet.label || "Unnamed Wallet"}*
🔗 Chain: ${wallet.chain.charAt(0).toUpperCase() + wallet.chain.slice(1)}
💼 Wallet: \`${wallet.wallet_address}\`
🕒 Added: ${new Date(wallet.added_at).toDateString()}
`;
    });
    await bot.sendMessage(chatId, wallets.join("\n"), {
      parse_mode: "Markdown",
    });
  });
}
