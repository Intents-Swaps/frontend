import { PortfolioToken } from '@/hooks/usePortfolio';
import { formatCurrency, formatCompactNumber } from '@/lib/coingecko';
import { cn } from '@/lib/utils';

interface PortfolioTokensProps {
    tokens: PortfolioToken[];
}

export function PortfolioTokens({ tokens }: PortfolioTokensProps) {
    if (tokens.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                No tokens found in your portfolio. Connect a wallet to view balances.
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Tokens</h2>
                <p className="text-sm text-muted-foreground mt-1">{tokens.length} assets</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground bg-white/[0.02] border-b border-white/[0.06]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Token</th>
                                <th className="px-6 py-4 font-medium text-right">Price</th>
                                <th className="px-6 py-4 font-medium text-right">Balance</th>
                                <th className="px-6 py-4 font-medium text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {tokens.map((token) => (
                                <tr key={token.symbol} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full bg-white/[0.05] p-2 flex items-center justify-center">
                                                    <img src={token.icon} alt={token.name} className="h-full w-full object-contain" />
                                                </div>
                                                {/* Chain indicator badge could go here if needed */}
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#121212] flex items-center justify-center border border-white/10">
                                                    <div className={cn(
                                                        "h-2.5 w-2.5 rounded-full",
                                                        token.chain === 'Solana' ? "bg-purple-500" :
                                                            token.chain === 'Movement' ? "bg-emerald-500" :
                                                                token.chain === 'Bitcoin Cash' ? "bg-green-500" : "bg-blue-500"
                                                    )} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{token.name}</span>
                                                <span className="text-xs text-muted-foreground">{token.symbol}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-medium text-foreground">{formatCurrency(token.price)}</span>
                                            <span className={cn(
                                                "text-xs mt-0.5",
                                                token.change24h >= 0 ? "text-emerald-500" : "text-rose-500"
                                            )}>
                                                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-medium text-foreground">{formatCompactNumber(token.balance)}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{token.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="font-medium text-foreground">{formatCurrency(token.valueUsd)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* View all button mock */}
            <div className="mt-4 flex justify-center sm:justify-start">
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                    View all tokens <span>→</span>
                </button>
            </div>
        </div>
    );
}
