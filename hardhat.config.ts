import {config as dotenvConfig} from 'dotenv';
import config from './.config.json';
import {resolve} from 'path';
dotenvConfig({ path: resolve(__dirname, './.env') })

import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-deploy";
// import "@openzeppelin/hardhat-upgrades";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

import "./hardhat/tasks";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports =  {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      accounts: config.PK ? {privateKey: config.PK} : {mnemonic: config.mnemonic},
    },
    main: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      gas: 'auto',
      chainId: 1,
      accounts: config.PK ? [config.PK] : {mnemonic: config.mnemonic},
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY ? ETHERSCAN_API_KEY : "",
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
}
