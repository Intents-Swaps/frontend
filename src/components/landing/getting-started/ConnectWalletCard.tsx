/**
 * ConnectWalletCard - Step 1
 * 
 * Connect to your favourite wallet on your chain.
 * Features animated wallet icons with floating effect.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Wallet, Link2, Shield, Sparkles } from 'lucide-react';

interface CardProps {
    stepNumber: number;
}

// Wallet icons data
const WALLETS = [
    { name: 'MetaMask', color: '#F6851B', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg' },
    { name: 'Nightly', color: '#6A44FF', icon: 'https://nightly.app/img/logo.png' },
    { name: 'Phantom', color: '#AB9FF2', icon: 'https://phantom.com/img/phantom-logo.svg' },
    { name: 'Electron Cash', color: '#0AC18E', icon: 'https://electroncash.org/images/logosForEcosystem/square/electroncash.png' },
];

export function ConnectWalletCard({ stepNumber }: CardProps) {
    return (
        <div className={cn(
            "bento-card-interactive glass-panel w-full h-full flex flex-col p-6 !rounded-none",
            "grainy group cursor-pointer"
        )}>
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 mesh-gradient-primary opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="tag-primary">
                        Step {stepNumber}
                    </span>
                    <div className="icon-box-primary w-10 h-10">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    Connect Wallet
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Connect to your favourite wallet on any supported chain. We support all major wallets for seamless DeFi access.
                </p>

                {/* Animated Wallet Icons */}
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative w-full h-48">
                        {WALLETS.map((wallet, index) => (
                            <motion.div
                                key={wallet.name}
                                className={cn(
                                    "absolute w-16 h-16 rounded-2xl flex items-center justify-center",
                                    "bg-white dark:bg-zinc-800 shadow-xl border border-border/50",
                                    "group-hover:scale-110 transition-transform duration-300"
                                )}
                                style={{
                                    left: `${15 + index * 20}%`,
                                    top: index % 2 === 0 ? '20%' : '50%',
                                }}
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, index % 2 === 0 ? 5 : -5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    delay: index * 0.3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <img
                                    src={wallet.icon}
                                    alt={wallet.name}
                                    className="w-10 h-10 object-contain rounded-xl"
                                    onError={(e) => {
                                        // Fallback to initial letter if image fails
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling) {
                                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                        }
                                    }}
                                />
                                <span className="text-2xl font-bold hidden" style={{ color: wallet.color }}>
                                    {wallet.name.charAt(0)}
                                </span>
                            </motion.div>
                        ))}

                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                                d="M 80 60 Q 150 100 220 80"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                fill="none"
                                className="text-primary/30"
                                animate={{ strokeDashoffset: [0, 20] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Features */}
                <div className="flex gap-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                        <span>One-click connect</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-3.5 h-3.5 text-green-500" />
                        <span>Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConnectWalletCard;
