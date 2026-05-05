import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Database, Rocket, Lock, GitBranch } from 'lucide-react';

export function RoadmapSection({ className }: { className?: string }) {
    return (
        <section
            className={cn(
                'relative py-20 md:py-32 overflow-hidden bg-black',
                className
            )}
        >
            {/* Section Background with Grainy Texture */}
            <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 grainy opacity-80" />

            {/* Ambient Gradient Orbs */}
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-green-500/10 dark:bg-green-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                        The Road to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">2026</span>
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Evolving from CashTokens to Trustless ZK-STARK Cross-Chain Settlement.
                    </p>
                </motion.div>

                {/* Grid Layout Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Phase 1: MVP */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors flex flex-col"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                    <Zap className="w-7 h-7 text-black" />
                                </div>
                                <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    Current MVP
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">2023-2024 Primitives</h3>
                            <p className="text-muted-foreground mb-6">
                                Proving the core concept using linear script evaluation. Trustless swap engine utilizing Introspection, CashTokens, and standard Hash Time-Locked Contracts (HTLCs).
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Linear Script Evaluation</li>
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> CashToken Composability</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Phase 2: TxV5 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors flex flex-col"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                                    <Database className="w-7 h-7 text-white" />
                                </div>
                                <div className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                    CHIP-2024-07
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">TxV5: Zero Overhead ZKP</h3>
                            <p className="text-muted-foreground mb-6">
                                Utilizing input-only data fields allowing massive verifiable proofs (100kb+ STARKs) to execute on-chain without permanently entering the UTXO set or causing state bloat.
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-cyan-500" /> Input-Only Pruning</li>
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-cyan-500" /> ABLA Synergy for high capacity</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Phase 3: 2026 Primitives */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 hover:bg-black/60 transition-colors flex flex-col md:col-span-2 lg:col-span-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                    <GitBranch className="w-7 h-7 text-white" />
                                </div>
                                <div className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
                                    Math Upgrade
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">2026 Primitives & Big Ints</h3>
                            <p className="text-muted-foreground mb-6">
                                Bounded loops (<code className="text-teal-400 mx-1">OP_BEGIN</code> / <code className="text-teal-400 mx-1">OP_UNTIL</code>) allow non-linear execution. Shrinking byte sizes to compress advanced AMM curves and iterative approximations directly into BCH contracts natively.
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-teal-500" /> Dutch Auctions in-script</li>
                                <li className="flex items-center text-sm text-foreground/80"><ShieldCheck className="w-4 h-4 mr-2 text-teal-500" /> Complex Pricing Curves</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Phase 4 (Hero Card): ZKP & STARKs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 lg:col-span-3 relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-8 md:p-12 hover:bg-black/60 transition-colors flex flex-col md:flex-row items-center gap-8"
                    >
                        {/* Dramatic glow for the main climax card */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <div className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-bold uppercase tracking-wider">
                                    The Endgame
                                </div>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black mb-4 text-white">Triton VM & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">zk-STARKs</span></h3>
                            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
                                Complete elimination of optimistic oracle relayers. The Solver executes the trade on Solana and generates a post-quantum zk-STARK proving the exact target cross-chain transaction occurred. The BCH contract verifies the STARK 100% on-chain and mathematically releases the funds. Trustless cross-chain settlement cemented on Layer 1 blockchains.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm flex items-center"><Rocket className="w-4 h-4 mr-2 text-amber-500" /> Quantum Resistant</span>
                                <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm flex items-center"><Rocket className="w-4 h-4 mr-2 text-amber-500" /> No Trusted Setup</span>
                                <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm flex items-center"><Rocket className="w-4 h-4 mr-2 text-amber-500" /> Recursive Verifiability</span>
                            </div>
                        </div>

                        {/* Abstract visual art piece for ZKPs */}
                        <div className="hidden lg:flex w-[350px] h-[350px] relative items-center justify-center shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-3xl animate-pulse" />
                            <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-xl">
                                <div className="w-48 h-48 border border-white/20 rounded-full flex items-center justify-center border-dashed animate-[spin_20s_linear_infinite]">
                                    <div className="w-32 h-32 border border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-pulse-glow">
                                            <Lock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Orbiting particles */}
                                <div className="absolute top-4 left-10 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
                                <div className="absolute bottom-10 right-4 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]" />
                                <div className="absolute -top-2 right-16 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
