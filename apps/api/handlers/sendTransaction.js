import db from "../db/pool.js";

export default async function sendTransaction(bot, data) {
  const { wallet: address, action, tokenAmount, solAmount, signature } = data;

  // Fetch unique users tracking this wallet to avoid duplicate notifications
  const userResults = await db`
    SELECT DISTINCT ON (user_chat_id) user_chat_id AS chat_id, label 
    FROM tracked_wallets 
    WHERE wallet_address = ${address}
  `;

  if (userResults.length === 0) {
    return;
  }

  if (userResults.length == 1) {
    console.log(`Single user tracking wallet: ${address}`);
    const user = userResults[0];
    const text =
      `🚨 *${action} Detected* 🚨\n\n` +
      `*Wallet:* ${user.label}\n` +
      `*Address:* \`${address}\`\n` +
      `*Amount:* ${tokenAmount.toLocaleString()} tokens\n` +
      `*Value:* ${Math.abs(solAmount).toFixed(4)} SOL\n\n` +
      `🔗 [View on Solscan](https://solscan.io/tx/${signature})`;

    bot.sendMessage(user.chat_id, text, { parse_mode: "Markdown" });
    return;
  }

  console.log("users:", userResults);

  userResults.forEach((user) => {
    const text =
      `🚨 *${action} Detected* 🚨\n\n` +
      `*Wallet:* ${user.label}\n` +
      `*Address:* \`${address}\`\n` +
      `*Amount:* ${tokenAmount.toLocaleString()} tokens\n` +
      `*Value:* ${Math.abs(solAmount).toFixed(4)} SOL\n\n` +
      `🔗 [View on Solscan](https://solscan.io/tx/${signature})`;

    try {
      bot.sendMessage(user.chat_id, text, { parse_mode: "Markdown" });
    } catch (error) {
      if (error.message.includes("bot was blocked by the user")) {
        // await db`DELETE FROM tracked_wallets WHERE user_chat_id = ${user.chat_id}`;
        // console.log(`User ${user.chat_id} blocked bot; removed from database.`);
      } else {
        console.error(`Failed to notify ${user.chat_id}:`, error.message);
      }
    }
  });
}
