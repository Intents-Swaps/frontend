/**
 * TrackPortfolioCard - Step 4
 * 
 * Track your crypto portfolio with balance and PnL visualization.
 * Features animated asset list with real-time styled updates.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface CardProps {
    stepNumber: number;
}

// Mock portfolio data
const ASSETS = [
    {
        symbol: 'MOVE',
        name: 'Movement',
        balance: '1,250.00',
        value: '$2,500.00',
        pnl: '+12.5%',
        isPositive: true,
        color: '#FACC15',
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '5,000.00',
        value: '$5,000.00',
        pnl: '0.0%',
        isPositive: true,
        color: '#2775CA',
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        balance: '25.50',
        value: '$3,825.00',
        pnl: '+8.2%',
        isPositive: true,
        color: '#9945FF',
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '0.85',
        value: '$2,125.00',
        pnl: '-2.1%',
        isPositive: false,
        color: '#627EEA',
    },
];

export function TrackPortfolioCard({ stepNumber }: CardProps) {
    return (
        <div className={cn(
            "bento-card-interactive w-full h-full flex flex-col p-6 !rounded-none",
            "grainy group cursor-pointer"
        )}>
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 mesh-gradient-green opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="tag-green">
                        Step {stepNumber}
                    </span>
                    <div className="icon-box-green w-10 h-10">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-green-500 transition-colors">
                    Track Portfolio
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-4 leading-relaxed">
                    Manage your digital assets, analyze PnL & historical swaps all in one place.
                </p>

                {/* Portfolio Summary */}
                <div className="bg-muted/30 dark:bg-zinc-800/50 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Balance</p>
                            <p className="text-xl font-bold">$13,450.00</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">24h Change</p>
                            <div className="flex items-center gap-1 text-green-500">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">+5.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset List */}
                <div className="flex-1 space-y-2 overflow-hidden">
                    {ASSETS.map((asset, index) => (
                        <motion.div
                            key={asset.symbol}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl",
                                "bg-white/50 dark:bg-zinc-800/50 border border-border/30",
                                "group-hover:bg-white/80 dark:group-hover:bg-zinc-800/80 transition-colors"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${asset.color}20` }}
                                >
                                    <span className="text-xs font-bold" style={{ color: asset.color }}>
                                        {asset.symbol.slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{asset.symbol}</p>
                                    <p className="text-[10px] text-muted-foreground">{asset.balance}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{asset.value}</p>
                                <div className={cn(
                                    "flex items-center justify-end gap-0.5 text-[10px]",
                                    asset.isPositive ? "text-green-500" : "text-red-500"
                                )}>
                                    {asset.isPositive ? (
                                        <TrendingUp className="w-2.5 h-2.5" />
                                    ) : (
                                        <TrendingDown className="w-2.5 h-2.5" />
                                    )}
                                    <span>{asset.pnl}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Features */}
                <div className="flex gap-4 mt-auto pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Wallet className="w-3.5 h-3.5 text-green-500" />
                        <span>Multi-chain</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Real-time PnL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrackPortfolioCard;
