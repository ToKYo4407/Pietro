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
class CryptoMetadataFetcher {
    constructor(apiKey, baseUrl = 'https://pro-api.coinmarketcap.com/v2') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json'
        };
    }
    fetchCoinMarketCapData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/cryptocurrency/info`, {
                    headers: this.headers,
                    params: {
                        symbol: symbol || 'USDC',
                    }
                });
                const tokenData = response.data.data[symbol][0];
                console.log(tokenData.urls);
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
    getCoreMetadata(identifiers_1) {
        return __awaiter(this, arguments, void 0, function* (identifiers, idType = 'symbol') {
            var _a;
            const identifierArray = Array.isArray(identifiers) ? identifiers : [identifiers];
            const metadata = {};
            for (const identifier of identifierArray) {
                const rawData = yield this.fetchCoinMarketCapData(identifier);
                metadata[identifier] = {
                    name: rawData.name,
                    symbol: rawData.symbol,
                    whitepaper: ((_a = rawData.urls.technical_doc) === null || _a === void 0 ? void 0 : _a[0]) || null,
                    description: rawData.description,
                    launch_date: rawData.date_launched || null,
                    tags: rawData.tags || [],
                    platform: rawData.platform ? {
                        name: rawData.platform.name,
                        symbol: rawData.platform.symbol
                    } : null
                };
            }
            return metadata;
        });
    }
    formatMetadataSummary(metadata) {
        return Object.values(metadata)
            .map(data => `--- ${data.name} (${data.symbol}) ---\nWhitepaper: ${data.whitepaper || 'Not available'}\nLaunch Date: ${data.launch_date || 'Not available'}\nTags: ${data.tags.length ? data.tags.join(', ') : 'None'}\nPlatform: ${data.platform ? `${data.platform.name} (${data.platform.symbol})` : 'Native Chain'}\nDescription: ${data.description.slice(0, 200)}...\n`)
            .join('\n');
    }
}
exports.default = CryptoMetadataFetcher;
