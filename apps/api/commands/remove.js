import db from "../db/pool.js";

export default function registerRemove(bot) {
  bot.onText(/\/remove/, async (msg) => {

    const chatId = msg.chat.id;
    const trackedWallets = await db`SELECT * from tracked_wallets WHERE user_chat_id=${chatId}`;

    if(trackedWallets.length === 0) {
      await bot.sendMessage(chatId, "You are not tracking any wallets yet.");
      return;
    }
    
    const address = msg.text.split(" ")[1];

    const checkIfAddressExist = trackedWallets.find(wallet => wallet.wallet_address == address)
    if (!checkIfAddressExist) {
      await bot.sendMessage(chatId, "Wallet not found.\nUse /remove [WALLET_ADDRESS] to remove a wallet.\n\nThe list of tracked wallets is:");
      const wallets = trackedWallets.map((wallet) => {
      return `
🐳 *${wallet.label || "Unnamed Wallet"}*
\`${wallet.wallet_address}\`
/remove ${wallet.wallet_address}`;
    });
    await bot.sendMessage(chatId, wallets.join("\n"), {
      parse_mode: "Markdown",
    });
      return;
    }
    
    const res = await db`DELETE FROM tracked_wallets WHERE user_chat_id=${chatId} AND wallet_address=${address}`;

    bot.sendMessage(chatId, "Wallet removed successfully!");
  });
}
