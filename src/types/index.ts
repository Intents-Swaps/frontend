// Token Types
export interface Token {
    symbol: string;
    name: string;
    icon: string;
    decimals: number;
    type: string;
    chain?: 'movement' | 'solana' | 'bch';  // Which chain this token lives on
    categoryId?: string;  // BCH CashToken category ID (hex)
    address?: string;     // Token mint or smart contract address
    priceUsd?: number;    // Cauldron price in USD (for CashTokens)
    priceSats?: number;   // Cauldron price in sats (for CashTokens)
}

// Oracle Types
export interface PriceData {
    id: string;
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
}

// Swap Types
export interface SwapParams {
    sellToken: string; // e.g. "0x1::aptos_coin::AptosCoin"
    buyToken: string;
    sellAmount: number;
    buyAmount: number; // Minimum receive
    slippage: number; // %
    sellDecimals: number; // Token decimals for sell token
    buyDecimals: number; // Token decimals for buy token
    duration?: number; // Optional duration in seconds
    isLimitOrder?: boolean; // If true, treat as fixed price limit order
}

// BCH Swap Types
export type BCHSwapType = 'same-chain' | 'bch-to-sol' | 'sol-to-bch' | 'bch-to-mov' | 'mov-to-bch';
export type BCHOrderType = 'market' | 'limit';

export interface BCHSwapParams {
    sellToken: Token;
    buyToken: Token;
    sellAmount: number;
    buyAmount: number;
    swapType: BCHSwapType;
    orderType: BCHOrderType;
    duration?: number;     // Dutch auction duration (seconds)
    expiryTime?: number;   // Limit order expiry (unix timestamp)
}

export interface BCHOrder {
    id: string;
    swapType: BCHSwapType;
    orderType: BCHOrderType;
    sellToken: Token;
    buyToken: Token;
    sellAmount: number;
    buyAmount: number;
    status: 'pending' | 'claimable' | 'claimed' | 'filled' | 'cancelled' | 'expired';
    contractAddress?: string;  // For same-chain covenant swaps
    tokenAddress?: string;     // Token-aware address for funding
    txid?: string;
    fillTxid?: string;         // TXID of the fill transaction
    explorerUrl?: string;      // Link to block explorer (source chain)
    destExplorerUrl?: string;  // Link to block explorer (destination chain)
    intentId?: string;         // For cross-chain relayer
    createdAt: number;
    claimData?: {
        hashlock?: string;
        secret?: string;
        solanaEscrowPda?: string;
        bchContractAddress?: string;
        movementEscrowId?: string;
        destFillTx?: string;
        destTimelock?: number;
        direction?: string;        // e.g. 'BCH_TO_SOL', 'SOL_TO_BCH', etc.
        solMaker?: string;
    };
}
