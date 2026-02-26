import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

// ============================================================================
// BCH Wallet Provider — Dual-mode wallet
// ============================================================================
// Mode 1: Cashonize / Zapit via bch-connect (WalletConnect v2 / CashConnect)
//   - Non-custodial, external wallet, sign via WalletConnect
//   - CashonizeBridge component syncs bch-connect React hooks → our context
// Mode 2: Browser wallet via mainnet-js (fallback for testing)
//   - In-browser wallet, WIF stored in localStorage
//   - Full CashToken support via mainnet-js SDK

const BCH_WALLET_KEY = 'bch_wallet_wif';
const BCH_WALLET_MODE_KEY = 'bch_wallet_mode';

export type BCHWalletMode = 'cashonize' | 'browser' | null;

interface BCHWalletContextType {
    // Connection state
    connected: boolean;
    connecting: boolean;
    walletMode: BCHWalletMode;
    address: string | null;
    tokenAddress: string | null;

    // Balances
    balance: number;  // satoshis
    tokenBalances: Record<string, bigint>;

    // Actions
    connectCashonize: () => Promise<void>;     // Connect via bch-connect (WalletConnect → Cashonize)
    connectBrowserWallet: () => Promise<void>; // Create/restore in-browser wallet
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
    getWIF: () => string | null;               // Only for browser wallet mode

    // Internal: used by CashonizeBridge to sync state
    _setCashonizeState: (state: { address: string; tokenAddress: string; balance: number }) => void;
    _requestCashonizeConnect: boolean;
    _onCashonizeConnected: () => void;
}

const BCHWalletContext = createContext<BCHWalletContextType | undefined>(undefined);

// ============================================================================
// BCH Connect Config — used by bch-connect for WalletConnect v2
// ============================================================================
let bchConnectConfig: any = null;

async function getBCHConnectConfig() {
    if (bchConnectConfig) return bchConnectConfig;
    try {
        const { createConfig } = await import('bch-connect');
        bchConnectConfig = createConfig({
            projectId: import.meta.env.VITE_REOWN_PROJECT_ID || "3a21bef83bc04b0e82f0e4ad63ac75d3",
            network: "testnet",
            metadata: {
                name: "Intent Protocol - BCH Swap",
                description: "Swap BCH CashTokens and bridge BCH ↔ Solana",
                url: window.location.origin,
                icons: ["https://raw.githubusercontent.com/nicholasgasior/glyph-examples/master/round/BCH.png"],
            },
            debug: false,
        });
        return bchConnectConfig;
    } catch (e) {
        console.error('Failed to init bch-connect config:', e);
        return null;
    }
}

// ============================================================================
// Provider Component
// ============================================================================

