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
const ethers_1 = require("ethers");
const hyperbolic_1 = __importDefault(require("./hyperbolic"));
const handletxns_1 = require("./handletxns");
const ALCHEMY_WEBSOCKET_URL = "wss://eth-mainnet.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw";
const provider = new ethers_1.ethers.WebSocketProvider(ALCHEMY_WEBSOCKET_URL);
const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const UNISWAP_V2_FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address)"
];
const UNISWAP_V2_PAIR_ABI = [
    "event RemoveLiquidity(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)"
];
function getPairAddress(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const factoryContract = new ethers_1.Contract(UNISWAP_V2_FACTORY, UNISWAP_V2_FACTORY_ABI, provider);
        const pairAddress = yield factoryContract.getPair(tokenAddress, WETH);
        if (pairAddress === ethers_1.ethers.ZeroAddress) {
            console.log("❌ No Uniswap V2 Pair Found for this token.");
            return null;
        }
        console.log(`✅ Found Pair: ${pairAddress}`);
        return pairAddress;
    });
}
// Function to monitor liquidity removal events
function monitorTokenLiquidity(tokenAddress, tokenName) {
    return __awaiter(this, void 0, void 0, function* () {
        const analyzer = new hyperbolic_1.default('05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c', 'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI', 'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris');
        const pairAddress = yield getPairAddress(tokenAddress);
        if (!pairAddress)
            return;
        const pairContract = new ethers_1.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);
        pairContract.on("RemoveLiquidity", (sender, amount0, amount1, to) => __awaiter(this, void 0, void 0, function* () {
            console.log(`⚠️ Liquidity Removed for ${tokenAddress}!`);
            console.log(`Sender: ${sender}`);
            console.log(`Amounts: ${ethers_1.ethers.formatUnits(amount0, 18)}, ${ethers_1.ethers.formatUnits(amount1, 18)}`);
            console.log(`To: ${to}`);
            yield analyzer.analyzeTokenRisk(tokenAddress, '0x0', '2023-01-01', '2022-2-8', 'base-mainnet', tokenName)
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                console.log('Complete result:', result);
                if (result.riskLevel === 'HIGH') {
                    console.log('High Risk Token');
                    yield (0, handletxns_1.swapTokens)(tokenAddress, WETH, yield (0, handletxns_1.checkBalance)(tokenAddress), "0", "WETH");
                }
                if (result.riskLevel === 'MEDIUM') {
                    console.log('Medium Risk Token');
                    console.warn('⚠️ Medium risk token detected. Proceed with caution. Press ctrl + c to cancel.');
                }
                if (result.riskLevel === 'LOW') {
                    console.log('Low Risk Token');
                    console.log('✅ Token is safe to swap.');
                }
            }));
            // Detect large liquidity removal
            if (Number(amount0) > 100000 || Number(amount1) > 100000) {
                (0, handletxns_1.swapTokens)(WETH, tokenAddress, yield (0, handletxns_1.checkBalance)(tokenAddress), "0", "WETH");
            }
        }));
    });
}
// const TOKEN_TO_MONITOR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";  
// monitorTokenLiquidity(TOKEN_TO_MONITOR , "USDC"); 
exports.default = monitorTokenLiquidity;
