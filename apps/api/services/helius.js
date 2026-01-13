import "dotenv/config";
import db from "../db/pool.js";

const heliusApiKey = process.env.HELIUS_API_KEY;
const serverUrl = process.env.SERVER_URL;
const heliusUrl = "https://api-mainnet.helius-rpc.com/v0/webhooks";

export async function createWebhook() {
  const webhookData = {
    webhookURL: `${serverUrl}/transactions`,
    transactionTypes: ["SWAP"],
    accountAddresses: ["9PejEmViKHgUkVFWN57cNEZnFS4Qo6SzsLj5UPAXfDTF"],
    webhookType: "enhanced",
    txnStatus: "success",
    encoding: "jsonParsed",
  };

  try {
    const response = await fetch(`${heliusUrl}?api-key=${heliusApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const webhook = await response.json();
    console.log("Webhook created:", webhook);
    return webhook;
  } catch (error) {
    console.error("Error creating webhook:", error);
  }
}

export async function updateWebhookAddresses(walletAddresses) {
  const query =
    await db`SELECT webhook_id FROM webhooks WHERE webhook_name = 'helius'`;
  const webhookId = query[0].webhook_id;

  const updateData = {
    webhookURL: `${serverUrl}/transactions`,
    transactionTypes: ["SWAP"],
    accountAddresses: walletAddresses,
    webhookType: "enhanced",
    txnStatus: "success",
    encoding: "jsonParsed",
  };

  try {
    const response = await fetch(
      `${heliusUrl}/${webhookId}?api-key=${heliusApiKey}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    // Log the response for debugging
    const responseText = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${responseText}`
      );
    }

    const updatedWebhook = JSON.parse(responseText);
    console.log("Webhook updated:", updatedWebhook);
    return updatedWebhook;
  } catch (error) {
    console.error("Error updating webhook:", error);
    throw error; // Re-throw to handle upstream
  }
}

export async function getWebhook(webhookId) {
  const response = await fetch(
    `${heliusUrl}/${webhookId}?api-key=${heliusApiKey}`
  );
  return await response.json();
}
