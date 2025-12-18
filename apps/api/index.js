import express from "express"
import dotenv from "dotenv"
import TelegramBot from "node-telegram-bot-api"

const app = express();
dotenv.config()

app.use(express.json())

const PORT = process.env.PORT;
const token = process.env.TELEGRAM_BOT_TOKEN
const serverUrl = process.env.SERVER_URL

const bot = new TelegramBot(token, {polling: false});

bot.setWebHook(`${serverUrl}/bot`);



app.get('/', (req, res) => {
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
    `)
});


app.post(`/bot`, (req, res) => {
// console.log(req.body)
  bot.processUpdate(req.body); 
  res.sendStatus(200);
});

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔍 View Details', callback_data: `view_7y9vhiern9vh89erubv876` },
        { text: '📋 Copy Address', callback_data: `copy_0xubuybvrsivbyier` }
      ],
      [
        { text: '🔔 Track Token', callback_data: `track_token_eocuhin9s8yf79hdrs78gv8r` }
      ]
    ]
  };

  bot.on('callback_query', async (query) => {
  const [action, ...params] = query.data.split('_');
    bot.answerCallbackQuery(query.id);
  switch (action) {
    case 'view':
      
        bot.sendMessage(query.message.chat.id, `button clicked is view_${params}`)
      break;
    case 'copy':
         bot.sendMessage(query.message.chat.id, `button clicked is copy_...`)

      break;
    case 'track':
         bot.sendMessage(query.message.chat.id, `button clicked is track_...`)

      break;
  }
});

bot.on('message', (msg) => {
   bot.sendMessage(msg.chat.id, `recieved message! you /said ${msg.text}`, {reply_markup: keyboard})
   console.log(msg)
})

app.listen(PORT, () => {
    console.log(`Bot running on http://127.0.0.1:${PORT}`)
})