import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Token } from "@/types";
import { CauldronService } from "@/lib/cauldron";

// ============================================================================
// BCH Token List — BCH native, CashTokens (chipnet), and Solana
// ============================================================================

export const BCH_TOKENS: Token[] = [
    // --- BCH Native ---
    {
        symbol: "BCH",
        name: "Bitcoin Cash",
        icon: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png",
        decimals: 8,
        type: "native",
        chain: "bch",
    },
];

export const SOLANA_TOKENS: Token[] = [
    {
        symbol: "SOL",
        name: "Solana",
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        decimals: 9,
        type: "11111111111111111111111111111111", // Used as a generic type ID or native flag
        chain: "solana",
        address: "So11111111111111111111111111111111111111112" // Native mint usually, but we check if undefined
    },
    {
        symbol: "USDC",
        name: "USD Coin (Devnet)",
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        decimals: 6,
        type: "spl-token",
        chain: "solana",
        address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" // Devnet USDC
    }
];

export const MOVEMENT_TOKENS: Token[] = [
    {
        symbol: "MOVE",
        name: "Movement",
        icon: "https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png",
        decimals: 8,
        type: "0x1::aptos_coin::AptosCoin",
        chain: "movement",
        address: "0x1::aptos_coin::AptosCoin",
    },
];

export const ALL_BCH_SWAP_TOKENS = [...BCH_TOKENS, ...SOLANA_TOKENS, ...MOVEMENT_TOKENS];

// ============================================================================
// Token Selector Component
// ============================================================================

interface BCHTokenSelectorProps {
    value?: Token;
    onSelect: (token: Token) => void;
    tokens?: Token[];
    className?: string;
    label?: string;
}

export function BCHTokenSelector({ value, onSelect, tokens = ALL_BCH_SWAP_TOKENS, className, label }: BCHTokenSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dynamicTokens, setDynamicTokens] = useState<Token[]>([]);
    const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);

    // Fetch popular CashTokens on component mount or lazy load when opened
    useEffect(() => {
        let mounted = true;
        const fetchTokens = async () => {
            setIsLoadingDynamic(true);
            const rawTokens = await CauldronService.getTopCashTokens(25);
            if (mounted) {
                const mapped = CauldronService.mapToTokens(rawTokens) as Token[];
                // Filter out tokens we already hardcoded AND tokens without BCMR metadata (UNKNOWN)
                const existingTypes = new Set(ALL_BCH_SWAP_TOKENS.map(t => t.type));
                const filtered = mapped.filter(t =>
                    !existingTypes.has(t.type) && t.symbol !== 'UNKNOWN'
                );
                setDynamicTokens(filtered);
                setIsLoadingDynamic(false);
            }
        };
        fetchTokens();
        return () => { mounted = false; };
    }, []);

    const displayTokens = [...(tokens || ALL_BCH_SWAP_TOKENS), ...dynamicTokens];

    const filteredTokens = displayTokens.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // Group tokens by chain
    const bchTokens = filteredTokens.filter(t => t.chain === 'bch');
    const solTokens = filteredTokens.filter(t => t.chain === 'solana');
    const moveTokens = filteredTokens.filter(t => t.chain === 'movement');

    const handleSelect = (token: Token) => {
        onSelect(token);
        setOpen(false);
        setSearch("");
    };

    const chainBadge = (chain: string) => {
        switch (chain) {
            case 'bch': return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">BCH</span>;
            case 'solana': return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400">SOL</span>;
            case 'movement': return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">MOVE</span>;
            default: return null;
        }
    };

    const TokenRow = ({ token }: { token: Token }) => (
        <Button
            variant="ghost"
            className="w-full justify-start h-14 px-4 hover:bg-muted/50"
            onClick={() => handleSelect(token)}
        >
            <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full mr-3" onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png';
            }} />
            <div className="text-left flex flex-col flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{token.symbol}</span>
                    {chainBadge(token.chain || 'bch')}
                </div>
                <span className="text-xs text-muted-foreground">{token.name}</span>
            </div>
            {value?.symbol === token.symbol && value?.chain === token.chain && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
            )}
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-fit min-w-[140px] justify-between rounded-full pl-2 pr-3 py-6", className)}
                >
                    {value ? (
                        <div className="flex items-center gap-2">
                            <img src={value.icon} alt={value.symbol} className="w-6 h-6 rounded-full" onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png';
                            }} />
                            <span className="font-semibold text-lg">{value.symbol}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{label || "Select Token"}</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle>Select a token</DialogTitle>
                </DialogHeader>
                <div className="p-4 pt-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search token name or symbol"
                            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[350px] overflow-y-auto p-2">
                    {filteredTokens.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            {isLoadingDynamic ? <div className="flex justify-center items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Fetching tokens...</div> : "No tokens found"}
                        </div>
                    ) : (
                        <>
                            {/* BCH Chain Section */}
                            {bchTokens.length > 0 && (
                                <div>
                                    <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Bitcoin Cash
                                    </div>
                                    <div className="grid gap-0.5">
                                        {bchTokens.map(token => (
                                            <TokenRow key={`${token.chain}-${token.categoryId || token.symbol}`} token={token} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Solana Chain Section */}
                            {solTokens.length > 0 && (
                                <div className="mt-2">
                                    <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        Solana
                                    </div>
                                    <div className="grid gap-0.5">
                                        {solTokens.map(token => (
                                            <TokenRow key={`${token.chain}-${token.address || token.symbol}`} token={token} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Movement Chain Section */}
                            {moveTokens.length > 0 && (
                                <div className="mt-2">
                                    <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                        Movement
                                    </div>
                                    <div className="grid gap-0.5">
                                        {moveTokens.map(token => (
                                            <TokenRow key={`${token.chain}-${token.address || token.symbol}`} token={token} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
