/**
 * TradingApiCard - Card 5 in the bento grid
 * 
 * Features:
 * - Developer-focused messaging
 * - Code snippet or API visualization
 * - Orange gradient mesh background
 * - "Integrate the API" CTA
 */

import { cn } from '@/lib/utils';
import { Code2, ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TradingApiCardProps {
    className?: string;
}

export function TradingApiCard({ className }: TradingApiCardProps) {
    return (
        <div
            className={cn(
                'bento-card h-full min-h-[320px] flex flex-col',
                'mesh-gradient-orange grainy',
                className
            )}
        >
            {/* Card Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-orange-500" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                    <Terminal className="w-3 h-3" />
                    Trading API
                </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-primary">
                    DeFi for your users, at no cost.
                </span>
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
                Use the same API that powers Intent Protocol. Join leading teams who trust the API
                to access deep crypto liquidity.
            </p>

            {/* CTA Button */}
            <a
                href="https://bch-intents-docs.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Button
                    variant="outline"
                    className="rounded-full gap-2 group border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5"
                >
                    Integrate the API
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </a>

            {/* Code Snippet Visualization */}
            <div className="mt-auto pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900 dark:bg-zinc-950 rounded-xl p-4 font-mono text-xs overflow-hidden relative"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 shimmer" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            <span className="ml-2 text-zinc-500">intent-swap-v4-sdk</span>
                        </div>

                        <pre className="text-zinc-400 overflow-x-auto">
                            <code>
                                <span className="text-purple-400">import</span>{' '}
                                <span className="text-zinc-200">{'{ IntentSwap }'}</span>{' '}
                                <span className="text-purple-400">from</span>{' '}
                                <span className="text-green-400">'@intent/sdk'</span>;{'\n\n'}
                                <span className="text-purple-400">const</span>{' '}
                                <span className="text-zinc-200">quote</span>{' '}
                                <span className="text-zinc-500">=</span>{' '}
                                <span className="text-purple-400">await</span>{' '}
                                <span className="text-blue-400">intent</span>
                                <span className="text-zinc-500">.</span>
                                <span className="text-yellow-400">getQuote</span>
                                <span className="text-zinc-500">(</span>
                                <span className="text-zinc-500">{'{'}</span>{'\n'}
                                {'  '}<span className="text-zinc-200">sellToken</span>
                                <span className="text-zinc-500">:</span>{' '}
                                <span className="text-green-400">"MOVE"</span>
                                <span className="text-zinc-500">,</span>{'\n'}
                                {'  '}<span className="text-zinc-200">buyToken</span>
                                <span className="text-zinc-500">:</span>{' '}
                                <span className="text-green-400">"USDC"</span>
                                <span className="text-zinc-500">,</span>{'\n'}
                                {'  '}<span className="text-zinc-200">amount</span>
                                <span className="text-zinc-500">:</span>{' '}
                                <span className="text-orange-400">"1000"</span>{'\n'}
                                <span className="text-zinc-500">{'}'}</span>
                                <span className="text-zinc-500">)</span>;
                            </code>
                        </pre>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default TradingApiCard;
