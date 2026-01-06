export default function registerCallbackQuery(bot) {
  bot.on("callback_query", async (query) => {
    const choice = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    await bot.answerCallbackQuery(query.id);

    switch (choice) {
      case "solana_wallet":
        await bot.editMessageText("What do you want to track? (WE ONLY SUPPORT SOLANA)", {
          chat_id: chatId,
          message_id: messageId,
        });
        await bot.sendMessage(chatId, "Send the the solana wallet adress of the wallet you want to track")
        break;
      case "cancel":
        await bot.deleteMessage(chatId, messageId);
        break;
      default:
        await bot.editMessageText("Unknown option", {
          
          chat_id: chatId,
          message_id: messageId,
        });

    }
  });
}
