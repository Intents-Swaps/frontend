import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function shortenAddr(addr: string | undefined, chars = 4): string {
    if (!addr) return '';
    return `${addr.substring(0, chars)}...${addr.substring(addr.length - chars)}`;
}
