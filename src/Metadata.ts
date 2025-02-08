import axios from 'axios';

interface CryptoUrls {
  technical_doc?: string[] | null;
}

interface RawCryptoData {
  urls: CryptoUrls;
  name: string;
  symbol: string;
  description: string;
  date_launched?: string;
  tags?: string[];
  platform?: {
    name: string;
    symbol: string;
  } | null;
}

interface ProcessedCryptoData {
  name: string;
  symbol: string;
  whitepaper: string | null;
  description: string;
  launch_date: string | null;
  tags: string[];
  platform: {
    name: string;
    symbol: string;
  } | null;
}

type IdType = 'symbol' | 'id' | 'slug' | 'address';

class CryptoMetadataFetcher {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(apiKey: string, baseUrl: string = 'https://pro-api.coinmarketcap.com/v2') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json'
    };
  }

  private async fetchCoinMarketCapData(symbol: string): Promise<RawCryptoData> {
    try {
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/info`, {
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
    } catch (error) {
      console.error('Error fetching CoinMarketCap data:', error);
      throw error;
    }
  }

  async getCoreMetadata(
    identifiers: string | string[],
    idType: IdType = 'symbol'
  ): Promise<Record<string, ProcessedCryptoData>> {
    const identifierArray = Array.isArray(identifiers) ? identifiers : [identifiers];
    const metadata: Record<string, ProcessedCryptoData> = {};
    for (const identifier of identifierArray) {
      const rawData = await this.fetchCoinMarketCapData(identifier);
      metadata[identifier] = {
        name: rawData.name,
        symbol: rawData.symbol,
        whitepaper: rawData.urls.technical_doc?.[0] || null,
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
  }

  formatMetadataSummary(metadata: Record<string, ProcessedCryptoData>): string {
    return Object.values(metadata)
      .map(data => `--- ${data.name} (${data.symbol}) ---\nWhitepaper: ${data.whitepaper || 'Not available'}\nLaunch Date: ${data.launch_date || 'Not available'}\nTags: ${data.tags.length ? data.tags.join(', ') : 'None'}\nPlatform: ${data.platform ? `${data.platform.name} (${data.platform.symbol})` : 'Native Chain'}\nDescription: ${data.description.slice(0, 200)}...\n`)
      .join('\n');
  }
}

export default CryptoMetadataFetcher;
