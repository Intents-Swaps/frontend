import { useState } from 'react';
import { BCHSwapCard } from '@/components/bch-swap/BCHSwapCard';
import { LimitOrderHistory } from '@/components/bch-swap/LimitOrderHistory';
import { BCHOrderType } from '@/types';
// ============================================================================
// BCH Swap Page — /bchswap
// ============================================================================
// Unified page for BCH same-chain (CashToken) and cross-chain (BCH↔Solana) swaps.
// Layout mirrors the existing SwapPage pattern when 'market' is selected.
// Expands to a two-column layout when 'limit' orders are selected.

export default function BchSwapPage() {
    const [orderType, setOrderType] = useState<BCHOrderType>('market');

    return (
        <div className="container mx-auto py-10">
            <div className="text-center mb-8 space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    <span className="text-white">BCH</span> <span className="text-emerald-500">Intents</span> <span className="text-white">Swap</span>
                </h1>
            </div>

            <div className="flex justify-center max-w-[1200px] mx-auto w-full transition-all duration-300">
                <div className={`flex w-full gap-8 transition-all duration-500 justify-center 
                    ${orderType === 'limit' ? 'lg:justify-start lg:gap-8 flex-col lg:flex-row' : 'max-w-[480px]'}`}
                >
                    {/* Swap Card */}
                    <div className="w-full lg:w-[480px] shrink-0 transform transition-transform duration-300">
                        <BCHSwapCard orderType={orderType} onOrderTypeChange={setOrderType} />
                    </div>

                    {/* Limit Order History Side Panel */}
                    {orderType === 'limit' && (
                        <div className="w-full lg:flex-1 hidden lg:block animate-in slide-in-from-right-8 fade-in-50 duration-500 fill-mode-both delay-100">
                            <LimitOrderHistory />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
