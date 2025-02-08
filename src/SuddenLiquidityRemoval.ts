import { error } from "console";
import { ethers, Contract } from "ethers";

const ALCHEMY_WEBSOCKET_URL = "wss://eth-mainnet.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw";
const provider = new ethers.WebSocketProvider(ALCHEMY_WEBSOCKET_URL);

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";  

const UNISWAP_V2_FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address)"
];

const UNISWAP_V2_PAIR_ABI = [
    "event RemoveLiquidity(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)"
];

async function getPairAddress(tokenAddress: string): Promise<string | null> {
    const factoryContract = new Contract(UNISWAP_V2_FACTORY, UNISWAP_V2_FACTORY_ABI, provider);
    const pairAddress: string = await factoryContract.getPair(tokenAddress, WETH);
    
    if (pairAddress === ethers.ZeroAddress) {
        console.log("❌ No Uniswap V2 Pair Found for this token.");
        return null;
    }
    
    console.log(`✅ Found Pair: ${pairAddress}`);
    return pairAddress;
}

// Function to monitor liquidity removal events
async function monitorTokenLiquidity(tokenAddress: string): Promise<void> {
    const pairAddress = await getPairAddress(tokenAddress);
    if (!pairAddress) return;

    const pairContract = new Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);

    pairContract.on("RemoveLiquidity", async (sender: string, amount0: ethers.BigNumberish, amount1: ethers.BigNumberish, to: string) => {
        console.log(`⚠️ Liquidity Removed for ${tokenAddress}!`);
        console.log(`Sender: ${sender}`);
        console.log(`Amounts: ${ethers.formatUnits(amount0, 18)}, ${ethers.formatUnits(amount1, 18)}`);
        console.log(`To: ${to}`);

        // Detect large liquidity removal
        if (Number(amount0) > 100_000 || Number(amount1) > 100_000) {
            console.error("🚨 Possible rug pull detected!");
        }
    });
}

const TOKEN_TO_MONITOR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";  
monitorTokenLiquidity(TOKEN_TO_MONITOR);

export default monitorTokenLiquidity;