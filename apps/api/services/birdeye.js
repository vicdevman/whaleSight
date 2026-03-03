import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BIRDEYE_API_KEY =
  process.env.BIRDEYE_API_KEY || "";

/**
 * Fetch wallet PnL summary from Birdeye
 * @param {string} address - Solana wallet address
 * @returns {Promise<Object>} - PnL data
 */
export async function getWalletPnL(address) {
  const options = {
    method: "GET",
    url: `https://public-api.birdeye.so/wallet/v2/pnl/summary?wallet=${address}&duration=all`,
    headers: {
      "x-chain": "solana",
      accept: "application/json",
      "X-API-KEY": BIRDEYE_API_KEY,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data) {
      return response.data.data;
    }
    throw new Error(
      response.data?.message || "Failed to fetch data from Birdeye",
    );
  } catch (error) {
    console.error(`Error fetching Birdeye data for ${address}:`, error.message);
    throw error;
  }
}
