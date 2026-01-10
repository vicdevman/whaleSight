
// tracked wallets
function getTrackedWallet(tx, trackedWallets) {
  // Fee payer is always first candidate
  if (trackedWallets.includes(tx.feePayer)) {
    return tx.feePayer;
  }

  // Fallback: find tracked wallet with balance delta
  for (const acc of tx.accountData) {
    if (
      trackedWallets.includes(acc.account) &&
      (acc.nativeBalanceChange !== 0 ||
       acc.tokenBalanceChanges?.length > 0)
    ) {
      return acc.account;
    }
  }

  // Unknown or unsupported case
  return null;
}

// sol change
function getSolChange(tx, wallet) {
  const lamports =
    tx.accountData.find(a => a.account === wallet)
      ?.nativeBalanceChange || 0;

  return lamports / 1e9;
}

// token transfer
function getTokenTransfer(tx, wallet) {
  return tx.tokenTransfers.find(t =>
    t.mint !== "So11111111111111111111111111111111111111112" &&
    (t.fromUserAccount === wallet ||
     t.toUserAccount === wallet)
  );
}

//classifyer
function classifySwap(solChange) {
  if (solChange < 0) return "BUY";
  if (solChange > 0) return "SELL";
  return "UNKNOWN";
}

/// main function ---------------------------------------------------------
export default function parseHeliusData(tx, trackedWallets) {
  if (!tx || tx.type !== "SWAP") return null;

  const trackedWallet = getTrackedWallet(tx, trackedWallets);
  if (!trackedWallet) return null;

  const solChange = getSolChange(tx, trackedWallet);
  const tokenTransfer = getTokenTransfer(tx, trackedWallet);
  if (!tokenTransfer) return null;

  const action = classifySwap(solChange);

  return {
    trackedWallet: trackedWallet,
    action,
    tokenMint: tokenTransfer.mint,
    solAmount: Math.abs(Number(solChange.toFixed(6))),
    tokenAmount: tokenTransfer.tokenAmount,
    source: tx.source,
    transactionType: tx.type,
    time: new Date(tx.timestamp * 1000).toISOString(),
    signature: tx.signature
  };
}
