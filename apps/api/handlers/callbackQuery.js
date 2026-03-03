import { clearState } from "../lib/conversationalState.js";
import rugCheck from "../services/rugcheck.js";
import db from "../db/pool.js";

export default function registerCallbackQuery(bot) {
  bot.on("callback_query", async (query) => {
    const choice = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Handle dynamic callbacks (e.g. risks_ADDRESS, holders_ADDRESS)
    if (
      choice.startsWith("risks_") ||
      choice.startsWith("holders_") ||
      choice.startsWith("refresh") ||
      choice.startsWith("track_from_scan")
    ) {
      await bot.answerCallbackQuery(query.id, { text: "Fetching data..." });

      const [action, address] = choice.split("_");
      const data = await rugCheck(address);

      if (!data) {
        await bot.sendMessage(
          chatId,
          "⚠️ Failed to fetch data. Please try again.",
        );
        return;
      }

      if (action === "risks") {
        const risksList =
          data.risks.length > 0
            ? data.risks
                .map((r) => `⚠️ *${r.name}* (${r.level})\n${r.description}`)
                .join("\n\n")
            : "✅ No specific risks detected.";

        const text = `🛡️ *Security Report for* \`${address}\`\n\n${risksList}`;
        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
      } else if (action === "holders") {
        const holdersList =
          data.topHolders.length > 0
            ? data.topHolders
                .map(
                  (h, i) =>
                    `${i + 1}. \`${h.address.slice(0, 4)}...${h.address.slice(-4)}\` - ${h.pct.toFixed(2)}% ${h.insider ? "(Insider)" : ""}`,
                )
                .join("\n")
            : "No holder info available.";

        const text = `👥 *Top Holders for* \`${address}\`\n\n${holdersList}\n\n*Total Holders:* ${data.totalHolders}`;
        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
      } else if (action === "refresh") {
        const tokenName = data.metadata?.name || "Unknown Token";
        const tokenSymbol = data.metadata?.symbol || "";
        const tokenDisplay = tokenSymbol
          ? `${tokenName} ($${tokenSymbol})`
          : tokenName;

        const score = data.score || 0;
        let riskLevel = "🟢 Safe";
        if (score > 30000) riskLevel = "🛑 Danger";
        else if (score > 15000) riskLevel = "🔴 High Risk";
        else if (score > 5000) riskLevel = "🟡 Caution";

        // Critical Checks
        const mintStatus = !data.mintAuthority ? "✅" : "❌";
        const freezeStatus = !data.freezeAuthority ? "✅" : "❌";

        const lpPct = data.lpLockedPct || 0;
        let lpStatus = "⚠️";
        if (lpPct > 80) lpStatus = "🟢";
        else if (lpPct < 50) lpStatus = "🔴";

        const liquidity = data.totalLiquidity
          ? `$${Math.floor(data.totalLiquidity).toLocaleString()}`
          : "Unknown";
        const mcap = data.marketCap
          ? `$${Math.floor(data.marketCap).toLocaleString()}`
          : "Unknown";

        const text =
          `🔄 *Updated Stats for* \`${address}\`\n\n` +
          `*Token:* ${tokenDisplay}\n` +
          `*Risk:* ${riskLevel} (${score})\n` +
          `*Mint:* ${mintStatus} | *Freeze:* ${freezeStatus} | *LP:* ${lpStatus} ${lpPct.toFixed(1)}%\n` +
          `*Liq:* ${liquidity} | *MCap:* ${mcap}\n` +
          `*Price:* $${data.price?.toFixed(6) || 0}`;

        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
      } else if (choice.startsWith("refreshScan:")) {
        const address = choice.split(":")[1];
        await bot.answerCallbackQuery(query.id, { text: "Refreshing scan..." });
        const { performScan } = await import("../utils/scanFormatter.js");
        await performScan(bot, chatId, address);
      } else if (choice.startsWith("track_from_scan:")) {
        const address = choice.split(":")[1];
        await bot.answerCallbackQuery(query.id);

        const trackedWallets =
          await db`SELECT * from tracked_wallets WHERE user_chat_id=${chatId}`;

        const checkIfAddressExist = trackedWallets.find(
          (wallet) => wallet.wallet_address == address,
        );

        if (checkIfAddressExist) {
          await bot.sendMessage(
            chatId,
            `solana address already exist and is labelled as ${checkIfAddressExist.label}, please enter a different wallet address`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Cancel", callback_data: "cancel_tracking" }],
                ],
              },
            },
          );

          return;
        }

        const { setState } = await import("../lib/conversationalState.js");

        await bot.sendMessage(
          chatId,
          `Setting up tracking for <code>${address}</code>. Please send a label for this wallet.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "Cancel", callback_data: "cancel_tracking" }],
              ],
            },
          },
        );
        await setState(chatId, {
          step: "AWAITING_LABEL",
          address: address,
        });
      } else if (choice.startsWith("perform_scan:")) {
        const address = choice.split(":")[1];
        await bot.answerCallbackQuery(query.id);
        const { performScan } = await import("../utils/scanFormatter.js");
        await performScan(bot, chatId, address);
      }
      return;
    }

    await bot.answerCallbackQuery(query.id);

    switch (choice) {
      case "cancel_tracking":
      case "cancel_scan":
        await bot.deleteMessage(chatId, messageId);
        await clearState(chatId);
        break;
      default:
        await bot.editMessageText("Unknown option", {
          chat_id: chatId,
          message_id: messageId,
        });
    }
  });
}
