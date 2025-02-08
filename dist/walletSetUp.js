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
Object.defineProperty(exports, "__esModule", { value: true });
const coinbase_sdk_1 = require("@coinbase/coinbase-sdk");
const apiKeyName = "organizations/4c9bff9e-51a7-4040-8a74-c1557259db6d/apiKeys/3a2486b4-8c59-47ec-93dd-e1dd62da116b";
const apiKeyPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIMxTzKjJrRMrDf28Lq0g0EhdMRfq3/f0uNBYRDtuDuryoAoGCCqGSM49
AwEHoUQDQgAEZgm5Sg4BBg9m5dvdPqSO3N8ziEoZGFaBB0wQmUdDOdvw+qbqJSIF
fVEtNJYEZVuA2lmKkhfXgWjtwA54dHqdXQ==
-----END EC PRIVATE KEY-----`;
coinbase_sdk_1.Coinbase.configure({
    apiKeyName: apiKeyName,
    privateKey: apiKeyPrivateKey
});
// ✅ Wrap in an async function
function setupWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const wallet = yield coinbase_sdk_1.Wallet.create();
            const address = yield wallet.getDefaultAddress();
            console.log("Wallet Address:", address);
            let data = wallet.export();
            let filePath = 'my_seed.json';
            // Set encrypt to true to encrypt the wallet seed with your CDP secret API key.
            wallet.saveSeed(filePath, true);
            console.log(`Seed for wallet ${wallet.getId()} successfully saved to ${filePath}.`);
            console.log("Wallet Data:", data);
        }
        catch (error) {
            console.error("Error creating wallet:", error);
        }
    });
}
// ✅ Call the function
setupWallet();
