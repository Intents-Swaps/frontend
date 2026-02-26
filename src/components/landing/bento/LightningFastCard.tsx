/**
 * LightningFastCard - Card 3 in the bento grid
 * 
 * Features:
 * - Speed metrics display (2.5s average swap time)
 * - Success rate and liquidity stats
 * - Green gradient mesh background
 * - Animated zap icon
 */

import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LightningFastCardProps {
    className?: string;
}

export function LightningFastCard({ className }: LightningFastCardProps) {
    return (
        <div
            className={cn(
                'bento-card h-full min-h-[280px] flex flex-col',
                'mesh-gradient-green grainy',
                className
            )}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-1">Lightning Fast</h3>
                    <p className="text-muted-foreground text-sm">Execute swaps in seconds</p>
                </div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="icon-box-green"
                >
                    <Zap className="w-5 h-5" />
                </motion.div>
            </div>

            {/* Main Stat - Swap Time */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Glow effect behind the number */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse-glow" />
                        </div>

                        <span className="relative text-5xl md:text-6xl font-bold text-emerald-500">
                            2.5s
                        </span>
                    </motion.div>
                    <p className="text-muted-foreground mt-2">Average swap time</p>
                </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">~99.9%</div>
                    <div className="text-xs text-muted-foreground">Success rate</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">$2.34M</div>
                    <div className="text-xs text-muted-foreground">Liquidity</div>
                </div>
            </div>
        </div>
    );
}

export default LightningFastCard;
