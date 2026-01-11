import db from "../db/pool.js";

export default function registerList(bot) {
  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const trackedWallets = await db`
        SELECT label, chain, wallet_address, added_at 
        FROM tracked_wallets 
        WHERE user_chat_id = ${chatId}
      `;

      if (!trackedWallets || trackedWallets.length === 0) {
        await bot.sendMessage(
          chatId,
          "You are not tracking any wallets yet.\nUse /track to start tracking a wallet.",
          { parse_mode: "Markdown" }
        );
        return;
      }

      const message = trackedWallets
        .map((wallet) => {
          const chain = wallet.chain.charAt(0).toUpperCase() + wallet.chain.slice(1);
          const date = new Date(wallet.added_at).toDateString();
          return `🐳 *${wallet.label || "Unnamed Wallet"}*\n🔗 Chain: ${chain}\n💼 Wallet: \`${wallet.wallet_address}\`\n🕒 Added: ${date}\n`;
        })
        .join("\n");

      await bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error("Error in /list command:", error);
      await bot.sendMessage(chatId, "❌ Failed to retrieve your tracked wallets. Please try again later.");
    }
  });
}
