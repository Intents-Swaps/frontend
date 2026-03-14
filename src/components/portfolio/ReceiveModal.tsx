import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWallet as useMovementWallet } from '@/context/wallet-provider';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { ArrowDownLeft, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReceiveModal({ children }: { children?: React.ReactNode }) {
    const { connected: solConnected, publicKey: solPubKey } = useSolanaWallet();
    const { connected: movConnected, account: movAccount } = useMovementWallet();
    const { connected: bchConnected, address: bchAddress } = useBCHWallet();

    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (address: string, network: string) => {
        navigator.clipboard.writeText(address);
        setCopied(network);
        toast.success(`${network} address copied to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
    };

    const renderNetworkOption = (network: string, address: string | null | undefined, icon: string) => {
        if (!address) return null;

        return (
            <div className="flex flex-col gap-2 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3">
                    <img src={icon} alt={network} className="w-8 h-8 rounded-full bg-white/10 p-1" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{network} Address</div>
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-xs block">
                            {address}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08]">
                    <div className="text-xs text-muted-foreground">Network: {network}</div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10"
                        onClick={() => handleCopy(address, network)}
                    >
                        {copied === network ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        {copied === network ? 'Copied' : 'Copy'}
                    </Button>
                </div>
            </div>
        );
    };

    const hasAnyConnection = solConnected || movConnected || bchConnected;

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group">
                        <div className="text-primary group-hover:scale-110 transition-transform"><ArrowDownLeft className="h-5 w-5" /></div>
                        <span className="text-sm font-medium text-foreground">Receive</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/10 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Receive Assets</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!hasAnyConnection ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            Please connect a wallet to view your receive addresses.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {movConnected && renderNetworkOption('Movement', movAccount?.address?.toString(), 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png')}
                            {solConnected && renderNetworkOption('Solana', solPubKey?.toBase58(), '/assets/solanaLogo.png')}
                            {bchConnected && renderNetworkOption('Bitcoin Cash', bchAddress, '/logos/bitcoin-cash-bch-logo.svg')}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
