export default function registerTrack(bot) {
  bot.onText(/\/track/, (msg) => {
    const buttons = {
      inline_keyboard: [
        [
          { text: "Solana Wallet", callback_data: "solana_wallet" },
          { text: "Cancel", callback_data: "cancel" },
        ],
      ],
    };

    bot.sendMessage(
      msg.chat.id,
      "What do you want to track? (WE ONLY SUPPORT SOLANA)",
      { reply_markup: buttons }
    );
  });
}
