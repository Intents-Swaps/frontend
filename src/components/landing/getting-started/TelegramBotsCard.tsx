/**
 * TelegramBotsCard - Step 5
 * 
 * Telegram bots for trading on the go.
 * Features bot handles with try buttons and Telegram styling.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MessageCircle, Bot, Zap, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardProps {
    stepNumber: number;
}

// Telegram bots data
const BOTS = [
    {
        handle: '@movementswaps_bot',
        name: 'Movement Swaps',
        description: 'Fast swaps on Movement',
        link: 'https://t.me/movementswaps_bot',
        color: '#FACC15',
    },
    {
        handle: '@crosschainintent_bot',
        name: 'Cross-Chain Intent',
        description: 'Bridge & swap across chains',
        link: 'https://t.me/crosschainintent_bot',
        color: '#9945FF',
    },
];

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

export function TelegramBotsCard({ stepNumber }: CardProps) {
    return (
        <div className={cn(
            "bento-card-interactive w-full h-full flex flex-col p-6",
            "grainy group cursor-pointer"
        )}>
            {/* Gradient Background - Telegram Blue */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0088cc]/10 via-transparent to-[#0088cc]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20">
                        Step {stepNumber}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center">
                        <TelegramIcon className="w-5 h-5" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[#0088cc] transition-colors">
                    Telegram Bots
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Trade on the go with our powerful Telegram bots. Execute swaps, check prices, and manage your portfolio right from Telegram.
                </p>

                {/* Bot Cards */}
                <div className="flex-1 space-y-4">
                    {BOTS.map((bot, index) => (
                        <motion.div
                            key={bot.handle}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className={cn(
                                "p-4 rounded-2xl",
                                "bg-white dark:bg-zinc-800 shadow-lg border border-border/50",
                                "hover:shadow-xl hover:border-[#0088cc]/30 transition-all duration-300"
                            )}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${bot.color}20` }}
                                >
                                    <Bot className="w-5 h-5" style={{ color: bot.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm">{bot.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{bot.description}</p>
                                </div>
                            </div>

                            {/* Handle */}
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-muted/50">
                                <TelegramIcon className="w-4 h-4 text-[#0088cc]" />
                                <code className="text-xs font-mono text-[#0088cc]">{bot.handle}</code>
                            </div>

                            {/* Try Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50"
                                asChild
                            >
                                <a href={bot.link} target="_blank" rel="noopener noreferrer">
                                    Try Bot
                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                </a>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Features */}
                <div className="flex gap-4 mt-auto pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="w-3.5 h-3.5 text-[#0088cc]" />
                        <span>Instant trades</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                        <span>24/7 Available</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TelegramBotsCard;
