
import {
    Aptos,
    AptosConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    InputViewFunctionData
} from "@aptos-labs/ts-sdk";

const SETUP = {
    // bardock params
    NODE_URL: "https://testnet.movementnetwork.xyz/v1",
    FAUCET_URL: "https://faucet.testnet.movementnetwork.xyz",
    // Contract addresses
    INTENT_SWAP_ADDR: "0xbd128d4f1dbb87783658bed4a4046f3811015952110f321863c34f161eb07611",
    COIN_TYPE: "0x1::aptos_coin::AptosCoin",
    AMOUNT: 1000000 // 0.01 MOVE
};

async function main() {
    console.log("🚀 Starting Debug Script for Escrow Deposit...");

    // 1. Setup Client
    const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: SETUP.NODE_URL,
        faucet: SETUP.FAUCET_URL
    });
    const aptos = new Aptos(config);

    // 2. Create & Fund Account
    const account = Account.generate();
    console.log(`👤 Generated Account: ${account.accountAddress.toString()}`);

    try {
        console.log("💰 Funding account from faucet...");
        await aptos.fundAccount({
            accountAddress: account.accountAddress,
            amount: 100_000_000 // 1 MOVE
        });
        console.log("✅ Component funded!");
    } catch (e) {
        console.error("❌ Faucet failed. You might need to manually fund this address:", account.accountAddress.toString());
        console.error(e);
        // If faucet fails, we might stop here or try to continue if user funds it
        // For now, let's try to verify if balance exists
    }

    // Verify Balance
    const resources = await aptos.getAccountResources({ accountAddress: account.accountAddress });
    const coinStore = resources.find(r => r.type === `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
    if (coinStore) {
        const val = (coinStore.data as any).coin.value;
        console.log(`💰 Balance: ${val} Octas`);
    } else {
        console.log("⚠️ No CoinStore found (balance 0 or account not initialized)");
    }

    // 3. Prepare Transaction
    // function: 0xbd12...::escrow::deposit
    // typeArgs: [0x1::aptos_coin::AptosCoin]
    // args: [amount]

    console.log("\n🛠 preparing transaction...");
    const payload = {
        function: `${SETUP.INTENT_SWAP_ADDR}::escrow::deposit`,
        typeArguments: [SETUP.COIN_TYPE],
        functionArguments: [SETUP.AMOUNT] // simple transaction
    };

    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    try {
        // 4. Simulate Transaction
        console.log("\n🧪 Simulating transaction...");
        // Fetch ledger info to check for clock skew
        const ledgerInfo = await aptos.getLedgerInfo();
        const chainTime = Math.floor(parseInt(ledgerInfo.ledger_timestamp) / 1000000); // microseconds to seconds
        const localTime = Math.floor(Date.now() / 1000);

        console.log(`⏱️ Time Sync Check:`);
        console.log(`   Chain Time: ${chainTime} (${new Date(chainTime * 1000).toISOString()})`);
        console.log(`   Local Time: ${localTime} (${new Date(localTime * 1000).toISOString()})`);
        console.log(`   Diff: ${localTime - chainTime}s`);

        const expireTimestamp = chainTime + 600; // Use chain time + 10 mins

        const rawSimpleTx = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${SETUP.INTENT_SWAP_ADDR}::escrow::deposit`,
                typeArguments: [SETUP.COIN_TYPE],
                functionArguments: [SETUP.AMOUNT]  // SDK handles serialization for simple tx
            },
            options: {
                expireTimestamp: expireTimestamp
            }
        });

        const [userTxResponse] = await aptos.transaction.simulate.simple({
            signerPublicKey: account.publicKey,
            transaction: rawSimpleTx
        });

        if (!userTxResponse.success) {
            console.error("❌ Simulation Failed!");
            console.error("Link:", `https://explorer.movementlabs.xyz/txn/${userTxResponse.hash}?network=bardock+testnet`);
            console.error("Status:", userTxResponse.vm_status);
            console.error("Reason:", userTxResponse.vm_status);
        } else {
            console.log("✅ Simulation Successful!");
            console.log("Gas Used:", userTxResponse.gas_used);
            console.log("Status:", userTxResponse.vm_status);
        }

        // 5. Submit Transaction (if simulation worked or just checking error)
        console.log("\n🚀 Submitting transaction...");
        const tx = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${SETUP.INTENT_SWAP_ADDR}::escrow::deposit`,
                typeArguments: [SETUP.COIN_TYPE],
                functionArguments: [SETUP.AMOUNT]
            }
        });

        const committedTx = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: tx
        });

        console.log("⏳ Transaction submitted. Hash:", committedTx.hash);
        console.log(`🔍 View: https://explorer.movementlabs.xyz/txn/${committedTx.hash}?network=bardock+testnet`);

        const receipt = await aptos.waitForTransaction({ transactionHash: committedTx.hash });
        console.log("✅ Transaction Confirmed!");
        console.log("Status:", receipt.success ? "Success" : "Failed");

    } catch (e: any) {
        console.error("❌ Transaction Failed:");
        if (e.message) console.error(e.message);
        if (e.apiMessage) console.error(e.apiMessage);
        if (e.vm_status) console.error("VM Status:", e.vm_status);
        console.error(e);
    }
}

main();
