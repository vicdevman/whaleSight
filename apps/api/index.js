import express from "express";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { registerAllCommands } from "./commands/index.js";
import { registerAllHandlers } from "./handlers/index.js";
import { createWebhook, updateWebhookAddresses } from "./services/helius.js";
import db from "./db/pool.js";
import parseHeliusSwap, {
  parseHeliusBatch,
} from "./utils/parseTransactionData.js";
import { testParser } from "./utils/parseTransactionData.js";
import sendTransaction from "./handlers/sendTransaction.js";

dotenv.config();
const app = express();

//middlewares
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT;
const serverUrl = process.env.SERVER_URL;

//bot setup
export const bot = new TelegramBot(token, { polling: false });

app.get("/setup", async (req, res) => {
  try {
    await bot.setWebHook(`${serverUrl}/bot`);
    await bot.setMyCommands([
      { command: "help", description: "Get all commands" },
      {
        command: "track",
        description:
          "Monitor a wallet and receive alerts when new transactions occur",
      },
      {
        command: "scan",
        description:
          "Analyze any wallet and get a full breakdown of its activity, token holdings, and risk insights",
      },
      { command: "list", description: "Get all tracked wallets" },
      // { command: "remove [WALLET_ADDRESS]", description: "Remove a wallet from tracked list" },
    ]);
    res.send("Webhook and commands set successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
    res.status(500).send(error.message);
  }
});

app.get("/helius/setup", async (req, res) => {
  await db`DELETE FROM webhooks WHERE webhook_name = 'helius'`;
  const response = await createWebhook();

  if (!response) {
    res.status(500).send("Failed to create webhook");
    return;
  }

  await db`INSERT INTO webhooks (webhook_name, webhook_id, webhook_project, webhook_wallet) VALUES ('helius', ${response.webhookID}, ${response.project}, ${response.wallet})`;
  res.send("Webhook created successfully!");
});

// app.get("/helius/update", async (req, res) => {
//   const newAddresses = await db`SELECT wallet_address FROM tracked_wallets`;
//   const walletAddresses = newAddresses.map((row) => row.wallet_address);
//   console.log(walletAddresses);
//   const response = await updateWebhookAddresses(walletAddresses);
//   res.send("Webhook updated successfully!");
// }) // frontend

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
app.post("/bot", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Transaction signature cache to prevent duplicates
// Stores signatures with timestamps for automatic cleanup
const processedTransactions = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [signature, timestamp] of processedTransactions.entries()) {
    if (now - timestamp > CACHE_TTL) {
      processedTransactions.delete(signature);
    }
  }
}, 60 * 1000); // Run cleanup every minute

app.post("/transactions", async (req, res) => {
  try {
    // Log the incoming webhook payload
    const data = JSON.stringify(req.body, null, 2);
    console.log("Webhook received:", data);

    // Helius sends an array of transactions
    const transactions = Array.isArray(req.body) ? req.body : [req.body];
    console.log(`Processing ${transactions.length} transaction(s)`);

    // Get all tracked wallet addresses
    const allAddresses = await db`SELECT wallet_address FROM tracked_wallets`;
    const formattedAddresses = allAddresses.map((row) => row.wallet_address);

    // Process each transaction
    for (const tx of transactions) {
      // Parse the transaction
      const parsed = parseHeliusSwap(tx, formattedAddresses);

      if (!parsed) {
        console.log(
          "Transaction not relevant (not a swap or no tracked wallet)"
        );
        continue;
      }

      // Check if we've already processed this transaction
      if (processedTransactions.has(parsed.signature)) {
        console.log(
          `Duplicate transaction detected: ${parsed.signature.slice(
            0,
            8
          )}... (skipping)`
        );
        continue;
      }

      // Mark this transaction as processed
      processedTransactions.set(parsed.signature, Date.now());
      console.log(
        `Processing new transaction: ${parsed.signature.slice(0, 8)}...`
      );
      console.log("Parsed data:", parsed);

      // Send notification
      await sendTransaction(bot, parsed);
    }

    res.send("Transactions processed successfully");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing transactions");
  }
});

app.get("/test", async (req, res) => {
  const data = {
    wallet: "AtTvfVTHvZATiGiAZJmtkPKMcK994GXjiM21kVJyDetr",
    action: "SELL",
    tokenMint: "D6eapUroaE5qkCp3ZbosEJoq946gBA9Zm9GTA2tRpump",
    tokenAmount: 5674.033617,
    solAmount: 0.9,
    solFlow: 0.9,
    pricePerToken: 0.15,
    source: "PUMP_AMM",
    signature:
      "LwuqagXW6wBKKvHdB1RhQn5ejQb983GykQKqA6E5hY4eMfeYep9fsaehRPF9S4ZHuatutWuatMox5h9aTqxuko3",
    timestamp: 1768632645,
    time: "2026-01-17T06:50:45.000Z",
    fee: 0.000005,
    slot: 394048054,
    transactionError: null,
  };

  await sendTransaction(bot, data);
  res.send("Transaction received & Transaction sent");
});

app.listen(PORT, () => {
  console.log(`Bot running on http://127.0.0.1:${PORT}`);
});

// Export the Express app as the default export
export default app;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
