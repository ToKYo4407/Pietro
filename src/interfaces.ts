interface TokenHolding {
    contract_address: string;
    contract_name: string;
    contract_ticker_symbol: string;
    balance: string;
  }
  
  interface HistoricalPrice {
    contract_metadata: {
        contract_decimals: number;
        contract_name: string;
        contract_ticker_symbol: string;
        contract_address: string;
        supports_erc: string[];  // Adjust if needed
        logo_url: string;
    };
    date: string;
    price: number;
    pretty_price: string;
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
  