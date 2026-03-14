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

                {/* SDK Overview Section */}
                <section className="relative py-12 md:py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 grainy" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Protocol SDK</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Our robust monorepo <code className="text-green-400">@bch-intents-sdk</code> gives developers a direct API interface to structure, sign, and broadcast intents programmatically.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Wallet Connections */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="border border-white/5 bg-zinc-900 rounded-3xl p-8 relative group hover:bg-zinc-800/80 transition-colors"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 relative z-10">
                                    <LinkIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 relative z-10">Multi-Wallet Connect</h3>
                                <p className="text-muted-foreground relative z-10">
                                    Unified adapters for Solana (Phantom), EVM (Petra/Metamask), and native Bitcoin Cash (Mainnet-JS).
                                </p>
                            </motion.div>

                            {/* Card 2: Cross Chain Logic */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="border border-white/5 bg-zinc-900 rounded-3xl p-8 relative group hover:bg-zinc-800/80 transition-colors"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 relative z-10">
                                    <Cpu className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 relative z-10">Atomic HTLC Swaps</h3>
                                <p className="text-muted-foreground relative z-10">
                                    Incorporate trustless settlement primitives directly into your smart contracts and dApps.
                                </p>
                            </motion.div>

                            {/* Card 3: Ready to use */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="border border-white/5 bg-zinc-900 rounded-3xl p-8 relative group hover:bg-zinc-800/80 transition-colors flex flex-col justify-between"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6">
                                        <Blocks className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">NPM Package</h3>
                                    <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-green-400 mb-6 w-full text-center">
                                        npm i @bch-intents-sdk/core
                                    </div>
                                </div>
                                <Button asChild className="w-full rounded-full h-12 font-bold bg-white text-black hover:bg-white/90 relative z-10 mt-auto">
                                    <a href="https://github.com/demandapi-ai" target="_blank" rel="noopener noreferrer">
                                        View Docs <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* What You Can Build Section */}
                <section className="relative py-12 md:py-20 overflow-hidden bg-black">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">What You Can Build</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                The Intents SDK is designed to be the ultimate developer toolkit for the Bitcoin Cash ecosystem. Be the engine, not just the car.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Build Card 1 */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Telegram Trading Bots</h3>
                                <p className="text-muted-foreground">
                                    Build instant-execution trading bots right inside Telegram. Let users sign intents without leaving their chat app, while the SDK handles the Cross-Chain and CashToken swaps in the background.
                                </p>
                            </motion.div>

                            {/* Build Card 2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Cross-Chain DEX Aggregators</h3>
                                <p className="text-muted-foreground">
                                    Don't rebuild from scratch. Provide trustless EVM/Solana to BCH bridging directly in your decentralized exchange. Access our network of solvers to fill orders with zero slippage.
                                </p>
                            </motion.div>

                            {/* Build Card 3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-6">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Stablecoin Payments (MUSD/PUSD)</h3>
                                <p className="text-muted-foreground">
                                    Integrate native BCH stablecoins like MUSD and PUSD seamlessly into your merchant applications or wallets, utilizing our CashToken escrow contracts.
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
