import db from "../db/pool.js";

export default async function sendTransaction(bot, data) {

const address = data.wallet;


const userResults = await db`SELECT user_chat_id, label AS chat_id FROM tracked_wallets WHERE wallet_address=${address}`

if (userResults.length === 0) {
  console.log(`No users tracking wallet: ${address}`);
  return;
}


userResults.map(async (user) =>
await bot.sendMessage(user.chat_id, `🚨 New transaction detected from wallet ${user.label}: ${address}`)
)
}