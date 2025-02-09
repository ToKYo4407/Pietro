"use strict";
// import { error } from "console";
// import { ethers, Contract } from "ethers";
// import CryptoRiskAnalyzer from "./hyperbolic";
// const ALCHEMY_WEBSOCKET_URL = "wss://eth-mainnet.g.alchemy.com/v2/Yy4JFDLUVE5oFwyhI8LAKMokkVwDJFsw";
// const provider = new ethers.WebSocketProvider(ALCHEMY_WEBSOCKET_URL);
// const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";  
// const UNISWAP_V2_FACTORY_ABI = [
//     "function getPair(address tokenA, address tokenB) external view returns (address)"
// ];
// const UNISWAP_V2_PAIR_ABI = [
//     "event RemoveLiquidity(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)"
// ];
// async function getPairAddress(tokenAddress: string): Promise<string | null> {
//     const factoryContract = new Contract(UNISWAP_V2_FACTORY, UNISWAP_V2_FACTORY_ABI, provider);
//     const pairAddress: string = await factoryContract.getPair(tokenAddress, WETH);
//     if (pairAddress === ethers.ZeroAddress) {
//         console.log("❌ No Uniswap V2 Pair Found for this token.");
//         return null;
//     }
//     console.log(`✅ Found Pair: ${pairAddress}`);
//     return pairAddress;
// }
// // Function to monitor liquidity removal events
// async function monitorTokenLiquidity(tokenAddress: string): Promise<void> {
//     const analyzer = new CryptoRiskAnalyzer(
//         '05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c',
//         'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI',
//         'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j',
//         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris'
//     );
//     const pairAddress = await getPairAddress(tokenAddress);
//     if (!pairAddress) return;
//     const pairContract = new Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);
//     pairContract.on("RemoveLiquidity", async (sender: string, amount0: ethers.BigNumberish, amount1: ethers.BigNumberish, to: string) => {
//         console.log(`⚠️ Liquidity Removed for ${tokenAddress}!`);
//         console.log(`Sender: ${sender}`);
//         console.log(`Amounts: ${ethers.formatUnits(amount0, 18)}, ${ethers.formatUnits(amount1, 18)}`);
//         console.log(`To: ${to}`);
//     await analyzer.analyzeTokenRisk(
//             tokenOut,
//             '0x0',
//             '2023-01-01',
//             '2022-2-8',
//             'base-mainnet',
//             tokenOutName
//           )
//             .then(result => {
//               console.log('Complete result:', result);
//               if (result.riskLevel === 'HIGH') {
//                 console.log('High Risk Token');
//                 console.error('❌ Swap aborted! High risk token detected.');
//               }
//               if (result.riskLevel === 'MEDIUM') {
//                 console.log('Medium Risk Token');
//                console.warn('⚠️ Medium risk token detected. Proceed with caution. Press ctrl + c to cancel.');
//               }
//               if (result.riskLevel === 'LOW') {
//                 console.log('Low Risk Token');
//                 console.log('✅ Token is safe to swap.');
//               }
//             })
//         // Detect large liquidity removal
//         if (Number(amount0) > 100_000 || Number(amount1) > 100_000) {
//             console.error("🚨 Possible rug pull detected!");
//         }
//     });
// }
// const TOKEN_TO_MONITOR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";  
// monitorTokenLiquidity(TOKEN_TO_MONITOR);
// export default monitorTokenLiquidity;
