
const WRAPPED_SOL = "So11111111111111111111111111111111111111112";

/* Find the tracked wallet involved in the transaction */
function getTrackedWallet(tx, trackedWallets) {
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

/*
 Calculate total SOL spent/received (including wrapped SOL flows)
 Returns negative for buys (SOL spent), positive for sells (SOL received)
 */
function calculateSolFlow(tx, wallet) {
  let totalSol = 0;

  const accountData = tx.accountData?.find(a => a.account === wallet);
  if (accountData?.nativeBalanceChange) {
    totalSol += accountData.nativeBalanceChange / 1e9;
  }

  const wsolTransfers = tx.tokenTransfers?.filter(
    t => t.mint === WRAPPED_SOL
  ) || [];

  for (const transfer of wsolTransfers) {
    if (transfer.fromUserAccount === wallet) {
      totalSol -= transfer.tokenAmount;
    } else if (transfer.toUserAccount === wallet) {
      totalSol += transfer.tokenAmount;
    }
  }

  if (tx.feePayer === wallet && tx.fee) {
    totalSol += tx.fee / 1e9;
  }

  return totalSol;
}

/* Get the actual token being traded (excludes wrapped SOL) */
function getTokenTransfer(tx, wallet) {
  const transfers = tx.tokenTransfers?.filter(
    t => t.mint !== WRAPPED_SOL &&
    (t.fromUserAccount === wallet || t.toUserAccount === wallet)
  ) || [];

  if (transfers.length === 0) return null;

  // In multi-hop swaps, find the final token the user receives/sends
  // Priority: token going TO wallet (buy) or FROM wallet (sell)
  const receivedToken = transfers.find(t => t.toUserAccount === wallet);
  if (receivedToken) return receivedToken;

  const sentToken = transfers.find(t => t.fromUserAccount === wallet);
  if (sentToken) return sentToken;

  // Fallback: first non-wSOL transfer
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
  const sampleTx = {
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

  const tracked = ["7gEQ6syDZmyPE4JdfJm4qatawnDqvqdh6i8jJjCXio6h"];
  const result = parseHeliusSwap(sampleTx, tracked);
  
  console.log("Parsed Result:", JSON.stringify(result, null, 2));
  return result;
}