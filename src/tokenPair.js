import { ethers } from "ethers";

const UNISWAP_V2_FACTORY = "0x7Ae58f10f7849cA6F5fB71b7f45CB416c9204b1e"; // Uniswap V2 Factory on Base Sepolia
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address)"
];

const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw");

async function findUniswapPair(tokenA, tokenB) {
  const factory = new ethers.Contract(UNISWAP_V2_FACTORY, FACTORY_ABI, provider);
  
  try {
    const pairAddress = await factory.getPair(tokenA, tokenB);
    
    if (pairAddress === ethers.ZeroAddress) {
      throw new Error("No liquidity pool found for this pair.");
    }
    
    console.log(`✅ Pair Address: ${pairAddress}`);
    return pairAddress;
  } catch (error) {
    console.error("❌ Error finding pair:", error.message);
    return null;
  }
}

// Example usage:
findUniswapPair("0x5deac602762362fe5f135fa5904351916053cf70", "0x7b79995e5f793a07bc00c21412e50ecae098e7f9");
