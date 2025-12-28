export default function registerStart(bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Tracking Bot active!");
  });
}