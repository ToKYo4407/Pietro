import React, { useState } from 'react';
import { Wallet, Copy, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

const WalletInterface = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState('');

  const createNewWallet = () => {
    try {
      setStatus('Creating new wallet...');
      // Generate mock wallet address and secret key
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const mockSecret = Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setWalletAddress(mockAddress);
      setSecretKey(mockSecret);
      setStatus('Wallet created successfully!');
    } catch (error) {
      setStatus('Error creating wallet');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard!');
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wallet className="h-6 w-6" />
        Wallet Creator
      </div>

      {!walletAddress ? (
        <button
          onClick={createNewWallet}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create New Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Wallet Created Successfully!</AlertTitle>
            <AlertDescription>
              Please save your wallet address and secret key in a secure location. Never share your secret key with anyone.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet Address</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={walletAddress} 
                  readOnly 
                  className="w-full p-2 bg-gray-50 rounded border"
                />
                <button
                  onClick={() => copyToClipboard(walletAddress)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Secret Key</label>
              <div className="flex items-center gap-2">
                <input 
                  type={showSecret ? "text" : "password"} 
                  value={secretKey} 
                  readOnly 
                  className="w-full p-2 bg-gray-50 rounded border font-mono"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(secretKey)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          {status}
        </div>
      )}
    </div>
  );
};

export default WalletInterface;