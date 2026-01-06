export default function registerMessageHandler(bot) {
  const commands = ["start", "help", "track", "list", "remove", "scan"];

  const messages = []

  bot.on("message", (msg) => {


messages.push()
    bot.deleteMessage(msg.chat.id, msg.message_id)
    if (msg && msg.text[0] === '/') {
      const command = msg.text.split("/");
      console.log(command[1]);

      if (!commands.includes(command[1])) {
        bot.sendMessage(
          msg.chat.id,
          "That command doesn't exist 😅 Type /help to see what I can do."
        );
      }

      return;
    }


    bot.sendMessage(msg.chat.id, `received message! you said ${msg.text}`);
    console.log(msg);
  });
}

