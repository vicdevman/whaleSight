export default function registerHelp(bot) {
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "this will list all the commands");
  });
}