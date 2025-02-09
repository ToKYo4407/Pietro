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
exports.handleTransaction = exports.checkEthBalance = exports.transferTokens = exports.checkBalance = exports.swapTokens = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const interpreter_1 = __importDefault(require("./interpreter"));
const { retrieveWallet } = require("./walletSetUp");
const hyperbolic_1 = __importDefault(require("./hyperbolic"));
const console_1 = require("console");
const readline_1 = __importDefault(require("readline"));
const SuddenLiquidityRemoval_1 = __importDefault(require("./SuddenLiquidityRemoval"));
dotenv_1.default.config(); // Load environment variables
const BASE_SEPOLIA_RPC = "https://base-sepolia.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw";
const UNISWAP_V2_ROUTER = "0x6977e417aEA71dd1554298030c85D1AD8C37374B"; // Uniswap V2 Router on Base Sepolia
const provider = new ethers_1.ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
// ABI Definitions
const ROUTER_ABI = [
    "function swap() external payable"
];
const ERC20_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];
// Swap Tokens
function swapTokens(tokenIn, tokenOut, amountIn, minAmountOut, tokenOutName) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = yield retrieveWallet("97d8b144-fbe6-4fdf-9664-1836ae5698c5");
        console.log(privateKey);
        const wallet = new ethers_1.ethers.Wallet(privateKey.privateKey, provider);
        const userAddress = wallet.address;
        //check for swap safety 
        const analyzer = new hyperbolic_1.default('05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c', 'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI', 'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris');
        yield analyzer.analyzeTokenRisk(tokenOut, userAddress, '2023-01-01', '2022-2-8', 'base-mainnet', tokenOutName)
            .then(result => {
            console.log('Complete result:', result);
            if (result.riskLevel === 'HIGH') {
                console.log('High Risk Token');
                console.error('❌ Swap aborted! High risk token detected.');
            }
            if (result.riskLevel === 'MEDIUM') {
                console.log('Medium Risk Token');
                (0, console_1.warn)('⚠️ Medium risk token detected. Proceed with caution. Press ctrl + c to cancel.');
            }
            if (result.riskLevel === 'LOW') {
                console.log('Low Risk Token');
                console.log('✅ Token is safe to swap.');
            }
        })
            .catch(error => console.error(error));
        const ERC20Contract = new ethers_1.ethers.Contract(tokenIn, ERC20_ABI, wallet);
        // const approval = await ERC20Contract.approve(UNISWAP_V2_ROUTER, amountIn);
        const router = new ethers_1.ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, wallet);
        const tx = yield router.swap({ value: amountIn });
        console.log("⏳ Swapping tokens...");
        yield tx.wait();
        console.log(`✅ Swap successful! Tx Hash: ${tx.hash}`);
    });
}
exports.swapTokens = swapTokens;
// Check Token Balance
function checkBalance(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = yield retrieveWallet("97d8b144-fbe6-4fdf-9664-1836ae5698c5");
        const wallet = new ethers_1.ethers.Wallet(privateKey.privateKey, provider);
        const userAddress = wallet.address;
        const token = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield token.balanceOf(yield wallet.getAddress());
        console.log(`💰 Balance: ${ethers_1.ethers.formatUnits(balance, 18)} tokens`);
        return balance;
    });
}
exports.checkBalance = checkBalance;
function checkEthBalance() {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = yield retrieveWallet("97d8b144-fbe6-4fdf-9664-1836ae5698c5");
        const wallet = new ethers_1.ethers.Wallet(privateKey.privateKey, provider);
        const userAddress = wallet.address;
        try {
            const balance = yield provider.getBalance(userAddress);
            console.log(`💰 Balance: ${ethers_1.ethers.formatUnits(balance, 18)} ETH`);
        }
        catch (error) {
            console.error("Error fetching ETH balance:", error);
        }
    });
}
exports.checkEthBalance = checkEthBalance;
// Transfer ERC20 Tokens
function transferTokens(tokenAddress, recipient, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = yield retrieveWallet("97d8b144-fbe6-4fdf-9664-1836ae5698c5");
        const wallet = new ethers_1.ethers.Wallet(privateKey.privateKey, provider);
        const userAddress = wallet.address;
        const token = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const tx = yield token.transfer(recipient, amount);
        yield tx.wait();
        console.log(`✅ Transfer successful! Tx Hash: ${tx.hash}`);
    });
}
exports.transferTokens = transferTokens;
// Handle Transactions Based on AI Output
function handleTransaction(parsed) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (parsed.action) {
            case "swap":
                return swapTokens(parsed.tokenIn, parsed.tokenOut, parsed.amountIn, parsed.amountOutMin, parsed.toName);
            case "balance":
                return checkBalance(parsed.token);
            case "transfer":
                return transferTokens(parsed.token, parsed.recipient, parsed.amount);
            case "ethbalance":
                return checkEthBalance();
            case "monitor":
                return (0, SuddenLiquidityRemoval_1.default)(parsed.token, parsed.tokenName);
            default:
                console.log("❌ Unknown action:", parsed.action);
        }
    });
}
exports.handleTransaction = handleTransaction;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // async function getWalletId(): Promise<string> {
        //   return new Promise((resolve) => {
        //     rl.question("Enter your Wallet ID: ", (walletId) => {
        //       resolve(walletId);
        //     });
        //   });
        // }
        // getWalletId()
        const askForInput = () => {
            rl.question("What txn to do today", (input) => __awaiter(this, void 0, void 0, function* () {
                if (input.toLowerCase() === 'exit') {
                    console.log("Exiting...");
                    rl.close();
                    return;
                }
                try {
                    const parsed = yield (0, interpreter_1.default)(input);
                    yield handleTransaction(parsed);
                }
                catch (error) {
                    console.error("Error processing transaction:", error);
                }
                askForInput(); // Ask for another input
            }));
        };
        askForInput();
    });
}
main();
