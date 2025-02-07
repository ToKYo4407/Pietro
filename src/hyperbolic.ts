import OpenAI from 'openai';
import UnifiedDataManager from './UnifiedDataManager';
import { warn } from 'console';

interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  findings: string[];
  timestamp: number;
}

interface TokenMetrics {
  priceVolatility: number;
  liquidityDepth: number;
  holderConcentration: number;
  tradingVolume: number;
}

class CryptoRiskAnalyzer extends UnifiedDataManager {
    private riskAnalyses: Map<string, RiskAnalysis> = new Map();
    private ai: OpenAI;

    constructor(
        cryptoApiKey: string,
        etherscanApiKey: string,
        covalentApiKey: string,
        hyperbolicApiKey: string
    ) {
        super(cryptoApiKey, etherscanApiKey, covalentApiKey);
        this.ai = new OpenAI({
            apiKey: hyperbolicApiKey,
            baseURL: 'https://api.hyperbolic.xyz/v1'
        });
    }

    private calculateMetrics(historicalPrices: HistoricalPrice[], holdings: TokenHolding[]): TokenMetrics {
        console.log('Historical prices:', historicalPrices);
    
        // Extract price values from historicalPrices
        const priceValues: number[] = historicalPrices.map(p => p.price);
        console.log('Price values:', priceValues);
    
        // Calculate total balance from holdings
        const totalBalance = holdings.reduce((acc, h) => acc + parseFloat(h.balance), 0);
    
        return {
            priceVolatility: this.calculateVolatility(priceValues),
            liquidityDepth: totalBalance,
            holderConcentration: this.calculateHolderConcentration(holdings),
            tradingVolume: this.calculateAverageVolume(historicalPrices)
        };
    }
    

    private calculateVolatility(prices: number[]): number {
        if (prices.length < 2) warn('Price data is insufficient for volatility calculation');
        if (prices.length < 2) return 0;
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        return Math.sqrt(returns.reduce((acc, ret) => acc + ret * ret, 0) / returns.length);
    }

    private calculateHolderConcentration(holdings: TokenHolding[]): number {
        const totalSupply = holdings.reduce((acc, h) => acc + parseFloat(h.balance || '0'), 0);
        if (totalSupply === 0) {
            warn('Total supply is zero, cannot calculate holder concentration');
            return 0;
        }
        const largestHolder = Math.max(...holdings.map(h => parseFloat(h.balance || '0')));
        return largestHolder / totalSupply;
    }

    private calculateAverageVolume(prices: any[]): number {
        if (prices.length < 2) return 0;

        let totalVolume = 0;
    
        for (let i = 1; i < prices.length; i++) {
            const prevTime = new Date(prices[i - 1].date).getTime();
            const currTime = new Date(prices[i].date).getTime();
            const timeDiff = (currTime - prevTime)// Convert ms to hours
    
            totalVolume += Math.abs(prices[i].price * timeDiff);;
    
        }
        
        console.log('Total volume:', totalVolume);
        return (totalVolume /(1000 * 60 * 60)) /(prices.length - 1); // Normalize over total intervals
    }

