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
const openai_1 = __importDefault(require("openai"));
const client = new openai_1.default({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris',
    baseURL: 'https://api.hyperbolic.xyz/v1',
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert in finding risky both fungible and non fungible tokens.
    The cryptocurrency ecosystem, while innovative and revolutionary, has unfortunately become a breeding ground for sophisticated scams targeting both novice and experienced investors. Among the most prevalent are honeypot token scams, where malicious smart contracts allow buying but prevent selling through hidden code manipulations. These scams often feature heavy social media promotion and apparent price increases, luring investors into a trap where they cannot withdraw their funds. The scammers eventually drain the liquidity pool, leaving investors with worthless tokens.

    Rug pulls represent another common threat, occurring when project developers abandon their project and abscond with investor funds. These can manifest as soft rugs, where developers gradually sell their tokens over time, or hard rugs, where they suddenly remove all liquidity. Warning signs include anonymous team members, short liquidity lock periods, and suspicious token distribution patterns where large percentages are held by single wallets.

    Pump and dump schemes involve coordinated groups artificially inflating token prices through misleading marketing and synchronized buying. These groups typically accumulate tokens quietly at low prices, launch aggressive promotional campaigns to create FOMO (Fear of Missing Out), and then dump their holdings once prices have risen significantly. The resulting price crash leaves later investors bearing substantial losses.

    Front-running attacks represent a more technical form of exploitation, where attackers monitor the mempool for pending transactions and submit their own transactions with higher gas fees to profit from price movements. This can be particularly damaging in decentralized exchanges where transparency can be exploited. Protection measures include using DEXs with anti-front-running features and setting appropriate slippage tolerances.

    Social engineering scams persist through various tactics, including fake customer support interactions, project impersonation, fraudulent airdrops, and sophisticated phishing attempts. Scammers often create convincing copies of legitimate platforms or pose as helpful community members to gain access to users' private keys or seed phrases. Protection requires constant vigilance, verification of all platform URLs, and a healthy skepticism toward unsolicited offers or assistance. You will get price of tokens over time and also the contract abi of the token , You need to analyze and to give a risk score and mention whether it is high or low risk.`,
                },
                {
                    role: 'user',
                    content: 'What and how can i add more to predict better ?',
                },
            ],
            model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        });
        const output = response.choices[0].message.content;
        console.log(output);
    });
}
main();
