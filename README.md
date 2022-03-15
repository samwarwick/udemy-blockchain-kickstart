# udemy-blockchain-lottery

Completed Kickstart (CrowdCoint) project exercise from Udemy course [Ethereum and Solidity: The Complete Developer's Guide](https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/).

### Stack
* Node 14
* Solidity 0.8.x
* Truffle (HDWallet)
* Ganache CLI
* Web3
* Mocha
* React + Next

### Compile
`cd ethereum; node compile`

### Test
`npm test`

### Deploy

To deploy the Campaign contract to the Rinkeby testnet:
1. Create a `.env` file in the project root.
2. Add entries for MNEMONIC and PROVIDER_URL. e.g. 
```
MNEMONIC="alpha ... lima"
NEXT_PUBLIC_PROVIDER_URL="https://rinkeby.infura.io/v3/<PROJECT_ID>"
```
3. Run `cd ethereum; node deploy`

### User Interface (React)

1. Add/update NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS in `.env` to reflect the deployed Factory contract. e.g.
```
NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=0x60f1...567F
```
2. `npm run dev`
3. http://localhost:3000/