export function BCHWalletProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [walletMode, setWalletMode] = useState<BCHWalletMode>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [tokenBalances, setTokenBalances] = useState<Record<string, bigint>>({});

    // Flag to signal CashonizeBridge to trigger connect
    const [requestCashonizeConnect, setRequestCashonizeConnect] = useState(false);

    // Auto-reconnect browser wallet on mount
    useEffect(() => {
        const savedMode = localStorage.getItem(BCH_WALLET_MODE_KEY) as BCHWalletMode;
        if (savedMode === 'browser') {
            const savedWif = localStorage.getItem(BCH_WALLET_KEY);
            if (savedWif) {
                restoreBrowserWallet(savedWif);
            }
        }
        // Cashonize auto-reconnect is handled by bch-connect's BCHConnectProvider
    }, []);

    // =========================================================================
    // Browser Wallet (mainnet-js)
    // =========================================================================
    const restoreBrowserWallet = async (wif: string) => {
        try {
            const { TestNetWallet } = await import('mainnet-js');
            const wallet = await TestNetWallet.fromWIF(wif);
            const addr = (wallet as any).cashaddr || (wallet as any).address;
            const tAddr = (wallet as any).tokenaddr || addr;

            setAddress(addr);
            setTokenAddress(tAddr);
            setConnected(true);
            setWalletMode('browser');

            // Fetch balance
            try {
                const bal = await wallet.getBalance();
                setBalance(typeof bal === 'number' ? bal : Number(bal) || 0);
            } catch { setBalance(0); }

            // Fetch token balances
            try {
                const utxos = await (wallet as any).getTokenUtxos?.();
                if (utxos && Array.isArray(utxos)) {
                    const tBals: Record<string, bigint> = {};
                    for (const u of utxos) {
                        if (u.token?.category) {
                            const cat = u.token.category;
                            tBals[cat] = (tBals[cat] || 0n) + BigInt(u.token.amount || 0);
                        }
                    }
                    setTokenBalances(tBals);
                }
            } catch { setTokenBalances({}); }
        } catch (e) {
            console.error('Failed to restore BCH browser wallet:', e);
        }
    };

    const connectBrowserWallet = useCallback(async () => {
        setConnecting(true);
        try {
            const { TestNetWallet } = await import('mainnet-js');
            const existingWif = localStorage.getItem(BCH_WALLET_KEY);
            let wallet;

            if (existingWif) {
                wallet = await TestNetWallet.fromWIF(existingWif);
            } else {
                wallet = await TestNetWallet.newRandom();
            }

            const wif = (wallet as any).privateKeyWif || (wallet as any).wif;
            const addr = (wallet as any).cashaddr || (wallet as any).address;
            const tAddr = (wallet as any).tokenaddr || addr;

            if (wif) localStorage.setItem(BCH_WALLET_KEY, wif);
            localStorage.setItem(BCH_WALLET_MODE_KEY, 'browser');

            setAddress(addr);
            setTokenAddress(tAddr);
            setConnected(true);
            setWalletMode('browser');

            // Fetch balance
            try {
                const bal = await wallet.getBalance();
                setBalance(typeof bal === 'number' ? bal : Number(bal) || 0);
            } catch { setBalance(0); }

            toast.success(existingWif ? 'BCH browser wallet reconnected' : 'New BCH chipnet wallet created!', {
                description: `Address: ${addr.slice(0, 20)}...`
            });
        } catch (e: any) {
            console.error('BCH browser wallet connect failed:', e);
            toast.error('Failed to connect BCH browser wallet', { description: e.message });
        } finally {
            setConnecting(false);
        }
    }, []);

    // =========================================================================
    // Cashonize / WalletConnect (bch-connect)
    // =========================================================================
    // Instead of calling hooks imperatively (which is illegal in React),
    // we set a flag that CashonizeBridge watches. When the bridge sees
    // requestCashonizeConnect=true, it calls bch-connect's connect() hook.
    const connectCashonize = useCallback(async () => {
        setConnecting(true);
        setWalletMode('cashonize');
        localStorage.setItem(BCH_WALLET_MODE_KEY, 'cashonize');
        // Signal the bridge component to trigger WalletConnect
        setRequestCashonizeConnect(true);
    }, []);

    // Called by CashonizeBridge when connection succeeds
    const _setCashonizeState = useCallback((state: { address: string; tokenAddress: string; balance: number }) => {
        setAddress(state.address);
        setTokenAddress(state.tokenAddress);
        setBalance(state.balance);
        setConnected(true);
        setWalletMode('cashonize');
        setConnecting(false);
        localStorage.setItem(BCH_WALLET_MODE_KEY, 'cashonize');
    }, []);

    const _onCashonizeConnected = useCallback(() => {
        setRequestCashonizeConnect(false);
        setConnecting(false);
    }, []);

    // =========================================================================
    // Shared actions
    // =========================================================================
    const disconnect = useCallback(() => {
        setConnected(false);
        setAddress(null);
        setTokenAddress(null);
        setBalance(0);
        setTokenBalances({});
        setWalletMode(null);
        setRequestCashonizeConnect(false);
        localStorage.removeItem(BCH_WALLET_MODE_KEY);
        toast.success('BCH wallet disconnected');
    }, []);

    const refreshBalance = useCallback(async () => {
        if (walletMode === 'browser') {
            const wif = localStorage.getItem(BCH_WALLET_KEY);
            if (wif) await restoreBrowserWallet(wif);
        }
        // For cashonize mode, balance is synced by CashonizeBridge
    }, [walletMode]);

    const getWIF = useCallback(() => {
        if (walletMode === 'browser') {
            return localStorage.getItem(BCH_WALLET_KEY);
        }
        return null; // Cashonize doesn't expose WIF
    }, [walletMode]);

    return (
        <BCHWalletContext.Provider
            value={{
                connected,
                connecting,
                walletMode,
                address,
                tokenAddress,
                balance,
                tokenBalances,
                connectCashonize,
                connectBrowserWallet,
                disconnect,
                refreshBalance,
                getWIF,
                _setCashonizeState,
                _requestCashonizeConnect: requestCashonizeConnect,
                _onCashonizeConnected,
            }}
        >
            {children}
        </BCHWalletContext.Provider>
    );
}

