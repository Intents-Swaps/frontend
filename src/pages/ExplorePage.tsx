import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TokensTable } from '@/components/explore/TokensTable';
import { TransactionsTable } from '@/components/explore/TransactionsTable';
import { Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ChainFilter = 'All' | 'Movement' | 'Solana' | 'Bitcoin Cash';

export function ExplorePage() {
    const [activeChain, setActiveChain] = useState<ChainFilter>('All');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.06] pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
                    <p className="text-muted-foreground mt-1">
                        Global token metrics and protocol transactions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        className="h-10 w-10 shrink-0"
                        title="Refresh Data"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Select value={activeChain} onValueChange={(val) => setActiveChain(val as ChainFilter)}>
                        <SelectTrigger className="w-[180px] h-10 bg-white/[0.02] border-white/10 focus:ring-primary/20">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Select Chain" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-white/10 text-foreground">
                            <SelectItem value="All">All Chains</SelectItem>
                            <SelectItem value="Movement">Movement</SelectItem>
                            <SelectItem value="Solana">Solana</SelectItem>
                            <SelectItem value="Bitcoin Cash">Bitcoin Cash</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabs & Content */}
            <Tabs defaultValue="tokens" className="w-full">
                <TabsList className="bg-white/[0.03] border border-white/5 h-12 p-1 relative w-full justify-start overflow-x-auto rounded-xl inline-flex shrink-0">
                    <TabsTrigger
                        value="tokens"
                        className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-primary rounded-lg px-6"
                    >
                        Tokens
                    </TabsTrigger>
                    <TabsTrigger
                        value="transactions"
                        className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-primary rounded-lg px-6"
                    >
                        Transactions
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="tokens" className="m-0 border-none p-0 outline-none">
                        <TokensTable activeChain={activeChain} refreshTrigger={refreshTrigger} />
                    </TabsContent>

                    <TabsContent value="transactions" className="m-0 border-none p-0 outline-none">
                        <TransactionsTable activeChain={activeChain} refreshTrigger={refreshTrigger} />
                    </TabsContent>
                </div>
            </Tabs>

        </div>
    );
}
