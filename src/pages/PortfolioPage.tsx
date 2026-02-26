import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioChart } from '@/components/portfolio/PortfolioChart';
import { PortfolioTokens } from '@/components/portfolio/PortfolioTokens';
import { PortfolioActivity } from '@/components/portfolio/PortfolioActivity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, MoreHorizontal, Loader2, ArrowDownUp } from 'lucide-react';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { SendModal } from '@/components/portfolio/SendModal';
import { ReceiveModal } from '@/components/portfolio/ReceiveModal';
import { Link } from 'react-router-dom';

// ============================================================================
// Portfolio Page — /portfolio
// ============================================================================
// A unified dashboard inspired by Uniswap's wallet/portfolio view.
// It aggregates balances across Movement, Solana, and BCH.

export default function PortfolioPage() {
    const { tokens, totalValue, chartData, loading, isConnected } = usePortfolio();

    // The user's wallet address would go here. We'll use a placeholder for now
    // or we could grab `account?.address` from the primary connected wallet.
    const activeAddress = isConnected ? "0x7a...4b92" : "Demo Wallet";

    if (loading) {
        return (
            <div className="container mx-auto py-24 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-medium text-foreground">Loading Portfolio...</h2>
                <p className="text-muted-foreground mt-2">Aggregating balances across chains</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-[1000px] mt-6">

            {/* Action Banner (if NOT connected) */}
            {!isConnected && (
                <div className="mb-8 w-full p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#FF007A]/10 to-[#9900FF]/10 border border-primary/20 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <h2 className="text-xl font-semibold text-foreground relative z-10">Connect a wallet <span className="text-muted-foreground font-normal">to view your portfolio</span></h2>
                    <div className="mt-4 relative z-10 w-[200px]">
                        <ConnectWalletButton className="w-full text-base h-12 rounded-xl" />
                    </div>
                </div>
            )}

            {/* Top Identity Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold">W</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-xl text-foreground">{activeAddress}</span>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Network Toggles / Actions Mock */}
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium flex items-center gap-2">
                        <div className="flex -space-x-1">
                            <div className="h-4 w-4 rounded-full bg-emerald-500 border border-[#0A0A0A]" />
                            <div className="h-4 w-4 rounded-full bg-purple-500 border border-[#0A0A0A]" />
                        </div>
                        All networks
                    </div>
                </div>
            </div>

            {/* Layout Grid: Left (Chart + Tabs) & Right (Quick Actions) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 flex flex-col space-y-8">
                    {/* Chart */}
                    <PortfolioChart
                        data={chartData}
                        totalValue={totalValue}
                        changePercentage24h={tokens[0]?.change24h || 1.04}
                    />

                    {/* Tabs for Tokens / Activity */}
                    <Tabs defaultValue="tokens" className="w-full pt-8 border-t border-white/[0.06]">
                        <TabsList className="bg-transparent border-0 p-0 h-auto gap-6 justify-start w-full border-b border-transparent">
                            <TabsTrigger
                                value="tokens"
                                className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground text-base"
                            >
                                Tokens
                            </TabsTrigger>
                            <TabsTrigger
                                value="activity"
                                className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground text-base"
                            >
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="tokens" className="m-0 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                                <PortfolioTokens tokens={tokens} />
                            </TabsContent>

                            <TabsContent value="activity" className="m-0 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                                <PortfolioActivity />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right Column: Quick Actions Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 grid grid-cols-2 gap-3">
                        <SendModal />
                        <ReceiveModal />
                        <Link to="/trade" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group">
                            <div className="text-primary group-hover:scale-110 transition-transform"><ArrowDownUp className="h-5 w-5" /></div>
                            <span className="text-sm font-medium text-foreground">Swap</span>
                        </Link>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group">
                            <div className="text-muted-foreground group-hover:text-foreground transition-colors"><MoreHorizontal className="h-5 w-5" /></div>
                            <span className="text-sm font-medium text-foreground">More</span>
                        </button>

                        <div className="col-span-2 mt-4 p-5 rounded-2xl bg-black/40 border border-white/[0.05] backdrop-blur-md flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Swaps this week</span>
                                <span className="text-xl font-medium text-foreground mt-1">0</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-muted-foreground">Volume</span>
                                <span className="text-xl font-medium text-foreground mt-1">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
