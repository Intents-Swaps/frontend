import { useState, useEffect, useRef } from 'react';
import { X, Wallet, Bell, LogOut, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceService } from '@/lib/pyth';
import { PriceData } from '@/types';
import { cn } from '@/lib/utils';
import { useWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { WalletTokensTab } from './WalletTokensTab';
import { WalletOrdersTab } from './WalletOrdersTab';
import { WalletHistoryTab } from './WalletHistoryTab';
import { WalletAddressesTab } from './WalletAddressesTab';
import { toast } from 'sonner';
import { usePortfolio } from '@/hooks/usePortfolio';

// ============================================================================
// Wallet Popup — Multi-tab wallet panel for the navbar
// ============================================================================

type TopTab = 'wallet' | 'notifications';
type SubTab = 'tokens' | 'orders' | 'history' | 'addresses';

interface WalletPopupProps {
    open: boolean;
    onClose: () => void;
}

export function WalletPopup({ open, onClose }: WalletPopupProps) {
    const [topTab, setTopTab] = useState<TopTab>('wallet');
    const [subTab, setSubTab] = useState<SubTab>('tokens');
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [priceLoading, setPriceLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const moveWallet = useWallet();
    const solanaWallet = useSolanaWallet();
    const bchWallet = useBCHWallet();

    // Fetch prices
    const fetchPrices = async () => {
        setPriceLoading(true);
        const data = await PriceService.getLatestPrices();
        setPrices(data);
        setPriceLoading(false);
    };

    useEffect(() => {
        if (open) {
            fetchPrices();
            const interval = setInterval(fetchPrices, 15000);
            return () => clearInterval(interval);
        }
    }, [open]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Delay to avoid click-through from the trigger button
        const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handler);
        };
    }, [open, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Calculate total portfolio value using shared hook to ensure UI consistency
    const { tokens: activeTokens, totalValue: portfolioValue, loading: portfolioLoading } = usePortfolio();

    // Disconnect all wallets
    const handleLogout = () => {
        if (moveWallet.connected) moveWallet.disconnect();
        if (solanaWallet.connected) solanaWallet.disconnect();
        if (bchWallet.connected) bchWallet.disconnect();
        toast.success('All wallets disconnected');
        onClose();
    };

    // Get shortened address for display
    const getDisplayAddress = (): string => {
        if (moveWallet.connected && moveWallet.account?.address) {
            const addr = moveWallet.account.address.toString();
            return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
        }
        if (solanaWallet.connected && solanaWallet.publicKey) {
            const addr = solanaWallet.publicKey.toBase58();
            return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
        }
        if (bchWallet.connected && bchWallet.address) {
            return `${bchWallet.address.slice(0, 12)}...`;
        }
        return '';
    };

    if (!open) return null;

    return (
        <div
            ref={panelRef}
            className={cn(
                "fixed top-[80px] right-4 z-[100] w-[380px] max-h-[calc(100vh-100px)]",
                "bg-[#0A0A0A]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08]",
                "shadow-2xl shadow-black/50 flex flex-col",
                "animate-in slide-in-from-top-2 fade-in duration-200"
            )}
        >
            {/* ─── Top Tab Bar ─── */}
            <div className="flex items-center justify-between px-1 pt-1 pb-0 border-b border-white/[0.06]">
                <div className="flex">
                    <button
                        onClick={() => setTopTab('wallet')}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors",
                            topTab === 'wallet'
                                ? "text-primary bg-white/[0.04] border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Wallet className="h-3.5 w-3.5" />
                        Wallet
                    </button>
                    <button
                        onClick={() => setTopTab('notifications')}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors",
                            topTab === 'notifications'
                                ? "text-primary bg-white/[0.04] border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Bell className="h-3.5 w-3.5" />
                        Notifications
                    </button>
                </div>
                <div className="flex items-center gap-1 pr-2">
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        onClick={handleLogout}
                        title="Disconnect all wallets"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {topTab === 'wallet' ? (
                <>
                    {/* ─── Portfolio Value ─── */}
                    <div className="px-4 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    Total Portfolio Value
                                </span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                    onClick={fetchPrices} disabled={priceLoading || portfolioLoading}>
                                    <RefreshCw className={cn("h-3 w-3", (priceLoading || portfolioLoading) && "animate-spin")} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                    onClick={() => setBalanceVisible(v => !v)}>
                                    {balanceVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                            </div>
                            {getDisplayAddress() && (
                                <span className="text-[9px] font-mono text-muted-foreground/60 bg-white/[0.03] px-2 py-0.5 rounded-md">
                                    {getDisplayAddress()}
                                </span>
                            )}
                        </div>
                        <div className="text-2xl font-bold tracking-tight">
                            {balanceVisible
                                ? `$${portfolioValue.toFixed(2)}`
                                : '••••••'
                            }
                        </div>
                    </div>

                    {/* ─── Sub Tabs ─── */}
                    <div className="flex border-b border-white/[0.06]">
                        {(['tokens', 'orders', 'history', 'addresses'] as SubTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setSubTab(tab)}
                                className={cn(
                                    "flex-1 py-2 text-[11px] font-medium capitalize transition-colors relative",
                                    subTab === tab
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                                {subTab === tab && (
                                    <span className="absolute bottom-0 left-1/4 w-1/2 h-[2px] bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ─── Tab Content ─── */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 max-h-[400px]">
                        {subTab === 'tokens' && <WalletTokensTab prices={prices} balanceVisible={balanceVisible} activeTokens={activeTokens} />}
                        {subTab === 'orders' && <WalletOrdersTab />}
                        {subTab === 'history' && <WalletHistoryTab />}
                        {subTab === 'addresses' && <WalletAddressesTab />}
                    </div>
                </>
            ) : (
                /* ─── Notifications Tab ─── */
                <div className="flex-1 px-4 py-10 text-center">
                    <Bell className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Swap confirmations and alerts will appear here
                    </p>
                </div>
            )}
        </div>
    );
}
