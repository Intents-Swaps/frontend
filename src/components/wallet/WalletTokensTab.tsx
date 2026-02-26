import { useEffect, useState } from 'react';
import { useWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { PriceService } from '@/lib/pyth';
import { PriceData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Loader2, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortfolioToken } from '@/hooks/usePortfolio';
import { CauldronService } from '@/lib/cauldron';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createCloseAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT } from '@solana/spl-token';
import { toast } from 'sonner';

// ============================================================================
// Token definitions for all chains
// ============================================================================

const WALLET_TOKENS = [
    // Bitcoin Cash (Moved to top)
    { symbol: 'BCH', name: 'Bitcoin Cash', chain: 'Bitcoin Cash', priceKey: 'BCH', icon: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png', decimals: 8 },

    // Movement Chain
    { symbol: 'MOVE', name: 'Movement Coin', chain: 'Movement', priceKey: 'MOVE', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png', decimals: 8 },
    { symbol: 'USDC.e', name: 'Bridged USDC', chain: 'Movement', priceKey: 'USDC.e', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/USDC.png', decimals: 6 },
    { symbol: 'USDT.e', name: 'Bridged USDT', chain: 'Movement', priceKey: 'USDT.e', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/USDT.png', decimals: 6 },

    // Solana Chain
    { symbol: 'SOL', name: 'Solana', chain: 'Solana', priceKey: 'SOL', icon: '/assets/solanaLogo.png', decimals: 9 },
    { symbol: 'WSOL', name: 'Wrapped SOL', chain: 'Solana', priceKey: 'SOL', icon: '/assets/solanaLogo.png', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', chain: 'Solana', priceKey: 'USDC', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', chain: 'Solana', priceKey: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', decimals: 6 },
];

interface WalletTokensTabProps {
    prices: Record<string, PriceData>;
    balanceVisible: boolean;
    activeTokens: PortfolioToken[];
}

export function WalletTokensTab({ prices, balanceVisible, activeTokens }: WalletTokensTabProps) {
    const moveWallet = useWallet();
    const solanaWallet = useSolanaWallet();
    const bchWallet = useBCHWallet();

    const [dynamicTokens, setDynamicTokens] = useState<any[]>([]);
    const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);
    const { connection } = useConnection();
    const [isUnwrapping, setIsUnwrapping] = useState(false);

    const unwrapWSOL = async () => {
        if (!solanaWallet.publicKey || !solanaWallet.signTransaction) {
            toast.error('Solana wallet not connected');
            return;
        }

        setIsUnwrapping(true);
        try {
            const wsolAta = await getAssociatedTokenAddress(NATIVE_MINT, solanaWallet.publicKey);

            const ix = createCloseAccountInstruction(
                wsolAta, // account to close
                solanaWallet.publicKey, // destination for rent lamports + wrapped lamports
                solanaWallet.publicKey // authority
            );

            const tx = new Transaction().add(ix);
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = solanaWallet.publicKey;

            const signed = await solanaWallet.signTransaction(tx);
            const signature = await connection.sendRawTransaction(signed.serialize());

            await connection.confirmTransaction(signature, 'confirmed');
            toast.success('Successfully unwrapped WSOL');
        } catch (error: any) {
            console.error('Failed to unwrap WSOL:', error);
            toast.error('Failed to unwrap WSOL', { description: error.message });
        } finally {
            setIsUnwrapping(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetchTokens = async () => {
            setIsLoadingDynamic(true);
            const rawTokens = await CauldronService.getTopCashTokens(10);
            if (mounted) {
                const mapped = CauldronService.mapToTokens(rawTokens).map(t => ({
                    symbol: t.symbol,
                    name: t.name,
                    chain: 'Bitcoin Cash',
                    priceKey: t.symbol,
                    icon: t.icon,
                    decimals: t.decimals,
                    type: t.type
                }));
                // Filter out existing
                const existing = new Set(WALLET_TOKENS.map(w => w.symbol));
                setDynamicTokens(mapped.filter(m => !existing.has(m.symbol)));
                setIsLoadingDynamic(false);
            }
        };
        fetchTokens();
        return () => { mounted = false; };
    }, []);

    // Get balance for each token based on chain connection
    const getBalance = (token: any): number | null => {
        // First check if the live Portfolio hook found a balance for it
        const found = activeTokens.find(t => t.chain === token.chain && t.symbol === token.symbol);
        if (found) return found.balance;

        // Otherwise fallback to 0 if connected but empty, or check token records
        switch (token.chain) {
            case 'Movement':
                if (!moveWallet.connected) return null;
                return 0;
            case 'Solana':
                if (!solanaWallet.connected) return null;
                return 0;
            case 'Bitcoin Cash':
                if (!bchWallet.connected) return null;
                if (token.type) {
                    const bal = bchWallet.tokenBalances[token.type];
                    if (bal) return Number(bal) / Math.pow(10, token.decimals || 0);
                }
                return 0;
            default:
                return null;
        }
    };

    const getChainColor = (chain: string) => {
        switch (chain) {
            case 'Movement': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
            case 'Solana': return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
            case 'Bitcoin Cash': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
            default: return '';
        }
    };

    const isChainConnected = (chain: string) => {
        switch (chain) {
            case 'Movement': return moveWallet.connected;
            case 'Solana': return solanaWallet.connected;
            case 'Bitcoin Cash': return bchWallet.connected;
            default: return false;
        }
    };

    const displayTokens = [...WALLET_TOKENS, ...dynamicTokens];

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-1 py-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    {displayTokens.length} Assets
                    {isLoadingDynamic && <Loader2 className="animate-spin h-3 w-3" />}
                </span>
            </div>

            {displayTokens.map((token) => {
                const priceData = prices[token.priceKey];
                const price = PriceService.formatPrice(priceData);
                const balance = getBalance(token);
                const usdValue = balance !== null ? balance * price : 0;
                const connected = isChainConnected(token.chain);
                // Mock 24h change
                const change = priceData ? (Math.random() * 4 - 2) : 0;

                return (
                    <div
                        key={token.type ? `${token.chain}-${token.type}` : `${token.chain}-${token.symbol}`}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    <img src={token.icon} alt={token.name} className="h-6 w-6 object-contain" />
                                </div>
                                {connected && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0A0A]" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold">{token.symbol}</span>
                                    <Badge variant="outline" className={cn('text-[8px] h-3.5 px-1 border', getChainColor(token.chain))}>
                                        {token.chain === 'Bitcoin Cash' ? 'BCH' : token.chain}
                                    </Badge>
                                </div>
                                <span className="text-[11px] text-muted-foreground">{token.name}</span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            {connected ? (
                                <>
                                    <div className="text-sm font-semibold">
                                        {balanceVisible
                                            ? `$${usdValue.toFixed(2)}`
                                            : '••••'
                                        }
                                    </div>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {balanceVisible
                                                ? `${balance?.toFixed(token.decimals > 6 ? 6 : token.decimals)} ${token.symbol}`
                                                : '••••'
                                            }
                                        </span>
                                    </div>

                                    {token.symbol === 'WSOL' && balance !== null && balance > 0 && (
                                        <div className="mt-1 flex justify-end">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); unwrapWSOL(); }}
                                                disabled={isUnwrapping}
                                                className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                                            >
                                                {isUnwrapping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Coins className="h-3 w-3" />}
                                                Unwrap
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-[10px] text-muted-foreground/60">Not connected</span>
                            )}
                            {price > 0 && (
                                <div className={cn(
                                    'flex items-center justify-end text-[10px] font-medium',
                                    change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                )}>
                                    {change >= 0
                                        ? <ArrowUpRight className="h-2.5 w-2.5" />
                                        : <ArrowDownRight className="h-2.5 w-2.5" />
                                    }
                                    {Math.abs(change).toFixed(2)}%
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
