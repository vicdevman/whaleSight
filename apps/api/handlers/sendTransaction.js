import db from "../db/pool.js";

export default async function sendTransaction(bot, data) {

const address = data.wallet;


const userResults = await db`SELECT user_chat_id, label AS chat_id FROM tracked_wallets WHERE wallet_address=${address}`

if (userResults.length === 0) {
  console.log(`No users tracking wallet: ${address}`);
  return;
}

console.log(`Notifying ${userResults.length} users about transaction from wallet: ${address}`);


for (const user of userResults) {
  try {
    await bot.sendMessage(user.chat_id, `🚨 New transaction detected from wallet ${user.label}: ${address}`);
  } catch (error) {
    console.error(`Failed to send message to ${user.chat_id}:`, error.message);
   
  } // I'll remove this user from DB if the error is "Bot was blocked by the user"
}
}