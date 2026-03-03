import { getWalletPnL } from "../services/birdeye.js";

/**
 * Format wallet PnL data into a clean HTML message for Telegram
 * @param {string} address - Wallet address
 * @param {Object} data - Birdeye PnL data
 * @returns {string} - Formatted HTML message
 */
export function formatScanResponse(address, data) {
  const { counts, pnl, unique_tokens, cashflow_usd} = data.summary;

  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  
  // Emojis and formatting for premium look
  const winRate = (counts.win_rate * 100).toFixed(2);
  const totalUsd = pnl.total_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const realizedUsd = pnl.realized_profit_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const unrealizedUsd = pnl.unrealized_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const currentValue = cashflow_usd.current_value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  
  const pnlEmoji = pnl.total_usd >= 0 ? "📈" : "📉";
  const winRateEmoji = counts.win_rate >= 0.5 ? "🎯" : "🎲";

  return `
<b>🔍 Wallet Analysis: <code>${shortAddress}</code></b>

<b>💰 Portfolio Stats</b>
• Current Value: <code>${currentValue}</code>
• Total PnL: <b>${totalUsd}</b> ${pnlEmoji}
• Realized: <code>${realizedUsd}</code>
• Unrealized: <code>${unrealizedUsd}</code>

<b>📊 Trading Stats</b>
• Win Rate: <b>${winRate}%</b> ${winRateEmoji}
• Total Trades: <code>${counts.total_trade}</code>
• Unique Tokens: <code>${unique_tokens}</code>
• Wins: <code>${counts.total_win}</code> | Losses: <code>${counts.total_loss}</code>

<b>📊 Volume Breakdown</b>
• Total Invested: <code>$${cashflow_usd.total_invested.toLocaleString()}</code>
• Total Sold: <code>$${cashflow_usd.total_sold.toLocaleString()}</code>

<i>Powered by WhaleSight & Birdeye</i>
  `.trim();
}

/**
 * Get inline keyboard for scan results
 * @param {string} address - Wallet address
 * @returns {Object} - Telegram inline keyboard
 */
export function getScanButtons(address) {
  return {
    inline_keyboard: [
      [
        { text: "Refresh", callback_data: `refreshScan:${address}` },
        { text: "Track Wallet", callback_data: `track_from_scan:${address}` }
      ],
      [
        { text: "View on Birdeye", url: `https://birdeye.so/profile/${address}?chain=solana` }
      ]
    ]
  };
}``

/**
 * Perform scan and send message
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - User chat ID
 * @param {string} address - Wallet address
 */
export async function performScan(bot, chatId, address) {
  const processingMsg = await bot.sendMessage(chatId, `🔍 Analyzing wallet <code>${address}</code>...`, { parse_mode: "HTML" });
  
  try {
    const data = await getWalletPnL(address);
    const message = formatScanResponse(address, data);
    const buttons = getScanButtons(address);
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
      parse_mode: "HTML",
      reply_markup: buttons
    });
  } catch (error) {
    console.error("Scan error:", error);
    await bot.editMessageText(`❌ Failed to scan wallet. Please ensure the address is correct and try again.`, {
      chat_id: chatId,
      message_id: processingMsg.message_id
    });
  }
}
