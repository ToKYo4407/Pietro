"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveWallet = exports.createWallet = void 0;
// walletService.ts
const coinbase_sdk_1 = require("@coinbase/coinbase-sdk");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// 🔹 Initialize Coinbase SDK
const initializeCoinbase = () => {
    const apiKeyName = "organizations/4c9bff9e-51a7-4040-8a74-c1557259db6d/apiKeys/3a2486b4-8c59-47ec-93dd-e1dd62da116b";
    const apiKeyPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIMxTzKjJrRMrDf28Lq0g0EhdMRfq3/f0uNBYRDtuDuryoAoGCCqGSM49
AwEHoUQDQgAEZgm5Sg4BBg9m5dvdPqSO3N8ziEoZGFaBB0wQmUdDOdvw+qbqJSIF
fVEtNJYEZVuA2lmKkhfXgWjtwA54dHqdXQ==
-----END EC PRIVATE KEY-----`;
    coinbase_sdk_1.Coinbase.configure({
        apiKeyName,
        privateKey: apiKeyPrivateKey,
    });
};
// 🔹 Create a new wallet
const createWallet = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        initializeCoinbase(); // Ensure Coinbase SDK is configured
        const wallet = yield coinbase_sdk_1.Wallet.create();
        const address = yield wallet.getDefaultAddress();
        const walletData = wallet.export();
        // Generate wallet seed file path
        const filePath = path_1.default.join(process.cwd(), "wallets", `${wallet.getId()}_seed.json`);
        // Save wallet seed data
        yield wallet.saveSeedToFile(filePath, false);
        return {
            success: true,
            data: {
                walletId: wallet.getId() || "",
                address: address.toString(),
                seedPath: filePath,
                walletData: JSON.stringify(walletData),
            },
        };
    }
    catch (error) {
        console.error("❌ Error creating wallet:", error);
        return { success: false, error: error.message };
    }
});
exports.createWallet = createWallet;
// 🔹 Retrieve a wallet using its ID
const retrieveWallet = (walletId, networkId = "eth-sepolia") => __awaiter(void 0, void 0, void 0, function* () {
    try {
        initializeCoinbase(); // Ensure Coinbase SDK is initialized
        const seedPath = path_1.default.join(process.cwd(), "wallets", `${walletId}_seed.json`);
        // Ensure the wallet seed file exists
        try {
            yield promises_1.default.access(seedPath);
        }
        catch (_a) {
            throw new Error("Wallet seed file not found");
        }
        // Read and parse wallet seed data
        const seedData = yield promises_1.default.readFile(seedPath, "utf-8");
        const parsedData = JSON.parse(seedData);
        if (!parsedData[walletId] || !parsedData[walletId].seed) {
            throw new Error("Invalid wallet data format: Missing walletId or seed");
        }
        console.log("🔍 Wallet seed data:", parsedData[walletId]);
        const seed = parsedData[walletId].seed;
        // Import the wallet using seed
        const wallet = yield coinbase_sdk_1.Wallet.import({ walletId, seed }, networkId);
        const address = yield wallet.getDefaultAddress();
        console.log("✅ Wallet loaded successfully:", wallet.getId(), address.toString());
        const privateKey = address.export();
        return { success: true, privateKey };
    }
    catch (error) {
        console.error("❌ Error retrieving wallet:", error.message);
        return { success: false, error: error.message };
    }
});
exports.retrieveWallet = retrieveWallet;
