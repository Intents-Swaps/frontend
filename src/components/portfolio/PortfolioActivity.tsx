import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Layers, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/coingecko';
import { ActivityService, ActivityRecord } from '@/lib/activity';

export function PortfolioActivity() {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);

    useEffect(() => {
        const loadHistory = () => {
            setActivities(ActivityService.getHistory());
        };

        loadHistory();

        // Listen for internal app updates
        window.addEventListener('activity_history_updated', loadHistory);
        return () => window.removeEventListener('activity_history_updated', loadHistory);
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
                <p className="text-sm text-muted-foreground mt-1">Your recent transactions</p>
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
                                {tx.type === 'bridge' && <Layers className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground capitalize">
                                    {tx.type === 'swap' ? `Swapped ${tx.assetIn} for ${tx.assetOut}` :
                                        tx.type === 'receive' ? `Received ${tx.asset}` :
                                            tx.type === 'send' ? `Sent ${tx.asset}` :
                                                `Bridged ${tx.asset}`}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5 font-mono">
                                    {tx.type === 'swap' ? `${tx.amountIn} ${tx.assetIn} → ${tx.amountOut} ${tx.assetOut}` : `${tx.amount} ${tx.asset}`}
                                </span>
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
