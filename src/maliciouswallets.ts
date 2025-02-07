export const getDataFromCovalentAPI = (URL: string) => {
    let headers = new Headers()
    const COVALENT_API_KEY = 'cqt_rQXTQQDygJt9C3vPYTvPV7qgYR7j' // Insert your API Key
    headers.set('Authorization', 'Basic ' + btoa(COVALENT_API_KEY));
    return fetch(URL, { method: 'GET', headers: headers }).then((resp) => {
      if (resp.status === 200) return resp.json()
      else throw new Error('Invalid response')
    })
  }
  
  const filterSuspiciousWallet = (data: any[], walletAddress: string) => {
      const filteredTransactions = data.filter(transaction => transaction.from_address === walletAddress || transaction.to_address === walletAddress)
      return filteredTransactions
  }
  
  const main = () => {
      const url = 'https://api.covalenthq.com/v1/eth-mainnet/block/16176246/transactions_v3/'
      getDataFromCovalentAPI(url)
          .then(res => console.log(filterSuspiciousWallet(res.data.items, '0x4fa0002e68e600f30c04119d1ba86eb1c243be39')))
  }
  
  main()