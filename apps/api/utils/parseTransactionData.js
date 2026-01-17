/**
 * Helius Webhook Parser for Solana Token Trading
 * Handles complex swap scenarios with wrapped SOL and multi-hop routes
 */

const WRAPPED_SOL = "So11111111111111111111111111111111111111112";

/**
 * Find the tracked wallet involved in the transaction
 */
function getTrackedWallet(tx, trackedWallets) {
  // Primary: Fee payer is usually the initiator
  if (trackedWallets.includes(tx.feePayer)) {
    return tx.feePayer;
  }

  // Secondary: Check token transfers for tracked wallet
  for (const transfer of tx.tokenTransfers || []) {
    if (trackedWallets.includes(transfer.fromUserAccount)) {
      return transfer.fromUserAccount;
    }
    if (trackedWallets.includes(transfer.toUserAccount)) {
      return transfer.toUserAccount;
    }
  }

  // Tertiary: Check account data for activity
  for (const acc of tx.accountData || []) {
    if (
      trackedWallets.includes(acc.account) &&
      (acc.nativeBalanceChange !== 0 || acc.tokenBalanceChanges?.length > 0)
    ) {
      return acc.account;
    }
  }

  return null;
}

/**
 * Calculate total SOL spent/received (including wrapped SOL flows and stablecoin routes)
 * Returns negative for buys (SOL spent), positive for sells (SOL received)
 */
function calculateSolFlow(tx, wallet) {
  let totalSol = 0;
  
  const STABLECOINS = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  ];

  // 1. Check direct native balance changes (including fees)
  const accountData = tx.accountData?.find(a => a.account === wallet);
  if (accountData?.nativeBalanceChange) {
    totalSol += accountData.nativeBalanceChange / 1e9;
  }

  // 2. Check wrapped SOL transfers
  const wsolTransfers = tx.tokenTransfers?.filter(
    t => t.mint === WRAPPED_SOL
  ) || [];

  for (const transfer of wsolTransfers) {
    if (transfer.fromUserAccount === wallet) {
      // Wallet sent wSOL (buying with SOL)
      totalSol -= transfer.tokenAmount;
    } else if (transfer.toUserAccount === wallet) {
      // Wallet received wSOL (selling for SOL)
      totalSol += transfer.tokenAmount;
    }
  }

  // 3. If SOL flow is near zero, check for stablecoin swaps
  // (User might be buying with USDC/USDT instead of SOL)
  if (Math.abs(totalSol) < 0.001) {
    const stablecoinSent = tx.tokenTransfers?.find(
      t => STABLECOINS.includes(t.mint) && t.fromUserAccount === wallet
    );
    const stablecoinReceived = tx.tokenTransfers?.find(
      t => STABLECOINS.includes(t.mint) && t.toUserAccount === wallet
    );

    if (stablecoinSent) {
      // Approximate: 1 USDC/USDT ≈ some amount of SOL
      // We'll use the stablecoin amount as a proxy (will be converted to SOL equivalent later)
      totalSol = -stablecoinSent.tokenAmount / 100; // Rough estimate
    } else if (stablecoinReceived) {
      totalSol = stablecoinReceived.tokenAmount / 100;
    }
  }

  // Add back the transaction fee (it's included in native balance change)
  if (tx.feePayer === wallet && tx.fee) {
    totalSol += tx.fee / 1e9;
  }

  return totalSol;
}

/**
 * Get the actual token being traded (excludes wrapped SOL and stablecoins)
 */
function getTokenTransfer(tx, wallet) {
  // Common stablecoins to exclude (these are often intermediate tokens)
  const STABLECOINS = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  ];

  const transfers = tx.tokenTransfers?.filter(
    t => t.mint !== WRAPPED_SOL &&
    !STABLECOINS.includes(t.mint) &&
    (t.fromUserAccount === wallet || t.toUserAccount === wallet)
  ) || [];

  if (transfers.length === 0) {
    // If no transfers found, check if user sent stablecoins (could be buying with USDC/USDT)
    const stablecoinSent = tx.tokenTransfers?.find(
      t => STABLECOINS.includes(t.mint) && t.fromUserAccount === wallet
    );
    
    if (stablecoinSent) {
      // User sent stablecoins, find what they received (excluding stables and wSOL)
      const received = tx.tokenTransfers?.find(
        t => !STABLECOINS.includes(t.mint) && 
        t.mint !== WRAPPED_SOL &&
        t.toUserAccount === wallet
      );
      if (received) return received;
    }
    
    return null;
  }

  // Priority 1: Token going TO wallet (likely a buy)
  const receivedToken = transfers.find(t => t.toUserAccount === wallet);
  if (receivedToken) return receivedToken;

  // Priority 2: Token coming FROM wallet (likely a sell)
  const sentToken = transfers.find(t => t.fromUserAccount === wallet);
  if (sentToken) return sentToken;

  // Fallback: first non-wSOL, non-stablecoin transfer
  return transfers[0];
}

