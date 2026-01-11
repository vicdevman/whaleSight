import { getState, setState, clearState } from "../lib/conversationalState.js";
import isValidSolanaAddress from "../utils/isValidSolanaAddress.js";
import db from "../db/pool.js";
import { commandHandlers } from "../commands/index.js";

export default function registerMessageHandler(bot) {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // Command handling
    if (msg.text && msg.text[0] == "/") {
        const [cmd] = msg.text.split(" ");
        if (commandHandlers[cmd]) {
            console.log(`Executing command: ${cmd}`);
            await commandHandlers[cmd](bot, msg);
            return;
        } else {
             await bot.sendMessage(
                chatId,
                "That command doesn't exist 😅\n Use /help to see what I can do."
              );
              return;
        }
    }

    const state = await getState(chatId);
    const buttons = {
      inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_tracking" }]],
    };

    if (state && state.step == "AWAITING_ADDRESS") {
      const isValid = await isValidSolanaAddress(msg.text);
      const trackedWallets = await db`SELECT * from tracked_wallets WHERE user_chat_id=${chatId}`;

      const checkIfAddressExist = trackedWallets.find(wallet => wallet.wallet_address == msg.text)

      if (checkIfAddressExist) {
         await bot.sendMessage(
          chatId,
          `solana address already exist and is labelled as ${checkIfAddressExist.label}, please enter a different wallet address`,
          {reply_markup: buttons}
        );
      } else if (isValid) {
        await bot.sendMessage(
          chatId,
          `Great! now please send a label, nickname to call the address`
        );

        await setState(chatId, {
          step: "AWAITING_LABEL",
          address: msg.text,
        });
      } else {
        await bot.sendMessage(
          chatId,
          `Invalid Solana address, please send a valid solana address`,
          {reply_markup: buttons}
        );
      }
      return;
    }

    if (state && state.step == "AWAITING_LABEL") {
      await bot.sendMessage(
        chatId,
        `Wallet tracked successfully! use /list to see all tracked wallets and /remove to remove a tracked wallet. enjoy!`
      );
      console.log(state?.address, msg.text);

      await db`INSERT INTO tracked_wallets(user_chat_id, wallet_address, chain, label) VALUES (${chatId}, ${state?.address}, ${"solana"}, ${msg.text})`;

      await clearState(chatId);
      return;
    }

    await bot.sendMessage(chatId, `Hi, what would you like to do? \n\n Use /help to see what I can do.`);
    console.log(msg);
  });
}