// ============================================================================
// CashonizeBridge — lives inside BCHConnectProvider, syncs hook state up
// ============================================================================
// This component uses bch-connect's useWallet() hook (which MUST be inside
// BCHConnectProvider) and syncs the wallet state into our BCHWalletProvider.

function CashonizeBridge() {
    const ctx = useContext(BCHWalletContext);
    const [bchConnectHooks, setBchConnectHooks] = useState<any>(null);

    // Lazy-load bch-connect hooks
    useEffect(() => {
        (async () => {
            try {
                const mod = await import('bch-connect');
                setBchConnectHooks(mod);
            } catch (e) {
                console.error('Failed to load bch-connect:', e);
            }
        })();
    }, []);

    // We can't call hooks conditionally, so we render a sub-component
    // only when bch-connect is loaded
    if (!bchConnectHooks || !ctx) return null;

    return <CashonizeBridgeInner ctx={ctx} bchConnect={bchConnectHooks} />;
}

function CashonizeBridgeInner({ ctx, bchConnect }: { ctx: BCHWalletContextType; bchConnect: any }) {
    const hasTriggeredRef = useRef(false);

    // Use bch-connect's hooks inside the provider tree
    let walletHook: any = null;
    try {
        walletHook = bchConnect.useWallet?.();
    } catch {
        // Hook not available (provider not loaded yet)
    }

    // When the user clicks "Connect Cashonize", trigger WalletConnect
    useEffect(() => {
        if (ctx._requestCashonizeConnect && walletHook?.connect && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            walletHook.connect().then(() => {
                ctx._onCashonizeConnected();
                hasTriggeredRef.current = false;
            }).catch((e: any) => {
                console.error('Cashonize WalletConnect failed:', e);
                toast.error('Cashonize connection failed', { description: e.message });
                ctx._onCashonizeConnected(); // Reset connecting state
                hasTriggeredRef.current = false;
            });
        }
    }, [ctx._requestCashonizeConnect, walletHook]);

    // Sync bch-connect wallet state → our context
    useEffect(() => {
        if (walletHook?.address && walletHook.address !== ctx.address) {
            ctx._setCashonizeState({
                address: walletHook.address,
                tokenAddress: walletHook.tokenAddress || walletHook.address,
                balance: walletHook.balance || 0,
            });
        }
    }, [walletHook?.address, walletHook?.tokenAddress, walletHook?.balance]);

    return null; // Invisible bridge component
}

// ============================================================================
// CashonizeProvider — wraps bch-connect's BCHConnectProvider + Bridge
// ============================================================================
// Place in App.tsx around the BCH swap route.

export function CashonizeProvider({ children }: { children: ReactNode }) {
    const [Provider, setProvider] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        (async () => {
            try {
                const bchConnect = await import('bch-connect');
                const cfg = await getBCHConnectConfig();
                if (cfg && bchConnect.BCHConnectProvider) {
                    setProvider(() => bchConnect.BCHConnectProvider);
                    setConfig(cfg);
                }
            } catch (e) {
                console.error('Failed to load bch-connect provider:', e);
            }
        })();
    }, []);

    if (Provider && config) {
        return (
            <Provider config={config}>
                <CashonizeBridge />
                {children}
            </Provider>
        );
    }

    // Fallback: render without BCHConnectProvider (browser wallet still works)
    return <>{children}</>;
}

// ============================================================================
// Hook
// ============================================================================
export const useBCHWallet = () => {
    const context = useContext(BCHWalletContext);
    if (!context) {
        throw new Error('useBCHWallet must be used within BCHWalletProvider');
    }
    return context;
};
