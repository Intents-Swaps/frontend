import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet as useMovementWallet } from '@/context/wallet-provider';
import { signAndSubmitTransaction } from '@/lib/wallet/adapter';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { Navigation, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityService } from '@/lib/activity';
import { PriceService } from '@/lib/pyth';
import { usePortfolio } from '@/hooks/usePortfolio';

// ============================================================================
// Token definitions per network
// ============================================================================

interface SendToken {
    symbol: string;
    name: string;
    icon: string;
    decimals: number;
    // For Movement: type argument for coin transfer
    moveType?: string;
    // For Solana: mint address (undefined = native SOL)
    solanaMint?: string;
    // For BCH: category ID (undefined = native BCH)
    bchCategory?: string;
}

const MOVEMENT_TOKENS: SendToken[] = [
    { symbol: 'MOVE', name: 'Movement', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png', decimals: 8, moveType: '0x1::aptos_coin::AptosCoin' },
    { symbol: 'USDC.e', name: 'Bridged USDC', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/USDC.png', decimals: 6 },
    { symbol: 'USDT.e', name: 'Bridged USDT', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/USDT.png', decimals: 6 },
];

const SOLANA_TOKENS: SendToken[] = [
    { symbol: 'SOL', name: 'Solana', icon: '/assets/solanaLogo.png', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', icon: '/logos/usd-coin-usdc-logo.svg', decimals: 6, solanaMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' },
];

const BCH_TOKENS: SendToken[] = [
    { symbol: 'BCH', name: 'Bitcoin Cash', icon: '/logos/bitcoin-cash-bch-logo.svg', decimals: 8 },
    { symbol: 'F-BREAKFAST', name: 'BREAKFAST', icon: 'https://ipfs.io/ipfs/bafybeicna3kw6fzajsayscsajr3zi4sie6orcfrg277wwhmfl4t6huqama/53636bc8c1afbe35a7ba169eadfac0aebadeacf96954a9a066a483e885580ed4.jpg', decimals: 0, bchCategory: '53636bc8c1afbe35a7ba169eadfac0aebadeacf96954a9a066a483e885580ed4' },
];

const NETWORK_TOKENS: Record<string, SendToken[]> = {
    'Movement': MOVEMENT_TOKENS,
    'Solana': SOLANA_TOKENS,
    'Bitcoin Cash': BCH_TOKENS,
};

// ============================================================================
// Send Modal Component
// ============================================================================

export function SendModal({ children }: { children?: React.ReactNode }) {
    const solWallet = useSolanaWallet();
    const movWallet = useMovementWallet();
    const bchWallet = useBCHWallet();
    const { tokens: portfolioTokens } = usePortfolio();

    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<SendToken | null>(null);
    const [showTokenPicker, setShowTokenPicker] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const hasAnyConnection = solWallet.connected || movWallet.connected || bchWallet.connected;

    // When a network is selected, auto-pick the first (native) token
    const selectNetwork = (name: string) => {
        setSelectedNetwork(name);
        const tokens = NETWORK_TOKENS[name];
        if (tokens && tokens.length > 0) {
            setSelectedToken(tokens[0]);
        }
    };

    const getSelectedTokenBalance = () => {
        if (!selectedToken) return 0;

        if (selectedNetwork === 'Bitcoin Cash' && bchWallet.connected) {
            if (!selectedToken.bchCategory) {
                return bchWallet.balance / 1e8;
            } else {
                const bal = bchWallet.tokenBalances[selectedToken.bchCategory];
                return bal ? Number(bal) / Math.pow(10, selectedToken.decimals) : 0;
            }
        }

        const found = portfolioTokens.find(t => t.symbol === selectedToken.symbol);
        return found ? found.balance : 0;
    };

    const maxBalance = getSelectedTokenBalance();

    const handleSend = async () => {
        if (!recipient || !amount || !selectedToken) {
            toast.error("Please fill in recipient, amount, and select a token.");
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Invalid amount.");
            return;
        }

        setIsSending(true);
        let txHashStr = '';
        let explorerUrl = '';

        try {
            if (selectedNetwork === 'Movement') {
                if (!movWallet.wallet) throw new Error("Movement wallet not found");

                // Native MOVE transfer
                const amountInOctas = Math.floor(parsedAmount * Math.pow(10, selectedToken.decimals));
                const payload = {
                    type: "entry_function_payload",
                    function: "0x1::aptos_account::transfer",
                    type_arguments: [],
                    arguments: [recipient, amountInOctas.toString()]
                };
                const response = await signAndSubmitTransaction(movWallet.wallet, payload);
                if (!response || !response.hash) throw new Error("Transaction failed or rejected");
                txHashStr = response.hash;
                explorerUrl = `https://explorer.movementnetwork.xyz/txn/${txHashStr}?network=porto`;

            } else if (selectedNetwork === 'Solana') {
                if (!solWallet.publicKey || !solWallet.sendTransaction) throw new Error("Solana wallet not fully connected");

                const connection = new Connection('https://api.devnet.solana.com');

                if (!selectedToken.solanaMint) {
                    // Native SOL transfer
                    const lamports = Math.floor(parsedAmount * LAMPORTS_PER_SOL);
                    const tx = new Transaction().add(
                        SystemProgram.transfer({
                            fromPubkey: solWallet.publicKey,
                            toPubkey: new PublicKey(recipient),
                            lamports,
                        })
                    );
                    const signature = await solWallet.sendTransaction(tx, connection);
                    await connection.confirmTransaction(signature, 'processed');
                    txHashStr = signature;
                } else {
                    // SPL token transfer — build manually
                    const { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } = await import('@solana/spl-token');

                    const mintPubkey = new PublicKey(selectedToken.solanaMint);
                    const recipientPubkey = new PublicKey(recipient);

                    const fromATA = await getAssociatedTokenAddress(mintPubkey, solWallet.publicKey);
                    const toATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

                    const tx = new Transaction();

                    // Check if recipient ATA exists. If not, create it.
                    try {
                        await getAccount(connection, toATA);
                    } catch {
                        tx.add(
                            createAssociatedTokenAccountInstruction(
                                solWallet.publicKey,
                                toATA,
                                recipientPubkey,
                                mintPubkey,
                            )
                        );
                    }

                    const tokenAmount = Math.floor(parsedAmount * Math.pow(10, selectedToken.decimals));
                    tx.add(
                        createTransferInstruction(fromATA, toATA, solWallet.publicKey, tokenAmount)
                    );

                    const signature = await solWallet.sendTransaction(tx, connection);
                    await connection.confirmTransaction(signature, 'processed');
                    txHashStr = signature;
                }
                explorerUrl = `https://solscan.io/tx/${txHashStr}?cluster=devnet`;

            } else if (selectedNetwork === 'Bitcoin Cash') {
                if (bchWallet.walletMode !== 'browser') {
                    throw new Error("Only the Browser Wallet mode is currently supported for sending directly.");
                }
                const existingWif = localStorage.getItem('bch_wallet_wif');
                if (!existingWif) throw new Error("BCH browser wallet WIF not found");

                const { TestNetWallet } = await import('mainnet-js');
                const wallet = await TestNetWallet.fromWIF(existingWif);
                let sendRequest: any;
                if (!selectedToken.bchCategory) {
                    // Send native BCH
                    const satoshis = Math.round(parsedAmount * 1e8);
                    sendRequest = { cashaddr: recipient, value: satoshis, unit: 'sat' };
                } else {
                    // Send CashToken
                    const tokenAmount = Math.round(parsedAmount * Math.pow(10, selectedToken.decimals));
                    sendRequest = {
                        cashaddr: recipient,
                        tokenId: selectedToken.bchCategory,
                        amount: tokenAmount
                    };
                }

                const sendResponse = await wallet.send([sendRequest]);
                txHashStr = (sendResponse as any).txId || '';
                explorerUrl = `https://chipnet.imaginary.cash/tx/${txHashStr}`;
            }

            // Estimate USD value
            let valueUsd = 0;
            try {
                const prices = await PriceService.getLatestPrices();
                const priceData = prices[selectedToken.symbol];
                const currentPrice = priceData ? PriceService.formatPrice(priceData) : 0;
                valueUsd = parsedAmount * currentPrice;
            } catch { /* price lookup is best-effort */ }

            // Log activity
            ActivityService.addActivity({
                type: 'send',
                asset: selectedToken.symbol,
                amount: parsedAmount,
                valueUsd,
                txHash: txHashStr,
                network: selectedNetwork!,
                explorerUrl,
            });

            toast.success(
                <div className="flex flex-col gap-1">
                    <span>Successfully sent {amount} {selectedToken.symbol}!</span>
                    {explorerUrl && (
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">
                            View on Explorer →
                        </a>
                    )}
                </div>
            );

            setIsOpen(false);
            setTimeout(() => {
                setSelectedNetwork(null);
                setSelectedToken(null);
                setRecipient('');
                setAmount('');
            }, 300);

        } catch (e: any) {
            console.error("Failed to send transaction:", e);
            toast.error("Transaction Failed", { description: e.message || "An unknown error occurred." });
        } finally {
            setIsSending(false);
        }
    };

    const renderNetworkOption = (name: string, icon: string) => (
        <button
            key={name}
            onClick={() => selectNetwork(name)}
            className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-primary/50 transition-all text-left w-full group"
        >
            <img src={icon} alt={name} className="w-8 h-8 rounded-full bg-white/10 p-1 group-hover:scale-110 transition-transform" />
            <span className="font-medium flex-1">{name}</span>
            <span className="text-xs text-muted-foreground">Select</span>
        </button>
    );

    const availableTokens = selectedNetwork ? (NETWORK_TOKENS[selectedNetwork] || []) : [];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group">
                        <div className="text-primary group-hover:-translate-y-0.5 transition-transform"><Navigation className="h-5 w-5" /></div>
                        <span className="text-sm font-medium text-foreground">Send</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/10 rounded-2xl p-0 overflow-hidden">
                <div className="p-6">
                    <DialogHeader className="mb-6 border-b border-white/[0.08] pb-4">
                        <DialogTitle className="text-xl font-semibold flex flex-col gap-1">
                            {selectedNetwork ? `Send on ${selectedNetwork}` : 'Send Assets'}
                            {selectedNetwork && (
                                <button
                                    className="text-xs text-muted-foreground hover:text-primary text-left"
                                    onClick={() => { setSelectedNetwork(null); setSelectedToken(null); setShowTokenPicker(false); }}
                                >
                                    ← Back to network selection
                                </button>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {!hasAnyConnection ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Please connect a wallet to send assets.
                        </div>
                    ) : !selectedNetwork ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-4">Select the network you want to send from:</p>
                            {movWallet.connected && renderNetworkOption('Movement', 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png')}
                            {solWallet.connected && renderNetworkOption('Solana', '/assets/solanaLogo.png')}
                            {bchWallet.connected && renderNetworkOption('Bitcoin Cash', '/logos/bitcoin-cash-bch-logo.svg')}
                        </div>
                    ) : showTokenPicker ? (
                        /* ── Token Picker ── */
                        <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                            <p className="text-sm text-muted-foreground mb-3">Select token to send:</p>
                            {availableTokens.map(token => (
                                <button
                                    key={token.symbol}
                                    onClick={() => { setSelectedToken(token); setShowTokenPicker(false); }}
                                    className="flex items-center gap-3 p-3.5 w-full bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-primary/40 transition-all text-left group"
                                >
                                    <img src={token.icon} alt={token.symbol} className="w-7 h-7 rounded-full bg-white/10 p-0.5" />
                                    <div className="flex flex-col flex-1">
                                        <span className="font-medium text-sm">{token.symbol}</span>
                                        <span className="text-[11px] text-muted-foreground">{token.name}</span>
                                    </div>
                                    {selectedToken?.symbol === token.symbol && (
                                        <span className="text-xs text-primary font-medium">Selected</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* ── Send Form ── */
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Recipient Address</label>
                                <Input
                                    placeholder={`Enter ${selectedNetwork} address`}
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Amount</label>
                                    <div className="text-xs text-muted-foreground mr-1 flex items-center gap-2">
                                        Balance: {maxBalance.toFixed(selectedToken?.decimals && selectedToken.decimals > 6 ? 6 : (selectedToken?.decimals || 2))} {selectedToken?.symbol}
                                        <button
                                            onClick={() => setAmount(maxBalance.toString())}
                                            className="text-primary hover:text-emerald-400 transition-colors font-semibold"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="bg-white/[0.03] border-white/10 h-14 text-xl rounded-xl focus-visible:ring-1 focus-visible:ring-primary pl-4 pr-32"
                                    />
                                    {/* Token selector button inside the amount input */}
                                    <button
                                        onClick={() => setShowTokenPicker(true)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors"
                                    >
                                        {selectedToken && (
                                            <img src={selectedToken.icon} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
                                        )}
                                        <span className="text-sm font-medium">{selectedToken?.symbol || 'Token'}</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 mt-4 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl"
                                onClick={handleSend}
                                disabled={isSending || !recipient || !amount || !selectedToken}
                            >
                                {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : `Send ${selectedToken?.symbol || ''}`}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
