const axios = require('axios');

const getABI = async (contractAddress: string, apiKey: string) => {
  try {
    const url = `https://api.etherscan.io/api`;
    const params = {
      module: 'contract',
      action: 'getabi',
      address: contractAddress,
      apikey: apiKey,
    };

    const response = await axios.get(url, { params });

    if (response.data.status === '1') {
      const abi = JSON.parse(response.data.result);
      console.log('ABI:', abi);
      return abi;
    } else {
      console.error('Error fetching ABI:', response.data.result);
      return null;
    }
  } catch (error) {
    console.error('Error fetching ABI:', error);
    return null;
  }
};

// Example usage
const contractAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const apiKey = 'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI';
getABI(contractAddress, apiKey);
