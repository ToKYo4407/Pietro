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
const ethers_1 = require("ethers");
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
function monitorTokenLiquidity(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const pairAddress = yield getPairAddress(tokenAddress);
        if (!pairAddress)
            return;
        const pairContract = new ethers_1.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);
        pairContract.on("RemoveLiquidity", (sender, amount0, amount1, to) => __awaiter(this, void 0, void 0, function* () {
            console.log(`⚠️ Liquidity Removed for ${tokenAddress}!`);
            console.log(`Sender: ${sender}`);
            console.log(`Amounts: ${ethers_1.ethers.formatUnits(amount0, 18)}, ${ethers_1.ethers.formatUnits(amount1, 18)}`);
            console.log(`To: ${to}`);
            // Detect large liquidity removal
            if (Number(amount0) > 100000 || Number(amount1) > 100000) {
                console.error("🚨 Possible rug pull detected!");
            }
        }));
    });
}
const TOKEN_TO_MONITOR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
monitorTokenLiquidity(TOKEN_TO_MONITOR);
exports.default = monitorTokenLiquidity;
