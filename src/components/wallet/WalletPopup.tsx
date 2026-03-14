import { useState, useEffect, useRef } from 'react';
import { X, Wallet, Bell, LogOut, RefreshCw, Eye, EyeOff, CheckCircle2, Clock, Loader2, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useBCHSwapOptional } from '@/context/BCHSwapContext';
import { BCHOrder } from '@/types';
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

// ============================================================================
// Notifications Panel — Shows captured toast/notification events
// ============================================================================

const NOTIF_STORAGE_KEY = 'intent_notifications';

export interface StoredNotification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    description?: string;
    timestamp: number;
}

/** Call this alongside toast() to also store the notification for the wallet panel */
export function pushNotification(type: StoredNotification['type'], message: string, description?: string) {
    try {
        const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
        const list: StoredNotification[] = raw ? JSON.parse(raw) : [];
        list.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            message,
            description,
            timestamp: Date.now(),
        });
        // Keep last 50
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch { /* non-fatal */ }
}

function getTimeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

function NotificationsPanel() {
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const load = () => {
            try {
                const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
                setNotifications(raw ? JSON.parse(raw) : []);
            } catch { setNotifications([]); }
        };
        load();
        // Poll every 2s to catch new toasts
        const interval = setInterval(load, 2000);
        return () => clearInterval(interval);
    }, []);

    const clearAll = () => {
        localStorage.removeItem(NOTIF_STORAGE_KEY);
        setNotifications([]);
    };

    const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        success: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, color: 'border-emerald-500/30' },
        error: { icon: <XCircle className="h-4 w-4 text-red-400" />, color: 'border-red-500/30' },
        info: { icon: <Bell className="h-4 w-4 text-blue-400" />, color: 'border-blue-500/30' },
        warning: { icon: <Clock className="h-4 w-4 text-yellow-400" />, color: 'border-yellow-500/30' },
    };

    if (notifications.length === 0) {
        return (
            <div className="flex-1 px-4 py-10 text-center">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Toast events will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto max-h-[400px] px-3 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <div className="flex items-center justify-between px-1 py-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {notifications.length} Notifications
                </span>
                <button
                    onClick={clearAll}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                >
                    Clear All
                </button>
            </div>
            <div className="space-y-1.5">
                {notifications.map(notif => {
                    const cfg = typeConfig[notif.type] || typeConfig.info;
                    return (
                        <div
                            key={notif.id}
                            className={cn(
                                "flex items-start gap-2.5 p-2.5 rounded-lg border-l-2 bg-white/[0.02] hover:bg-white/[0.04] transition-colors",
                                cfg.color
                            )}
                        >
                            <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground">{notif.message}</div>
                                {notif.description && (
                                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</div>
                                )}
                                <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                                    {getTimeAgo(notif.timestamp)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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
    const { tokens: activeTokens, totalValue: portfolioValue, loading: portfolioLoading, refetch: refetchPortfolio } = usePortfolio();

    const handleGlobalRefresh = async () => {
        setPriceLoading(true);
        await Promise.all([
            fetchPrices(),
            refetchPortfolio()
        ]);
        setPriceLoading(false);
    };

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
                                    onClick={handleGlobalRefresh} disabled={priceLoading || portfolioLoading}>
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
                <NotificationsPanel />
            )}
        </div>
    );
}
