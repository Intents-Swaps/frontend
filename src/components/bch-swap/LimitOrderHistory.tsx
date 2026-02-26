import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, CheckCircle2, XCircle, BoxSelect, RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBCHSwap } from '@/context/BCHSwapContext';
import { BCHOrder } from '@/types';

function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function shortenAddr(addr?: string) {
    if (!addr) return '—';
    return `${addr.slice(0, 16)}…${addr.slice(-6)}`;
}

function shortenTx(tx?: string) {
    if (!tx) return '';
    return `${tx.slice(0, 8)}…${tx.slice(-6)}`;
}

function statusBadge(status: BCHOrder['status']) {
    switch (status) {
        case 'pending': return <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
        case 'claimable': return (
            <Badge variant="outline" className="border-blue-500/50 text-blue-400 gap-1 animate-pulse">
                <Zap className="h-3 w-3" />Claim Ready
            </Badge>
        );
        case 'claimed': return <Badge variant="outline" className="border-teal-500/50 text-teal-400 gap-1"><CheckCircle2 className="h-3 w-3" />Claimed</Badge>;
        case 'filled': return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
        case 'cancelled': return <Badge variant="outline" className="border-red-500/50 text-red-400 gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
        case 'expired': return <Badge variant="outline" className="border-gray-500/50 text-gray-400 gap-1"><XCircle className="h-3 w-3" />Expired</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

function swapTypeBadge(order: BCHOrder) {
    if (order.swapType === 'same-chain') return null;
    const labels: Record<string, string> = {
        'bch-to-sol': 'BCH → SOL',
        'sol-to-bch': 'SOL → BCH',
        'bch-to-mov': 'BCH → MOVE',
        'mov-to-bch': 'MOVE → BCH',
    };
    const label = labels[order.swapType] || order.swapType;
    const isMove = order.swapType.includes('mov');
    return (
        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${isMove ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'}`}>
            {label}
        </Badge>
    );
}

function OrderRow({ order, onClaim, isClaiming }: { order: BCHOrder; onClaim?: (id: string) => void; isClaiming?: boolean }) {
    // Build explorer links
    const sourceExplorerUrl = order.explorerUrl
        || (order.txid ? `https://chipnet.chaingraph.cash/tx/${order.txid}` : undefined)
        || (order.contractAddress ? `https://chipnet.chaingraph.cash/address/${order.contractAddress}` : undefined);

    const destExplorerUrl = order.destExplorerUrl
        || (order.fillTxid && order.swapType === 'bch-to-sol'
            ? `https://explorer.solana.com/tx/${order.fillTxid}?cluster=devnet`
            : order.fillTxid && order.swapType === 'bch-to-mov'
                ? `https://explorer.movementnetwork.xyz/txn/${order.fillTxid}?network=testnet`
                : order.fillTxid
                    ? `https://chipnet.chaingraph.cash/tx/${order.fillTxid}`
                    : undefined);

    return (
        <div className="flex items-center justify-between py-3 px-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                        {order.sellToken?.symbol || '?'} → {order.buyToken?.symbol || '?'}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {order.orderType === 'limit' ? 'Limit' : 'Market'}
                    </Badge>
                    {swapTypeBadge(order)}
                    {statusBadge(order.status)}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span>{order.sellAmount} {order.sellToken?.symbol} for {order.buyAmount} {order.buyToken?.symbol}</span>
                    <span>·</span>
                    <span>{formatTime(order.createdAt)}</span>
                </div>

                {/* Transaction links for completed swaps */}
                {(order.status === 'filled' || order.status === 'claimed') && (sourceExplorerUrl || destExplorerUrl) && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {sourceExplorerUrl && (
                            <a
                                href={sourceExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-emerald-400 transition-colors"
                            >
                                Source TX {shortenTx(order.txid)} <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        {sourceExplorerUrl && destExplorerUrl && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                        )}
                        {destExplorerUrl && (
                            <a
                                href={destExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-emerald-400 transition-colors"
                            >
                                Dest TX {shortenTx(order.fillTxid)} <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                )}

                {order.contractAddress && order.status === 'pending' && (
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                        {shortenAddr(order.contractAddress)}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-3">
                {/* Claim button for claimable orders — only when secret is available */}
                {order.status === 'claimable' && onClaim && order.claimData?.secret && (
                    <Button
                        size="sm"
                        variant="default"
                        className="h-8 gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-medium shadow-lg shadow-blue-500/25 animate-pulse"
                        onClick={() => onClaim(order.id)}
                        disabled={isClaiming}
                    >
                        <Zap className="h-3.5 w-3.5" />
                        {isClaiming ? 'Claiming...' : 'Claim'}
                    </Button>
                )}

                {/* Explorer link for non-completed pending/claimable */}
                {sourceExplorerUrl && order.status !== 'filled' && order.status !== 'claimed' && (
                    <a
                        href={sourceExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-white/[0.06] text-muted-foreground hover:text-emerald-400 transition-colors"
                        title="View on Explorer"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative opacity-30 mb-4">
                <BoxSelect className="h-24 w-24 text-muted-foreground" strokeWidth={0.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{message}</h3>
            <p className="text-sm text-muted-foreground">
                Create a limit order or market swap to get started.
            </p>
        </div>
    );
}

export function LimitOrderHistory() {
    const { pendingOrders, completedOrders, refreshOrders, claimOrder, isLoading } = useBCHSwap();

    // Auto-refresh every 15 seconds
    useEffect(() => {
        refreshOrders(); // Initial fetch
        const interval = setInterval(() => {
            refreshOrders();
        }, 15000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    const openCount = pendingOrders.length;
    const claimableCount = pendingOrders.filter(o => o.status === 'claimable').length;
    const historyCount = completedOrders.length;

    return (
        <Card className="w-full h-full min-h-[500px] border-muted/50 bg-card/80 backdrop-blur-sm shadow-lg flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
                <Tabs defaultValue="open" className="w-full h-full flex flex-col">
                    <div className="border-b border-white/[0.06] px-4 pt-4 flex items-center justify-between">
                        <TabsList className="bg-transparent gap-6 h-auto p-0 justify-start">
                            <TabsTrigger
                                value="open"
                                className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground text-sm font-medium"
                            >
                                Open ({openCount})
                                {claimableCount > 0 && (
                                    <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold animate-pulse">
                                        {claimableCount}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground text-sm font-medium"
                            >
                                Orders history ({historyCount})
                            </TabsTrigger>
                        </TabsList>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => refreshOrders()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-auto">
                        <TabsContent value="open" className="m-0 flex-1">
                            {openCount === 0 ? (
                                <EmptyState message="No open orders" />
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {/* Show claimable orders first */}
                                    {pendingOrders
                                        .sort((a, b) => {
                                            if (a.status === 'claimable' && b.status !== 'claimable') return -1;
                                            if (a.status !== 'claimable' && b.status === 'claimable') return 1;
                                            return b.createdAt - a.createdAt;
                                        })
                                        .map(order => (
                                            <OrderRow
                                                key={order.id}
                                                order={order}
                                                onClaim={claimOrder}
                                                isClaiming={isLoading}
                                            />
                                        ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="m-0 flex-1">
                            {historyCount === 0 ? (
                                <EmptyState message="No order history" />
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {completedOrders.map(order => (
                                        <OrderRow key={order.id} order={order} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
