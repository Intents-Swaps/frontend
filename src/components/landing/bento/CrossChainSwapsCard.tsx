/**
 * CrossChainSwapsCard - Card 1 in the bento grid
 * 
 * Features:
 * - Cross-chain Swaps header with swap icon
 * - "Explore. Swap. Repeat." tagline
 * - Live token prices from Pyth Oracle
 * - "Explore chains" CTA button
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeftRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenDisplay } from '@/components/common/TokenDisplay';
import { PriceService } from '@/lib/pyth';
import { PriceData } from '@/types';
import { Link } from 'react-router-dom';

// Token assets configuration
const DISPLAY_TOKENS = [
    {
        symbol: 'BCH',
        name: 'Bitcoin Cash',
        priceKey: 'BCH',
        icon: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg',
        chainIcon: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg'
    },
    {
        symbol: 'MOVE',
        name: 'Movement',
        priceKey: 'MOVE',
        icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png',
        chainIcon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        priceKey: 'ETH',
        icon: '/logos/ethereum-eth-logo.svg',
        chainIcon: '/logos/ethereum-eth-logo.svg'
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        priceKey: 'SOL',
        icon: '/assets/solanaLogo.png',
        chainIcon: '/assets/solanaLogo.png'
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        priceKey: 'USDC',
        icon: '/logos/usd-coin-usdc-logo.svg',
        chainIcon: '/logos/usd-coin-usdc-logo.svg'
    },
];

interface CrossChainSwapsCardProps {
    className?: string;
}

export function CrossChainSwapsCard({ className }: CrossChainSwapsCardProps) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            const data = await PriceService.getLatestPrices();
            setPrices(data);
            setLoading(false);
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={cn(
                'bento-card h-full min-h-[420px] flex flex-col',
                'grainy',
                className
            )}
        >
            {/* Card Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="icon-box-primary">
                    <ArrowLeftRight className="w-5 h-5" />
                </div>
                <span className="tag-primary">
                    <Globe className="w-3 h-3" />
                    Cross-chain Swaps
                </span>
            </div>

            {/* Tagline */}
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-primary">Explore.</span>{' '}
                <span className="text-secondary">Swap.</span>{' '}
                <span className="text-foreground">Repeat.</span>
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
                Swap between multiple chains without bridging assets - all in one platform.
                <span className="text-foreground font-medium"> Explore 10+ chains.</span>
            </p>

            {/* CTA Button */}
            <Link to="/cross-chain">
                <Button variant="outline" className="rounded-full gap-2 mb-6 group">
                    Explore chains
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>

            {/* Token Prices List */}
            <div className="mt-auto space-y-1 bg-muted/30 dark:bg-zinc-800/30 rounded-2xl p-3">
                {DISPLAY_TOKENS.map((token, index) => {
                    const priceData = prices[token.priceKey];
                    const price = PriceService.formatPrice(priceData);
                    // Mock price change for demo (Pyth doesn't provide 24h change directly)
                    const priceChange = (Math.random() * 10 - 5);

                    return (
                        <div
                            key={token.symbol}
                            className={cn(
                                'flex items-center justify-between py-2.5 px-3 rounded-xl',
                                'hover:bg-muted/50 dark:hover:bg-zinc-700/30 transition-colors',
                                index < DISPLAY_TOKENS.length - 1 && 'border-b border-border/30'
                            )}
                        >
                            <TokenDisplay
                                tokenIcon={token.icon}
                                chainIcon={token.chainIcon}
                                name={token.name}
                                ticker={token.symbol}
                                size="md"
                                showChainBadge={false}
                            />

                            <div className="flex items-center gap-3 text-right">
                                {loading ? (
                                    <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    <>
                                        <span className="font-semibold">
                                            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                                            )}
                                        >
                                            {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CrossChainSwapsCard;