/**
 * Determine if this is a BUY or SELL
 */
function classifySwap(solFlow, tokenTransfer, wallet) {
  // If wallet received the token → BUY
  if (tokenTransfer.toUserAccount === wallet) {
    return "BUY";
  }
  // If wallet sent the token → SELL
  if (tokenTransfer.fromUserAccount === wallet) {
    return "SELL";
  }

  // Fallback to SOL flow direction
  // Negative SOL flow = spent SOL = BUY
  // Positive SOL flow = received SOL = SELL
  return solFlow < 0 ? "BUY" : "SELL";
}

/**
 * Extract token metadata from transaction
 */
function getTokenInfo(tokenTransfer, action, wallet) {
  const amount = Math.abs(tokenTransfer.tokenAmount);
  const direction = action === "BUY" ? "received" : "sent";
  
  return {
    mint: tokenTransfer.mint,
    amount,
    direction,
    // Token account addresses for reference
    fromAccount: tokenTransfer.fromTokenAccount,
    toAccount: tokenTransfer.toTokenAccount
  };
}

/**
 * Main parser function
 * @param {Object} tx - Helius transaction object
 * @param {Array<string>} trackedWallets - Array of wallet addresses to track
 * @returns {Object|null} Parsed trade data or null if not relevant
 */
export default function parseHeliusSwap(tx, trackedWallets) {
  // Only process SWAP transactions
  if (!tx || tx.type !== "SWAP") {
    return null;
  }

  // Check if transaction involves a tracked wallet
  const trackedWallet = getTrackedWallet(tx, trackedWallets);
  if (!trackedWallet) {
    return null;
  }

  // Get the token being traded (non-SOL)
  const tokenTransfer = getTokenTransfer(tx, trackedWallet);
  if (!tokenTransfer) {
    return null;
  }

  // Calculate SOL spent/received
  const solFlow = calculateSolFlow(tx, trackedWallet);

  // Classify the action
  const action = classifySwap(solFlow, tokenTransfer, trackedWallet);

  // Get token details
  const tokenInfo = getTokenInfo(tokenTransfer, action, trackedWallet);

  // Calculate price per token
  const pricePerToken = Math.abs(solFlow) / tokenInfo.amount;

  return {
    // Wallet & Action
    wallet: trackedWallet,
    action, // "BUY" or "SELL"

    // Token Details
    tokenMint: tokenInfo.mint,
    tokenAmount: tokenInfo.amount,
    
    // SOL Details
    solAmount: Math.abs(solFlow),
    solFlow, // Raw flow (negative for buys, positive for sells)
    
    // Price
    pricePerToken: Number(pricePerToken.toFixed(9)),
    
    // Transaction Metadata
    source: tx.source, // e.g., "PUMP_AMM", "JUPITER"
    signature: tx.signature,
    timestamp: tx.timestamp,
    time: new Date(tx.timestamp * 1000).toISOString(),
    
    // Additional Context
    fee: tx.fee / 1e9,
    slot: tx.slot,
    
    // Error handling
    transactionError: tx.transactionError
  };
}

/**
 * Batch process multiple transactions
 */
export function parseHeliusBatch(transactions, trackedWallets) {
  return transactions
    .map(tx => parseHeliusSwap(tx, trackedWallets))
    .filter(Boolean) // Remove nulls
    .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
}

/**
 * Example usage and testing
 */
