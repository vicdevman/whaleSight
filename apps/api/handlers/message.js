import { getState, setState, clearState } from "../lib/conversationalState.js";
import isValidSolanaAddress from "../utils/isValidSolanaAddress.js";
import db from "../db/pool.js";

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
      
      try {
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
      } catch (error) {
        console.error("❌ Database error checking tracked wallets:", error);
        await bot.sendMessage(
          chatId,
          "⚠️ Connection error. Please try again in a moment.",
          {reply_markup: buttons}
        );
      }
      return;
    }

    if (state && state.step == "AWAITING_LABEL") {
      try {
        await db`INSERT INTO tracked_wallets(user_chat_id, wallet_address, chain, label) VALUES (${chatId}, ${state?.address}, ${"solana"}, ${msg.text})`;
        
        await bot.sendMessage(
          chatId,
          `Wallet tracked successfully! use /list to see all tracked wallets and /remove to remove a tracked wallet. enjoy!`
        );
        console.log(state?.address, msg.text);

        await clearState(chatId);
      } catch (error) {
        console.error("❌ Database error inserting tracked wallet:", error);
        await bot.sendMessage(
          chatId,
          "⚠️ Connection error while saving wallet. Please try again."
        );
      }
      return;
    }

    await bot.deleteMessage(chatId, msg.message_id);
    if (msg && msg.text[0] === "/") {
      const command = msg.text.split("/");
      console.log(command[1]);

      if (!commands.includes(command[1].split(" ")[0])) {
        await bot.sendMessage(
          chatId,
          "That command doesn't exist 😅\nUse /help to see what I can do."
        );
      }

      return;
    }

    await bot.sendMessage(chatId, `Hi, what would you like to do? \n\nUse /help to see what I can do.`);
    console.log(msg);
  });
}
