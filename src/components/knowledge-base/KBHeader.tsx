/**
 * KBHeader - Premium Knowledge Base Header
 * 
 * Features:
 * - Gradient mesh background with grainy texture
 * - Animated search bar with glow effect
 * - Clean typography matching morphic design system
 * - Responsive layout with smooth animations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function KBHeader() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/kb/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className="relative text-center pt-24 pb-32 overflow-hidden">
            {/* Premium Mesh Background */}
            <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 grainy" />

            {/* Ambient Gradient Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 dark:bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse-glow" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 px-4">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <span className="tag-primary">
                        <Sparkles className="w-3 h-3" />
                        Knowledge Hub
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                >
                    <span className="text-foreground">How can we </span>
                    <span className="text-gradient-primary">help?</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Master Intent Protocol with our comprehensive guides, technical documentation, and trading strategies.
                </motion.p>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-2xl mx-auto relative"
                >
                    {/* Glow effect on focus */}
                    <div
                        className={cn(
                            "absolute -inset-1 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-2xl blur-xl transition-opacity duration-500",
                            isFocused ? "opacity-100" : "opacity-0"
                        )}
                    />

                    <div className="relative">
                        <div className={cn(
                            "bento-card p-2 transition-all duration-300",
                            isFocused && "border-primary/50"
                        )}>
                            <div className="relative flex items-center">
                                <Search className={cn(
                                    "absolute left-4 h-5 w-5 transition-colors duration-300",
                                    isFocused ? "text-primary" : "text-muted-foreground"
                                )} />
                                <Input
                                    placeholder="Search for articles, guides, or troubleshooting..."
                                    className="pl-12 pr-20 h-14 text-lg bg-transparent border-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                                <div className="absolute right-4 hidden md:flex items-center gap-1">
                                    <kbd className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md border border-border">
                                        Enter ↵
                                    </kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
