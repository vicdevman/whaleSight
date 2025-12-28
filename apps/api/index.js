import express from "express";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { registerAllCommands } from './commands/index.js';
import { registerAllHandlers } from './handlers/index.js'

dotenv.config();
const app = express();

//middlewares
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT;
const serverUrl = process.env.SERVER_URL;

//bot setup
const bot = new TelegramBot(token, { polling: false });
bot.setWebHook(`${serverUrl}/bot`);
bot.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Get help' },
  { command: 'track', description: 'track a new wallet' },
])


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

app.listen(PORT, () => {
  console.log(`Bot running on http://127.0.0.1:${PORT}`);
});
