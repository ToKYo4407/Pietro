import { ethers } from "ethers";
import dotenv from "dotenv";
import parseTransaction  from "./interpreter";
const { retrieveWallet } = require("./walletSetUp");
import CryptoRiskAnalyzer  from "./hyperbolic";
import { warn } from "console";

dotenv.config(); // Load environment variables

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const UNISWAP_V2_ROUTER = "0xYourRouterAddress"; // Uniswap V2 Router on Base Sepolia

const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
const privateKey = retrieveWallet();
const wallet = new ethers.Wallet(privateKey, provider);
const userAddress = wallet.address;
// ABI Definitions
const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) external returns (uint[])"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)"
];

// Swap Tokens
async function swapTokens(tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string , tokenOutName: string) {
  //check for swap safety 
  const analyzer = new CryptoRiskAnalyzer('05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c',
    'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI',
    'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris');

analyzer.analyzeTokenRisk(tokenOut, userAddress, '2023-01-01', '2022-2-8' , 'base-sepolia-testnet' ,tokenOutName )
    .then(result => {
      console.log('Complete result:', result);
      if (result.riskLevel === 'HIGH') {
        console.log('High Risk Token');
        console.error('❌ Swap aborted! High risk token detected.');
      }
      if (result.riskLevel === 'MEDIUM') {
        console.log('Medium Risk Token');
       warn('⚠️ Medium risk token detected. Proceed with caution. Press ctrl + c to cancel.');
      }
      if (result.riskLevel === 'LOW') {
        console.log('Low Risk Token');
        console.log('✅ Token is safe to swap.');
      }
    })
    .catch(error => console.error(error));

  const router = new ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, wallet);
  const path = [tokenIn, tokenOut];
  const to = await wallet.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  const tx = await router.swapExactTokensForTokens(amountIn, minAmountOut, path, to, deadline);
  console.log("⏳ Swapping tokens...");
  await tx.wait();
  console.log(`✅ Swap successful! Tx Hash: ${tx.hash}`);
}

// Check Token Balance
async function checkBalance(tokenAddress: string) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await token.balanceOf(await wallet.getAddress());
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} tokens`);
}

// Transfer ERC20 Tokens
async function transferTokens(tokenAddress: string, recipient: string, amount: string) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const tx = await token.transfer(recipient, amount);
  await tx.wait();
  console.log(`✅ Transfer successful! Tx Hash: ${tx.hash}`);
}

// Handle Transactions Based on AI Output
async function handleTransaction(parsed: any) {
  switch (parsed.action) {
    case "swap":
      return swapTokens(parsed.tokenIn, parsed.tokenOut, parsed.amountIn, parsed.amountOutMin , parsed.toName);
    case "balance":
      return checkBalance(parsed.token);
    case "transfer":
      return transferTokens(parsed.token, parsed.recipient, parsed.amount);
    default:
      console.log("❌ Unknown action:", parsed.action);
  }
}


async function main() {
  const input = "Swap 1 ETH (0xETHContract) for 5 USDC (0xUSDCContract)";
  const parsed = await parseTransaction(input);
  await handleTransaction(parsed);
}

main().catch(console.error);
