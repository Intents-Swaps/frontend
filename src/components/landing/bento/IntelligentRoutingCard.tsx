/**
 * IntelligentRoutingCard - Card 4 in the bento grid
 * 
 * Features:
 * - Routing visualization with token icons
 * - "Any token, best price, lowest slippage" tagline
 * - Token pairs and swaps stats
 * - Animated routing arrow
 */

import { cn } from '@/lib/utils';
import { Route, ArrowRight } from 'lucide-react';
import { TokenDisplay } from '@/components/common/TokenDisplay';
import { motion } from 'framer-motion';

interface IntelligentRoutingCardProps {
    className?: string;
}

export function IntelligentRoutingCard({ className }: IntelligentRoutingCardProps) {
    return (
        <div
            className={cn(
                'bento-card h-full min-h-[280px] flex flex-col',
                'mesh-gradient-blue grainy',
                className
            )}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-1">Intelligent Routing</h3>
                    <p className="text-muted-foreground text-sm">Any token, best price, lowest slippage</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Route className="w-5 h-5 text-blue-500" />
                </div>
            </div>

            {/* Routing Visualization */}
            <div className="flex-1 flex items-center justify-center py-4">
                <div className="flex items-center gap-4">
                    {/* From Tokens (stacked) */}
                    <div className="flex -space-x-3">
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <TokenDisplay
                                tokenIcon="https://raw.githubusercontent.com/kitelabs-io/mvmt-tokens/main/logos/MOVE.png"
                                size="lg"
                                compact
                                className="ring-2 ring-background"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <TokenDisplay
                                tokenIcon="/logos/ethereum-eth-logo.svg"
                                size="lg"
                                compact
                                className="ring-2 ring-background"
                            />
                        </motion.div>
                    </div>

                    {/* Animated Arrow */}
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-blue-500"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </motion.div>

                    {/* To Tokens (stacked) */}
                    <div className="flex -space-x-3">
                        <motion.div
                            initial={{ x: 10, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <TokenDisplay
                                tokenIcon="/logos/usd-coin-usdc-logo.svg"
                                size="lg"
                                compact
                                className="ring-2 ring-background"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ x: 10, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <TokenDisplay
                                tokenIcon="/assets/solanaLogo.png"
                                size="lg"
                                compact
                                className="ring-2 ring-background"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-4">
                Swap between any token pair
            </p>

            {/* Bottom Stats Row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">200+</div>
                    <div className="text-xs text-muted-foreground">Token pairs</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">2M+</div>
                    <div className="text-xs text-muted-foreground">Swaps</div>
                </div>
            </div>
        </div>
    );
}

export default IntelligentRoutingCard;
