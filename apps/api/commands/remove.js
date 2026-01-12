import db from "../db/pool.js";

export default function registerRemove(bot) {
 bot.onText(/\/remove(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const address = match[1]?.trim();

  // 1. No address provided
  if (!address) {
    await bot.sendMessage(
      chatId,
      "Usage:\n/remove WALLET_ADDRESS"
    );
    return;
  }

  // 2. Check if wallet exists for this user
  const [wallet] = await db`
    SELECT 1
    FROM tracked_wallets
    WHERE user_chat_id = ${chatId}
      AND wallet_address = ${address}
    LIMIT 1
  `;

  // 3. If wallet does not exist, fetch list only now
  if (!wallet) {
    const trackedWallets = await db`
      SELECT wallet_address, label
      FROM tracked_wallets
      WHERE user_chat_id = ${chatId}
      ORDER BY id DESC
    `;

    if (!trackedWallets.length) {
      await bot.sendMessage(
        chatId,
        "You are not tracking any wallets yet."
      );
      return;
    }

    const wallets = trackedWallets.map(w => `
🐳 *${w.label || "Unnamed Wallet"}*
\`${w.wallet_address}\`
/remove ${w.wallet_address}
    `);

    await bot.sendMessage(
      chatId,
      "Wallet not found.\n\nHere are your tracked wallets:\n" +
        wallets.join("\n"),
      { parse_mode: "Markdown" }
    );
    return;
  }

  // 4. Delete wallet
  await db`
    DELETE FROM tracked_wallets
    WHERE user_chat_id = ${chatId}
      AND wallet_address = ${address}
  `;

  await bot.sendMessage(
    chatId,
    "Wallet removed successfully. Clean slate energy "
  );
});

}
