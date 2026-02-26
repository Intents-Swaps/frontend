/**
 * LiveOnSection
 * 
 * Displays "Live on" status with a marquee of supported networks.
 * Replaces the old Features and Rates sections.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NETWORKS = [
    {
        name: "Bitcoin Cash",
        logo: (
            <div className="flex items-center gap-2">
                <img src="https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png" alt="BCH" className="w-8 h-8" />
                <span className="text-2xl font-bold tracking-tighter text-[#0AC18E]">Bitcoin Cash</span>
            </div>
        ),
        color: "text-inherit"
    },
    {
        name: "Solana",
        logo: (
            <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 4H4.5L6.5 7.5H19.5L17.5 4Z" fill="url(#solana-gradient)" />
                    <path d="M6.5 12H19.5L17.5 15.5H4.5L6.5 12Z" fill="url(#solana-gradient)" />
                    <path d="M17.5 20H4.5L6.5 16.5H19.5L17.5 20Z" fill="url(#solana-gradient)" />
                    <defs>
                        <linearGradient id="solana-gradient" x1="4.5" y1="4" x2="19.5" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#9945FF" />
                            <stop offset="1" stopColor="#14F195" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#9945FF] to-[#14F195]">
                    Solana
                </span>
            </div>
        ),
        color: "text-inherit"
    },
    {
        name: "Movement",
        logo: (
            <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="currentColor" />
                </svg>
                <span className="text-2xl font-bold tracking-tighter text-white">Movement</span>
            </div>
        ),
        color: "text-inherit"
    }
];

// Duplicate for infinite marquee
const MARQUEE_ITEMS = [...NETWORKS, ...NETWORKS, ...NETWORKS, ...NETWORKS, ...NETWORKS];

export function LiveOnSection() {
    return (
        <section className="relative py-12 overflow-hidden bg-[#050505] border-y border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-20" />
            <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none opacity-20" />

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                            Live On
                        </span>
                    </div>
                </div>

                {/* Marquee */}
                <div className="relative w-full overflow-hidden mask-linear-fade">
                    <motion.div
                        className="flex gap-24 w-max items-center"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                    >
                        {MARQUEE_ITEMS.map((network, i) => (
                            <div key={i} className={cn("flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-300", network.color)}>
                                {network.logo}
                            </div>
                        ))}
                    </motion.div>

                    {/* Fade overlay edges */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
                </div>

            </div>
        </section>
    );
}
