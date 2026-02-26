// ============================================================================
// CauldronService — Fetch CashTokens from the Riften Labs Indexer (mainnet)
// ============================================================================
// API Docs: https://docs.riftenlabs.com/cauldron/API/cauldron/

export interface CauldronTokenData {
    token_id: string;
    display_name: string;
    display_symbol: string;
    score_rank: number;
    trade_volume: number;
    tvl_sats: number;
    tvl_tokens: number;
    price_now: number;
    price_now_usd: number;
    price_24h: number;
    price_24h_usd: number;
    change_24h_bp: number;
    change_7d_bp: number;
    bcmr?: {
        name: string;
        description: string;
        token?: {
            category: string;
            decimals: number;
            symbol: string;
        };
        uris?: {
            icon?: string;
            web?: string;
        };
    };
}

/**
 * Resolve an icon URI from BCMR metadata.
 * Handles ipfs:// URIs, https:// URIs, and IPFS CIDs.
 */
function resolveIconUri(uri?: string | null): string | undefined {
    if (!uri) return undefined;
    if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;
    if (uri.startsWith('ipfs://')) {
        const cid = uri.replace('ipfs://', '');
        return `https://ipfs.io/ipfs/${cid}`;
    }
    return undefined;
}

export const CauldronService = {
    // The correct live Riften Labs Indexer endpoint for Chipnet
    API_URL: 'https://indexer-chipnet.riften.net/cauldron',

    /**
     * Fetches the top CashTokens from the Cauldron indexer sorted by volume.
     * Returns data in a format compatible with our internal Token interface.
     */
    async getTopCashTokens(limit = 20): Promise<CauldronTokenData[]> {
        try {
            const res = await fetch(`${this.API_URL}/tokens/list_cached?limit=${limit}&by=volume&order=desc`);

            if (!res.ok) {
                console.warn("Cauldron API response not ok:", res.status);
                return [];
            }

            const rawData = await res.json() as CauldronTokenData[];
            // Centrally prune UNKNOWN tokens for all UI components (Wallet UI, Explore, Oracle, Token Selector)
            return rawData.filter(t => {
                const symbol = t.bcmr?.token?.symbol || t.display_symbol || 'UNKNOWN';
                return symbol !== 'UNKNOWN';
            });
        } catch (e) {
            console.error("Cauldron API fetch error:", e);
            return [];
        }
    },

    /**
     * Maps raw API data to our simplified Token-like shape for UI injection.
     */
    mapToTokens(data: CauldronTokenData[]): Array<{
        symbol: string;
        name: string;
        icon: string;
        decimals: number;
        type: string;
        chain: string;
        categoryId: string;
        priceUsd: number;
        priceSats: number;
    }> {
        return data.map(t => {
            const symbol = t.bcmr?.token?.symbol || t.display_symbol || 'UNKNOWN';
            const name = t.bcmr?.name || t.display_name || symbol;
            const iconRaw = t.bcmr?.uris?.icon;
            const icon = resolveIconUri(iconRaw) || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.token_id}`;

            return {
                symbol: symbol.toUpperCase(),
                name,
                icon,
                decimals: t.bcmr?.token?.decimals || 0,
                type: t.token_id,
                chain: "bch",
                categoryId: t.token_id,
                priceUsd: t.price_now_usd || 0,
                priceSats: t.price_now || 0,
            };
        });
    }
};
