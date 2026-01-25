export default function registerScan(bot) {
  bot.onText(/\/scan/, (msg) => {

    bot.sendMessage(msg.chat.id, 'Scan gives you insights about a wallet PNL, coming soon... ')
  });
}