// walletService.js
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { Wallet as EthersWallet} from "ethers";
import { Mnemonic , getBytes} from "ethers";
import path from 'path';
import fs from 'fs/promises';

// Initialize Coinbase SDK
const initializeCoinbase = () => {
  const apiKeyName = "organizations/4c9bff9e-51a7-4040-8a74-c1557259db6d/apiKeys/3a2486b4-8c59-47ec-93dd-e1dd62da116b";
  const apiKeyPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIMxTzKjJrRMrDf28Lq0g0EhdMRfq3/f0uNBYRDtuDuryoAoGCCqGSM49
AwEHoUQDQgAEZgm5Sg4BBg9m5dvdPqSO3N8ziEoZGFaBB0wQmUdDOdvw+qbqJSIF
fVEtNJYEZVuA2lmKkhfXgWjtwA54dHqdXQ==
-----END EC PRIVATE KEY-----`;

  Coinbase.configure({
    apiKeyName: apiKeyName,
    privateKey: apiKeyPrivateKey
  });
};

// Create wallet function
const createWallet = async () => {
  try {
    // Initialize SDK first
    initializeCoinbase();

    // Create new wallet
    const wallet = await Wallet.create('eth-sepolia');
    const address = await wallet.getDefaultAddress();
    
    // Export wallet data
    const data = wallet.export();
    
    // Save encrypted wallet seed
    //create wallet seed file
    
    const filePath = path.join(process.cwd(), 'wallets', `${wallet.getId()}_seed.json`);
    await wallet.saveSeedToFile(filePath, false);

    return {
      success: true,
      data: {
        walletId: wallet.getId(),
        address: address.toString(),
        seedPath: filePath,
        walletData: data
      }
    };

  } catch (error) {
    console.error("Error creating wallet:", error);
    return {
      success: false,
      error: error.message
    };
  }
};


const retrieveWallet = async (walletId, networkId = "eth-sepolia")  => {
  try {
    await initializeCoinbase(); // Ensure SDK is initialized

    const seedPath = path.join(process.cwd(), 'wallets', `${walletId}_seed.json`);

    // Check if the seed file exists
    try {
      await fs.access(seedPath);
    } catch {
      throw new Error("Wallet seed file not found");
    }

    // Read the wallet seed data
    const seedData = await fs.readFile(seedPath, 'utf-8');
    const parsedData = JSON.parse(seedData);

    if (!parsedData[walletId] || !parsedData[walletId].seed) {
      throw new Error("Invalid wallet data format: Missing walletId or seed");
    }

    console.log("🔍 Wallet seed data:", parsedData[walletId]);

    const seed = parsedData[walletId].seed;

    // Import the wallet using seed
    const wallet = await Wallet.import({ walletId, seed }, networkId);
    const address = await wallet.getDefaultAddress();

    console.log("✅ Wallet loaded successfully:", wallet.getId(), address.toString());

    let privateKey = address.export().privateKey;

    return {
      privateKey,
    };

  } catch (error) {
    console.error("❌ Error retrieving wallet:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};


export default retrieveWallet;