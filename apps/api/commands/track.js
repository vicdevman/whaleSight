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
      "Send the Solana wallet address you want to track"
    );
  });
}
