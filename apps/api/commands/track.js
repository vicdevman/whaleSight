import { redis } from "../db/cache.js";
import { setState } from "../lib/conversationalState.js";

export const handleTrack = async (bot, msg) => {
    const chatId = msg.chat.id;

    const buttons = {
      inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_tracking" }]],
    };

    bot.sendMessage(
      chatId,
      "Send the Solana wallet address you want to track",
      { reply_markup: buttons }
    );

    await setState(chatId, {
      step: 'AWAITING_ADDRESS',
      type: 'solana'
    })
};
