import express from "express";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import cors from "cors";
import { registerAllCommands } from "./commands/index.js";
import { registerAllHandlers } from "./handlers/index.js";
import { createWebhook, updateWebhookAddresses } from "./services/helius.js";
import db from "./db/pool.js";
import parseHeliusSwap from "./utils/parseTransactionData.js";
import { testParser } from "./utils/parseTransactionData.js";
import sendTransaction from "./handlers/sendTransaction.js";
import rugCheck from "./services/rugcheck.js";
import isValidSolanaAddress from "./utils/isValidSolanaAddress.js";
import axios from "axios";

dotenv.config();
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT;
const serverUrl = process.env.SERVER_URL;

//bot setup
export const bot = new TelegramBot(token, { polling: false });

const processedSignaturesCache = new Map();
const SIGNATURE_CACHE_TTL = 2 * 60 * 1000;

function cleanupSignatureCache() {
  const now = Date.now();
  for (const [signature, timestamp] of processedSignaturesCache.entries()) {
    if (now - timestamp > SIGNATURE_CACHE_TTL) {
      processedSignaturesCache.delete(signature);
    }
  }
  console.log(`Signature cache size: ${processedSignaturesCache.size}`);
}

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
      { command: "remove", description: "Remove a wallet from tracked list" },
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
// }) // frontend I'll modify this to work perfectly for the frontend part (miniapp)

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

app.post("/transactions", async (req, res) => {
  const data = JSON.stringify(req.body, null, 2);
  // console.log("Webhook payload:", data);

  // Clean up old signatures from cache
  cleanupSignatureCache();

  // Get all tracked wallets
  const allAdresses = await db`SELECT wallet_address FROM tracked_wallets`;
  const formattedAdresses = allAdresses.map((row) => row.wallet_address);

  let processedCount = 0;
  let skippedCount = 0;

  // Process all transactions in the webhook payload
  const transactions = Array.isArray(req.body) ? req.body : [req.body];

  for (const tx of transactions) {
    const parsed = parseHeliusSwap(tx, formattedAdresses);

    if (!parsed) {
      console.log("Skipping non-swap or irrelevant transaction");
      continue;
    }

    // Check if we've already processed this transaction signature (in cache)
    if (processedSignaturesCache.has(parsed.signature)) {
      console.log(
        `Duplicate transaction detected (cached): ${parsed.signature}`,
      );
      skippedCount++;
      continue;
    }

    // Mark as processed with current timestamp
    processedSignaturesCache.set(parsed.signature, Date.now());

    console.log(
      "Parsed transaction: -----------------------------------------------------------",
      parsed,
    );

    // Send notification
    await sendTransaction(bot, parsed);
    processedCount++;
  }

  console.log(
    `Processed ${processedCount} unique, skipped ${skippedCount} duplicates from ${transactions.length} total`,
  );
  res.send(
    `Processed ${processedCount} unique transaction(s), skipped ${skippedCount} duplicates`,
  );
});

app.get("/rugcheck", async (req, res) => {
  const { address } = req.query;
  const data = await rugCheck(address);
  console.log(data);
  res.send(data);
});

app.post("/api/wallets", async (req, res) => {
  const { telegramUser } = req.body;
  console.log("incoming");
  console.log("telegram user:", telegramUser);

  if (!telegramUser || !telegramUser.id) {
    return res.status(400).json({ error: "User not found or invalid" });
  }

  try {
    const userwallets =
      await db`SELECT * FROM tracked_wallets WHERE user_chat_id = ${telegramUser.id}`;
    res.json(userwallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post(`/api/addwallet`, async (req, res) => {
  const { telegramUser, address, label } = req.body;
  try {
    if (!telegramUser) {
      throw new Error("Invalid telegram user");
    }

    const isValid = await isValidSolanaAddress(address);
    // console.log(isValid);
    if (!isValid) {
      throw new Error("Invalid Solana addresss");
    }

    await db`INSERT INTO tracked_wallets(user_chat_id, wallet_address, chain, label) VALUES (${telegramUser.id}, ${address}, ${"solana"}, ${label})`;

    res.status(200).json({ msg: "wallet added successfully!" });

    // Background tasks
    bot
      .sendMessage(
        telegramUser.id,
        `Wallet tracked successfully! use /list to see all tracked wallets and /remove to remove a tracked wallet. enjoy!`,
      )
      .catch(console.error);

    // Update webhook addresses in background
    (async () => {
      try {
        const remainingWallets =
          await db`SELECT DISTINCT wallet_address FROM tracked_wallets`;
        const walletAddresses = remainingWallets.map(
          (row) => row.wallet_address,
        );
        console.log("Remaining wallets for webhook update:", walletAddresses);

        if (walletAddresses.length > 0) {
          await updateWebhookAddresses(walletAddresses);
        } else {
          console.log("No wallets remaining, webhook update skipped");
        }
      } catch (webhookErr) {
        console.error("Error updating webhooks in background:", webhookErr);
      }
    })();
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: err.message });
  }
});

app.delete("/api/deletewallet/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db`
        DELETE FROM tracked_wallets
        WHERE id = ${id}
      `;

    res.status(200).json({ msg: "Wallet deleted Successfully!" });

    // Update webhook background
    (async () => {
      try {
        const remainingWallets =
          await db`SELECT DISTINCT wallet_address FROM tracked_wallets`;
        const walletAddresses = remainingWallets.map(
          (row) => row.wallet_address,
        );
        console.log("Remaining wallets for webhook update:", walletAddresses);

        if (walletAddresses.length > 0) {
          await updateWebhookAddresses(walletAddresses);
        } else {
          console.log("No wallets remaining, webhook update skipped");
        }
      } catch (webhookErr) {
        console.error("Error updating webhooks in background:", webhookErr);
      }
    })();
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: err.message });
  }
});

import { getWalletPnL } from "./services/birdeye.js";

app.post("/api/checkaddress", async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const isValid = await isValidSolanaAddress(address);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid Solana address!" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Validation failed" });
  }
});

app.get("/api/scan", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  const isValid = await isValidSolanaAddress(address);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid Solana address!" });
  }

  try {
    const data = await getWalletPnL(address);
    if (data) {
      res.json({ data });
      console.log("data------", JSON.stringify(data, null, 2));
    } else {
      res.status(400).json({ error: "Failed to fetch data from Birdeye" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error while fetching PnL data" });
  }
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
