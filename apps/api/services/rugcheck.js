export default async function rugCheck(address) {
    try {
        const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report`);
        const data = await response.json();

        const supply = data.token.supply / Math.pow(10, data.token.decimals);
        const marketCap = supply * (data.price || 0);

        const metadata = {
            name: data.tokenMeta?.name || data.fileMeta?.name || 'Unknown',
            symbol: data.tokenMeta?.symbol || data.fileMeta?.symbol || 'Unknown',
            uri: data.tokenMeta?.uri || null,
            description: data.fileMeta?.description || 'No description available',
            image: data.fileMeta?.image || null,
            mutable: data.tokenMeta?.mutable || false,
            updateAuthority: data.tokenMeta?.updateAuthority || null
        };

        return {
            risks: data.risks || [],
            score: data.score || 0,
            rugged: data.rugged || false,
            mintAuthority: data.mintAuthority || null,
            freezeAuthority: data.freezeAuthority || null,
            insiderNetworks: data.insiderNetworks || [],
            lpLockedPct: data.lpLockedPct || (data.markets?.[0]?.lp?.lpLockedPct) || 0,
            transferFeePct: data.transferFee?.pct || 0,

            topHolders: (data.topHolders || []).slice(0, 5).map(holder => ({
                address: holder.address,
                pct: holder.pct,
                insider: holder.insider
            })),
            metadata: metadata,
            price: data.price || 0,
            marketCap: marketCap || 0,
            totalLiquidity: data.totalMarketLiquidity || 0,
            totalHolders: data.totalHolders || 0,
            launchpad: data.launchpad?.name || 'Unknown'
            // rawData: data
        };

    } catch (error) {
        console.log(error);
        return false;
    }
}