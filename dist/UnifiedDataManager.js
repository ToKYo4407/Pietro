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
const axios_1 = __importDefault(require("axios"));
class UnifiedDataManager {
    constructor(cryptoApiKey, etherscanApiKey, covalentApiKey) {
        this.cryptoApiKey = cryptoApiKey;
        this.etherscanApiKey = etherscanApiKey;
        this.covalentApiKey = covalentApiKey;
        this.news = [];
        this.signals = new Map();
        this.abis = new Map();
        this.tokenHoldings = new Map();
        this.historicalPrices = new Map();
    }
    fetchTokenHoldings(walletAddress_1) {
        return __awaiter(this, arguments, void 0, function* (walletAddress, chainName = 'eth-mainnet') {
            try {
                const url = `https://api.covalenthq.com/v1/${chainName}/address/${walletAddress}/balances_v2/`;
                const response = yield axios_1.default.get(url, {
                    params: { key: this.covalentApiKey }
                });
                const holdings = response.data.data.items;
                this.tokenHoldings.set(walletAddress, holdings);
                return holdings;
            }
            catch (error) {
                console.error('Error fetching token holdings:', error);
                return [];
            }
        });
    }
    fetchHistoricalPrices(tokenAddresses_1, fromDate_1, toDate_1) {
        return __awaiter(this, arguments, void 0, function* (tokenAddresses, fromDate, toDate, chainName = 'eth-mainnet', quoteCurrency = 'USD') {
            var _a;
            try {
                const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chainName}/${quoteCurrency}/${tokenAddresses.join(',')}/`;
                const response = yield axios_1.default.get(url, {
                    params: {
                        key: this.covalentApiKey,
                        from: fromDate,
                        to: toDate,
                    }
                });
                const prices = ((_a = response.data.data[0]) === null || _a === void 0 ? void 0 : _a.items) || [];
                this.historicalPrices.set(tokenAddresses.join('-'), prices);
                console.log('Historical Prices:', prices);
                return prices;
            }
            catch (error) {
                console.error('Error fetching historical prices:', error);
                return [];
            }
        });
    }
    fetchAndStoreABI(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get('https://api.etherscan.io/api', {
                    params: {
                        module: 'contract',
                        action: 'getabi',
                        address: contractAddress,
                        apikey: this.etherscanApiKey,
                    }
                });
                if (response.data.status === '1') {
                    const abi = JSON.parse(response.data.result);
                    this.abis.set(contractAddress, abi);
                    return abi;
                }
                return null;
            }
            catch (error) {
                console.error('ABI fetch error:', error);
                return null;
            }
        });
    }
    fetchAndStoreCryptoData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const [newsData, signalsData] = yield Promise.all([
                axios_1.default.get('https://min-api.cryptocompare.com/data/v2/news/', {
                    params: { categories: 'Technology,Blockchain' },
                    headers: { 'Authorization': `Apikey ${this.cryptoApiKey}` }
                }),
                axios_1.default.get('https://min-api.cryptocompare.com/data/tradingsignals/intotheblock/latest', {
                    params: { fsym: symbol },
                    headers: { 'Authorization': `Apikey ${this.cryptoApiKey}` }
                })
            ]);
            this.news = [...this.news, ...newsData.data.Data];
            const existingSignals = this.signals.get(symbol) || [];
            this.signals.set(symbol, [...existingSignals, signalsData.data.Data]);
        });
    }
    getNews() {
        return this.news;
    }
    getSignals(symbol) {
        return this.signals.get(symbol) || [];
    }
    getABI(contractAddress) {
        return this.abis.get(contractAddress);
    }
    getTokenHoldings(walletAddress) {
        return this.tokenHoldings.get(walletAddress) || [];
    }
    getHistoricalPrices(tokenAddresses) {
        return this.historicalPrices.get(tokenAddresses.join('-')) || [];
    }
}
// Usage example
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = new UnifiedDataManager('YOUR_CRYPTO_API_KEY', 'YOUR_ETHERSCAN_API_KEY', 'YOUR_COVALENT_API_KEY');
        try {
            const walletAddress = '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A';
            const fromDate = '2023-01-01';
            const toDate = '2023-12-31';
            yield Promise.all([
                manager.fetchAndStoreCryptoData('USDC'),
                manager.fetchTokenHoldings(walletAddress),
                manager.fetchAndStoreABI('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
            ]);
            const holdings = manager.getTokenHoldings(walletAddress);
            if (holdings.length > 0) {
                const addresses = holdings.map(h => h.contract_address);
                yield manager.fetchHistoricalPrices(addresses, fromDate, toDate);
            }
            console.log('Data fetched and stored successfully');
        }
        catch (error) {
            console.error('Error in main:', error);
        }
    });
}
exports.default = UnifiedDataManager;
