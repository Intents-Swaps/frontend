import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Wallet, Search, ChevronDown } from 'lucide-react';

import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { WalletPopup } from '@/components/wallet/WalletPopup';
import { TokenSearchModal } from '@/components/common/TokenSearchModal';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useBCHWallet } from '@/context/BCHWalletProvider';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [walletPopupOpen, setWalletPopupOpen] = useState(false);
    const location = useLocation();
    const { connected } = useWallet();
    const { connected: solConnected } = useSolanaWallet();
    const { connected: bchConnected } = useBCHWallet();

    const anyWalletConnected = connected || solConnected || bchConnected;

    const primaryNavItems = [
        { name: 'Trade', path: '/trade' },
        { name: 'Explore', path: '/explore' },
        { name: 'Portfolio', path: '/portfolio' },
    ];

    const dropdownItems = [
        { name: 'Ecosystem', path: '/ecosystem' },
        { name: 'Integrate', path: '/integrate' },
        { name: 'Oracle', path: '/oracle' },
        { name: 'Knowledge Base', path: '/kb' },
    ];

    if (connected) {
        dropdownItems.push({ name: 'Orders', path: '/orders' });
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/60 transition-all duration-300">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* Left Section: Logo & Nav */}
                <div className="flex items-center gap-8 lg:gap-12">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center gap-2 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary transition-transform group-hover:scale-110 duration-300">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight hidden sm:block text-foreground">
                            <span className="text-emerald-500">BCH </span><span className="text-white">Intents</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 xl:gap-8">
                        {primaryNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "text-sm font-medium transition-all duration-200 hover:text-primary relative group py-2",
                                    location.pathname === item.path ? "text-primary" : "text-muted-foreground/80"
                                )}
                            >
                                {item.name}
                                <span className={cn(
                                    "absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left",
                                    location.pathname === item.path && "scale-x-100"
                                )} />
                            </Link>
                        ))}

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground/80 hover:text-primary transition-colors focus:outline-none data-[state=open]:text-primary">
                                More <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 text-foreground">
                                {dropdownItems.map((item) => (
                                    <DropdownMenuItem key={item.path} asChild className="focus:bg-white/5 focus:text-primary cursor-pointer">
                                        <Link to={item.path} className="w-full">{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-primary cursor-pointer">
                                    <a href="https://bch-intents-docs.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-full">Docs</a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>

                {/* Middle Section: Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md justify-center px-4">
                    <TokenSearchModal>
                        <Button
                            variant="outline"
                            className="w-full bg-[#0A0A0A]/50 backdrop-blur-sm border-white/10 hover:bg-white/10 text-muted-foreground hover:text-primary h-10 px-4 flex items-center justify-between rounded-xl shadow-sm transition-all duration-300 hover:shadow-primary/5 hover:border-primary/30"
                        >
                            <div className="flex items-center gap-3">
                                <Search className="h-4 w-4" />
                                <span className="font-medium text-sm">Search tokens...</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-semibold bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded text-white/40">/</span>
                            </div>
                        </Button>
                    </TokenSearchModal>
                </div>

                {/* Right Section: Actions */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative">
                            <ConnectWalletButton />
                        </div>
                    </div>
                    {/* Wallet Popup Trigger */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                            walletPopupOpen && "bg-primary/10 border-primary/30 text-primary",
                            anyWalletConnected && !walletPopupOpen && "border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-glow"
                        )}
                        onClick={() => setWalletPopupOpen(v => !v)}
                    >
                        <Wallet className="h-4 w-4" />
                    </Button>
                </div>

                {/* Wallet Popup Panel */}
                <WalletPopup open={walletPopupOpen} onClose={() => setWalletPopupOpen(false)} />

                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/5">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#050505]/95 backdrop-blur-xl border-l border-white/10">
                        <div className="flex flex-col gap-8 mt-12">
                            <nav className="flex flex-col gap-6">
                                {[
                                    ...primaryNavItems,
                                    ...dropdownItems,
                                ].map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-xl font-medium transition-colors hover:text-primary flex items-center justify-between group",
                                            location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {item.name}
                                        <ChevronDown className="-rotate-90 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </Link>
                                ))}
                                <a
                                    href="https://bch-intents-docs.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-medium transition-colors hover:text-primary flex items-center justify-between group text-muted-foreground"
                                >
                                    Docs
                                    <ChevronDown className="-rotate-90 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                </a>
                            </nav>
                            <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                                <div className="flex gap-3 mt-2">
                                    <div className="flex-1">
                                        <ConnectWalletButton className="w-full h-12 text-lg rounded-xl" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "h-12 w-12 shrink-0 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                                            walletPopupOpen && "bg-primary/10 border-primary/30 text-primary",
                                            anyWalletConnected && !walletPopupOpen && "border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-glow"
                                        )}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setWalletPopupOpen(true);
                                        }}
                                    >
                                        <Wallet className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
