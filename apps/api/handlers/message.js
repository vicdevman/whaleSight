import { getState, setState, clearState } from "../lib/conversationalState.js";
import isValidSolanaAddress from "../utils/isValidSolanaAddress.js";
import { db } from "../db/pool.js";

export default function registerMessageHandler(bot) {
  const commands = ["start", "help", "track", "list", "remove", "scan"];

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    const state = await getState(chatId);
    const buttons = {
      inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_tracking" }]],
    };

    if (state && state.step == "AWAITING_ADDRESS") {
      const isValid = await isValidSolanaAddress(msg.text);
      const trackedWallets = await db.query(
        "SELECT * from tracked_wallets WHERE user_chat_id=$1",
        [chatId]
      );

      const checkIfAddressExist = trackedWallets.rows.find(wallet => wallet.wallet_address == msg.text)

      if (checkIfAddressExist) {
         bot.sendMessage(
          chatId,
          `solana address already exist and is labelled as ${checkIfAddressExist.label}, please enter a different wallet address`,
          {reply_markup: buttons}
        );
      } else if (isValid) {
        bot.sendMessage(
          chatId,
          `Great! now please send a label, nickname to call the address`
        );

        await setState(chatId, {
          step: "AWAITING_LABEL",
          address: msg.text,
        });
      } else {
        bot.sendMessage(
          chatId,
          `Invalid Solana address, please send a valid solana address`
        );
      }
      return;
    }

    if (state && state.step == "AWAITING_LABEL") {
      bot.sendMessage(
        chatId,
        `Wallet tracked successfully! use /list to see all tracked wallets and /remove to remove a tracked wallet. enjoy!`
      );
      console.log(state?.address, msg.text);

      await db.query(
        "INSERT INTO tracked_wallets(user_chat_id, wallet_address, chain, label) VALUES ($1, $2, $3, $4)",
        [chatId, state?.address, "solana", msg.text]
      );

      await clearState(chatId);
      return;
    }

    bot.deleteMessage(chatId, msg.message_id);
    if (msg && msg.text[0] === "/") {
      const command = msg.text.split("/");
      console.log(command[1]);

      if (!commands.includes(command[1])) {
        bot.sendMessage(
          chatId,
          "That command doesn't exist 😅 Type /help to see what I can do."
        );
      }

      return;
    }

    bot.sendMessage(chatId, `received message! you said ${msg.text}`);
    console.log(msg);
  });
}
