import axios from 'axios';

// Covalent API Base URL
const COVALENT_API_URL = 'https://api.covalenthq.com/v1';
const API_KEY = 'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j'; // Replace with your Covalent API key
const WALLET_ADDRESS = '0xcDC5a5e232EEdC690128ADB5ca9c840C9F94c68A'; // Example wallet address
const CHAIN_NAME = 'eth-mainnet'; // Ethereum Mainnet (replace with the chain you need)
const QUOTE_CURRENCY = 'USD'; // Currency to convert (e.g., USD)

// Function to fetch token holdings of a specific wallet
const fetchTokenHoldings = async () => {
  const url = `https://api.covalenthq.com/v1/${CHAIN_NAME}/address/${WALLET_ADDRESS}/balances_v2/`;
  try {
    const response = await axios.get(url, {
      params: {
        key: API_KEY,
      },
    });

    // Extract token contract addresses
    const tokenAddresses = response.data.data.items.map((item: any) => item.contract_address);
    return tokenAddresses;
  } catch (error) {
    console.error('Error fetching token holdings:', (error as any).response ? (error as any).response.data : error);
    return [];
  }
};

// Function to fetch historical prices for token addresses
const fetchHistoricalPrices = async (tokenAddresses: string[], from: string, to: string) => {
const contractAddress = tokenAddresses.join(',')
  const url = `${COVALENT_API_URL}/pricing/historical_by_addresses_v2/${CHAIN_NAME}/${QUOTE_CURRENCY}/${contractAddress}/`;
  
  try {
    const response = await axios.get(url, {
      params: {
        key: API_KEY,// Correct parameter name
        from: from, // Start date (YYYY-MM-DD)
        to: to,     // End date (YYYY-MM-DD)
      },
    });

    // Process the historical price data
    console.log('Historical Prices:', response.data.data);
    const historicalData = response.data.data[0]?.items;
    return historicalData.map((item: any) => ({
      contract_address: item.contract_address,
      contract_name: item.contract_name,
      contract_ticker_symbol: item.contract_ticker_symbol,
      prices: item.prices,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching historical prices:', error.response ? error.response.data : error.message);
    } else {
      console.error('Error fetching historical prices:', error);
    }
    return [];
  }
};

// Function to fetch both token addresses and historical prices
const fetchAllData = async (from: string, to: string) => {
  const tokenAddresses = await fetchTokenHoldings();
  
  if (tokenAddresses.length === 0) {
    console.log('No token addresses found.');
    return;
  }

  const historicalPrices = await fetchHistoricalPrices(tokenAddresses, from, to);
  return historicalPrices;
};

// Example usage: Fetch historical prices for a date range
const fromDate = '2023-01-01'; // Example start date (YYYY-MM-DD)
const toDate = '2023-12-31';   // Example end date (YYYY-MM-DD)

fetchAllData(fromDate, toDate).then((data) => {
  console.log('Fetched Historical Prices:', data);
});
