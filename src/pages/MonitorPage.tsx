import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import axios from 'axios';
import { TOKENS } from '@/components/intent-swap/forms/TokenSelector';
import { ALL_BCH_SWAP_TOKENS } from '@/components/bch-swap/BCHTokenSelector';
import { useSwap } from '@/context/SwapContext';
import { ArrowRight, ExternalLink, RefreshCw, Layers, Zap, Globe, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { shortenAddr } from '@/lib/utils';

// ============================================================================
// Types & Normalization
// ============================================================================

type UnifiedOrderStatus = 'PENDING' | 'LOCKED' | 'DEST_FILLED' | 'CLAIMABLE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
type OrderCategory = 'ALL' | 'SAME_CHAIN' | 'CROSS_CHAIN';

interface UnifiedOrder {
    id: string;
    source: 'CASHTOKEN' | 'CROSSCHAIN';
    swapType: string;         // 'same-chain', 'bch-to-sol', 'mov-to-bch', etc
    orderType: string;        // 'limit', 'market'
    status: UnifiedOrderStatus;

    makerAddress: string;
    recipientAddress?: string;

    sellToken: any;
    buyToken: any;
    sellAmountRaw: string;
    buyAmountRaw: string;
    sellAmountFormatted: string;
    buyAmountFormatted: string;

    createdAt: number;
    updatedAt: number;
    expiryTime?: number;

    sourceTxId?: string;
    destTxId?: string;
    sourceExplorerUrl?: string;
    destExplorerUrl?: string;

    rawIntent: any; // Keep original for debugging/expansion
}

export function MonitorPage() {
    // Relayer contexts
    const { relayerUrl: cashtokenRelayerUrl } = useSwap();
    // Use environment variable for cross-chain relayer host
    const crossChainRelayerUrl = import.meta.env.VITE_CROSS_CHAIN_RELAYER_URL || 'https://cross-chain-relayer-production-a93e.up.railway.app';

    // State
    const [orders, setOrders] = useState<UnifiedOrder[]>([]);
    const [health, setHealth] = useState<{ cashtoken?: any; crosschain?: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [, setLastUpdated] = useState<Date>(new Date());

    // Filters
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [categoryFilter, setCategoryFilter] = useState<OrderCategory>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // ============================================================================
    // Data Fetching & Normalization
    // ============================================================================

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Health
            const [healthCT, healthCC] = await Promise.allSettled([
                axios.get(`${cashtokenRelayerUrl}/health`),
                axios.get(`${crossChainRelayerUrl}/health`)
            ]);

            setHealth({
                cashtoken: healthCT.status === 'fulfilled' ? healthCT.value.data : null,
                crosschain: healthCC.status === 'fulfilled' ? healthCC.value.data : null
            });

            // 2. Fetch Orders
            const [intentsCT, ordersCC] = await Promise.allSettled([
                axios.get(`${cashtokenRelayerUrl}/intents`),
                axios.get(`${crossChainRelayerUrl}/orders`)
            ]);

            let unified: UnifiedOrder[] = [];

            // Process CashToken Orders
            if (intentsCT.status === 'fulfilled' && intentsCT.value.data) {
                const { active = [], completed = [] } = intentsCT.value.data;
                const processCashToken = (intent: any, isCompleted: boolean): UnifiedOrder => {
                    // Try to resolve exactly from TOKENS or ALL_BCH_SWAP_TOKENS
                    const sToken = findTokenInRegistries(intent.sell_token_type) || { symbol: 'UNK', decimals: 8, icon: '' };
                    const bToken = findTokenInRegistries(intent.buy_token_type) || { symbol: 'UNK', decimals: 8, icon: '' };

                    let status: UnifiedOrderStatus = isCompleted ? (intent.success ? 'COMPLETED' : 'FAILED') : 'PENDING';
                    if (!isCompleted && intent.end_time && (Date.now() / 1000) > intent.end_time) status = 'EXPIRED';

                    return {
                        id: intent.id || `ct_${intent.timestamp}`,
                        source: 'CASHTOKEN',
                        swapType: 'same-chain',
                        orderType: intent.intent_type === 'DUTCH_AUCTION' ? 'market' : 'limit',
                        status,
                        makerAddress: intent.maker_address || 'Unknown',
                        sellToken: sToken,
                        buyToken: bToken,
                        sellAmountRaw: intent.sell_amount,
                        buyAmountRaw: intent.buy_amount || intent.start_buy_amount || '0',
                        sellAmountFormatted: formatTokenAmount(intent.sell_amount, sToken.decimals),
                        buyAmountFormatted: formatTokenAmount(intent.buy_amount || intent.start_buy_amount, bToken.decimals),
                        createdAt: intent.timestamp,
                        updatedAt: intent.timestamp, // Cashtoken relayer doesn't update intents often
                        expiryTime: intent.end_time ? intent.end_time * 1000 : undefined,
                        sourceTxId: intent.hash,
                        sourceExplorerUrl: intent.hash ? `https://chipnet.chaingraph.cash/tx/${intent.hash}` : undefined,
                        rawIntent: intent
                    };
                };

                unified = [
                    ...unified,
                    ...active.map((i: any) => processCashToken(i, false)),
                    ...completed.map((i: any) => processCashToken(i.intent || i, true))
                ];
            }

            // Process CrossChain Orders
            if (ordersCC.status === 'fulfilled' && ordersCC.value.data) {
                const { active = [], completed = [] } = ordersCC.value.data;
                const processCrossChain = (intent: any): UnifiedOrder => {
                    const sToken = resolveCrossChainToken(intent.direction, 'SELL');
                    const bToken = resolveCrossChainToken(intent.direction, 'BUY');

                    // Map specific CC statuses
                    let status: UnifiedOrderStatus = 'PENDING';
                    if (intent.status === 'SOURCE_LOCKED') status = 'LOCKED';
                    else if (intent.status === 'DEST_FILLED') status = 'DEST_FILLED';
                    else if (intent.status === 'DEST_CLAIMED') status = 'CLAIMABLE';
                    else if (intent.status === 'COMPLETED') status = 'COMPLETED';

                    if (intent.status !== 'COMPLETED' && intent.sourceTimelock && (Date.now() / 1000) > intent.sourceTimelock) {
                        status = 'EXPIRED'; // Simplistic timeout
                    }

                    return {
                        id: intent.id,
                        source: 'CROSSCHAIN',
                        swapType: intent.direction.toLowerCase().replace(/_/g, '-'),
                        orderType: 'limit', // CC is implicitly limit
                        status,
                        makerAddress: intent.makerAddress,
                        recipientAddress: intent.recipientAddress,
                        sellToken: sToken,
                        buyToken: bToken,
                        sellAmountRaw: intent.sellAmount,
                        buyAmountRaw: intent.buyAmount,
                        sellAmountFormatted: formatTokenAmount(intent.sellAmount, sToken?.decimals || 8),
                        buyAmountFormatted: formatTokenAmount(intent.buyAmount, bToken?.decimals || 8),
                        createdAt: intent.createdAt * 1000,
                        updatedAt: intent.updatedAt * 1000,
                        expiryTime: intent.sourceTimelock ? intent.sourceTimelock * 1000 : undefined,
                        sourceTxId: intent.bchContractAddress || intent.solanaEscrowPda || intent.movementEscrowId,
                        destTxId: intent.destFillTx || intent.destClaimTx,
                        sourceExplorerUrl: buildExplorerUrl(intent.direction, 'SOURCE', intent.bchContractAddress || intent.solanaEscrowPda || intent.movementEscrowId),
                        destExplorerUrl: buildExplorerUrl(intent.direction, 'DEST', intent.destFillTx || intent.destClaimTx),
                        rawIntent: intent
                    };
                };

                unified = [
                    ...unified,
                    ...active.map(processCrossChain),
                    ...completed.map(processCrossChain)
                ];
            }

            // Sort by latest
            unified.sort((a, b) => b.createdAt - a.createdAt);
            setOrders(unified);
            setLastUpdated(new Date());

        } catch (e) {
            console.error("Monitor fetch error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 8000);
        return () => clearInterval(interval);
    }, []);

    // ============================================================================
    // Utility Helpers
    // ============================================================================

    const findTokenInRegistries = (idOrSymbol: string) => {
        if (!idOrSymbol) return null;
        if (idOrSymbol.toLowerCase() === 'bch' || idOrSymbol === '') return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'BCH');

        let found = TOKENS.find(t => t.type === idOrSymbol);
        if (found) return found;

        found = ALL_BCH_SWAP_TOKENS.find(t =>
            t.categoryId === idOrSymbol ||
            t.address === idOrSymbol ||
            stripHex(t.categoryId || '') === stripHex(idOrSymbol)
        );
        return found;
    };

    const resolveCrossChainToken = (direction: string, side: 'SELL' | 'BUY') => {
        const isBchSell = direction.startsWith('BCH_');
        if (side === 'SELL') {
            if (isBchSell) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'BCH');
            if (direction.includes('SOL')) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'SOL');
            if (direction.includes('MOV')) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'MOVE');
        } else {
            if (!isBchSell) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'BCH');
            if (direction.includes('SOL')) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'SOL');
            if (direction.includes('MOV')) return ALL_BCH_SWAP_TOKENS.find(t => t.symbol === 'MOVE');
        }
        return { symbol: 'UNK', decimals: 8, icon: '' };
    };

    const stripHex = (s: string) => s.startsWith('0x') ? s.slice(2) : s;

    const formatTokenAmount = (raw: string | number, decimals: number = 8) => {
        if (!raw) return '0.00';
        const val = Number(raw) / Math.pow(10, decimals);
        return val.toLocaleString(undefined, { maximumFractionDigits: val < 0.01 ? 6 : 4 });
    };

    const buildExplorerUrl = (direction: string, leg: 'SOURCE' | 'DEST', identifier: string) => {
        if (!identifier) return undefined;
        // Simplistic router based on chain direction
        const isBch = (leg === 'SOURCE' && direction.startsWith('BCH_')) || (leg === 'DEST' && direction.endsWith('_BCH'));
        const isSol = (leg === 'SOURCE' && direction.startsWith('SOL_')) || (leg === 'DEST' && direction.endsWith('_SOL'));
        const isMov = (leg === 'SOURCE' && direction.startsWith('MOV_')) || (leg === 'DEST' && direction.endsWith('_MOV'));

        if (isBch) return `https://chipnet.chaingraph.cash/tx/${identifier}`; // Using tx as fallback
        if (isSol) return `https://explorer.solana.com/tx/${identifier}?cluster=devnet`;
        if (isMov) return `https://explorer.movementnetwork.xyz/txn/${identifier}?network=testnet`;
        return undefined;
    };

    // ============================================================================
    // Filtering Logic
    // ============================================================================

    const filteredOrders = orders.filter(order => {
        // Tab Filter
        if (activeTab === 'ACTIVE' && (order.status === 'COMPLETED' || order.status === 'FAILED' || order.status === 'EXPIRED')) return false;
        if (activeTab === 'HISTORY' && (order.status !== 'COMPLETED' && order.status !== 'FAILED' && order.status !== 'EXPIRED')) return false;

        // Category Filter
        if (categoryFilter === 'SAME_CHAIN' && order.source !== 'CASHTOKEN') return false;
        if (categoryFilter === 'CROSS_CHAIN' && order.source !== 'CROSSCHAIN') return false;

        // Status Filter
        if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

        return true;
    });

    // ============================================================================
    // Render Helpers
    // ============================================================================

    const renderTypeBadge = (order: UnifiedOrder) => {
        if (order.source === 'CASHTOKEN') {
            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                        <Zap className="h-3 w-3 mr-1" />
                        Same-Chain
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] py-0">
                        {order.orderType === 'limit' ? 'Limit' : 'Auction'}
                    </Badge>
                </div>
            );
        } else {
            let color = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            let label = order.swapType.toUpperCase();
            if (label.includes('MOV')) color = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            else if (label.includes('SOL')) color = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`${color} text-[10px] py-0`}>
                        <Globe className="h-3 w-3 mr-1" />
                        {label.replace('-', ' → ')}
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] py-0">
                        Limit
                    </Badge>
                </div>
            );
        }
    };

    const renderStatusBadge = (status: UnifiedOrderStatus) => {
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
            case 'LOCKED': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20"><Layers className="h-3 w-3 mr-1 animate-pulse" /> Locked</Badge>;
            case 'DEST_FILLED': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Layers className="h-3 w-3 mr-1" /> Filled (Waiting Claim)</Badge>;
            case 'CLAIMABLE': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"><Zap className="h-3 w-3 mr-1" /> Claimable</Badge>;
            case 'COMPLETED': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
            case 'FAILED': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
            case 'EXPIRED': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><Clock className="h-3 w-3 mr-1" /> Expired</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="w-full space-y-6">

            {/* Header & Network Health */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Protocol Monitor
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time observer for all Intent Protocol network relayers
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* CashToken Health */}
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono">
                        <span className="text-zinc-500 uppercase">CashTokens</span>
                        {health.cashtoken ? (
                            <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE ({health.cashtoken.activeIntents} Active)</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500" /> OFFLINE</span>
                        )}
                    </div>
                    {/* Cross-Chain Health */}
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono">
                        <span className="text-zinc-500 uppercase">Cross-Chain</span>
                        {health.crosschain ? (
                            <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500" /> OFFLINE</span>
                        )}
                    </div>

                    <Button variant="outline" size="icon" onClick={fetchAllData} disabled={isLoading} className="bg-zinc-900/50 border-zinc-800 h-8 w-8 text-zinc-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Filtering & Layout */}
            <Card className="border-white/5 bg-zinc-950/50 overflow-hidden shadow-2xl backdrop-blur-xl">
                <CardHeader className="border-b border-white/5 pb-4 bg-zinc-900/20">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-900/80">
                                <TabsTrigger value="ACTIVE" className="data-[state=active]:bg-zinc-800">Active Orders</TabsTrigger>
                                <TabsTrigger value="HISTORY" className="data-[state=active]:bg-zinc-800">History</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-3">
                            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                                <SelectTrigger className="w-[140px] h-9 bg-zinc-900/80 border-zinc-800 text-xs text-muted-foreground focus:ring-0">
                                    <SelectValue placeholder="Network" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    <SelectItem value="ALL">All Networks</SelectItem>
                                    <SelectItem value="SAME_CHAIN">Same-Chain (BCH)</SelectItem>
                                    <SelectItem value="CROSS_CHAIN">Cross-Chain (HTLC)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-9 bg-zinc-900/80 border-zinc-800 text-xs text-muted-foreground focus:ring-0">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="LOCKED">Locked</SelectItem>
                                    <SelectItem value="DEST_FILLED">Dest Filled</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-900/30">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="w-[160px] text-xs font-semibold text-zinc-400">Created At</TableHead>
                                    <TableHead className="text-xs font-semibold text-zinc-400">Trade Configuration</TableHead>
                                    <TableHead className="text-xs font-semibold text-zinc-400">Prices & Routing</TableHead>
                                    <TableHead className="text-xs font-semibold text-zinc-400">Status & Timeout</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-zinc-400">Explorers</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            {isLoading ? 'Loading intent networks...' : 'No orders found matching criteria.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const now = Date.now();
                                        const isExpired = order.expiryTime && now > order.expiryTime;
                                        const isCompleted = order.status === 'COMPLETED' || order.status === 'FAILED';

                                        return (
                                            <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                {/* CREATED */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium text-zinc-200">
                                                            {order.createdAt ? formatDistanceToNow(order.createdAt, { addSuffix: true }) : 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 font-mono">
                                                            {order.createdAt ? format(order.createdAt, 'MMM dd, HH:mm:ss') : '--'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* CONFIGURATION */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-2">
                                                        {renderTypeBadge(order)}
                                                        <div className="flex items-center gap-1.5 bg-zinc-900/50 w-fit px-2 py-1 rounded-md border border-zinc-800">
                                                            <div className="flex items-center gap-1.5">
                                                                {order.sellToken?.icon ? <img src={order.sellToken.icon} className="w-4 h-4 rounded-full" /> : <div className="w-4 h-4 rounded-full bg-zinc-800" />}
                                                                <span className="text-xs font-medium text-zinc-300">{order.sellAmountFormatted} {order.sellToken?.symbol}</span>
                                                            </div>
                                                            <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                            <div className="flex items-center gap-1.5">
                                                                {order.buyToken?.icon ? <img src={order.buyToken.icon} className="w-4 h-4 rounded-full" /> : <div className="w-4 h-4 rounded-full bg-zinc-800" />}
                                                                <span className="text-xs font-medium text-zinc-300">{order.buyAmountFormatted} {order.buyToken?.symbol}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* PRICING & ROUTING */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-zinc-500 w-12">Price:</span>
                                                            <span className="text-xs font-mono text-emerald-400">
                                                                {(Number(order.buyAmountFormatted) / Number(order.sellAmountFormatted)).toFixed(4)} {order.buyToken?.symbol}/{order.sellToken?.symbol}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-[10px] text-zinc-500 uppercase w-12">Maker:</span>
                                                            <span className="text-xs font-mono text-zinc-400" title={order.makerAddress}>
                                                                {shortenAddr(order.makerAddress)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* STATUS & TIMEOUTS */}
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {renderStatusBadge(order.status)}
                                                        {!isCompleted && order.expiryTime && !isNaN(order.expiryTime) && (
                                                            <div className={`text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border ${isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {isExpired ? 'Expired' : `Expires in ${formatDistanceToNow(order.expiryTime)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* EXPLORERS */}
                                                <TableCell className="text-right align-top py-4">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {order.sourceExplorerUrl ? (
                                                            <a href={order.sourceExplorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/5 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-blue-500/20">
                                                                <span className="font-mono">Source Tx</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-zinc-700 font-mono px-2 py-1">No Source Tx</span>
                                                        )}

                                                        {order.source === 'CROSSCHAIN' && (
                                                            order.destExplorerUrl ? (
                                                                <a href={order.destExplorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/5 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-purple-500/20">
                                                                    <span className="font-mono">Dest Tx</span>
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-zinc-700 font-mono px-2 py-1">No Dest Tx</span>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

