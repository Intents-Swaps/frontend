import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    size?: 'default' | 'lg';
    onClick?: () => void;
}

export function AnimatedTradeButton({ className, size = 'default', onClick }: Props) {
    const isLg = size === 'lg';

    return (
        <Link
            to="/trade"
            onClick={onClick}
            className={cn("relative group block cursor-pointer", className)}
        >
            {/* Outer Glow / Wireframe effect */}
            <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-400 via-green-500 to-yellow-400 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse-glow" />

            {/* Inner button container - border box with curved edges */}
            <div className={cn(
                "relative flex items-center justify-center bg-black/90 rounded-xl border border-white/20 overflow-hidden backdrop-blur-sm",
                isLg ? "h-14 px-10 text-xl font-bold" : "h-10 px-6 text-sm font-bold"
            )}>

                {/* Morphing / Shape-shifting animation background inside */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden rounded-xl">
                    <motion.div
                        animate={{
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.8, 1.2, 1.8, 1],
                            borderRadius: ["30%", "40%", "20%", "50%", "30%"]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-green-500/40 to-emerald-400/20 blur-xl"
                    />
                    <motion.div
                        animate={{
                            rotate: [360, 270, 180, 90, 0],
                            scale: [1, 1.5, 1],
                            borderRadius: ["50%", "20%", "40%", "30%", "50%"]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tl from-yellow-400/30 to-transparent blur-lg"
                    />
                </div>

                {/* Text */}
                <span className="relative z-10 text-white tracking-widest group-hover:text-emerald-300 transition-colors drop-shadow-md">
                    {isLg ? 'TRADE NOW' : 'TRADE'}
                </span>
            </div>
        </Link>
    );
}
