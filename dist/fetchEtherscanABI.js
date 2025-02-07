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
const axios = require('axios');
const getABI = (contractAddress, apiKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://api.etherscan.io/api`;
        const params = {
            module: 'contract',
            action: 'getabi',
            address: contractAddress,
            apikey: apiKey,
        };
        const response = yield axios.get(url, { params });
        if (response.data.status === '1') {
            const abi = JSON.parse(response.data.result);
            console.log('ABI:', abi);
            return abi;
        }
        else {
            console.error('Error fetching ABI:', response.data.result);
            return null;
        }
    }
    catch (error) {
        console.error('Error fetching ABI:', error);
        return null;
    }
});
// Example usage
const contractAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const apiKey = 'ACUZ4KME7A2WRPFPPWU2VWBXQS4AAMNQUI';
getABI(contractAddress, apiKey);
