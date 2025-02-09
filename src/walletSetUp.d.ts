

/**
 * Initializes the Coinbase SDK.
 */
declare function initializeCoinbase(): void;

/**
 * Creates a new wallet and saves the encrypted seed file.
 * @returns {Promise<WalletCreationResult>} The result of wallet creation.
 */
declare function createWallet(): Promise<WalletCreationResult>;

/**
 * Retrieves an existing wallet using its ID.
 * @param {string} walletId - The unique wallet identifier.
 * @param {string} [networkId="eth-sepolia"] - The network to use.
 * @returns {Promise<WalletRetrievalResult>} The retrieved wallet details.
 */
declare function retrieveWallet(walletId: string, networkId?: string): Promise<WalletRetrievalResult>;

export { initializeCoinbase, createWallet, retrieveWallet, WalletCreationResult, WalletRetrievalResult };
