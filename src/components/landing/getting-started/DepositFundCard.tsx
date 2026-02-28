/**
 * DepositFundCard - Step 2
 * 
 * Deposit funds to your crypto wallet from any chain with ease.
 * Features animated chain logos with deposit visualization.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowDownToLine, Coins, Zap } from 'lucide-react';

interface CardProps {
    stepNumber: number;
}

// Chain data with logos
const CHAINS = [
    {
        name: 'Bitcoin Cash',
        color: '#0AC18E',
        logo: 'https://bitcoincash.org/img/green/bitcoin-cash-circle.svg',
        shortName: 'BCH'
    },
    {
        name: 'Solana',
        color: '#9945FF',
        logo: '/assets/solanaLogo.png',
        shortName: 'SOL'
    },
    {
        name: 'Movement',
        color: '#FACC15',
        logo: 'https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png',
        shortName: 'MOVE'
    },
    {
        name: 'Ethereum',
        color: '#627EEA',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
        shortName: 'ETH'
    },
];

export function DepositFundCard({ stepNumber }: CardProps) {
    return (
        <div className={cn(
            "bento-card-interactive glass-panel w-full h-full flex flex-col p-6 !rounded-none",
            "grainy group cursor-pointer"
        )}>
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 mesh-gradient-blue opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="tag-primary">
                        Step {stepNumber}
                    </span>
                    <div className="icon-box w-10 h-10 bg-blue-500/10 text-blue-500">
                        <ArrowDownToLine className="w-5 h-5" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-blue-500 transition-colors">
                    Deposit Funds
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Deposit funds to your crypto wallet from any chain with ease. Bridge assets seamlessly across networks.
                </p>

                {/* Animated Chain Logos with Deposit Flow */}
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative w-full h-48">
                        {/* Central Wallet */}
                        <motion.div
                            className={cn(
                                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                                "w-20 h-20 rounded-2xl",
                                "bg-white dark:bg-zinc-800 shadow-2xl border border-border/50",
                                "flex items-center justify-center",
                                "group-hover:scale-110 transition-transform duration-300"
                            )}
                            animate={{
                                boxShadow: [
                                    '0 0 0 0 rgba(250, 204, 21, 0)',
                                    '0 0 0 15px rgba(250, 204, 21, 0.1)',
                                    '0 0 0 0 rgba(250, 204, 21, 0)',
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Coins className="w-8 h-8 text-primary" />
                        </motion.div>

                        {/* Chain Icons orbiting */}
                        {CHAINS.map((chain, index) => {
                            const angle = (index * 90) * (Math.PI / 180);
                            const radius = 80;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;

                            return (
                                <motion.div
                                    key={chain.name}
                                    className={cn(
                                        "absolute w-12 h-12 rounded-xl",
                                        "bg-white dark:bg-zinc-800 shadow-lg border border-border/50",
                                        "flex items-center justify-center overflow-hidden"
                                    )}
                                    style={{
                                        left: `calc(50% + ${x}px - 24px)`,
                                        top: `calc(50% + ${y}px - 24px)`,
                                    }}
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: index * 0.5,
                                        repeat: Infinity,
                                    }}
                                >
                                    <img
                                        src={chain.logo}
                                        alt={chain.name}
                                        className="w-8 h-8 object-contain z-10"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            if (e.currentTarget.nextElementSibling) {
                                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                            }
                                        }}
                                    />
                                    {/* Fallback text */}
                                    <div
                                        className="absolute inset-0 hidden items-center justify-center font-bold text-xs"
                                        style={{ color: chain.color }}
                                    >
                                        {chain.shortName}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Animated deposit arrows */}
                        {[0, 1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute left-1/2 top-1/2 w-1 h-4 bg-primary/50 rounded-full"
                                style={{
                                    rotate: `${i * 90}deg`,
                                    transformOrigin: '0 40px',
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: [0, -30, -30],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.4,
                                    repeat: Infinity,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="flex gap-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        <span>Instant deposits</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-green-500">4+</span>
                        <span>Chains supported</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DepositFundCard;
