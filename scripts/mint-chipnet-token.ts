import { TestNetWallet } from 'mainnet-js';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log("=== Chipnet CashToken Minter ===\n");

    rl.question("Enter your funded Chipnet WIF (or leave blank to generate a new wallet): ", async (wifInput) => {
        try {
            let wallet;
            if (wifInput.trim().length > 0) {
                wallet = await TestNetWallet.fromWIF(wifInput.trim());
                console.log(`\nWallet loaded: ${wallet.cashaddr}`);
            } else {
                wallet = await TestNetWallet.newRandom();
                console.log(`\nCreated NEW wallet: ${wallet.cashaddr}`);
                console.log(`Save this WIF: ${wallet.privateKeyWif}`);
                console.log(`\n⚠️  Please send some Chipnet BCH (e.g. 0.01 tBCH) to ${wallet.cashaddr}`);
                console.log(`You can get free tBCH from a faucet like https://tbch.faucet.cash/`);

                console.log("Waiting for deposit...");
                await wallet.waitForBalance(0.0001, 'bch');
                console.log("Deposit received!");
            }

            const balance = await wallet.getBalance('bch');
            console.log(`Current Balance: ${balance} BCH`);

            if (balance < 0.00001) {
                console.log("Error: Insufficient balance to mint a token.");
                process.exit(1);
            }

            rl.question("\nHow many tokens do you want to mint? (e.g. 1000000): ", async (amountStr) => {
                const amount = parseInt(amountStr.trim()) || 1000000;

                console.log(`\nMinting ${amount} tokens... Please wait.`);
                const response = await wallet.tokenMint({
                    amount: amount
                });

                console.log("\n✅ Token minted successfully!");
                console.log("Transaction ID:", response.txId);
                console.log("Token ID:", response.tokenId);
                console.log("Token Balance:", response.balance.tokenAmount);
                console.log(`\nYou can view this token on the explorer: https://chipnet.imaginary.cash/tx/${response.txId}`);

                console.log("\n=== Next Steps for Cauldron DEX ===");
                console.log("1. Go to https://chipnet.cauldron.quest/pool");
                console.log("2. Connect your wallet (use a browser extension or WalletConnect that holds this WIF).");
                console.log(`3. Select BCH for the first token, and paste your Token ID (${response.tokenId}) for the second token.`);
                console.log("4. Set your initial price and provide liquidity!");

                process.exit(0);
            });
        } catch (e) {
            console.error("\nError:", e);
            process.exit(1);
        }
    });
}

main();
