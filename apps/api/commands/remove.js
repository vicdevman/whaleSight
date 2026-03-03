import db from "../db/pool.js";
import { updateWebhookAddresses } from "../services/helius.js";
import { setState } from "../lib/conversationalState.js";

export default function registerRemove(bot) {
  bot.onText(/\/remove(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const address = match[1]?.trim();

    // 1. No address provided
    if (!address) {
      await setState(chatId, { step: "AWAITING_REMOVE_ADDRESS" });
      const buttons = {
        inline_keyboard: [
          [{ text: "Cancel", callback_data: "cancel_tracking" }],
        ],
      };
      await bot.sendMessage(
        chatId,
        "Please send the wallet address you want to remove:",
        { reply_markup: buttons },
      );
      return;
    }

    try {
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
        try {
          const trackedWallets = await db`
          SELECT wallet_address, label
          FROM tracked_wallets
          WHERE user_chat_id = ${chatId}
          ORDER BY id DESC
        `;

          if (!trackedWallets.length) {
            await bot.sendMessage(
              chatId,
              "You are not tracking any wallets yet.",
            );
            return;
          }

          const wallets = trackedWallets.map(
            (w) => `
🐳 *${w.label || "Unnamed Wallet"}*
\`${w.wallet_address}\`
/remove ${w.wallet_address}
        `,
          );

          await bot.sendMessage(
            chatId,
            "Wallet not found.\n\nHere are your tracked wallets:\n" +
              wallets.join("\n"),
            { parse_mode: "Markdown" },
          );
        } catch (listError) {
          console.error("❌ Database error fetching wallet list:", listError);
          await bot.sendMessage(
            chatId,
            "🔄 Having trouble connecting. Please try again:\n/remove " +
              address,
          );
        }
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
        "Wallet removed successfully! use /list to see all tracked wallets",
      );

      // 5. Get all unique tracked wallets to update webhook
      const remainingWallets =
        await db`SELECT DISTINCT wallet_address FROM tracked_wallets`;

      const walletAddresses = remainingWallets.map((row) => row.wallet_address);
      console.log("Remaining wallets for webhook update:", walletAddresses);

      if (walletAddresses.length > 0) {
        await updateWebhookAddresses(walletAddresses);
      } else {
        console.log("No wallets remaining, webhook update skipped");
      }
    } catch (error) {
      console.error("❌ Database error in remove command:", error);
      await bot.sendMessage(
        chatId,
        "🔄 Having trouble connecting. Please try again:\n/remove " +
          (address || "WALLET_ADDRESS"),
      );
    }
  });
}
