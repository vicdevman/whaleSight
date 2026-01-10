import express from "express";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { registerAllCommands } from "./commands/index.js";
import { registerAllHandlers } from "./handlers/index.js";
import { redis } from "./db/cache.js";


dotenv.config();
const app = express(); 

//middlewares
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT;
const serverUrl = process.env.SERVER_URL;

//test
// await redis.set('foo', 'bar');
// const result = await redis.get('foo');
// console.log(result)  // >>> bar 

//bot setup
//bot setup
export const bot = new TelegramBot(token, { polling: false });

// Moved webhook/command setup to a specific route to prevent "socket hang up" errors
// causing the function to crash on cold start.
app.get("/setup", async (req, res) => {
  try {
    await bot.setWebHook(`${serverUrl}/bot`);
    await bot.setMyCommands([
      { command: "help", description: "Get all commands" },
      {
        command: "track",
        description: "Monitor a wallet and receive alerts when new transactions occur",
      },
      {
        command: "scan",
        description: "Analyze any wallet and get a full breakdown of its activity, token holdings, and risk insights",
      },
      { command: "list", description: "Get all tracked wallets" },
      { command: "remove", description: "Remove a wallet from tracked list" },
    ]);
    res.send("Webhook and commands set successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
    res.status(500).send(error.message);
  }
});

//events
registerAllCommands(bot);
registerAllHandlers(bot);

//health check route
app.get("/", (req, res) => {
  res.status(200).send(`
        <html>
            <body style='font-family: verdana; background-color: black; justify-content:center; align-items:center; display:flex; height: 80vh;'>
                <div style='max-w:480px; color:white;  background-color: #242424ff; padding:20px; border-radius: 16px'>
                <p>WhaleSight Bot Active, Visit on Telegram!
                <br/>
                <br/>
                <center><a style="background-color: #2196f3;  border-radius: 160px; padding: 10px 20px; color:white; text-decoration:none;" href="https://t.me/WhaleSightBot">Open Bot</a><center></p>
                </div>
            </body>
        </html>
    `);
});

//webhook
app.post(`/bot`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.post('/transaction', (req, res) => {
console.log(JSON.stringify(req.body, null, 2))


})

app.listen(PORT, () => {
  console.log(`Bot running on http://127.0.0.1:${PORT}`);
});

// Export the Express app as the default export
export default app;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
