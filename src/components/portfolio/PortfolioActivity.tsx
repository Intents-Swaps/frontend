import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Layers, Navigation, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/coingecko';
import { ActivityService, ActivityRecord } from '@/lib/activity';
import { BCHOrder } from '@/types';

const BCH_ORDERS_KEY = 'bch_swap_orders';

const TOKEN_ICONS: Record<string, string> = {
    'BCH': '/logos/bitcoin-cash-bch-logo.svg',
    'SOL': '/assets/solanaLogo.png',
    'MOVE': 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png',
    'USDC': '/logos/usd-coin-usdc-logo.svg',
    'USDT': '/logos/usd-coin-usdc-logo.svg',
};

interface MergedActivity {
    id: string;
    type: 'send' | 'receive' | 'swap' | 'bridge';
    title: string;
    subtitle: string;
    valueUsd: number;
    timestamp: number;
    explorerUrl?: string;
    sellIcon?: string;
    buyIcon?: string;
}

function getExplorerUrl(order: BCHOrder): string | undefined {
    if (order.explorerUrl) return order.explorerUrl;
    if (order.txid) {
        if (order.swapType.includes('sol')) return `https://explorer.solana.com/tx/${order.txid}?cluster=devnet`;
        if (order.swapType.includes('mov')) return `https://explorer.movementnetwork.xyz/txn/${order.txid}?network=testnet`;
        return `https://chipnet.chaingraph.cash/tx/${order.txid}`;
    }
    if (order.contractAddress) return `https://chipnet.chaingraph.cash/address/${order.contractAddress}`;
    return undefined;
}

export function PortfolioActivity() {
    const [activities, setActivities] = useState<MergedActivity[]>([]);

    useEffect(() => {
        const loadAll = () => {
            const merged: MergedActivity[] = [];

            // 1. ActivityService records (send/receive)
            try {
                const records = ActivityService.getHistory();
                records.forEach(tx => {
                    merged.push({
                        id: tx.id,
                        type: tx.type,
                        title: tx.type === 'swap' ? `Swapped ${tx.assetIn} for ${tx.assetOut}` :
                            tx.type === 'receive' ? `Received ${tx.asset}` :
                                tx.type === 'send' ? `Sent ${tx.asset}` :
                                    `Bridged ${tx.asset}`,
                        subtitle: tx.type === 'swap' ? `${tx.amountIn} ${tx.assetIn} → ${tx.amountOut} ${tx.assetOut}` : `${tx.amount} ${tx.asset}`,
                        valueUsd: tx.valueUsd,
                        timestamp: tx.timestamp,
                        explorerUrl: tx.explorerUrl,
                    });
                });
            } catch { /* non-fatal */ }

            // 2. BCH swap orders from localStorage
            try {
                const saved = localStorage.getItem(BCH_ORDERS_KEY);
                if (saved) {
                    const bchOrders: BCHOrder[] = JSON.parse(saved);
                    bchOrders.forEach(order => {
                        const sellSym = order.sellToken?.symbol || '?';
                        const buySym = order.buyToken?.symbol || '?';
                        const isCross = order.swapType !== 'same-chain';
                        const mockUsdPrice = sellSym === 'BCH' ? 250 : sellSym === 'SOL' ? 150 : sellSym === 'MOVE' ? 0.8 : 1;
                        const statusLabel = order.status === 'filled' || order.status === 'claimed' ? '✓' : order.status === 'pending' ? '⏳' : order.status === 'claimable' ? '🎯' : '';
                        merged.push({
                            id: `bch_${order.id}`,
                            type: isCross ? 'bridge' : 'swap',
                            title: `${statusLabel} Swapped ${sellSym} for ${buySym}`,
                            subtitle: `${order.sellAmount} ${sellSym} → ${Number(order.buyAmount).toFixed(4)} ${buySym}`,
                            valueUsd: order.sellAmount * mockUsdPrice,
                            timestamp: order.createdAt,
                            explorerUrl: getExplorerUrl(order),
                            sellIcon: order.sellToken?.icon || TOKEN_ICONS[sellSym],
                            buyIcon: order.buyToken?.icon || TOKEN_ICONS[buySym],
                        });
                    });
                }
            } catch { /* non-fatal */ }

            // Sort by time desc and dedupe
            const seen = new Set<string>();
            const deduped = merged.filter(a => {
                if (seen.has(a.id)) return false;
                seen.add(a.id);
                return true;
            });
            deduped.sort((a, b) => b.timestamp - a.timestamp);
            setActivities(deduped);
        };

        loadAll();
        window.addEventListener('activity_history_updated', loadAll);
        // Also poll every 5s for new BCH orders
        const interval = setInterval(loadAll, 5000);
        return () => {
            window.removeEventListener('activity_history_updated', loadAll);
            clearInterval(interval);
        };
    }, []);

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                No recent activity. Make your first swap or transfer!
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                <p className="text-sm text-muted-foreground mt-1">Swaps, sends, receives, and cross-chain bridges</p>
            </div>

            <div className="flex flex-col gap-2">
                {activities.map((tx) => (
                    <a
                        key={tx.id}
                        href={tx.explorerUrl || '#'}
                        target={tx.explorerUrl ? "_blank" : undefined}
                        rel={tx.explorerUrl ? "noopener noreferrer" : undefined}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl transition-colors border border-transparent group",
                            tx.explorerUrl ? "hover:bg-white/[0.04] hover:border-white/[0.05] cursor-pointer" : ""
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                tx.type === 'receive' ? "bg-emerald-500/10 text-emerald-500" :
                                    tx.type === 'swap' ? "bg-blue-500/10 text-blue-500" :
                                        tx.type === 'send' ? "bg-orange-500/10 text-orange-500" :
                                            "bg-purple-500/10 text-purple-500"
                            )}>
                                {tx.type === 'receive' && <ArrowDownLeft className="h-5 w-5" />}
                                {tx.type === 'send' && <Navigation className="h-5 w-5 -rotate-90" />}
                                {tx.type === 'swap' && <RefreshCw className="h-5 w-5" />}
                                {tx.type === 'bridge' && <Globe className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    {/* Token icons for swaps */}
                                    {(tx.type === 'swap' || tx.type === 'bridge') && (tx.sellIcon || tx.buyIcon) && (
                                        <div className="flex -space-x-1.5 mr-1">
                                            {tx.sellIcon && <img src={tx.sellIcon} className="w-4 h-4 rounded-full border border-zinc-800" />}
                                            {tx.buyIcon && <img src={tx.buyIcon} className="w-4 h-4 rounded-full border border-zinc-800" />}
                                        </div>
                                    )}
                                    <span className="font-medium text-foreground">{tx.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground mt-0.5 font-mono">{tx.subtitle}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-foreground">{formatCurrency(tx.valueUsd)}</span>
                            <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                {formatTime(tx.timestamp)}
                                {tx.explorerUrl && <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            {activities.length >= 10 && (
                <div className="mt-4 flex justify-center sm:justify-start">
                    <button
                        onClick={() => ActivityService.clearHistory()}
                        className="text-sm text-red-500/80 hover:text-red-500 font-medium transition-colors"
                    >
                        Clear History
                    </button>
                </div>
            )}
        </div>
    );
}
