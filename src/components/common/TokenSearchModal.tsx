import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SUPPORTED_TOKENS = [
    { symbol: "MOVE", name: "Movement Coin", icon: "https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png" },
    { symbol: "SOL", name: "Solana", icon: "/assets/solanaLogo.png" },
    { symbol: "USDC", name: "USD Coin", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    { symbol: "USDT", name: "Tether", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    { symbol: "BCH", name: "Bitcoin Cash", icon: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png" },
];

interface TokenSearchModalProps {
    children: React.ReactNode;
}

export function TokenSearchModal({ children }: TokenSearchModalProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const filteredTokens = SUPPORTED_TOKENS.filter(token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectToken = () => {
        setOpen(false);
        setSearchQuery('');
        navigate('/bchswap');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl shadow-black/80 top-[20%] translate-y-0">
                <div className="p-4 border-b border-white/[0.08] relative">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search tokens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.03] border-white/10 hover:border-white/20 focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-base transition-colors"
                        autoFocus
                    />
                </div>
                <div className="max-h-[350px] overflow-y-auto p-2 pb-4">
                    {filteredTokens.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No tokens found.
                        </div>
                    ) : (
                        filteredTokens.map((token) => (
                            <button
                                key={token.symbol}
                                onClick={handleSelectToken}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                            >
                                <div className="h-10 w-10 rounded-full bg-white/[0.05] p-2 flex items-center justify-center flex-shrink-0">
                                    <img src={token.icon} alt={token.name} className="h-full w-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">{token.name}</span>
                                    <span className="text-xs text-muted-foreground tracking-wide">{token.symbol}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
