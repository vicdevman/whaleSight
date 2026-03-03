import { setState } from "../lib/conversationalState.js";
import { performScan } from "../utils/scanFormatter.js";
import { redis } from "../db/cache.js";
import isValidSolanaAddress from "../utils/isValidSolanaAddress.js";

export default function registerScan(bot) {
  bot.onText(/\/scan(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const address = match[1]?.trim();

    if (address) {
      const isValid = await isValidSolanaAddress(address);
      if (isValid) {
        return performScan(bot, chatId, address);
      } else {
        return bot.sendMessage(
          chatId,
          "❌ Invalid Solana address. Please check and try again.",
        );
      }
    }

    const buttons = {
      inline_keyboard: [
        [{ text: "Cancel", callback_data: "cancel_scan" }],
      ],
    };

    bot.sendMessage(
      chatId,
      "🔍 Please send the Solana wallet address you want to scan.",
      { reply_markup: buttons },
    );

    await setState(chatId, {
      step: "AWAITING_SCAN_ADDRESS",
    });
  });
}
