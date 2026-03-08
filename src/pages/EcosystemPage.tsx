import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, MessageCircle, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function EcosystemPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/30 text-foreground">
            <Header />

            <main className="flex-1">
                {/* Hero section */}
                <section className="relative pt-28 pb-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[#050505] z-0" />
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                                The BCH Intents{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-yellow-400">
                                    Ecosystem
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground">
                                Discover the suite of powerful tools and products built on top of the BCH Intents Protocol.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Bento Grid section */}
                <section className={cn('relative py-12 md:py-20 overflow-hidden')}>
                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 grainy" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Card 1: Swap */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-2 relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                                        <ArrowLeftRight className="w-6 h-6 text-black" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">BCH Intents Swap</h3>
                                    <p className="text-muted-foreground text-lg mb-8 flex-1">
                                        Our flagship product. Trustless intent-based swaps combining CashTokens and cross-chain execution without bridges or wrapping.
                                    </p>
                                    <div>
                                        <Button asChild className="rounded-full bg-white text-black hover:bg-white/90 group-hover:scale-105 transition-transform">
                                            <Link to="/trade">
                                                Start Trading <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2: Telegram Bot */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Telegram Bot</h3>
                                    <p className="text-muted-foreground mb-8 flex-1">
                                        Trade instantly from Telegram. Seamless intent execution on the go with zero web interface required.
                                    </p>
                                    <div>
                                        <Button asChild variant="outline" className="rounded-full border-white/20 hover:bg-white/10 group-hover:scale-105 transition-transform">
                                            <a href="#" target="_blank" rel="noopener noreferrer">
                                                Launch Bot <ArrowRight className="ml-2 w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 3: Explorer */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-3 relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row gap-8 relative z-10 items-center">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6">
                                            <Globe className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-4">BCH Intents Explorer</h3>
                                        <p className="text-muted-foreground text-lg mb-8 max-w-xl">
                                            Transparently verify cross-chain state. Track intents, solver competition, and atomic HTLC settlements in real-time across the network.
                                        </p>
                                        <div>
                                            <Button asChild className="rounded-full bg-white text-black hover:bg-white/90 group-hover:scale-105 transition-transform">
                                                <Link to="/explore">
                                                    Open Explorer <ArrowRight className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Abstract visualization for explorer */}
                                    <div className="hidden md:flex flex-1 justify-center relative">
                                        <div className="w-[300px] h-[200px] rounded-xl border border-white/10 bg-black/50 overflow-hidden relative p-4 grid gap-2">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-10 rounded border border-white/5 bg-white-[0.02] flex items-center px-4 justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <div className="h-2 w-20 bg-white/20 rounded" />
                                                    </div>
                                                    <div className="h-2 w-12 bg-white/10 rounded" />
                                                </div>
                                            ))}
                                            <div className="mt-4 flex gap-2 justify-end">
                                                <div className="w-10 h-10 rounded border border-white/5 flex items-center justify-center text-xs text-white/40">#12</div>
                                                <div className="w-10 h-10 rounded border border-white/5 flex items-center justify-center text-xs text-white/40">#13</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