    async analyzeTokenRisk(
        contractAddress: string,
        walletAddress: string,
        fromDate: string,
        toDate: string
    ): Promise<RiskAnalysis> {
        try {
            const [holdings, abi] = await Promise.all([
                super.fetchTokenHoldings(walletAddress),
                super.fetchAndStoreABI(contractAddress)
            ]);

            const prices = await super.fetchHistoricalPrices([contractAddress], fromDate, toDate);
            const metrics = this.calculateMetrics(prices, holdings);

            const aiResponse = await this.ai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert in finding risky tokens. Analyze the provided metrics and return a risk score (0-100) and detailed findings.
                        The cryptocurrency ecosystem, while innovative and revolutionary, has unfortunately become a breeding ground for sophisticated scams targeting both novice and experienced investors. Among the most prevalent are honeypot token scams, where malicious smart contracts allow buying but prevent selling through hidden code manipulations. These scams often feature heavy social media promotion and apparent price increases, luring investors into a trap where they cannot withdraw their funds. The scammers eventually drain the liquidity pool, leaving investors with worthless tokens.

                        Rug pulls represent another common threat, occurring when project developers abandon their project and abscond with investor funds. These can manifest as soft rugs, where developers gradually sell their tokens over time, or hard rugs, where they suddenly remove all liquidity. Warning signs include anonymous team members, short liquidity lock periods, and suspicious token distribution patterns where large percentages are held by single wallets.
                    
                        Pump and dump schemes involve coordinated groups artificially inflating token prices through misleading marketing and synchronized buying. These groups typically accumulate tokens quietly at low prices, launch aggressive promotional campaigns to create FOMO (Fear of Missing Out), and then dump their holdings once prices have risen significantly. The resulting price crash leaves later investors bearing substantial losses.
                    
                        Front-running attacks represent a more technical form of exploitation, where attackers monitor the mempool for pending transactions and submit their own transactions with higher gas fees to profit from price movements. This can be particularly damaging in decentralized exchanges where transparency can be exploited. Protection measures include using DEXs with anti-front-running features and setting appropriate slippage tolerances.
                    
                        Social engineering scams persist through various tactics, including fake customer support interactions, project impersonation, fraudulent airdrops, and sophisticated phishing attempts. Scammers often create convincing copies of legitimate platforms or pose as helpful community members to gain access to users' private keys or seed phrases. Protection requires constant vigilance, verification of all platform URLs, and a healthy skepticism toward unsolicited offers or assistance. You will get price of tokens over time and also the contract abi of the token , You need to analyze and to give a risk score and mention whether it is high or low risk.
                        Also please analyze the data if u find that some data is unusual like liquidity is too high while like trading volume is almost zero do try to correct it this may be due to problems in the ccode i wrote or the server i quered may be prone to nugs and error. Also try to find out the whitepaper to red more about that token. Price data will be sent to you only if there are any anomalies in the data if you receive no data hence no anomalies are there in price.
                        Whitepaper needs to be found out by you and also the contract address of the token is given to you. So try to find out` 
                    },
                    {
                        role: 'user',
                        content: `Analyze token metrics:
                            Contract: ${contractAddress}
                            Volatility: ${metrics.priceVolatility}
                            Liquidity: ${metrics.liquidityDepth}
                            Volume: ${metrics.tradingVolume}
                            ABI: ${JSON.stringify(abi)}
                            Prices: ${JSON.stringify(this.detectAnomalies(prices))}
                            `
                    }
                ],
                model: 'meta-llama/Meta-Llama-3-70B-Instruct'
            });
             
            console.log('AI Response:', aiResponse);
            const analysis = aiResponse.choices[0].message.content || '';
            const riskScore = this.extractRiskScore(analysis);
            
            const riskAnalysis: RiskAnalysis = {
                riskScore,
                riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW',
                findings: this.extractFindings(analysis),
                timestamp: Date.now()
            };

            this.riskAnalyses.set(contractAddress, riskAnalysis);
            return riskAnalysis;
        } catch (error) {
            console.error('Risk analysis error:', error);
            throw error;
        }
    }

    private extractRiskScore(analysis: string): number {
        const scoreMatch = analysis.match(/risk score:?\s*(\d+)/i);
        return scoreMatch ? parseInt(scoreMatch[1]) : 50;
    }

    private extractFindings(analysis: string): string[] {
        return analysis
            .split(/[.\n]/)
            .map(f => f.trim())
            .filter(f => f.length > 0);
    }

    getRiskAnalysis(contractAddress: string): RiskAnalysis | undefined {
        return this.riskAnalyses.get(contractAddress);
    }

    private detectAnomalies(prices: HistoricalPrice[]): { date: string; price: number }[] {
       //Implement z score algorithm to detect anomalies
        const zScores = [];
        const priceValues = prices.map(p => p.price);
        const mean = priceValues.reduce((acc, val) => acc + val, 0) / priceValues.length;
        const variance = priceValues.reduce((acc, val) => acc + (val - mean) ** 2, 0) / priceValues.length;
        const stdDev = Math.sqrt(variance);
        for (let i = 0; i < priceValues.length; i++) {
            const zScore = (priceValues[i] - mean) / stdDev;
            if (Math.abs(zScore) > 2){
            zScores.push({ date: prices[i].date, price: priceValues[i], zScore });
            }
        }
        return zScores;
    }
    
    
}



const analyzer = new CryptoRiskAnalyzer('05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c',
    'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI',
    'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris');

analyzer.analyzeTokenRisk('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A', '2023-01-01', '2023-12-31')
    .then(result => console.log(result))
    .catch(error => console.error(error));

    