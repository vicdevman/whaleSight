export default function registerTrack(bot) {
  bot.onText(/\/track/, (msg) => {
    bot.sendMessage(msg.chat.id, "this is when you want to track a wallet");
  });
}