import db from "../db/pool.js";
import rugCheck from "../services/rugcheck.js";

export default async function sendTransaction(bot, data) {
  const { wallet: address, action, tokenAmount, solAmount, signature, tokenMint } = data;

  // Fetch unique users tracking this wallet to avoid duplicate notifications
  const userResults = await db`
    SELECT DISTINCT ON (user_chat_id) user_chat_id AS chat_id, label 
    FROM tracked_wallets 
    WHERE wallet_address = ${address}
  `;

  if (userResults.length === 0) {
    return;
  }

  const rugCheckData = await rugCheck(tokenMint);

  // Determine emoji based on action
  let actionEmoji = "🟢";
  let actionText = "Buy";

  const actionLower = action.toLowerCase();

  if (actionLower.includes("sell")) {
    actionEmoji = "🔴";
    actionText = "Sell";
  } else if (!actionLower.includes("buy") && solAmount > 0) {
    actionEmoji = "🔴";
    actionText = "Sell";
  }

  // Rugcheck extended logic
  const tokenName = rugCheckData.metadata?.name || "Unknown Token";
  const tokenSymbol = rugCheckData.metadata?.symbol || "";
  const tokenDisplay = tokenSymbol
    ? `${tokenName} (${tokenSymbol})`
    : tokenName;

  const score = rugCheckData.score || 0;
  let riskLevel = "🟢 Safe";
  if (score > 30000) riskLevel = "🛑 Danger - DYOR";
  else if (score > 15000) riskLevel = "🔴 High Risk - DYOR";
  else if (score > 5000) riskLevel = "🟡 Caution - DYOR";

  // Critical Checks
  const mintStatus = !rugCheckData.mintAuthority ? "✅" : "❌";
  const freezeStatus = !rugCheckData.freezeAuthority ? "✅" : "❌";

  const lpPct = rugCheckData.lpLockedPct || 0;
  let lpStatus = "⚠️";
  if (lpPct > 80) lpStatus = "🟢";
  else if (lpPct < 50) lpStatus = "🔴";

  const liquidity = rugCheckData.totalLiquidity
    ? `$${Math.floor(rugCheckData.totalLiquidity).toLocaleString()}`
    : "Unknown";
  const mcap = rugCheckData.marketCap
    ? `$${Math.floor(rugCheckData.marketCap).toLocaleString()}`
    : "Unknown";

  const rugcheckSummary =
    `*Token:* ${tokenDisplay}\n` +
    `${tokenMint}\n` +
    `*Risk:* ${riskLevel} (${score})\n` +
    `*Mint:* ${mintStatus} | *Freeze:* ${freezeStatus} | *LP:* ${lpStatus} ${lpPct.toFixed(1)}%\n` +
    `*Liq:* ${liquidity} | *MCap:* ${mcap}`;

  const messageText = (label) =>
    `${actionEmoji} *${actionText} - ${label}* ${actionEmoji}\n` +
    `*Value:* ${solAmount.toFixed(4)} SOL (${tokenAmount.toLocaleString()} ${tokenSymbol})\n\n` +
    `${rugcheckSummary}\n\n` +
    `🔗 [View on Solscan](https://solscan.io/tx/${signature})`;

  const options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Refresh", callback_data: `refresh_${tokenMint}` },
          { text: "Dexscreener", url: `https://dexscreener.com/solana/${tokenMint}` },
        ],
        [
          { text: "Risks", callback_data: `risks_${tokenMint}` },
          { text: "Top Holders", callback_data: `holders_${tokenMint}` },
        ],
      ],
    },
  };

  if (userResults.length == 1) {
    console.log(`Single user tracking wallet: ${address}`);
    console.log(`address: ------------------------------`, address);
    console.log('rugcheck: ------------------------------', rugCheckData);

    const user = userResults[0];
    try {
      await bot.sendMessage(user.chat_id, messageText(user.label), options);
    } catch (error) {
      console.error(`Failed to notify ${user.chat_id}:`, error.message);
    }
    return;
  }

  console.log("users:", userResults);

  for (const user of userResults) {
    try {
      await bot.sendMessage(user.chat_id, messageText(user.label), options);
    } catch (error) {
      if (error.message.includes("bot was blocked by the user")) {
        // await db`DELETE FROM tracked_wallets WHERE user_chat_id = ${user.chat_id}`;
      } else {
        console.error(`Failed to notify ${user.chat_id}:`, error.message);
      }
    }
  }
}
