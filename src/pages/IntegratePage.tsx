import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Code2, Cpu, Link as LinkIcon, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IntegratePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/30 text-foreground">
            <Header />

            <main className="flex-1">
                {/* Hero section */}
                <section className="relative pt-28 pb-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[#050505] z-0" />
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[10%] left-[60%] w-[30vw] h-[30vw] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse-glow delay-700" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <Code2 className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                                Integrate{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-yellow-600">
                                    BCH Intents
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground">
                                Build powerful cross-chain applications and unified trading experiences with the BCH Intents SDK.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Bento Grid layout for SDK Features */}
                <section className={cn('relative py-12 md:py-20 overflow-hidden')}>
                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 grainy" />

                    <div className="container mx-auto px-4 relative z-10">
                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Card 1: Main SDK Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-2 relative group rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 p-8"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Blocks className="w-8 h-8 text-yellow-500" />
                                        <h3 className="text-2xl font-bold">The Protocol SDK</h3>
                                    </div>
                                    <p className="text-muted-foreground mb-6">
                                        Our robust monorepo `@bch-intents-sdk` gives developers a direct API interface to structure, sign, and broadcast intents programmatically.
                                        Connect your existing wallets, create dynamic orders, and tap into solver liquidity seamlessly.
                                    </p>
                                    <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-green-400 mb-6">
                                        npm install @bch-intents-sdk/core
                                    </div>
                                    <Button asChild className="rounded-full h-12 px-6 font-bold bg-white text-black hover:bg-white/90">
                                        <a href="https://github.com/demandapi-ai" target="_blank" rel="noopener noreferrer">
                                            View Documentation <ArrowRight className="ml-2 w-4 h-4" />
                                        </a>
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Card 2: Wallet Connections */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-1 border border-white/5 bg-zinc-900 rounded-3xl p-6 relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                                    <LinkIcon className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Multi-Wallet Connect</h3>
                                <p className="text-muted-foreground text-sm">
                                    Unified adapters for Solana (Phantom), EVM (Petra/Metamask), and native Bitcoin Cash (Mainnet-JS).
                                </p>
                            </motion.div>

                            {/* Card 3: Cross Chain Logic */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-1 border border-white/5 bg-zinc-900 rounded-3xl p-6 relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Atomic HTLC Swaps</h3>
                                <p className="text-muted-foreground text-sm">
                                    Incorporate trustless settlement primitives directly into your smart contracts and dApps.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
