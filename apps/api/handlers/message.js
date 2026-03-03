import { getState, setState, clearState } from "../lib/conversationalState.js";
import isValidSolanaAddress from "../utils/isValidSolanaAddress.js";
import db from "../db/pool.js";
import { updateWebhookAddresses } from "../services/helius.js";

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
        const trackedWallets =
          await db`SELECT * from tracked_wallets WHERE user_chat_id=${chatId}`;

        const checkIfAddressExist = trackedWallets.find(
          (wallet) => wallet.wallet_address == msg.text,
        );

        if (checkIfAddressExist) {
          await bot.sendMessage(
            chatId,
            `solana address already exist and is labelled as ${checkIfAddressExist.label}, please enter a different wallet address`,
            { reply_markup: buttons },
          );
        } else if (isValid) {
          await bot.sendMessage(
            chatId,
            `Great! now please send a label, nickname to call the address`,
          );

          await setState(chatId, {
            step: "AWAITING_LABEL",
            address: msg.text,
          });
        } else {
          await bot.sendMessage(
            chatId,
            `Invalid Solana address, please send a valid solana address`,
            { reply_markup: buttons },
          );
        }
      } catch (error) {
        console.error("❌ Database error checking tracked wallets:", error);
        await bot.sendMessage(
          chatId,
          "🔄 Having trouble connecting. Please start over:\n/track",
        );
      }
      return;
    }

    if (state && state.step == "AWAITING_LABEL") {
      try {
        await db`INSERT INTO tracked_wallets(user_chat_id, wallet_address, chain, label) VALUES (${chatId}, ${
          state?.address
        }, ${"solana"}, ${msg.text})`;

        await bot.sendMessage(
          chatId,
          `Wallet tracked successfully! use /list to see all tracked wallets and /remove to remove a tracked wallet. enjoy!`,
        );
        console.log(state?.address, msg.text);

        await clearState(chatId);
        // 5. Get all unique tracked wallets to update webhook
        const remainingWallets =
          await db`SELECT DISTINCT wallet_address FROM tracked_wallets`;

        const walletAddresses = remainingWallets.map(
          (row) => row.wallet_address,
        );
        console.log("Remaining wallets for webhook update:", walletAddresses);

        if (walletAddresses.length > 0) {
          await updateWebhookAddresses(walletAddresses);
        } else {
          console.log("No wallets remaining, webhook update skipped");
        }
      } catch (error) {
        console.error("❌ Database error inserting tracked wallet:", error);
        await bot.sendMessage(
          chatId,
          "🔄 Having trouble saving your wallet. Please start over:\n/track",
        );
      }
      return;
    }

    await bot.deleteMessage(chatId, msg.message_id);
    if (state && state.step == "AWAITING_SCAN_ADDRESS") {
      const isValid = await isValidSolanaAddress(msg.text);

      if (isValid) {
        const address = msg.text.trim();

        await clearState(chatId);
        const { performScan } = await import("../utils/scanFormatter.js");
        return performScan(bot, chatId, address);
      } else {
        const buttons = {
          inline_keyboard: [[{ text: "Cancel", callback_data: "cancel_scan" }]],
        };
        await bot.sendMessage(
          chatId,
          `❌ Invalid Solana address, please send a valid Solana address or /cancel`,
          { reply_markup: buttons },
        );
      }
      return;
    }

    if (msg && msg.text[0] === "/") {
      const command = msg.text.split("/");
      console.log(command[1]);

      if (!commands.includes(command[1].split(" ")[0])) {
        await bot.sendMessage(
          chatId,
          "That command doesn't exist 😅\nUse /help to see what I can do.",
        );
      }

      return;
    }

    await bot.sendMessage(
      chatId,
      `Hi, what would you like to do? \n\nUse /help to see what I can do.`,
    );
    console.log(msg);
  });
}
