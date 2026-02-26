import { useBCHSwapOptional } from '@/context/BCHSwapContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowRight, History } from 'lucide-react';
import { BCHOrder } from '@/types';

// ============================================================================
// Wallet History Tab — Shows completed and cancelled orders
// Uses useBCHSwapOptional to safely handle pages without BCHSwapProvider
// ============================================================================

function getTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

function HistoryRow({ order }: { order: BCHOrder }) {
    const isFilled = order.status === 'filled';

    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
                {isFilled
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    : <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                }
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span>{order.sellAmount} {order.sellToken.symbol}</span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                        <span>{order.buyAmount.toFixed(4)} {order.buyToken.symbol}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{getTimeAgo(order.createdAt)}</span>
                </div>
            </div>
            <Badge
                variant={isFilled ? 'secondary' : 'destructive'}
                className="text-[9px] h-4 px-1.5"
            >
                {isFilled ? 'Filled' : order.status}
            </Badge>
        </div>
    );
}

export function WalletHistoryTab() {
    const swapCtx = useBCHSwapOptional();
    const historyOrders = (swapCtx?.completedOrders || []).slice(0, 20);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-1 py-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Transaction History
                </span>
            </div>

            {historyOrders.length === 0 ? (
                <div className="text-center py-10">
                    <History className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No history yet</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Completed transactions will appear here</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {historyOrders.map(order => (
                        <HistoryRow key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
