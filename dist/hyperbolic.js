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
const UnifiedDataManager_1 = __importDefault(require("./UnifiedDataManager"));
const console_1 = require("console");
const axios_1 = __importDefault(require("axios"));
const Metadata_1 = __importDefault(require("./Metadata"));
class CryptoRiskAnalyzer extends UnifiedDataManager_1.default {
    constructor(cryptoApiKey, etherscanApiKey, covalentApiKey, hyperbolicApiKey) {
        super(cryptoApiKey, etherscanApiKey, covalentApiKey);
        this.riskAnalyses = new Map();
        this.ai = new openai_1.default({
            apiKey: hyperbolicApiKey,
            baseURL: 'https://api.hyperbolic.xyz/v1'
        });
    }
    fetchCoinMarketCapData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest', {
                    headers: {
                        'X-CMC_PRO_API_KEY': 'd71b1825-f56f-42b8-84ca-0832f63d530e'
                    },
                    params: {
                        symbol: symbol || 'USDC',
                        convert: 'USD'
                    }
                });
                console.log('CoinMarketCap response:', response.data.data.USDC[0]);
                const tokenData = response.data.data[symbol][0];
                console.log('Token data:', tokenData);
                if (!tokenData) {
                    throw new Error(`No data found for symbol ${symbol}`);
                }
                return tokenData;
            }
            catch (error) {
                console.error('Error fetching CoinMarketCap data:', error);
                throw error;
            }
        });
    }
    calculateMetrics(historicalPrices) {
        // Extract price values from historicalPrices
        const priceValues = historicalPrices.map(p => p.price);
        return {
            priceVolatility: this.calculateVolatility(priceValues),
            tradingVolume: this.calculateAverageVolume(historicalPrices)
        };
    }
    calculateVolatility(prices) {
        if (prices.length < 2)
            (0, console_1.warn)('Price data is insufficient for volatility calculation');
        if (prices.length < 2)
            return 0;
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        return Math.sqrt(returns.reduce((acc, ret) => acc + ret * ret, 0) / returns.length);
    }
    calculateHolderConcentration(holdings) {
        const totalSupply = holdings.reduce((acc, h) => acc + parseFloat(h.balance || '0'), 0);
        if (totalSupply === 0) {
            (0, console_1.warn)('Total supply is zero, cannot calculate holder concentration');
            return 0;
        }
        const largestHolder = Math.max(...holdings.map(h => parseFloat(h.balance || '0')));
        return largestHolder / totalSupply;
    }
    calculateAverageVolume(prices) {
        if (prices.length < 2)
            return 0;
        let totalVolume = 0;
        for (let i = 1; i < prices.length; i++) {
            const prevTime = new Date(prices[i - 1].date).getTime();
            const currTime = new Date(prices[i].date).getTime();
            const timeDiff = (currTime - prevTime); // Convert ms to hours
            totalVolume += Math.abs(prices[i].price * timeDiff);
            ;
        }
        return (totalVolume / (1000 * 60 * 60)) / (prices.length - 1); // Normalize over total intervals
    }
    analyzeTokenRisk(contractAddress, walletAddress, fromDate, toDate) {
        const _super = Object.create(null, {
            fetchHistoricalPrices: { get: () => super.fetchHistoricalPrices },
            fetchAndStoreABI: { get: () => super.fetchAndStoreABI }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [marketData, prices, abi] = yield Promise.all([
                    this.fetchCoinMarketCapData("USDC"),
                    _super.fetchHistoricalPrices.call(this, [contractAddress], fromDate, toDate),
                    _super.fetchAndStoreABI.call(this, contractAddress)
                ]);
                console.log('Market Data:', marketData.quote);
                const metrics = this.calculateMetrics(prices);
                const fetcher = new Metadata_1.default('d71b1825-f56f-42b8-84ca-0832f63d530e');
                // Fetch metadata for multiple cryptocurrencies
                const metadata = yield fetcher.getCoreMetadata(["USDC"]);
                // Get a formatted summary
                const summary = fetcher.formatMetadataSummary(metadata);
                const aiResponse = yield this.ai.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert in identifying risky tokens. Analyze the provided metrics and return a risk score (0-100) along with detailed findings.
                
                The cryptocurrency ecosystem, while innovative, has become a hotspot for scams targeting both novice and experienced investors. Some of the most common fraudulent tactics include:
                
                - **Honeypot Scams:** Malicious smart contracts allow users to buy tokens but prevent selling. These scams often feature aggressive social media promotion and artificial price inflation to lure investors before preventing withdrawals.
                  
                - **Rug Pulls:** Developers abandon a project and steal investor funds. This can occur as:
                  - **Soft Rug:** Developers gradually sell their holdings over time.
                  - **Hard Rug:** Liquidity is suddenly removed, crashing the token price.
                  - Red flags include anonymous teams, short liquidity lock periods, and concentrated token distribution among a few wallets.
                
                - **Pump and Dump Schemes:** Coordinated groups artificially inflate token prices through misleading marketing and synchronized buying. Once prices peak, they sell, causing a rapid price drop.
                
                - **Front-Running Attacks:** Attackers monitor pending transactions in the mempool and use higher gas fees to execute profitable trades before others. This is especially common in decentralized exchanges (DEXs). 
                
                - **Social Engineering Scams:** Scammers use fake customer support, project impersonation, fraudulent airdrops, and phishing attempts to steal private keys or funds.
                
                ### **Your Analysis Task**
                1. Evaluate the provided token data, including contract ABI, price history, and liquidity metrics.
                2. Identify anomalies (e.g., extremely high liquidity with zero trading volume).
                3. Assess the token’s whitepaper for credibility. If unavailable, attempt to locate it online.
                4. Compute a **risk score (0-100)** and categorize the risk as **High / Low**.
                5. If you suspect data errors (e.g., incorrect liquidity values), highlight potential sources of errors (e.g., API issues or incorrect queries).
                6. If no price anomalies are detected, no price data will be sent.
                7. Also this is the token name ${marketData.name} and the token symbol ${marketData.symbol} , so you can use this information to help you in your analysis.
                8 . ${summary}`
                        },
                        {
                            role: 'user',
                            content: `Analyze token metrics:
                Contract: ${contractAddress}
                Volatility: ${metrics.priceVolatility}
                24h Volume: ${marketData.quote.USD.volume_24h}
                Market Cap: ${marketData.quote.USD.market_cap}
                Market Cap Dominance: ${marketData.quote.USD.market_cap_dominance}
                
                Price Change:
                - 1 Hour: ${marketData.quote.USD.percent_change_1h}%
                - 24 Hours: ${marketData.quote.USD.percent_change_24h}%
                - 7 Days: ${marketData.quote.USD.percent_change_7d}%
                
                Supply:
                - Circulating: ${marketData.circulating_supply}
                - Total: ${marketData.total_supply}
                - Max: ${marketData.max_supply}
                
                ABI: ${JSON.stringify(abi)}
                Detected Price Anomalies: ${JSON.stringify(this.detectAnomalies(prices))}
                `
                        }
                    ],
                    model: 'meta-llama/Meta-Llama-3-70B-Instruct'
                });
                console.log('AI Response:', aiResponse);
                const analysis = aiResponse.choices[0].message.content || '';
                const riskScore = this.extractRiskScore(analysis);
                const riskAnalysis = {
                    riskScore,
                    riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW',
                    findings: this.extractFindings(analysis),
                    timestamp: Date.now()
                };
                this.riskAnalyses.set(contractAddress, riskAnalysis);
                return riskAnalysis;
            }
            catch (error) {
                console.error('Risk analysis error:', error);
                throw error;
            }
        });
    }
    extractRiskScore(analysis) {
        const scoreMatch = analysis.match(/risk score:?\s*(\d+)/i);
        return scoreMatch ? parseInt(scoreMatch[1]) : 50;
    }
    extractFindings(analysis) {
        return analysis
            .split(/[.\n]/)
            .map(f => f.trim())
            .filter(f => f.length > 0);
    }
    getRiskAnalysis(contractAddress) {
        return this.riskAnalyses.get(contractAddress);
    }
    detectAnomalies(prices) {
        //Implement z score algorithm to detect anomalies
        const zScores = [];
        const priceValues = prices.map(p => p.price);
        const mean = priceValues.reduce((acc, val) => acc + val, 0) / priceValues.length;
        const variance = priceValues.reduce((acc, val) => acc + Math.pow((val - mean), 2), 0) / priceValues.length;
        const stdDev = Math.sqrt(variance);
        for (let i = 0; i < priceValues.length; i++) {
            const zScore = (priceValues[i] - mean) / stdDev;
            if (Math.abs(zScore) > 2) {
                zScores.push({ date: prices[i].date, price: priceValues[i], zScore });
            }
        }
        return zScores;
    }
}
const analyzer = new CryptoRiskAnalyzer('05d617d5bb2ae9fd145c603619749e8c6629b3f79a1a99b1f8595b7cc86ece0c', 'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI', 'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYW1iaGF2amFpbjE3MDk0NEBnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MzQyOTF9.uqfJJdLlFrAy5ucKfmbjAM8QGCoWWW5fZzGMyfKQris');
analyzer.analyzeTokenRisk('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A', '2023-01-01', '2023-12-31')
    .then(result => console.log(result))
    .catch(error => console.error(error));
