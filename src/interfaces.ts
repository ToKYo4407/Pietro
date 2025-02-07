interface TokenHolding {
    contract_address: string;
    contract_name: string;
    contract_ticker_symbol: string;
    balance: string;
  }
  
  interface HistoricalPrice {
    contract_address: string;
    contract_name: string;
    contract_ticker_symbol: string;
    prices: Array<{
      date: string;
      price: number;
    }>;
  }
  
  interface NewsDataItem {
    id: string;
    published_on: number;
    title: string;
    url: string;
    body: string;
    categories: string;
    source: string;
  }
  
  interface SignalMetric {
    category: string;
    sentiment: string;
    value: number;
    score: number;
  }
  
  interface TradingSignal {
    id: number;
    time: number;
    symbol: string;
    inOutVar: SignalMetric;
    addressesNetGrowth: SignalMetric;
    concentrationVar: SignalMetric;
    largetxsVar: SignalMetric;
  }
  