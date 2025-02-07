import OpenAI from 'openai';
import UnifiedDataManager from './UnifiedDataManager';

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
        const prices = historicalPrices[0]?.prices || [];
        const priceValues = prices.map(p => p.price);
        
        const totalBalance = holdings.reduce((acc, h) => 
            acc + parseFloat(h.balance || '0'), 0);
            
        return {
            priceVolatility: this.calculateVolatility(priceValues),
            liquidityDepth: totalBalance,
            holderConcentration: this.calculateHolderConcentration(holdings),
            tradingVolume: this.calculateAverageVolume(prices)
        };
    }

    private calculateVolatility(prices: number[]): number {
        if (prices.length < 2) return 0;
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        return Math.sqrt(returns.reduce((acc, ret) => acc + ret * ret, 0) / returns.length);
    }

    private calculateHolderConcentration(holdings: TokenHolding[]): number {
        const totalSupply = holdings.reduce((acc, h) => acc + parseFloat(h.balance || '0'), 0);
        if (totalSupply === 0) return 0;
        const largestHolder = Math.max(...holdings.map(h => parseFloat(h.balance || '0')));
        return largestHolder / totalSupply;
    }

    private calculateAverageVolume(prices: any[]): number {
        if (prices.length === 0) return 0;
        return prices.reduce((acc, p) => acc + (p.volume || 0), 0) / prices.length;
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
                        content: 'You are an expert in finding risky tokens. Analyze the provided metrics and return a risk score (0-100) and detailed findings.'
                    },
                    {
                        role: 'user',
                        content: `Analyze token metrics:
                            Contract: ${contractAddress}
                            Volatility: ${metrics.priceVolatility}
                            Liquidity: ${metrics.liquidityDepth}
                            Concentration: ${metrics.holderConcentration}
                            Volume: ${metrics.tradingVolume}
                            ABI: ${JSON.stringify(abi)}
                            Prices: ${JSON.stringify(prices)}`
                    }
                ],
                model: 'meta-llama/Meta-Llama-3-70B-Instruct'
            });

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
}

const analyzer = new CryptoRiskAnalyzer(process.env.CRYPTO_API_KEY || '',
    process.env.ETHERSCAN_API_KEY || '',
    process.env.COVALENT_API_KEY || '',
    process.env.HYPERBOLIC_API_KEY || '');

analyzer.analyzeTokenRisk('', '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A', 'fromDate', 'toDate')
    .then(result => console.log(result))
    .catch(error => console.error(error));

    