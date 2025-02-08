import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env file

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set your OpenAI API key
});

async function parseTransaction(input: string) {
  const prompt = `
  Convert the input into structured JSON for Base Sepolia transactions.
  Ensure:
  - Use contract addresses instead of token symbols.
  - Amounts should be in the correct decimal format (ETH: 18, USDC: 6).
  - Recognize swap, transfer, and balance check intents.

  Examples:
  - "Swap 1 ETH (0xETHContract) for 5 USDC (0xUSDCContract)"
    → {"action": "swap", "tokenIn": "0xETHContract", "tokenOut": "0xUSDCContract", "amountIn": "1000000000000000000", "amountOutMin": "5000000" , "toName": "USDC"}

  - "Check balance of 0xUSDCContract in my wallet 0xMyWallet"
    → {"action": "balance", "token": "0xUSDCContract", "wallet": "0xMyWallet"}

  - "Send 0.5 ETH (0xETHContract) to 0xABC123"
    → {"action": "transfer", "token": "0xETHContract", "amount": "500000000000000000", "recipient": "0xABC123"}

  Now, convert this input: ${input}
  `;

  const response = await openai.completions.create({
    model: "gpt-4",
    prompt: prompt,
    max_tokens: 200,
  });

  const jsonString = response.choices[0].text.trim();
  return JSON.parse(jsonString);
}

export default parseTransaction;