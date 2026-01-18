import { clearState } from "../lib/conversationalState.js";
import rugCheck from "../services/rugcheck.js";

export default function registerCallbackQuery(bot) {
  bot.on("callback_query", async (query) => {
    const choice = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Handle dynamic callbacks (e.g. risks_ADDRESS, holders_ADDRESS)
    if (
      choice.startsWith("risks_") ||
      choice.startsWith("holders_") ||
      choice.startsWith("refresh_")
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
      }
      return;
    }

    await bot.answerCallbackQuery(query.id);

    switch (choice) {
      case "cancel_tracking":
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
