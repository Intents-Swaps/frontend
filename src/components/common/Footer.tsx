/**
 * Footer - Premium Footer Component
 * 
 * Features:
 * - Morphic design with grainy texture
 * - Gradient mesh background
 * - Clean grid layout with social links
 * - Animated hover states
 * - Full light/dark mode support
 */

import { Link } from 'react-router-dom';
import { Twitter, Github, BookOpen, Zap, ArrowUpRight, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const footerLinks = {
    protocol: [
        { label: 'Swap', href: '/swap' },
        { label: 'Cross-Chain', href: '/crossswap' },
        { label: 'Oracle', href: '/oracle' },
        { label: 'Resolver', href: '/resolver' },
    ],
    resources: [
        { label: 'Documentation', href: 'https://bch-intents-docs.vercel.app/', external: true },
        { label: 'GitHub', href: 'https://github.com/Move-Intent-Protocol', external: true },
        { label: 'Knowledge Base', href: '/kb' },
        { label: 'API Reference', href: '#' },
    ],
    company: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
    ],
};

const socialLinks = [
    {
        icon: Twitter,
        href: 'https://x.com/intentprotocol',
        label: 'Twitter',
        color: 'hover:bg-blue-500/10 hover:text-blue-500'
    },
    {
        icon: BookOpen,
        href: 'https://bch-intents-docs.vercel.app/',
        label: 'Docs',
        color: 'hover:bg-green-500/10 hover:text-green-500'
    },
    {
        icon: Github,
        href: 'https://github.com/Move-Intent-Protocol',
        label: 'GitHub',
        color: 'hover:bg-purple-500/10 hover:text-purple-500'
    },
    {
        icon: Mail,
        href: 'mailto:hello@intentprotocol.xyz',
        label: 'Email',
        color: 'hover:bg-orange-500/10 hover:text-orange-500'
    },
];

interface FooterLinkProps {
    label: string;
    href: string;
    external?: boolean;
}

function FooterLink({ label, href, external }: FooterLinkProps) {
    const className = cn(
        "text-sm text-muted-foreground hover:text-foreground transition-colors",
        "flex items-center gap-1 group"
    );

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {label}
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
            </a>
        );
    }

    return (
        <Link to={href} className={className}>
            {label}
        </Link>
    );
}

export function Footer() {
    return (
        <footer className="relative border-t border-border/40 mt-auto overflow-hidden">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 mesh-gradient-primary opacity-30" />
            <div className="absolute inset-0 grainy" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
                        {/* Brand Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl bg-primary flex items-center justify-center",
                                    "group-hover:scale-110 transition-transform duration-300",
                                    "shadow-lg shadow-primary/30"
                                )}>
                                    <Zap className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="font-heading font-bold text-xl tracking-tight">
                                    BCH <span className="text-primary">Intents</span>
                                </span>
                            </Link>

                            <p className="text-muted-foreground max-w-sm leading-relaxed">
                                The fastest intent-based swap protocol bridging Bitcoin Cash and Solana.
                                Gasless, secure, and cross-chain ready.
                            </p>

                            {/* Social Links */}
                            <div className="flex items-center gap-2">
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            "bg-muted/50 text-muted-foreground",
                                            "transition-colors duration-200",
                                            social.color
                                        )}
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="font-bold mb-4 text-foreground">Protocol</h4>
                            <ul className="space-y-3">
                                {footerLinks.protocol.map((link) => (
                                    <li key={link.label}>
                                        <FooterLink {...link} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-foreground">Resources</h4>
                            <ul className="space-y-3">
                                {footerLinks.resources.map((link) => (
                                    <li key={link.label}>
                                        <FooterLink {...link} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-foreground">Company</h4>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.label}>
                                        <FooterLink {...link} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} BCH Intents. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Built on
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Bitcoin Cash
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
