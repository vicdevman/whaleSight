export default function registerHelp(bot) {
  bot.onText(/\/help/, (msg) => {
    const commands = [
      { command: "help", description: "Get all commands" },
      { command: "track", description: "Monitor a wallet and receive alerts when new transactions occur" },
      { command: "scan", description: "Analyze any wallet and get a full breakdown of its activity, token holdings, and risk insights" },
      { command: "list", description: "Get all tracked wallets" },
      { command: "remove", description: "Remove a wallet from tracked list" }
    ];

    const helpMessage = commands
      .map(cmd => `<b>/${cmd.command}</b> - ${cmd.description}`)
      .join("\n");

    bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: "HTML" });
  });
}