import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env file

const openai = new OpenAI({
  apiKey: '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', // Use environment variable for security
});

export async function parseTransaction(input: string) {
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Use "gpt-4-turbo" if needed
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
        `,
      },
      {
        role: "user",
        content: input,
      },
    ],
    max_tokens: 200,
  });

  const jsonString = aiResponse.choices[0].message.content?.trim();
  return JSON.parse(jsonString?.toString() || "{}");
}

export default parseTransaction;