export default function registerScan(bot) {
  bot.onText(/\/scan/, (msg) => {

    bot.sendMessage(msg.chat.id, 'this is to scan a wallet ')
  });
}