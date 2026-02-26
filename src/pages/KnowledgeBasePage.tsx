/**
 * KnowledgeBasePage - Premium Knowledge Base Landing
 * 
 * Features:
 * - Morphic design system styling
 * - Grainy texture backgrounds
 * - Glass containers with bento cards
 * - Premium newsletter CTA section
 * - Smooth Framer Motion animations
 */

import { KBHeader } from '../components/knowledge-base/KBHeader';
import { KBCategoryList } from '../components/knowledge-base/KBCategoryList';
import { KBArticleList } from '../components/knowledge-base/KBArticleList';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KnowledgeBasePage() {
    return (
        <main className="flex-1 relative overflow-x-hidden bg-background">
            {/* Hero & Search */}
            <KBHeader />

            {/* Categories Section */}
            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={cn(
                        "bento-card p-6 md:p-8",
                        "grainy"
                    )}
                >
                    <KBCategoryList />
                </motion.div>
            </div>

            {/* Recent Articles Section */}
            <section className="container mx-auto px-4 py-24 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                >
                    <div className="space-y-2">
                        <span className="tag-primary">
                            <Sparkles className="w-3 h-3" />
                            Latest Updates
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Recent Articles
                        </h2>
                        <p className="text-muted-foreground max-w-md">
                            Stay up to date with the latest guides, tutorials, and protocol updates from our team.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-full px-6 group self-start md:self-auto"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                <KBArticleList limit={6} />
            </section>

            {/* Newsletter CTA Section */}
            <section className="container mx-auto px-4 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className={cn(
                        "bento-card relative overflow-hidden text-center p-12 md:p-16",
                        "grainy"
                    )}>
                        {/* Gradient Mesh Background */}
                        <div className="absolute inset-0 mesh-gradient-primary opacity-50" />

                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="icon-box-primary w-16 h-16 mx-auto mb-8">
                                <Mail className="w-7 h-7" />
                            </div>

                            {/* Title */}
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                                Stay ahead of the curve
                            </h3>

                            {/* Subtitle */}
                            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
                                Join 50,000+ traders getting weekly alpha, protocol updates, and trading strategies.
                            </p>

                            {/* Email Form */}
                            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl",
                                            "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl",
                                            "border border-white/20 dark:border-white/10",
                                            "text-foreground placeholder:text-muted-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                                            "transition-all duration-200"
                                        )}
                                    />
                                </div>
                                <Button
                                    size="lg"
                                    className={cn(
                                        "h-14 px-8 rounded-2xl font-bold text-base",
                                        "shadow-lg shadow-primary/25"
                                    )}
                                >
                                    Subscribe
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            {/* Trust Text */}
                            <p className="text-xs text-muted-foreground mt-6">
                                No spam, unsubscribe anytime. We respect your privacy.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}

export default KnowledgeBasePage;
