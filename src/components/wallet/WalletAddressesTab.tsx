import { useWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Loader2, Shield, Globe, LogOut, Plug } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// Wallet Addresses Tab — Connect/disconnect wallets per chain
// ============================================================================

function copyAddress(address: string, label: string) {
    navigator.clipboard.writeText(address);
    toast.success(`${label} address copied!`);
}

function formatAddr(addr: string) {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}

export function WalletAddressesTab() {
    const moveWallet = useWallet();
    const solanaWallet = useSolanaWallet();
    const bchWallet = useBCHWallet();

    return (
        <div className="space-y-3 pt-2">
            {/* Movement Chain */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <img src="https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png"
                                alt="Movement" className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold">Movement</span>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${moveWallet.connected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                                <span className="text-[9px] text-muted-foreground">
                                    {moveWallet.connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {moveWallet.connected ? (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={moveWallet.disconnect}>
                            <LogOut className="h-3 w-3 mr-1" /> Disconnect
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                            onClick={moveWallet.connect} disabled={moveWallet.connecting}>
                            <Plug className="h-3 w-3 mr-1" /> {moveWallet.connecting ? 'Connecting...' : 'Connect'}
                        </Button>
                    )}
                </div>
                {moveWallet.connected && moveWallet.account?.address && (
                    <div className="flex items-center gap-1.5 pl-9">
                        <span className="text-[10px] font-mono text-muted-foreground">
                            {formatAddr(moveWallet.account.address.toString())}
                        </span>
                        <button onClick={() => copyAddress(moveWallet.account!.address.toString(), 'Movement')}
                            className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Solana Chain */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <img src="/assets/solanaLogo.png" alt="Solana" className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold">Solana</span>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${solanaWallet.connected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                                <span className="text-[9px] text-muted-foreground">
                                    {solanaWallet.connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {solanaWallet.connected ? (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => solanaWallet.disconnect()}>
                            <LogOut className="h-3 w-3 mr-1" /> Disconnect
                        </Button>
                    ) : (
                        <div className="scale-75 origin-right">
                            <WalletMultiButton style={{
                                height: '28px', fontSize: '10px', padding: '0 10px',
                                borderRadius: '6px', background: 'transparent',
                                border: '1px solid rgba(168,85,247,0.3)',
                                color: '#a855f7',
                            }} />
                        </div>
                    )}
                </div>
                {solanaWallet.connected && solanaWallet.publicKey && (
                    <div className="flex items-center gap-1.5 pl-9">
                        <span className="text-[10px] font-mono text-muted-foreground">
                            {formatAddr(solanaWallet.publicKey.toBase58())}
                        </span>
                        <button onClick={() => copyAddress(solanaWallet.publicKey!.toBase58(), 'Solana')}
                            className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* BCH Chain */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <img src="https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png"
                                alt="BCH" className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold">Bitcoin Cash</span>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${bchWallet.connected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                                <span className="text-[9px] text-muted-foreground">
                                    {bchWallet.connected
                                        ? `${bchWallet.walletMode === 'cashonize' ? 'Cashonize' : 'Browser'}`
                                        : 'Disconnected'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    {bchWallet.connected ? (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={bchWallet.disconnect}>
                            <LogOut className="h-3 w-3 mr-1" /> Disconnect
                        </Button>
                    ) : null}
                </div>

                {bchWallet.connected && bchWallet.address ? (
                    <div className="space-y-1.5 pl-9">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {formatAddr(bchWallet.address)}
                            </span>
                            <button onClick={() => copyAddress(bchWallet.address!, 'BCH')}
                                className="text-muted-foreground hover:text-foreground">
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="text-[11px] font-medium">
                            {(bchWallet.balance / 1e8).toFixed(6)} BCH
                        </div>
                        <a href="https://tbch4.googol.cash/" target="_blank" rel="noopener noreferrer"
                            className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <ExternalLink className="h-2.5 w-2.5" /> Get Chipnet BCH (Faucet)
                        </a>
                    </div>
                ) : !bchWallet.connected && (
                    <div className="space-y-1.5 pl-9">
                        <Button variant="outline" size="sm"
                            className="w-full h-7 text-[10px] justify-start gap-2 border-white/[0.06]"
                            onClick={bchWallet.connectCashonize} disabled={bchWallet.connecting}>
                            <Shield className="h-3 w-3 text-emerald-400" />
                            <span>Cashonize (WalletConnect)</span>
                        </Button>
                        <Button variant="outline" size="sm"
                            className="w-full h-7 text-[10px] justify-start gap-2 border-white/[0.06]"
                            onClick={bchWallet.connectBrowserWallet} disabled={bchWallet.connecting}>
                            {bchWallet.connecting
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Globe className="h-3 w-3 text-blue-400" />
                            }
                            <span>Browser Wallet (Chipnet)</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
