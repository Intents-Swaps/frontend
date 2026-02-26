/**
 * TokenDisplay - Reusable DeFi-style token display component
 * 
 * ============================================================
 * USAGE GUIDE - Reference this when building other components
 * ============================================================
 * 
 * Basic token icon only:
 *   <TokenDisplay tokenIcon="/path/to/token.png" />
 * 
 * Token with chain badge (shows small chain logo at bottom-right):
 *   <TokenDisplay tokenIcon="/path/to/token.png" chainIcon="/path/to/chain.png" />
 * 
 * Token with name beside it:
 *   <TokenDisplay tokenIcon="/path/to/token.png" name="Solana" />
 * 
 * Token with ticker:
 *   <TokenDisplay tokenIcon="/path/to/token.png" ticker="SOL" />
 * 
 * Token with name AND ticker:
 *   <TokenDisplay tokenIcon="/path/to/token.png" name="Solana" ticker="SOL" />
 * 
 * Token with price at the end:
 *   <TokenDisplay tokenIcon="/path/to/token.png" ticker="SOL" price={142.50} />
 * 
 * Token with price change:
 *   <TokenDisplay tokenIcon="/path/to/token.png" ticker="SOL" price={142.50} priceChange={5.23} />
 * 
 * Full display (icon + chain badge + name + ticker + price + change):
 *   <TokenDisplay 
 *     tokenIcon="/path/to/token.png" 
 *     chainIcon="/path/to/chain.png"
 *     name="Solana" 
 *     ticker="SOL" 
 *     price={142.50}
 *     priceChange={5.23}
 *   />
 * 
 * Hide chain badge even when chainIcon is provided:
 *   <TokenDisplay tokenIcon="/path/to/token.png" chainIcon="/path/to/chain.png" showChainBadge={false} />
 * 
 * Different sizes:
 *   <TokenDisplay tokenIcon="/path/to/token.png" size="sm" />  // 24px icon
 *   <TokenDisplay tokenIcon="/path/to/token.png" size="md" />  // 32px icon (default)
 *   <TokenDisplay tokenIcon="/path/to/token.png" size="lg" />  // 48px icon
 *   <TokenDisplay tokenIcon="/path/to/token.png" size="xl" />  // 64px icon
 * 
 * Compact mode (icon only, no text even if provided):
 *   <TokenDisplay tokenIcon="/path/to/token.png" name="Solana" compact />
 * 
 * ============================================================
 */

import { cn } from '@/lib/utils';

export interface TokenDisplayProps {
    /** Token logo URL (required) */
    tokenIcon: string;
    /** Chain logo URL - displayed as small badge at bottom-right of token icon */
    chainIcon?: string;
    /** Token full name (e.g., "Solana") */
    name?: string;
    /** Token ticker symbol (e.g., "SOL") */
    ticker?: string;
    /** Token price in USD */
    price?: number;
    /** 24h price change percentage */
    priceChange?: number;
    /** Size variant - controls icon size and text scaling */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Whether to show chain badge (default: true when chainIcon is provided) */
    showChainBadge?: boolean;
    /** Compact mode - shows only the icon, ignores name/ticker/price */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Whether token icon has loading animation */
    animated?: boolean;
}

// Size configurations
const sizeConfig = {
    sm: {
        icon: 'w-6 h-6',
        badge: 'w-3 h-3 -bottom-0.5 -right-0.5',
        name: 'text-xs',
        ticker: 'text-xs',
        price: 'text-xs',
        gap: 'gap-1.5',
    },
    md: {
        icon: 'w-8 h-8',
        badge: 'w-4 h-4 -bottom-0.5 -right-0.5',
        name: 'text-sm',
        ticker: 'text-sm',
        price: 'text-sm',
        gap: 'gap-2',
    },
    lg: {
        icon: 'w-10 h-10',
        badge: 'w-5 h-5 -bottom-1 -right-1',
        name: 'text-base',
        ticker: 'text-base',
        price: 'text-base',
        gap: 'gap-2.5',
    },
    xl: {
        icon: 'w-12 h-12',
        badge: 'w-6 h-6 -bottom-1 -right-1',
        name: 'text-lg',
        ticker: 'text-lg',
        price: 'text-lg',
        gap: 'gap-3',
    },
};

export function TokenDisplay({
    tokenIcon,
    chainIcon,
    name,
    ticker,
    price,
    priceChange,
    size = 'md',
    showChainBadge = true,
    compact = false,
    className,
    animated = false,
}: TokenDisplayProps) {
    const config = sizeConfig[size];
    const shouldShowBadge = showChainBadge && chainIcon;
    const showTextContent = !compact && (name || ticker || price !== undefined);

    // Format price with appropriate decimals
    const formatPrice = (value: number): string => {
        if (value >= 1000) {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (value >= 1) {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        } else {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
    };

    return (
        <div className={cn('flex items-center', config.gap, className)}>
            {/* Token Icon Container with optional Chain Badge */}
            <div className="relative flex-shrink-0">
                {/* Token Icon */}
                <div
                    className={cn(
                        config.icon,
                        'rounded-full overflow-hidden bg-muted/50 flex items-center justify-center',
                        animated && 'animate-pulse'
                    )}
                >
                    <img
                        src={tokenIcon}
                        alt={name || ticker || 'Token'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            // Fallback to placeholder on error
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><circle cx="12" cy="12" r="10"/></svg>';
                        }}
                    />
                </div>

                {/* Chain Badge */}
                {shouldShowBadge && (
                    <div
                        className={cn(
                            config.badge,
                            'absolute rounded-full overflow-hidden bg-background border-2 border-background shadow-sm flex items-center justify-center'
                        )}
                    >
                        <img
                            src={chainIcon}
                            alt="Chain"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>

            {/* Text Content */}
            {showTextContent && (
                <div className="flex flex-col min-w-0">
                    {/* Name and Ticker Row */}
                    {(name || ticker) && (
                        <div className="flex items-center gap-1.5 truncate">
                            {name && (
                                <span className={cn(config.name, 'font-medium text-foreground truncate')}>
                                    {name}
                                </span>
                            )}
                            {ticker && (
                                <span className={cn(config.ticker, 'text-muted-foreground uppercase')}>
                                    {ticker}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price Row */}
                    {price !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={cn(config.price, 'font-semibold text-foreground')}>
                                ${formatPrice(price)}
                            </span>
                            {priceChange !== undefined && (
                                <span
                                    className={cn(
                                        config.price,
                                        'font-medium',
                                        priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * TokenDisplayRow - Horizontal row variant optimized for price lists
 * Like the Uniswap token price list
 */
export interface TokenDisplayRowProps extends TokenDisplayProps {
    /** Show separator line below */
    showDivider?: boolean;
}

export function TokenDisplayRow({
    showDivider = false,
    className,
    ...props
}: TokenDisplayRowProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between py-3 px-4',
                'hover:bg-muted/30 transition-colors duration-200 rounded-lg',
                showDivider && 'border-b border-border/50',
                className
            )}
        >
            <TokenDisplay {...props} />

            {/* Price on the right side for row layout */}
            {props.price !== undefined && (
                <div className="flex items-center gap-2 ml-auto">
                    <span className="font-semibold text-foreground">
                        ${props.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </span>
                    {props.priceChange !== undefined && (
                        <span
                            className={cn(
                                'text-sm font-medium',
                                props.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                            )}
                        >
                            {props.priceChange >= 0 ? '↑' : '↓'} {Math.abs(props.priceChange).toFixed(2)}%
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default TokenDisplay;
