import { useState, useEffect, useCallback } from 'react';
import { useWallet as useMovementWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useBCHWallet } from '@/context/BCHWalletProvider';
import { CoinGeckoService } from '@/lib/coingecko';

// Define the portfolio token structure
export interface PortfolioToken {
    symbol: string;
    name: string;
    chain: string;
    icon: string;
    balance: number;
    price: number;
    valueUsd: number;
    change24h: number;
}

// Generate realistic mock history data for the chart
const generateChartData = (currentTotal: number) => {
    const data = [];
    const now = new Date();
    // 24 hours of data points
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        // Add some random volatility (±2%)
        const volatility = 1 + (Math.random() * 0.04 - 0.02);
        data.push({
            time: time.toISOString(),
            value: currentTotal * volatility * (1 - (i * 0.001)) // Slight upward trend recently
        });
    }
    // Ensure the last point matches the exact current total
    data[data.length - 1].value = currentTotal;
    return data;
};

export function usePortfolio() {
    // Contexts
    const { connected: aptosConnected, account: aptosAccount, network: aptosNetwork } = useMovementWallet();
    const { connected: solanaConnected, publicKey: solanaPublicKey } = useSolanaWallet();
    const { connection: solanaConnection } = useConnection();
    const { connected: bchConnected, balance: bchSatBalance } = useBCHWallet();

    // State
    const [tokens, setTokens] = useState<PortfolioToken[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPortfolio = useCallback(async () => {
        setLoading(true);

        // 1. Fetch live market prices
        const marketData = await CoinGeckoService.getMarketData(['MOVE', 'SOL', 'USDC', 'USDT', 'BCH']);
        const portfolioTokens: PortfolioToken[] = [];

        // 2. Fetch Live Solana Balances
        if (solanaConnected && solanaPublicKey) {
            const solPrice = marketData['SOL']?.current_price || 0;
            let solBalance = 0;

            try {
                const lamports = await solanaConnection.getBalance(solanaPublicKey);
                solBalance = lamports / 1e9; // Convert lamports to SOL
            } catch (e) {
                console.error("Failed to fetch Solana balance", e);
            }

            if (solBalance >= 0) {
                portfolioTokens.push({
                    symbol: 'SOL',
                    name: 'Solana',
                    chain: 'Solana',
                    icon: '/logos/solana.svg',
                    balance: solBalance,
                    price: solPrice,
                    valueUsd: solBalance * solPrice,
                    change24h: marketData['SOL']?.price_change_percentage_24h_in_currency || 0
                });
            }

            // Fetch SPL Tokens (USDC, USDT)
            try {
                const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
                const parsedTokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(solanaPublicKey, {
                    programId: TOKEN_PROGRAM_ID
                });

                let solUsdcBalance = 0;
                let solUsdtBalance = 0;
                let wsolBalance = 0;

                parsedTokenAccounts.value.forEach((accountInfo) => {
                    const parsedInfo = accountInfo.account.data.parsed.info;
                    const mint = parsedInfo.mint;
                    const uiAmount = parsedInfo.tokenAmount.uiAmount || 0;

                    // WSOL (Native Mint)
                    if (mint === 'So11111111111111111111111111111111111111112') {
                        wsolBalance += uiAmount;
                    }
                    // USDC (Devnet & Mainnet)
                    if (mint === '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' || mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
                        solUsdcBalance += uiAmount;
                    }
                    // USDT (Mainnet)
                    if (mint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
                        solUsdtBalance += uiAmount;
                    }
                });

                if (wsolBalance > 0) {
                    portfolioTokens.push({
                        symbol: 'WSOL',
                        name: 'Wrapped SOL',
                        chain: 'Solana',
                        icon: '/logos/solana.svg',
                        balance: wsolBalance,
                        price: solPrice,
                        valueUsd: wsolBalance * solPrice,
                        change24h: marketData['SOL']?.price_change_percentage_24h_in_currency || 0
                    });
                }

                if (solUsdcBalance > 0) {
                    const usdcPrice = marketData['USDC']?.current_price || 1;
                    portfolioTokens.push({
                        symbol: 'USDC',
                        name: 'USD Coin',
                        chain: 'Solana',
                        icon: '/logos/usd-coin-usdc-logo.svg',
                        balance: solUsdcBalance,
                        price: usdcPrice,
                        valueUsd: solUsdcBalance * usdcPrice,
                        change24h: marketData['USDC']?.price_change_percentage_24h_in_currency || 0
                    });
                }

                if (solUsdtBalance > 0) {
                    const usdtPrice = marketData['USDT']?.current_price || 1;
                    portfolioTokens.push({
                        symbol: 'USDT',
                        name: 'Tether',
                        chain: 'Solana',
                        icon: '/logos/usd-coin-usdc-logo.svg',
                        balance: solUsdtBalance,
                        price: usdtPrice,
                        valueUsd: solUsdtBalance * usdtPrice,
                        change24h: marketData['USDT']?.price_change_percentage_24h_in_currency || 0
                    });
                }
            } catch (e) {
                console.error("Failed to fetch Solana SPL balances", e);
            }
        }

        // 3. Fetch Live Movement (Aptos) Balances
        if (aptosConnected && aptosAccount && aptosNetwork) {
            const movePrice = marketData['MOVE']?.current_price || 0;
            let moveBalance = 0;

            try {
                // Fetch native CoinStore balance using Movement REST API
                const addressStr = aptosAccount.address.toString();
                const resourceType = encodeURIComponent("0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
                const response = await fetch(`${aptosNetwork.url}/accounts/${addressStr}/resource/${resourceType}`);
                if (response.ok) {
                    const resource = await response.json();
                    moveBalance = Number(resource.data.coin.value) / 1e8; // Assuming 8 decimals
                }
            } catch (e) {
                console.error("Failed to fetch Movement balance", e);
            }

            if (moveBalance >= 0) {
                portfolioTokens.push({
                    symbol: 'MOVE',
                    name: 'Movement',
                    chain: 'Movement',
                    icon: '/logos/movement.svg',
                    balance: moveBalance,
                    price: movePrice,
                    valueUsd: moveBalance * movePrice,
                    change24h: marketData['MOVE']?.price_change_percentage_24h_in_currency || 0
                });
            }
        }

        // 4. Fetch Live Bitcoin Cash Balances
        if (bchConnected) {
            const bchPrice = marketData['BCH']?.current_price || 0;
            const bchBalance = bchSatBalance / 1e8; // Context provides satoshis

            if (bchBalance >= 0) {
                portfolioTokens.push({
                    symbol: 'BCH',
                    name: 'Bitcoin Cash',
                    chain: 'Bitcoin Cash',
                    icon: '/logos/bitcoin-cash-bch-logo.svg',
                    balance: bchBalance,
                    price: bchPrice,
                    valueUsd: bchBalance * bchPrice,
                    change24h: marketData['BCH']?.price_change_percentage_24h_in_currency || 0
                });
            }
        }

        // 5. Default Demo state (Only if no wallets are connected, to show the UI)
        if (!aptosConnected && !solanaConnected && !bchConnected) {
            portfolioTokens.push({
                symbol: 'ETH',
                name: 'Ethereum',
                chain: 'Ethereum',
                icon: '/logos/ethereum-eth-logo.svg',
                balance: 0.00,
                price: 2800,
                valueUsd: 0.00,
                change24h: 0
            });
        }

        // 6. Calculate Totals
        const total = portfolioTokens.reduce((sum, t) => sum + t.valueUsd, 0);

        // Sort by value descending
        portfolioTokens.sort((a, b) => b.valueUsd - a.valueUsd);

        setTokens(portfolioTokens);
        setTotalValue(total);
        setChartData(generateChartData(total));
        setLoading(false);
    }, [aptosConnected, solanaConnected, bchConnected, solanaConnection, solanaPublicKey, bchSatBalance, aptosAccount, aptosNetwork]);

    useEffect(() => {
        let isMounted = true;
        fetchPortfolio();
        return () => { isMounted = false; };
    }, [fetchPortfolio]);

    return {
        tokens,
        totalValue,
        chartData,
        loading,
        refetch: fetchPortfolio,
        isConnected: aptosConnected || solanaConnected || bchConnected
    };
}
