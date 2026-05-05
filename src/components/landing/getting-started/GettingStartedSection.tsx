/**
 * Getting Started Section - Manual Scroll Pinning
 * 
 * Implements a robust "manual sticky" pattern using position: fixed/absolute
 * based on scroll position. This bypasses issues where overflow:hidden on
 * parents breaks standard position:sticky.
 */

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ConnectWalletCard } from './ConnectWalletCard';
import { DepositFundCard } from './DepositFundCard';
import { IntentSwapCard } from './IntentSwapCard';
import { TrackPortfolioCard } from './TrackPortfolioCard';
import { Sparkles, ChevronRight } from 'lucide-react';

const CARDS = [
    { id: 'connect', Component: ConnectWalletCard },
    { id: 'deposit', Component: DepositFundCard },
    { id: 'swap', Component: IntentSwapCard },
    { id: 'portfolio', Component: TrackPortfolioCard },
];

export function GettingStartedSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Track scroll within the tall container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // Smooth out the progress for fluid "drag" feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 20,
        restDelta: 0.001
    });


    // Horizontal Scroll Transform
    // Adjusted end value because we have 1 less card now
    const x = useTransform(smoothProgress, [0.15, 0.85], ['0%', '-25%']);

    // Removed opacity/scale based on user feedback

    // Hint fades out after start buffer
    const hintOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

    // Check mobile on mount
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // For mobile: Snap scrolling with correct "momentum" feel implies native scroll
    // We use scroll-snap to give it a structured feel
    if (isMobile) {
        return (
            <section className="py-20 bg-[#050505] overflow-hidden">
                <div className="container mx-auto px-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-white/10 mb-6 text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Step by Step Guide
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        How to get started
                    </h2>
                </div>

                {/* Mobile: Snap Scroll Container with hidden scrollbar */}
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-12 w-full no-scrollbar"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch' // Critical for momentum
                    }}
                >
                    {CARDS.map(({ id, Component }, index) => (
                        <div key={id} className="snap-center flex-shrink-0 w-[300px]">
                            <Component stepNumber={index + 1} />
                        </div>
                    ))}
                    <div className="w-4 flex-shrink-0" /> {/* End padding */}
                </div>
            </section>
        );
    }

    return (
        <section
            ref={containerRef}
            className="relative h-[300vh]"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505] flex flex-col justify-center">
                {/* Background Effects */}
                <div className="absolute inset-0 grainy" />
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    className="relative z-10 w-full"
                >
                    {/* Header */}
                    <div className="container mx-auto px-4 lg:px-16 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-white/10 mb-6 text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Step by Step Guide
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                How to get started with <br />
                                <span className="text-gradient-primary">Intent Swaps</span>
                            </h2>
                        </motion.div>
                    </div>

                    {/* Cards Container */}
                    <div className="w-full overflow-hidden pl-4 lg:pl-16">
                        <motion.div
                            style={{ x }}
                            className="flex gap-8 w-max"
                        >
                            {CARDS.map(({ id, Component }, index) => (
                                <div
                                    key={id}
                                    className="relative group w-[85vw] md:w-[45vw] lg:w-[30vw] h-[500px] md:h-[560px] flex-shrink-0"
                                >
                                    <Component stepNumber={index + 1} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Progress Bar & Hint */}
                    <div className="container mx-auto px-4 lg:px-16 mt-12">
                        <div className="flex items-center gap-6">
                            {/* Progress Track */}
                            <div className="w-48 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary origin-left"
                                    style={{ scaleX: smoothProgress }}
                                />
                            </div>

                            {/* Scroll Hint */}
                            <motion.div
                                style={{ opacity: hintOpacity }}
                                className="flex items-center gap-2 text-sm text-muted-foreground font-medium"
                            >
                                Scroll to explore
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default GettingStartedSection;
