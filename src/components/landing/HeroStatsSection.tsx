import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Activity, Zap, Layers, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Stats Data
const STATS = [
    {
        label: "24h Volume",
        value: "$6.6B",
        change: "+12.5%",
        color: "text-green-400",
        icon: <BarChart3 className="w-4 h-4 text-green-400" />
    },
    {
        label: "Active Resolvers",
        value: "42",
        sub: "Live Now",
        color: "text-blue-400",
        icon: <Activity className="w-4 h-4 text-blue-400" />
    },
    {
        label: "Avg Fill Time",
        value: "~230ms",
        sub: "Lightning Fast",
        color: "text-yellow-400",
        icon: <Zap className="w-4 h-4 text-yellow-400" />
    },
    {
        label: "Total Value Locked",
        value: "$2.5B",
        sub: "Across 3 Chains",
        color: "text-purple-400",
        icon: <Layers className="w-4 h-4 text-purple-400" />
    }
];

export function HeroStatsSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#050505] z-0" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[150px] animate-pulse-glow delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT COLUMN: Typography & Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        {/* Eyebrow / Logo Placeholder */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white text-black font-black flex items-center justify-center rounded-xl text-xl">
                                M
                            </div>
                            <span className="text-xl font-bold tracking-wide">BCH Intents Lab</span>
                        </div>

                        {/* Main Typography */}
                        <div className="space-y-2">
                            <h2 className="text-xl md:text-2xl font-medium text-muted-foreground uppercase tracking-widest pl-1">
                                Explore the
                            </h2>
                            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85]">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-yellow-400">
                                    BRIDGE
                                </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600">
                                    LESS
                                </span>
                                <br />
                                <span className="text-white block mt-2 text-5xl md:text-6xl lg:text-7xl">
                                    future of DeFi
                                </span>
                            </h1>
                        </div>

                        {/* Taglines */}
                        <p className="text-xl font-medium text-muted-foreground/80 max-w-lg">
                            No bridges. No wrapping. No hassle. <br />
                            <span className="text-white">Built for all the ways you swap.</span>
                        </p>

                        {/* Description Paragraphs */}
                        <div className="space-y-6 max-w-xl text-lg text-muted-foreground leading-relaxed border-l-2 border-white/10 pl-6">
                            <p>
                                <strong className="text-white">BCH Intents</strong> delivers every piece of the onchain economy in one platform.
                            </p>
                            <p>
                                Get no-fees trading, proven security, and deep liquidity, all backed by a competitive network of professional resolvers.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="pt-4">
                            <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] transition-transform hover:scale-105">
                                <Link to="/trade">
                                    Launch app <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Stats Header Card */}
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[28px] blur-sm opacity-50" />

                            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] flex items-center justify-between overflow-hidden">
                                {/* Animated background elements inside header */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    <h3 className="text-lg font-bold tracking-wide">Intents Protocol Stats</h3>
                                </div>

                                {/* Decorative mini chart or visualization */}
                                <div className="flex gap-1 items-end h-8 relative z-10">
                                    {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                        <div key={i} className="w-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4 Cards Grid - 2x2 even on mobile */}
                        <div className="grid grid-cols-2 gap-4">
                            {STATS.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className={cn(
                                        "bento-card relative p-6 rounded-[24px] flex flex-col justify-between min-h-[180px]",
                                        "bg-zinc-900/40 border border-white/5 backdrop-blur-md overflow-hidden group"
                                    )}
                                >
                                    {/* Hover Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-muted-foreground text-sm font-medium">{stat.label}</span>
                                            {stat.icon}
                                        </div>
                                        <div className={`text-3xl md:text-4xl font-bold tracking-tight mb-1 ${stat.color} group-hover:scale-105 transition-transform origin-left`}>
                                            {stat.value}
                                        </div>
                                        {stat.sub && (
                                            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">{stat.sub}</span>
                                        )}
                                        {stat.change && (
                                            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{stat.change}</span>
                                        )}
                                    </div>

                                    {/* Decorative Blur */}
                                    <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-[40px] opacity-20 ${stat.color.replace('text-', 'bg-')}`} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
