import { ethers, MaxUint256 } from "ethers";
import dotenv from "dotenv";
import parseTransaction  from "./interpreter";
const { retrieveWallet } = require("./walletSetUp");
import CryptoRiskAnalyzer  from "./hyperbolic";
import { warn } from "console";
import readline from 'readline';

dotenv.config(); // Load environment variables

const BASE_SEPOLIA_RPC = "https://base-sepolia.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw";
const UNISWAP_V2_ROUTER = "0x6977e417aEA71dd1554298030c85D1AD8C37374B"; // Uniswap V2 Router on Base Sepolia

const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
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
async function swapTokens(tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string , tokenOutName: string) {
  const privateKey = await retrieveWallet("97d8b144-fbe6-4fdf-9664-1836ae5698c5");
  console.log(privateKey);
  const wallet = new ethers.Wallet(privateKey.privateKey, provider);
  const userAddress = wallet.address;
  //check for swap safety 
  const analyzer = new CryptoRiskAnalyzer(
    '05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c',
    'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI',
    'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris'
  );

  await analyzer.analyzeTokenRisk(
    tokenOut,
    userAddress,
    '2023-01-01',
    '2022-2-8',
    'base-mainnet',
    tokenOutName
  )
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

    const ERC20Contract = new ethers.Contract(tokenIn, ERC20_ABI, wallet);
    // const approval = await ERC20Contract.approve(UNISWAP_V2_ROUTER, amountIn);

    const router = new ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, wallet);

    const tx = await router.swap({value: amountIn });
    console.log("⏳ Swapping tokens...");
    await tx.wait();
    console.log(`✅ Swap successful! Tx Hash: ${tx.hash}`);
}

// Check Token Balance
async function checkBalance(tokenAddress: string) {
  const privateKey = retrieveWallet();
const wallet = new ethers.Wallet(privateKey, provider);
const userAddress = wallet.address;
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await token.balanceOf(await wallet.getAddress());
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} tokens`);
  return balance;
}

async function checkEthBalance() {
  const privateKey = retrieveWallet();
const wallet = new ethers.Wallet(privateKey, provider);
const userAddress = wallet.address;
  const balance = await provider.getBalance(userAddress);
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} ETH`);
}

// Transfer ERC20 Tokens
async function transferTokens(tokenAddress: string, recipient: string, amount: string) {
  const privateKey = retrieveWallet();
const wallet = new ethers.Wallet(privateKey, provider);
const userAddress = wallet.address;
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
    case "ethbalance":
      return checkEthBalance();  
    default:
      console.log("❌ Unknown action:", parsed.action);
  }
}


async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askForInput = () => {
    rl.question("Enter transaction input: ", async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log("Exiting...");
        rl.close();
        return;
      }

      try {
        const parsed = await parseTransaction(input);
        await handleTransaction(parsed);
      } catch (error) {
        console.error("Error processing transaction:", error);
      }

      askForInput(); // Ask for another input
    });
  };

  askForInput();
}

main();

export { swapTokens, checkBalance, transferTokens, checkEthBalance, handleTransaction };