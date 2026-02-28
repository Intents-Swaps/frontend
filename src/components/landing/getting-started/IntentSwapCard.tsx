/**
 * IntentSwapCard - Step 3
 * 
 * Swap between tokens with intent-based swaps.
 * Features animated looping swap visualization.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CardProps {
    stepNumber: number;
}

// Token pairs for swap animation
const SWAP_PAIRS = [
    {
        from: { symbol: 'SOL', amount: '5', icon: '/assets/solanaLogo.png', color: '#9945FF' },
        to: { symbol: 'BCH', amount: '40', icon: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg', color: '#0AC18E' },
    },
    {
        from: { symbol: 'ETH', amount: '1', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', color: '#627EEA' },
        to: { symbol: 'BCH', amount: '6', icon: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg', color: '#0AC18E' },
    },
    {
        from: { symbol: 'MOVE', amount: '1000', icon: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png', color: '#FACC15' },
        to: { symbol: 'BCH', amount: '2', icon: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg', color: '#0AC18E' },
    },
];

export function IntentSwapCard({ stepNumber }: CardProps) {
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);

    const currentPair = SWAP_PAIRS[currentPairIndex];

    // Cycle through swap pairs
    useEffect(() => {
        const interval = setInterval(() => {
            setIsSwapping(true);
            setTimeout(() => {
                setCurrentPairIndex((prev) => (prev + 1) % SWAP_PAIRS.length);
                setIsSwapping(false);
            }, 500);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(
            "bento-card-interactive glass-panel w-full h-full flex flex-col p-6 !rounded-none",
            "grainy group cursor-pointer"
        )}>
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 mesh-gradient-pink opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="tag-pink">
                        Step {stepNumber}
                    </span>
                    <div className="icon-box w-10 h-10 bg-pink-500/10 text-pink-500">
                        <ArrowRightLeft className="w-5 h-5" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-pink-500 transition-colors">
                    Intent Swap
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Express your trading intent and let resolvers compete for best execution.
                    <span className="text-foreground font-medium block mt-1">
                        "I want {currentPair.to.amount} {currentPair.to.symbol} for my {currentPair.from.amount} {currentPair.from.symbol}"
                    </span>
                </p>

                {/* Animated Swap Visualization */}
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative w-full flex items-center justify-center gap-4">
                        {/* From Token */}
                        <motion.div
                            key={`from-${currentPairIndex}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: isSwapping ? 0.9 : 1,
                                opacity: isSwapping ? 0.5 : 1,
                                x: isSwapping ? 20 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
                                "bg-white dark:bg-zinc-800 shadow-xl border border-border/50"
                            )}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-1 overflow-hidden"
                                style={{ backgroundColor: `${currentPair.from.color}20` }}
                            >
                                <img src={currentPair.from.icon} alt={currentPair.from.symbol} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                                {currentPair.from.amount}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {currentPair.from.symbol}
                            </span>
                        </motion.div>

                        {/* Arrow with animation */}
                        <motion.div
                            className="relative"
                            animate={{
                                scale: isSwapping ? 1.2 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center"
                                animate={{ rotate: isSwapping ? 180 : 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ArrowRightLeft className="w-5 h-5 text-pink-500" />
                            </motion.div>

                            {/* Particles on swap */}
                            {isSwapping && (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1.5 h-1.5 rounded-full bg-pink-500"
                                            initial={{
                                                x: 0,
                                                y: 0,
                                                scale: 1,
                                                opacity: 1
                                            }}
                                            animate={{
                                                x: Math.cos(i * 60 * Math.PI / 180) * 30,
                                                y: Math.sin(i * 60 * Math.PI / 180) * 30,
                                                scale: 0,
                                                opacity: 0,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                marginLeft: '-3px',
                                                marginTop: '-3px',
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </motion.div>

                        {/* To Token */}
                        <motion.div
                            key={`to-${currentPairIndex}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: isSwapping ? 0.9 : 1,
                                opacity: isSwapping ? 0.5 : 1,
                                x: isSwapping ? -20 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
                                "bg-white dark:bg-zinc-800 shadow-xl border border-border/50"
                            )}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-1 overflow-hidden"
                                style={{ backgroundColor: `${currentPair.to.color}20` }}
                            >
                                <img src={currentPair.to.icon} alt={currentPair.to.symbol} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                                {currentPair.to.amount}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {currentPair.to.symbol}
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Features */}
                <div className="flex gap-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                        <span>MEV Protected</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        <span>Best rates</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IntentSwapCard;
