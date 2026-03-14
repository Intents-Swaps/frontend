import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CoinGeckoService, CoinData, formatCompactNumber } from '@/lib/coingecko';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChainFilter } from '@/pages/ExplorePage';
import { ArrowUpRight, ArrowDownRight, Loader2, Layers } from 'lucide-react';
import { CauldronService, CauldronTokenData } from '@/lib/cauldron';

const ASSETS = [
    { symbol: "MOVE", name: "Movement Coin", chain: "Movement", icon: "/logos/movement.svg" },
    { symbol: "SOL", name: "Solana", chain: "Solana", icon: "/logos/solana.svg" },
    { symbol: "USDC", name: "USD Coin", chain: "Solana", icon: "/logos/usd-coin-usdc-logo.svg" },
    { symbol: "USDT", name: "Tether", chain: "Solana", icon: "/logos/usd-coin-usdc-logo.svg" },
    { symbol: "BCH", name: "Bitcoin Cash", chain: "Bitcoin Cash", icon: "/logos/bitcoin-cash-bch-logo.svg" },
];

interface TokensTableProps {
    activeChain: ChainFilter;
    refreshTrigger: number;
}

export function TokensTable({ activeChain, refreshTrigger }: TokensTableProps) {
    const [data, setData] = useState<Record<string, CoinData>>({});
    const [loading, setLoading] = useState(true);
    const [cashTokens, setCashTokens] = useState<CauldronTokenData[]>([]);

    useEffect(() => {
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const symbols = ASSETS.map(a => a.symbol);
                const [res, apiTokens] = await Promise.all([
                    CoinGeckoService.getMarketData(symbols),
                    CauldronService.getTopCashTokens(20)
                ]);
                setData(res);
                setCashTokens(apiTokens);
            } catch (e) {
                console.error("Tokens fetch failed", e);
            }
            setLoading(false);
        };
        fetchTokens();
    }, [refreshTrigger]);

    const filteredAssets = ASSETS.filter(a => activeChain === 'All' || a.chain === activeChain);
    const filteredCashTokens = activeChain === 'All' || activeChain === 'Bitcoin Cash' ? cashTokens : [];

    const formatPct = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        const isPos = val >= 0;
        return (
            <span className={cn("flex items-center gap-0.5", isPos ? "text-green-400" : "text-red-400")}>
                {isPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(val).toFixed(2)}%
            </span>
        );
    };

    return (
        <div className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="overflow-x-auto relative">
                <Table>
                    <TableHeader className="bg-white/[0.02] border-b border-white/[0.06]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground w-[250px]">Token</TableHead>
                            <TableHead className="text-muted-foreground text-right">Price</TableHead>
                            <TableHead className="text-muted-foreground text-right w-[100px]">1H</TableHead>
                            <TableHead className="text-muted-foreground text-right w-[100px]">1D</TableHead>
                            <TableHead className="text-muted-foreground text-right hidden md:table-cell">FDV</TableHead>
                            <TableHead className="text-muted-foreground text-right hidden sm:table-cell">Volume</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && Object.keys(data).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span>Loading market data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No tokens found for this chain.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssets.map((asset) => {
                                const coin = data[asset.symbol];
                                const priceStr = coin
                                    ? `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                                    : '-';

                                return (
                                    <TableRow key={asset.symbol} className="hover:bg-white/[0.02] border-white/[0.06] transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-white/[0.05] p-1.5 flex items-center justify-center flex-shrink-0">
                                                    <img src={asset.icon} alt={asset.name} className="h-full w-full object-contain" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm truncate">{asset.name}</span>
                                                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{asset.symbol}</span>
                                                    </div>
                                                    <div className="mt-0.5 flex">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[9px] h-3.5 px-1.5 border-white/10 font-medium",
                                                            asset.chain === 'Solana' && 'text-indigo-300',
                                                            asset.chain === 'Movement' && 'text-primary',
                                                            asset.chain === 'Bitcoin Cash' && 'text-emerald-400'
                                                        )}>
                                                            {asset.chain}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {loading && !coin ? <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /> : priceStr}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {loading && !coin ? <div className="h-4 w-12 bg-white/5 rounded animate-pulse ml-auto" /> : formatPct(coin?.price_change_percentage_1h_in_currency)}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {loading && !coin ? <div className="h-4 w-12 bg-white/5 rounded animate-pulse ml-auto" /> : formatPct(coin?.price_change_percentage_24h_in_currency)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground font-medium hidden md:table-cell text-sm">
                                            {loading && !coin ? <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /> : formatCompactNumber(coin?.fully_diluted_valuation)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground font-medium hidden sm:table-cell text-sm">
                                            {loading && !coin ? <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /> : formatCompactNumber(coin?.total_volume)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}

                        {filteredCashTokens.length > 0 && (() => {
                            const bchPriceUsd = data['BCH']?.current_price || 0;
                            return filteredCashTokens.map(ct => {
                                const sym = ct.bcmr?.token?.symbol || ct.display_symbol || 'UNKNOWN';
                                const iconRaw = ct.bcmr?.uris?.icon;
                                const icon = iconRaw?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${iconRaw.replace('ipfs://', '')}` : (iconRaw?.startsWith('http') ? iconRaw : `https://api.dicebear.com/7.x/identicon/svg?seed=${ct.token_id}`);
                                const change24h = ct.change_24h_bp / 100;
                                const tokenBchPrice = ct.price_now ? ct.price_now / 1e8 : 0;
                                const calculatedUsdPrice = tokenBchPrice * bchPriceUsd;

                                return (
                                    <TableRow key={ct.token_id} className="hover:bg-white/[0.02] border-white/[0.06] transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 p-1 flex items-center justify-center flex-shrink-0">
                                                    <img src={icon} alt={ct.display_name} className="h-full w-full object-contain rounded-full" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm truncate">{ct.display_name}</span>
                                                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{sym}</span>
                                                    </div>
                                                    <div className="mt-0.5 flex">
                                                        <Badge variant="outline" className="text-[9px] h-3.5 px-1.5 border-emerald-500/20 text-emerald-400 font-medium">
                                                            <Layers className="w-2.5 h-2.5 mr-1 inline" />
                                                            CashToken
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            <div className="flex flex-col items-end">
                                                <span>{calculatedUsdPrice > 0 ? `$${calculatedUsdPrice.toFixed(6)}` : '-'}</span>
                                                {ct.price_now ? <span className="text-xs text-muted-foreground">{ct.price_now.toFixed(2)} sats</span> : null}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            <span className="text-muted-foreground">-</span>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {formatPct(change24h)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground font-medium hidden md:table-cell text-sm">
                                            {ct.tvl_sats ? `${(ct.tvl_sats / 1e8).toFixed(4)} BCH` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground font-medium hidden sm:table-cell text-sm">
                                            {ct.trade_volume ? `${(ct.trade_volume / 1e8).toFixed(4)} BCH` : '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        })()}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
