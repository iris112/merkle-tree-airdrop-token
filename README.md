# Sturdy Token Contracts

Usage
===

1. Install Dependencies

`yarn install`

2. Run Tests

`yarn test`

Deployment
===

First you would need to create a local `.config.json` file in the root directory. 

A sample of the content is as follows:


```
{
  "mnemonic": "detect truck crouch case risk girl million hockey sick also absurd swim",
  "PK": "abcdefghijklmn...",
  "decimals": 18,
  "airdrop": {
    "0x016C8780e5ccB32E5CAA342a926794cE64d9C364": 10,
    "0x185a4dc360ce69bdccee33b3784b0282f7961aea": 100
  }
}
```

- `mnemonic`: The mnemonic of the deployer wallet
- `PK`: The private key of the deployer address
- `decimals`: The decimals of airdrop token
- `airdrop`: The claimable user's address and amount info

Once it's done you can run:

`yarn deploy`


Deploying on Mainnet
===
Please update the url i.e. `url: 'https://eth-mainnet.alchemyapi.io/v2/{alchemy_key}` basically you would need to add a valid alchemy key.

And then run:
`yarn deploy --network main`
