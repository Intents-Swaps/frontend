import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Loader2, Zap, Globe, AlertTriangle } from 'lucide-react';
import { Token, BCHSwapParams, BCHSwapType, BCHOrderType } from '@/types';
import { BCHTokenSelector, BCH_TOKENS, SOLANA_TOKENS, ALL_BCH_SWAP_TOKENS } from './BCHTokenSelector';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { useBCHSwap } from '@/context/BCHSwapContext';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useLocation } from 'react-router-dom';
import { useWallet as useMovementWallet } from '@/context/wallet-provider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PriceService, PRICE_FEEDS } from '@/lib/pyth';
import { CauldronService } from '@/lib/cauldron';
import { PriceData } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================================
// BCH Swap Card — Unified swap card with auto chain detection
// ============================================================================

export interface BCHSwapCardProps {
    orderType: BCHOrderType;
    onOrderTypeChange: (type: BCHOrderType) => void;
}

export function BCHSwapCard({ orderType, onOrderTypeChange }: BCHSwapCardProps) {
    const location = useLocation();

    // Parse query params for default tokens
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    // Find tokens matching the query params or fallback to defaults
    const initialSellToken = useMemo(() => {
        const sellParam = queryParams.get('sell');
        if (sellParam) {
            return ALL_BCH_SWAP_TOKENS.find(t => t.symbol.toUpperCase() === sellParam.toUpperCase()) || BCH_TOKENS[0];
        }
        return BCH_TOKENS[0];
    }, [queryParams]);

    const initialBuyToken = useMemo(() => {
        const buyParam = queryParams.get('buy');
        if (buyParam) {
            return ALL_BCH_SWAP_TOKENS.find(t => t.symbol.toUpperCase() === buyParam.toUpperCase()) || SOLANA_TOKENS[0];
        }
        return SOLANA_TOKENS[0];
    }, [queryParams]);

    // Token selection
    const [sellToken, setSellToken] = useState<Token>(initialSellToken);
    const [buyToken, setBuyToken] = useState<Token>(initialBuyToken);

    // Amounts
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');

    // Order config
    const [duration, setDuration] = useState(3600); // For market Dutch auction
    const [limitPrice, setLimitPrice] = useState<string>('');
    const [expiryValue, setExpiryValue] = useState<string>('86400'); // Default 24h for limit orders

    // XMR Specific Parameters
    const [xmrAddress, setXmrAddress] = useState('');
    const [xmrViewKey, setXmrViewKey] = useState('');
    const [xmrSpendKey, setXmrSpendKey] = useState('');

    // Prices
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [cauldronPrices, setCauldronPrices] = useState<Record<string, number>>({});

    // Context
    const bchWallet = useBCHWallet();
    const { detectSwapType, executeSwap, isLoading, swapStep } = useBCHSwap();
    const solanaWallet = useSolanaWallet();
    const { account: movementAccount } = useMovementWallet();

    // Auto-detect swap type
    const swapType: BCHSwapType = useMemo(() => {
        return detectSwapType(sellToken.chain, buyToken.chain);
    }, [sellToken, buyToken, detectSwapType]);

    // Update tokens if URL params change after mount
    useEffect(() => {
        const sellParam = queryParams.get('sell');
        const buyParam = queryParams.get('buy');
        if (sellParam) {
            const token = ALL_BCH_SWAP_TOKENS.find(t => t.symbol.toUpperCase() === sellParam.toUpperCase());
            if (token) setSellToken(token);
        }
        if (buyParam) {
            const token = ALL_BCH_SWAP_TOKENS.find(t => t.symbol.toUpperCase() === buyParam.toUpperCase());
            if (token) setBuyToken(token);
        }
    }, [queryParams]);

    // Fetch prices from both Pyth (major assets) and Cauldron (CashTokens)
    useEffect(() => {
        const fetchAllPrices = async () => {
            // Pyth for BCH, SOL, USDC, USDT
            const pythData = await PriceService.getLatestPrices();
            setPrices(pythData);

            // Cauldron for CashTokens
            try {
                const rawTokens = await CauldronService.getTopCashTokens(50);
                const priceMap: Record<string, number> = {};
                for (const t of rawTokens) {
                    const sym = (t.bcmr?.token?.symbol || t.display_symbol || '').toUpperCase();
                    if (sym && t.price_now_usd > 0) {
                        priceMap[sym] = t.price_now_usd;
                    }
                    // Also key by categoryId
                    if (t.token_id && t.price_now_usd > 0) {
                        priceMap[t.token_id] = t.price_now_usd;
                    }
                }
                setCauldronPrices(priceMap);
            } catch { /* non-fatal */ }
        };
        fetchAllPrices();
        const interval = setInterval(fetchAllPrices, 15000);
        return () => clearInterval(interval);
    }, []);

    /**
     * Resolve the USD price for a token.
     * Priority: 1) Pyth feed 2) Cauldron by symbol 3) Cauldron by categoryId 4) token.priceUsd
     */
    const getTokenPrice = useCallback((token: Token): number => {
        // 1. Try Pyth (works for BCH, SOL, USDC, USDT)
        const cleanSymbol = token.symbol.replace('.b', ''); // SOL.b → SOL
        const feedKey = Object.keys(PRICE_FEEDS).find(k =>
            k.toUpperCase() === cleanSymbol.toUpperCase()
        );
        if (feedKey && prices[feedKey]) {
            return PriceService.formatPrice(prices[feedKey]);
        }

        // 2. Try Cauldron by symbol
        if (cauldronPrices[token.symbol] > 0) {
            return cauldronPrices[token.symbol];
        }
        if (cauldronPrices[cleanSymbol] > 0) {
            return cauldronPrices[cleanSymbol];
        }

        // 3. Try Cauldron by categoryId
        if (token.categoryId && cauldronPrices[token.categoryId] > 0) {
            return cauldronPrices[token.categoryId];
        }

        // 4. Token's own embedded price (set when dynamically loaded from Cauldron)
        if (token.priceUsd && token.priceUsd > 0) {
            return token.priceUsd;
        }

        return 0;
    }, [prices, cauldronPrices]);

    // Calculate current market ratio
    const currentMarketRatio = useMemo(() => {
        const sellPrice = getTokenPrice(sellToken);
        const buyPrice = getTokenPrice(buyToken);
        if (sellPrice > 0 && buyPrice > 0) return (sellPrice / buyPrice);
        return 0;
    }, [sellToken, buyToken, prices, cauldronPrices, getTokenPrice]);

    // Auto-populate limit price if empty
    useEffect(() => {
        if (!limitPrice && currentMarketRatio > 0 && orderType === 'limit') {
            setLimitPrice(currentMarketRatio.toFixed(6));
        }
    }, [currentMarketRatio, limitPrice, orderType]);

    // Auto-calculate buy amount when sell changes
    useEffect(() => {
        if (!sellAmount || Number(sellAmount) <= 0) {
            setBuyAmount('');
            return;
        }

        const sellPrice = getTokenPrice(sellToken);
        const buyPrice = getTokenPrice(buyToken);

        if (sellPrice > 0 && buyPrice > 0) {
            const usdValue = Number(sellAmount) * sellPrice;
            const estimated = usdValue / buyPrice;
            setBuyAmount(estimated.toFixed(6));
        }
    }, [sellAmount, sellToken, buyToken, prices, cauldronPrices, getTokenPrice]);


    // Swap direction
    const flipTokens = () => {
        const tempToken = sellToken;
        const tempAmount = sellAmount;
        setSellToken(buyToken);
        setBuyToken(tempToken);
        setSellAmount(buyAmount);
        setBuyAmount(tempAmount);
    };

    // Which wallets are needed?
    const needsBCHWallet = sellToken.chain === 'bch' || buyToken.chain === 'bch';
    const needsSolanaWallet = sellToken.chain === 'solana' || buyToken.chain === 'solana';
    const bchConnected = bchWallet.connected;
    const solanaConnected = solanaWallet.connected;

    // Can submit?
    const canSubmit = useMemo(() => {
        if (!sellAmount || Number(sellAmount) <= 0) return false;
        if (!buyAmount || Number(buyAmount) <= 0) return false;
        if (needsBCHWallet && !bchConnected) return false;
        if (needsSolanaWallet && !solanaConnected) return false;
        if (swapType === 'bch-to-xmr' && (!xmrAddress || !xmrViewKey || !xmrSpendKey)) return false;
        if (swapType === 'xmr-to-bch' && !bchConnected) return false; // Needs destination
        return true;
    }, [sellAmount, buyAmount, needsBCHWallet, bchConnected, needsSolanaWallet, solanaConnected, swapType, xmrAddress, xmrViewKey, xmrSpendKey]);

    // Submit
    const handleSwap = async () => {
        if (!canSubmit) return;

        const params: BCHSwapParams = {
            sellToken,
            buyToken,
            sellAmount: Number(sellAmount),
            buyAmount: Number(buyAmount),
            swapType,
            orderType,
            duration: orderType === 'market' ? duration : undefined,
            expiryTime: orderType === 'limit'
                ? (expiryValue === 'forever' ? 4102444800 : Math.floor(Date.now() / 1000) + parseInt(expiryValue))
                : undefined,
            xmr: swapType === 'bch-to-xmr' ? {
                viewKey: xmrViewKey,
                spendKey: xmrSpendKey
            } : undefined,
        };

        let recipientAddress: string | undefined;

        if (swapType === 'bch-to-sol' && solanaWallet.publicKey) {
            recipientAddress = solanaWallet.publicKey.toBase58();
        } else if (swapType === 'bch-to-xmr' && xmrAddress) {
            recipientAddress = xmrAddress;
        } else if ((swapType === 'sol-to-bch' || swapType === 'mov-to-bch' || swapType === 'xmr-to-bch') && bchWallet.address) {
            recipientAddress = bchWallet.address;
        } else if (swapType === 'bch-to-mov' && movementAccount?.address) {
            recipientAddress = movementAccount.address.toString();
        }

        try {
            await executeSwap(params, recipientAddress || '');
            setSellAmount('');
            setBuyAmount('');
        } catch (e: any) {
            // Error toast is handled in context
        }
    };

    // Swap type badge info
    const swapTypeInfo: Record<string, any> = {
        'same-chain': {
            icon: <Zap className="h-3.5 w-3.5" />,
            label: 'Same Chain',
            color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
            desc: 'Covenant-based atomic swap on BCH'
        },
        'bch-to-sol': {
            icon: <Globe className="h-3.5 w-3.5" />,
            label: 'Cross Chain',
            color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
            desc: 'HTLC relay BCH → Solana'
        },
        'sol-to-bch': {
            icon: <Globe className="h-3.5 w-3.5" />,
            label: 'Cross Chain',
            color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
            desc: 'HTLC relay Solana → BCH'
        },
        'bch-to-mov': {
            icon: <Globe className="h-3.5 w-3.5" />,
            label: 'Cross Chain',
            color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
            desc: 'HTLC relay BCH → Movement'
        },
        'mov-to-bch': {
            icon: <Globe className="h-3.5 w-3.5" />,
            label: 'Cross Chain',
            color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
            desc: 'HTLC relay Movement → BCH'
        },
        'bch-to-xmr': {
            icon: <Zap className="h-3.5 w-3.5" />,
            label: 'Atomic Swap',
            color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
            desc: 'Adaptor Signature Swap BCH → XMR'
        },
        'xmr-to-bch': {
            icon: <Zap className="h-3.5 w-3.5" />,
            label: 'Atomic Swap',
            color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
            desc: 'Adaptor Signature Swap XMR → BCH'
        },
    };

    const typeInfo = swapTypeInfo[swapType] || {
        icon: <Zap className="h-3.5 w-3.5" />,
        label: 'Swap',
        color: 'bg-muted text-muted-foreground border-border',
        desc: ''
    };

    // CTA button logic
    const renderCTA = () => {
        if (needsBCHWallet && !bchConnected) {
            return (
                <div className="space-y-2">
                    <Button
                        className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                        onClick={bchWallet.connectCashonize}
                        disabled={bchWallet.connecting}
                    >
                        {bchWallet.connecting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                        ) : (
                            '🔗 Connect Cashonize (WalletConnect)'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-9 text-xs"
                        onClick={bchWallet.connectBrowserWallet}
                        disabled={bchWallet.connecting}
                    >
                        🌐 Use Browser Wallet (Chipnet)
                    </Button>
                </div>
            );
        }

        if (needsSolanaWallet && !solanaConnected) {
            return (
                <div className="w-full">
                    <WalletMultiButton style={{
                        width: '100%',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        justifyContent: 'center',
                    }} />
                </div>
            );
        }

        if (!sellAmount || Number(sellAmount) <= 0) {
            return (
                <Button className="w-full h-12 text-base font-semibold" disabled>
                    Enter an amount
                </Button>
            );
        }

        return (
            <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                onClick={handleSwap}
                disabled={!canSubmit || isLoading}
            >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {swapStep || 'Processing...'}</>
                ) : (
                    `Swap ${sellToken.symbol} → ${buyToken.symbol}`
                )}
            </Button>
        );
    };

    const sellUSD = sellAmount ? (Number(sellAmount) * getTokenPrice(sellToken)).toFixed(2) : '0.00';
    const buyUSD = buyAmount ? (Number(buyAmount) * getTokenPrice(buyToken)).toFixed(2) : '0.00';

    return (
        <Card className="border-muted/50 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 space-y-4">
                {/* Header with swap type badge */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">BCH Swap</h2>
                    <Badge variant="outline" className={cn("text-xs flex items-center gap-1", typeInfo.color)}>
                        {typeInfo.icon}
                        {typeInfo.label}
                    </Badge>
                </div>

                {/* Order Type Tabs */}
                <Tabs value={orderType} onValueChange={v => onOrderTypeChange(v as BCHOrderType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="market" className="text-xs">Market (Dutch Auction)</TabsTrigger>
                        <TabsTrigger value="limit" className="text-xs">Limit Order</TabsTrigger>
                    </TabsList>

                    {/* Market-specific: Duration slider */}
                    <TabsContent value="market" className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span>Auction Duration</span>
                            <span className="font-medium text-foreground">{Math.floor(duration / 60)}m {duration % 60}s</span>
                        </div>
                        <input
                            type="range"
                            min={60}
                            max={3600}
                            step={60}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full mt-1 accent-emerald-500"
                        />
                    </TabsContent>

                    <TabsContent value="limit" className="mt-3">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                <span>Limit Price</span>
                                <span className="font-medium text-foreground">
                                    1 {sellToken.symbol} = {limitPrice || '0.00'} {buyToken.symbol}
                                </span>
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={limitPrice}
                                    onChange={(e) => setLimitPrice(e.target.value)}
                                    className="h-12 bg-white/5 border-white/10 text-lg font-medium pr-20 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground flex flex-col items-end leading-tight">
                                    <span>{buyToken.symbol}</span>
                                    <span className="text-[10px] opacity-70">per received</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Market', mult: 1 },
                                    { label: '+1%', mult: 1.01 },
                                    { label: '+5%', mult: 1.05 },
                                    { label: '-1%', mult: 0.99 },
                                ].map((preset) => (
                                    <Badge
                                        key={preset.label}
                                        variant="outline"
                                        className="cursor-pointer bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 border-white/10 text-xs py-1 transition-colors"
                                        onClick={() => {
                                            if (currentMarketRatio > 0) {
                                                setLimitPrice((currentMarketRatio * preset.mult).toFixed(6));
                                            }
                                        }}
                                    >
                                        {preset.label}
                                    </Badge>
                                ))}
                            </div>

                            {/* Expiry Selector for Limit Orders */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1.5">
                                    <span>Expiration</span>
                                </div>
                                <Select value={expiryValue} onValueChange={setExpiryValue}>
                                    <SelectTrigger className="w-full h-11 bg-white/5 border-white/10 focus:ring-emerald-500/50">
                                        <SelectValue placeholder="Select expiration limit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3600">1 Hour</SelectItem>
                                        <SelectItem value="86400">24 Hours</SelectItem>
                                        <SelectItem value="604800">7 Days</SelectItem>
                                        <SelectItem value="2592000">30 Days</SelectItem>
                                        <SelectItem value="forever">Forever</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Sell Input */}
                <div className="rounded-xl bg-muted/40 border border-muted/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">You sell</span>
                        {bchConnected && sellToken.chain === 'bch' && (
                            <button
                                className="text-xs text-blue-400 hover:text-blue-300"
                                onClick={() => {
                                    if (sellToken.type === 'native') {
                                        setSellAmount((bchWallet.balance / 1e8).toFixed(8));
                                    }
                                }}
                            >
                                Max
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            placeholder="0.0"
                            className="border-none bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={sellAmount}
                            onChange={e => setSellAmount(e.target.value)}
                        />
                        <BCHTokenSelector
                            value={sellToken}
                            onSelect={setSellToken}
                            tokens={ALL_BCH_SWAP_TOKENS}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">≈ ${sellUSD}</div>
                </div>

                {/* Flip Button */}
                <div className="flex justify-center -my-1 relative z-10">
                    <button
                        onClick={flipTokens}
                        className="p-2 rounded-xl bg-card border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowDownUp className="h-4 w-4" />
                    </button>
                </div>

                {/* Buy Input */}
                <div className="rounded-xl bg-muted/40 border border-muted/50 p-4 space-y-2">
                    <span className="text-xs text-muted-foreground">You receive</span>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            placeholder="0.0"
                            className="border-none bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={buyAmount}
                            onChange={e => setBuyAmount(e.target.value)}
                            readOnly={orderType === 'market'}
                        />
                        <BCHTokenSelector
                            value={buyToken}
                            onSelect={setBuyToken}
                            tokens={ALL_BCH_SWAP_TOKENS}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">≈ ${buyUSD}</div>
                </div>

                {/* Conditional XMR Parameters */}
                {swapType === 'bch-to-xmr' && (
                    <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                            <Zap className="h-4 w-4" />
                            <span>Monero Adaptor Parameters</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Recipient XMR Address</label>
                                <Input
                                    type="text"
                                    placeholder="4..."
                                    className="h-9 bg-white/5 border-white/10 text-xs focus-visible:ring-1 focus-visible:ring-orange-500/50"
                                    value={xmrAddress}
                                    onChange={e => setXmrAddress(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Private View Key</label>
                                    <Input
                                        type="password"
                                        placeholder="Hex format"
                                        className="h-9 bg-white/5 border-white/10 text-xs focus-visible:ring-1 focus-visible:ring-orange-500/50"
                                        value={xmrViewKey}
                                        onChange={e => setXmrViewKey(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Private Spend Key</label>
                                    <Input
                                        type="password"
                                        placeholder="Hex format"
                                        className="h-9 bg-white/5 border-white/10 text-xs focus-visible:ring-1 focus-visible:ring-orange-500/50"
                                        value={xmrSpendKey}
                                        onChange={e => setXmrSpendKey(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground bg-orange-500/10 p-2 rounded border border-orange-500/20 leading-tight">
                                These keys remain client-side to derive the adaptor parameters and decrypt your XMR when the relayer completes the swap.
                            </div>
                        </div>
                    </div>
                )}

                {swapType === 'xmr-to-bch' && (
                    <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                            <Zap className="h-4 w-4" />
                            <span>Monero Deposit</span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-orange-500/10 p-3 rounded border border-orange-500/20 leading-relaxed">
                            <p className="mb-2"><strong className="text-white">Relayer-assisted swap:</strong> You do not need to provide keys for this direction.</p>
                            <p>After clicking "Swap", the backend will generate a unique Monero Stagenet deposit address for this transaction. You will have 2 hours to send the exact XMR amount to that address.</p>
                        </div>
                    </div>
                )}

                {/* Route Info */}
                {sellAmount && Number(sellAmount) > 0 && (
                    <div className="rounded-lg bg-muted/20 border border-muted/30 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Route</span>
                            <span className="font-medium text-foreground">{typeInfo.desc}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Rate</span>
                            <span className="font-medium text-foreground">
                                1 {sellToken.symbol} ≈ {
                                    getTokenPrice(sellToken) > 0 && getTokenPrice(buyToken) > 0
                                        ? (getTokenPrice(sellToken) / getTokenPrice(buyToken)).toFixed(6)
                                        : '...'
                                } {buyToken.symbol}
                            </span>
                        </div>
                        {swapType !== 'same-chain' && (
                            <div className="flex items-center gap-1 text-yellow-400/80 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Cross-chain swap uses HTLC with relayer</span>
                            </div>
                        )}
                    </div>
                )}

                {/* CTA Button */}
                {renderCTA()}

                {/* Cross-chain step progress */}
                {isLoading && swapStep && swapType !== 'same-chain' && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="font-medium">{swapStep}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {swapType === 'bch-to-sol'
                                ? 'Deploying HTLC covenant on BCH, then notifying relayer to fill on Solana.'
                                : 'Creating escrow on Solana, then notifying relayer to fill on BCH.'}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
