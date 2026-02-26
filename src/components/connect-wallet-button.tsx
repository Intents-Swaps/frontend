import { useState } from 'react';
import { Wallet, LogOut, ChevronDown, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tooling / Hooks for Movement
import { useWallet as useMovementWallet } from '@/context/wallet-provider';
import { NETWORK_MAP } from '@/lib/wallet/networks';

// Tooling / Hooks for Solana
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Tooling / Hooks for BCH
import { useBCHWallet } from '@/context/BCHWalletProvider';

function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Icons
const NightlyIcon = () => (
    <img src="https://docs.nightly.app/img/logo.png" alt="Nightly Wallet" width={24} height={24} className="rounded-md" />
);

const SolanaIcon = () => (
    <img src="/assets/solanaLogo.png" alt="Solana Wallet" width={24} height={24} className="rounded-md object-contain p-0.5 bg-black/50" />
);

const BCHIcon = () => (
    <img src="https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png" alt="BCH Wallet" width={24} height={24} className="rounded-md object-contain" />
);

export function ConnectWalletButton({ className }: { className?: string }) {
    // Modal State
    const [dialogOpen, setDialogOpen] = useState(false);

    // Contexts
    const {
        connected: mvmtConnected,
        connecting: mvmtConnecting,
        account: mvmtAccount,
        network: mvmtNetwork,
        connect: connectMvmt,
        disconnect: disconnectMvmt,
        changeNetwork: changeMvmtNetwork
    } = useMovementWallet();

    const {
        connected: solConnected,
        publicKey: solPublicKey,
        disconnect: disconnectSol
    } = useSolanaWallet();
    const { setVisible: setSolanaModalVisible } = useWalletModal();

    const {
        connected: bchConnected,
        address: bchAddress,
        connectCashonize,
        connectBrowserWallet,
        disconnect: disconnectBch
    } = useBCHWallet();

    // Aggregations
    const connectedCount = [mvmtConnected, solConnected, bchConnected].filter(Boolean).length;
    const isAnyConnected = connectedCount > 0;

    // Derived Label for the Trigger Button
    let buttonLabel = 'Connect Wallets';
    if (isAnyConnected) {
        if (connectedCount === 1) {
            if (mvmtConnected && mvmtAccount) buttonLabel = shortenAddress(mvmtAccount.address.toString());
            else if (solConnected && solPublicKey) buttonLabel = shortenAddress(solPublicKey.toString());
            else if (bchConnected && bchAddress) buttonLabel = shortenAddress(bchAddress);
        } else {
            buttonLabel = `${connectedCount} Wallets Connected`;
        }
    }

    return (
        <>
            <Button
                onClick={() => setDialogOpen(true)}
                variant="outline"
                className={className || "gap-2 min-w-[140px]"}
            >
                <Wallet className="h-4 w-4" />
                {buttonLabel}
                {isAnyConnected && <ChevronDown className="h-4 w-4 ml-1 opacity-50" />}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-semibold">Connect Wallets</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">Connect to multiple chains simultaneously for cross-chain features.</p>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 p-6 pt-2">
                        {/* 1. Movement Network */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">Movement</span>
                                    {mvmtConnected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                </div>
                                {mvmtConnected && mvmtNetwork && (
                                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                                        {NETWORK_MAP[mvmtNetwork.chainId?.toString()]?.buttonName || mvmtNetwork.name}
                                    </span>
                                )}
                            </div>

                            {!mvmtConnected ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-12 bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                                    onClick={() => connectMvmt()}
                                    disabled={mvmtConnecting}
                                >
                                    <div className="flex items-center gap-3">
                                        <NightlyIcon />
                                        <span>Nightly Wallet</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                </Button>
                            ) : (
                                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <NightlyIcon />
                                        <span className="font-mono text-sm text-primary">{shortenAddress(mvmtAccount?.address.toString() || '')}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Simple dropdown for network switching, or we can just have disconnect */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => disconnectMvmt()}>
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Solana Network */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-foreground">Solana</span>
                                {solConnected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </div>

                            {!solConnected ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-12 bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                                    onClick={() => {
                                        setDialogOpen(false); // Close our modal before opening Solana's
                                        setSolanaModalVisible(true);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <SolanaIcon />
                                        <span>Select Solana Wallet</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                </Button>
                            ) : (
                                <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <SolanaIcon />
                                        <span className="font-mono text-sm text-purple-400">{shortenAddress(solPublicKey?.toString() || '')}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => disconnectSol()}>
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 3. Bitcoin Cash Network */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-foreground">Bitcoin Cash</span>
                                {bchConnected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </div>

                            {!bchConnected ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 h-12 bg-white/[0.03] hover:bg-white/[0.06] border-white/10 px-3"
                                        onClick={() => connectCashonize()}
                                    >
                                        <BCHIcon />
                                        <span className="text-xs">Cashonize</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 h-12 bg-white/[0.03] hover:bg-white/[0.06] border-white/10 px-3"
                                        onClick={() => connectBrowserWallet()}
                                    >
                                        <BCHIcon />
                                        <span className="text-xs">Local Wallet</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <BCHIcon />
                                        <span className="font-mono text-sm text-emerald-400">{shortenAddress(bchAddress || '')}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => disconnectBch()}>
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