export function testParser() {
  // Test Case 1: Direct SOL → Token swap
  const directSwap = {
    type: "SWAP",
    feePayer: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
    fee: 30000,
    signature: "3ZEQaZ...",
    timestamp: 1768397921,
    slot: 393454238,
    source: "PUMP_AMM",
    accountData: [
      {
        account: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        nativeBalanceChange: 9933,
        tokenBalanceChanges: []
      }
    ],
    tokenTransfers: [
      {
        mint: "E9uUgGXJ77AVmaqVhN544oz644VUPBGU6r4qUaeppump",
        fromUserAccount: "B9wKM6pjxsGamAbYm78YBsbFvKpDQFnQ3a4csnGKiKiM",
        toUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        tokenAmount: 33511.36643
      },
      {
        mint: "So11111111111111111111111111111111111111112",
        fromUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        toUserAccount: "B9wKM6pjxsGamAbYm78YBsbFvKpDQFnQ3a4csnGKiKiM",
        tokenAmount: 0.442467727
      }
    ]
  };

  // Test Case 2: Multi-hop USDT → USDC → SOL → Token
  const multiHopSwap = {
    type: "SWAP",
    feePayer: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
    fee: 30000,
    signature: "3Ray48...",
    timestamp: 1768560894,
    slot: 393866736,
    source: "PUMP_AMM",
    accountData: [
      {
        account: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        nativeBalanceChange: 4026,
        tokenBalanceChanges: []
      }
    ],
    tokenTransfers: [
      {
        fromTokenAccount: "GUtUvkro8tQsHd8N9urQ3uXGReVZWVqpyrzcwTxPb87",
        fromUserAccount: "FDrY5i5kuadZ1ik8gPS26qjj9Rw9mpufXMegGC2HNSP7",
        mint: "8J69rbLTzWWgUJziFY8jeu5tDwEPBwUz4pKBMr5rpump",
        toTokenAccount: "Fe2Su67TrN4XHP8A4sUHK4iUsmVukFXB89auVMTj5nnB",
        toUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        tokenAmount: 4234.958822,
        tokenStandard: "Fungible"
      },
      {
        fromTokenAccount: "FF5yfX1VezPt5uFXkwVsriSq2TdCMhbkXj9uf6Wmy9iQ",
        fromUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        mint: "So11111111111111111111111111111111111111112",
        toTokenAccount: "GEaRRckcM37BuBne4iFy5HBQQntdpFUHbVKsFf7zYj7f",
        toUserAccount: "FDrY5i5kuadZ1ik8gPS26qjj9Rw9mpufXMegGC2HNSP7",
        tokenAmount: 0.446961297,
        tokenStandard: "Fungible"
      },
      {
        fromTokenAccount: "A4SbaK3eKbWQsonAupUSaeFYJqWDTrDLvH1SoEh5K2vg",
        fromUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        toTokenAccount: "5dRazfLSjTq15r7XL6b5WBGTFtria1EHZQS7VZr7BD5V",
        toUserAccount: "EEUNhHsRoUVgJUFpkupmdF4v7uLUw1zhYLp7u9s8zFqG",
        tokenAmount: 64,
        tokenStandard: "Fungible"
      },
      {
        fromTokenAccount: "F9xyBfChZ2uCv7aQujJCe6gKVx7ydCmxfh2ZWrNwFoKr",
        fromUserAccount: "EEUNhHsRoUVgJUFpkupmdF4v7uLUw1zhYLp7u9s8zFqG",
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        toTokenAccount: "6fGbtYDCTkBLb3qvDh4ZSH4rDdGYDLguzDLZV76Ltaks",
        toUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        tokenAmount: 63.988864,
        tokenStandard: "Fungible"
      },
      {
        fromTokenAccount: "6fGbtYDCTkBLb3qvDh4ZSH4rDdGYDLguzDLZV76Ltaks",
        fromUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        toTokenAccount: "GhFfLFSprPpfoRaWakPMmJTMJBHuz6C694jYwxy2dAic",
        toUserAccount: "65ZHSArs5XxPseKQbB1B4r16vDxMWnCxHMzogDAqiDUc",
        tokenAmount: 63.988864,
        tokenStandard: "Fungible"
      },
      {
        fromTokenAccount: "CRo8DBwrmd97DJfAnvCv96tZPL5Mktf2NZy2ZnhDer1A",
        fromUserAccount: "65ZHSArs5XxPseKQbB1B4r16vDxMWnCxHMzogDAqiDUc",
        mint: "So11111111111111111111111111111111111111112",
        toTokenAccount: "FF5yfX1VezPt5uFXkwVsriSq2TdCMhbkXj9uf6Wmy9iQ",
        toUserAccount: "7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h",
        tokenAmount: 0.447411393,
        tokenStandard: "Fungible"
      }
    ]
  };

  const tracked = ["7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h"];
  
  console.log("=== Test Case 1: Direct SOL → Token ===");
  const result1 = parseHeliusSwap(directSwap, tracked);
  console.log(JSON.stringify(result1, null, 2));
  
  console.log("\n=== Test Case 2: Multi-hop USDT → Token ===");
  const result2 = parseHeliusSwap(multiHopSwap, tracked);
  console.log(JSON.stringify(result2, null, 2));
  
  return { directSwap: result1, multiHopSwap: result2 };
}