import { createContext, useContext, useState, ReactNode } from 'react';
import { useWallet as useAptosWallet } from '@/context/wallet-provider';
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { signAndSubmitTransaction } from "@/lib/wallet/adapter";
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { CROSS_CHAIN_RELAYER_URL, SOLANA_RPC_URL } from '../lib/config';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/lib/idl/intent_swap.json';
import { toast } from 'sonner';

interface CrossChainContextType {
    isLoading: boolean;
    relayerUrl: string;
    createMovementToSolanaSwap: (
        sellAmount: string,
        buyAmount: string, // SOL amount to receive
        userSolanaAddress: string
    ) => Promise<void>;
    createSolanaToMovementSwap: (
        sellAmount: string, // SOL amount to send
        buyAmount: string,  // MOVE amount to receive (octas)
        userMovementAddress: string
    ) => Promise<void>;
}

const CrossChainContext = createContext<CrossChainContextType | undefined>(undefined);

export function CrossChainProvider({ children }: { children: ReactNode }) {
    const aptos = useAptosWallet();
    const solana = useSolanaWallet();
    const { connection: solanaConnection } = useConnection();
    const [isLoading, setIsLoading] = useState(false);

    // Helper to generate hashlock
    const generateHashlock = async () => {
        const secretBytes = new Uint8Array(32);
        crypto.getRandomValues(secretBytes);
        const secretHex = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

        const hashlockBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
        const hashlockHex = "0x" + Array.from(new Uint8Array(hashlockBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        return { secretHex, hashlockHex };
    };

    const savePendingSwap = (hashlockHex: string, data: any) => {
        const stored = localStorage.getItem('cross_chain_pending');
        const pending = stored ? JSON.parse(stored) : {};
        pending[hashlockHex] = data;
        localStorage.setItem('cross_chain_pending', JSON.stringify(pending));
    };

    const createMovementToSolanaSwap = async (sellAmount: string, buyAmount: string, userSolanaAddress: string) => {
        if (!aptos.account || !aptos.wallet) throw new Error("Movement wallet not connected");
        setIsLoading(true);

        try {
            const { secretHex, hashlockHex } = await generateHashlock();

            // Store pending state
            const pendingSwap = {
                secret: secretHex,
                hashlock: hashlockHex,
                direction: 'MOV_TO_SOL',
                amount: sellAmount,
                timestamp: Date.now(),
                status: 'PENDING_LOCK'
            };
            savePendingSwap(hashlockHex, pendingSwap);

            const amountOctas = Math.floor(parseFloat(sellAmount) * 1e8);
            const MOVEMENT_HTLC_ADDR = "0x485ca1c12b5dfa01c282b9c7ef09fdfebbf877ed729bf999ce61a8ec5c5e69bd";

            // 1. Fetch Relayer Address from /health
            let relayerAddress = "";
            try {
                const healthRes = await axios.get(`${CROSS_CHAIN_RELAYER_URL}/health`);
                relayerAddress = healthRes.data.movement.address;
            } catch (e) {
                console.error("Relayer health check failed", e);
                throw new Error("Relayer unavailable");
            }

            // 2. Query stats to predict Escrow ID (Optimistic)
            // In a real robust app, we might parse the event from the transaction receipt
            let sourceEscrowId = 0;
            try {
                const aptosClient = new Aptos(new AptosConfig({
                    network: Network.CUSTOM,
                    fullnode: 'https://testnet.movementnetwork.xyz/v1'
                }));
                const registryStats = await aptosClient.view({
                    payload: {
                        function: `${MOVEMENT_HTLC_ADDR}::htlc_escrow::get_registry_stats`,
                        typeArguments: ["0x1::aptos_coin::AptosCoin"],
                        functionArguments: [MOVEMENT_HTLC_ADDR]
                    }
                });
                sourceEscrowId = parseInt(registryStats[0] as string);
                console.log("Predicted Escrow ID:", sourceEscrowId);
            } catch (e) {
                console.warn("Could not predict escrow ID", e);
            }

            // 3. Create Escrow on Movement
            const response = await signAndSubmitTransaction(aptos.wallet, {
                function: `${MOVEMENT_HTLC_ADDR}::htlc_escrow::create_escrow`,
                typeArguments: ["0x1::aptos_coin::AptosCoin"],
                functionArguments: [
                    MOVEMENT_HTLC_ADDR,
                    hashlockHex,
                    relayerAddress,
                    amountOctas.toString(),
                    3600 // timelock 1hr
                ]
            });
            console.log("Movement Lock Tx:", response);

            // 4. Sign Intent for Solana Relayer (to authorize fill)
            const now = Math.floor(Date.now() / 1000);
            const intent = {
                maker: new PublicKey(userSolanaAddress),
                sellToken: new PublicKey("11111111111111111111111111111111"), // Placeholder logic from existing code
                buyToken: new PublicKey("11111111111111111111111111111111"),
                sellAmount: new anchor.BN((parseFloat(buyAmount) * 1e9).toString()),
                startAmount: new anchor.BN((parseFloat(buyAmount) * 1e9).toString()),
                endAmount: new anchor.BN((parseFloat(buyAmount) * 1e9).toString()),
                startTime: new anchor.BN(now - 60),
                endTime: new anchor.BN(now + 3600),
                nonce: new anchor.BN(Date.now())
            };

            // Convert to bytes for signing (using Anchor dummy provider logic)
            const dummyProvider = new anchor.AnchorProvider(new Connection(SOLANA_RPC_URL), {} as any, {});
            const program = new anchor.Program(idl as any, dummyProvider);

            const txBuilder = program.methods.fill({
                maker: intent.maker,
                sellToken: intent.sellToken,
                buyToken: intent.buyToken,
                sellAmount: intent.sellAmount,
                startAmount: intent.startAmount,
                endAmount: intent.endAmount,
                startTime: intent.startTime,
                endTime: intent.endTime,
                nonce: intent.nonce
            }, []) as any;

            const ix = await txBuilder.accounts({
                taker: new PublicKey("11111111111111111111111111111111"),
                maker: intent.maker,
                takerTokenAccount: intent.maker,
                makerTokenAccount: intent.maker,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                verifyCtx: { instructions: new PublicKey("Sysvar1nstructions1111111111111111111111111") }
            }).instruction();

            const msg = ix.data.slice(8, 8 + 144); // 144 bytes of intent data
            const intentHex = Buffer.from(msg).toString('hex');
            const messageToSign = `Intent Protocol Swap\n\nIntent (hex): ${intentHex}`;
            const messageBytes = new TextEncoder().encode(messageToSign);

            if (!solana.signMessage) throw new Error("Solana wallet does not support signMessage");

            const signatureBytes = await solana.signMessage(messageBytes);
            const signatureHex = "0x" + Buffer.from(signatureBytes).toString('hex');

            // 5. Submit to Relayer
            const intentJson = {
                maker: intent.maker.toBase58(),
                sell_token: intent.sellToken.toBase58(),
                buy_token: intent.buyToken.toBase58(),
                sell_amount: intent.sellAmount.toString(),
                start_amount: intent.startAmount.toString(),
                end_amount: intent.endAmount.toString(),
                start_time: intent.startTime.toString(),
                end_time: intent.endTime.toString(),
                nonce: intent.nonce.toString()
            };

            await axios.post(`${CROSS_CHAIN_RELAYER_URL}/swap/movement-to-solana`, {
                makerAddress: aptos.account.address.toString(),
                recipientAddress: userSolanaAddress,
                sellAmount: amountOctas.toString(),
                buyAmount: (parseFloat(buyAmount) * 1e9).toString(),
                hashlock: hashlockHex,
                sourceEscrowId: sourceEscrowId,
                signature: signatureHex,
                intent: intentJson
            });

            // Update storage
            pendingSwap.status = 'LOCKED_ON_SOURCE';
            (pendingSwap as any).sourceEscrowId = sourceEscrowId;
            savePendingSwap(hashlockHex, pendingSwap);

            toast.success("Cross-Chain Swap Initiated!");

        } catch (e: any) {
            console.error("Swap Error:", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const createSolanaToMovementSwap = async (sellAmount: string, buyAmount: string, userMovementAddress: string) => {
        // Logic for SOL -> MOV
        if (!solana.publicKey) throw new Error("Solana wallet not connected");
        setIsLoading(true);

        try {
            const { secretHex, hashlockHex } = await generateHashlock();

            // Store pending
            const pendingSwap = {
                secret: secretHex,
                hashlock: hashlockHex,
                direction: 'SOL_TO_MOV',
                amount: sellAmount,
                timestamp: Date.now(),
                status: 'PENDING_LOCK'
            };
            savePendingSwap(hashlockHex, pendingSwap);

            const amountLamports = Math.floor(parseFloat(sellAmount) * LAMPORTS_PER_SOL);

            // 1. Get Relayer SOL address
            // Ideally fetch from relayer health, but hardcoded fallback for now in case of issues, or use what was in existing code
            const RELAYER_SOL_ADDR = new PublicKey("Crgx1n8HxZe8fq3d3vYhYrLDuKJ3pJZN4gfeSKuNarub");

            // 2. Transfer SOL (Lock)
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: solana.publicKey,
                    toPubkey: RELAYER_SOL_ADDR,
                    lamports: amountLamports,
                })
            );

            const { blockhash, lastValidBlockHeight } = await solanaConnection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = solana.publicKey;

            if (!solana.signTransaction) throw new Error("Wallet does not support signTransaction");

            const signedTransaction = await solana.signTransaction(transaction);
            const signature = await solanaConnection.sendRawTransaction(signedTransaction.serialize());

            console.log("Solana Lock Tx:", signature);
            await solanaConnection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

            // 3. Call Relayer
            await axios.post(`${CROSS_CHAIN_RELAYER_URL}/swap/solana-to-movement`, {
                makerAddress: solana.publicKey.toString(),
                recipientAddress: userMovementAddress,
                sellAmount: amountLamports.toString(),
                buyAmount: (parseFloat(buyAmount) * 1e8).toString(), // MOVE octas
                hashlock: hashlockHex,
                sourceEscrowPda: signature // Use tx signature as ID
            });

            // Update storage
            pendingSwap.status = 'LOCKED_ON_SOURCE';
            savePendingSwap(hashlockHex, pendingSwap);

            toast.success("Cross-Chain Swap Initiated!");

        } catch (e: any) {
            console.error("Swap Error:", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CrossChainContext.Provider value={{
            isLoading,
            relayerUrl: CROSS_CHAIN_RELAYER_URL,
            createMovementToSolanaSwap,
            createSolanaToMovementSwap
        }}>
            {children}
        </CrossChainContext.Provider>
    );
}

export const useCrossChain = () => {
    const context = useContext(CrossChainContext);
    if (context === undefined) {
        throw new Error('useCrossChain must be used within a CrossChainProvider');
    }
    return context;
};
