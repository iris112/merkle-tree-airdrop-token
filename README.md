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
  "mnemonic": "detect truck crouch case risk girl million hockey sick also absurd swim"
}
```

- `mnemonic`: The mnemonic of the deployer wallet

Once it's done you can run:

`yarn deploy`


Deploying on Mainnet
===
Please update the url i.e. `url: 'https://eth-mainnet.alchemyapi.io/v2/{alchemy_key}` basically you would need to add a valid alchemy key.

And then run:
`yarn deploy --network main`
