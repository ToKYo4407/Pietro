import axios from 'axios';

class UnifiedDataManager {
  private news: NewsDataItem[] = [];
  private signals: Map<string, TradingSignal[]> = new Map();
  private abis: Map<string, any> = new Map();
  public tokenHoldings: Map<string, TokenHolding[]> = new Map();
  public historicalPrices: Map<string, HistoricalPrice[]> = new Map();

  constructor(
    private cryptoApiKey: string,
    private etherscanApiKey: string,
    private covalentApiKey: string,
  ) {}

  async fetchTokenHoldings(walletAddress: string, chainName: string = 'eth-mainnet'): Promise<TokenHolding[]> {
    try {
      const url = `https://api.covalenthq.com/v1/${chainName}/address/${walletAddress}/balances_v2/`;
      const response = await axios.get(url, {
        params: { key: this.covalentApiKey }
      });

      const holdings = response.data.data.items;
      this.tokenHoldings.set(walletAddress, holdings);
      return holdings;
    } catch (error) {
      console.error('Error fetching token holdings:', error);
      return [];
    }
  }

  async fetchHistoricalPrices(
    tokenAddresses: string[],
    fromDate: string,
    toDate: string,
    chainName: string = 'eth-mainnet',
    quoteCurrency: string = 'USD'
  ): Promise<HistoricalPrice[]> {
    try {
      const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chainName}/${quoteCurrency}/${tokenAddresses.join(',')}/`;
      const response = await axios.get(url, {
        params: {
          key: this.covalentApiKey,
          from: fromDate,
          to: toDate,
        }
      });
       
      const prices = response.data.data[0]?.items || [];
      this.historicalPrices.set(tokenAddresses.join('-'), prices);
      console.log('Historical Prices:', prices);
      return prices;
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      return [];
    }
  }

  async fetchAndStoreABI(contractAddress: string): Promise<any> {
    try {
      const response = await axios.get('https://api.etherscan.io/api', {
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
    } catch (error) {
      console.error('ABI fetch error:', error);
      return null;
    }
  }

  async fetchAndStoreCryptoData(symbol: string): Promise<void> {
    const [newsData, signalsData] = await Promise.all([
      axios.get('https://min-api.cryptocompare.com/data/v2/news/', {
        params: { categories: 'Technology,Blockchain' },
        headers: { 'Authorization': `Apikey ${this.cryptoApiKey}` }
      }),
      axios.get('https://min-api.cryptocompare.com/data/tradingsignals/intotheblock/latest', {
        params: { fsym: symbol },
        headers: { 'Authorization': `Apikey ${this.cryptoApiKey}` }
      })
    ]);

    this.news = [...this.news, ...newsData.data.Data];
    const existingSignals = this.signals.get(symbol) || [];
    this.signals.set(symbol, [...existingSignals, signalsData.data.Data]);
  }

  getNews(): NewsDataItem[] {
    return this.news;
  }

  getSignals(symbol: string): TradingSignal[] {
    return this.signals.get(symbol) || [];
  }

  getABI(contractAddress: string): any {
    return this.abis.get(contractAddress);
  }

  getTokenHoldings(walletAddress: string): TokenHolding[] {
    return this.tokenHoldings.get(walletAddress) || [];
  }

  getHistoricalPrices(tokenAddresses: string[]): HistoricalPrice[] {
    return this.historicalPrices.get(tokenAddresses.join('-')) || [];
  }
}

// Usage example
async function main() {
  const manager = new UnifiedDataManager(
    'YOUR_CRYPTO_API_KEY',
    'YOUR_ETHERSCAN_API_KEY',
    'YOUR_COVALENT_API_KEY'
  );

  try {
    const walletAddress = '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A';
    const fromDate = '2023-01-01';
    const toDate = '2023-12-31';

    await Promise.all([
      manager.fetchAndStoreCryptoData('USDC'),
      manager.fetchTokenHoldings(walletAddress),
      manager.fetchAndStoreABI('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    ]);

    const holdings = manager.getTokenHoldings(walletAddress);
    if (holdings.length > 0) {
      const addresses = holdings.map(h => h.contract_address);
      await manager.fetchHistoricalPrices(addresses, fromDate, toDate);
    }

    console.log('Data fetched and stored successfully');
  } catch (error) {
    console.error('Error in main:', error);
  }
}

export default UnifiedDataManager;