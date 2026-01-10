import { clearState } from "../lib/conversationalState.js";

export default function registerCallbackQuery(bot) {
  bot.on("callback_query", async (query) => {
    const choice = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    await bot.answerCallbackQuery(query.id);

    switch (choice) {
      case "cancel_tracking":
        await bot.deleteMessage(chatId, messageId);
        await clearState(chatId);
        break;
      default:
        await bot.editMessageText("Unknown option", {
          chat_id: chatId,
          message_id: messageId,
        });
    }
  });
}
