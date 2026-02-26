import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChainFilter } from '@/pages/ExplorePage';
import { useSwap } from '@/context/SwapContext';
import { ArrowRight, Clock, ExternalLink, Loader2 } from 'lucide-react';

// Define the transaction shape for the table
interface ExplorerTx {
    id: string;
    timestamp: number;
    sellToken: string;
    sellAmount: number;
    buyToken: string;
    buyAmount: number;
    usdValue: number;
    wallet: string;
    chain: 'Movement' | 'Solana' | 'Bitcoin Cash';
    txHash?: string;
    type: string;
}

// Helper to calculate "time ago"
function getTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}

export function TransactionsTable({ activeChain, refreshTrigger }: { activeChain: ChainFilter, refreshTrigger: number }) {
    const { fetchOrderHistory } = useSwap();
    const [transactions, setTransactions] = useState<ExplorerTx[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const history = await fetchOrderHistory();
                if (!isMounted) return;

                const completed = (window as any).bchOrders || []; // Fallback for local orders if no global indexer exists yet
                // For a true global explorer, you'd fetch from an indexer backend. 
                // Here we piece together what we can from user history if global isn't available.

                const formatted = history.filter(o => o.status === 'completed' || o.status === 'filled').map((order: any): ExplorerTx => {
                    const sellSym = order.sellToken?.symbol || 'UNKNOWN';
                    const mockUsdPrice = sellSym === 'BCH' ? 250 : sellSym === 'SOL' ? 150 : 1;
                    
                    return {
                        id: order.id || order.nonce || order.orderId,
                        timestamp: order.createdAt || Date.now(),
                        sellToken: sellSym,
                        sellAmount: Number(order.sellAmount) || 0,
                        buyToken: order.buyToken?.symbol || 'UNKNOWN',
                        buyAmount: Number(order.buyAmount) || 0,
                        usdValue: (Number(order.sellAmount) || 0) * mockUsdPrice,
                        wallet: order.maker || 'Unknown Wallet',
                        chain: 'Bitcoin Cash', // Assuming primarily BCH-Swap/Relayer for now based on context
                        txHash: order.txid || order.fulfillTxId,
                        type: order.type || 'Cross-Chain'
                    };
                });

                // Sort by time desc
                formatted.sort((a, b) => b.timestamp - a.timestamp);
                setTransactions(formatted);
            } catch (e) {
                console.error("Failed to fetch global transactions", e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadOrders();
        return () => { isMounted = false; };
    }, [fetchOrderHistory, refreshTrigger]);

    // Apply chain filter
    const filteredTxs = transactions.filter(tx => activeChain === 'All' || tx.chain === activeChain);

    return (
        <div className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="overflow-x-auto relative">
                <Table>
                    <TableHeader className="bg-white/[0.02] border-b border-white/[0.06]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground w-[80px]">Time</TableHead>
                            <TableHead className="text-muted-foreground w-[180px]">Type</TableHead>
                            <TableHead className="text-muted-foreground text-right w-[120px]">USD Value</TableHead>
                            <TableHead className="text-muted-foreground text-right">Sold Amount</TableHead>
                            <TableHead className="text-muted-foreground text-right">Bought Amount</TableHead>
                            <TableHead className="text-muted-foreground text-right w-[150px]">Wallet</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTxs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                    No transactions found for this chain.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTxs.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-white/[0.02] border-white/[0.06] transition-colors">
                                    <TableCell className="text-muted-foreground text-sm font-medium">
                                        {getTimeAgo(tx.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">{tx.type}</span>
                                            <div className="flex items-center gap-1.5 ml-1">
                                                <span className="text-sm font-bold text-foreground">{tx.sellToken}</span>
                                                <span className="text-xs text-muted-foreground">for</span>
                                                <span className="text-sm font-bold text-primary">{tx.buyToken}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-400">
                                        ${tx.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="font-semibold">{tx.sellAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                                            <span className="text-xs text-muted-foreground">{tx.sellToken}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="font-semibold">{tx.buyAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                                            <span className="text-xs text-muted-foreground">{tx.buyToken}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-mono text-xs text-muted-foreground bg-white/[0.03] px-1.5 py-0.5 rounded">
                                                {tx.wallet}
                                            </span>
                                            {tx.txHash && (
                                                <a
                                                    href={tx.chain === 'Bitcoin Cash' ? `https://chipnet.chaingraph.cash/tx/${tx.txHash}` : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
