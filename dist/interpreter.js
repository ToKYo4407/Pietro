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
exports.parseTransaction = void 0;
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load API key from .env file
const openai = new openai_1.OpenAI({
    apiKey: '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', // Use environment variable for security
});
function parseTransaction(input) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const aiResponse = yield openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Convert the input into structured JSON for Base Sepolia transactions.
        Ensure:
        - Use contract addresses instead of token symbols.
        - Amounts should be in the correct decimal format (ETH: 18, USDC: 6).
        - Recognize swap, transfer, and balance check intents.

        Examples:
        - "Swap 1 ETH (0xETHContract) for 5 USDC (0xUSDCContract)"
          → {"action": "swap", "tokenIn": "0xETHContract", "tokenOut": "0xUSDCContract", "amountIn": "1000000000000000000", "amountOutMin": "5000000", "toName": "USDC"}

        - "Check balance of 0xUSDCContract in my wallet 0xMyWallet"
          → {"action": "balance", "token": "0xUSDCContract", "wallet": "0xMyWallet"}

        - "Send 0.5 ETH (0xETHContract) to 0xABC123"
          → {"action": "transfer", "token": "0xETHContract", "amount": "500000000000000000", "recipient": "0xABC123"}
        
        - "Check ETH balance in my wallet "
          → {"action": "ethbalance""}

        - "Monitor liquidity of 0xUSDCContract"
          → {"action": "monitor", "token": "0xUSDCContract"}  
        `,
                },
                {
                    role: "user",
                    content: input,
                },
            ],
            max_tokens: 200,
        });
        const jsonString = (_a = aiResponse.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim();
        return JSON.parse((jsonString === null || jsonString === void 0 ? void 0 : jsonString.toString()) || "{}");
    });
}
exports.parseTransaction = parseTransaction;
exports.default = parseTransaction;
