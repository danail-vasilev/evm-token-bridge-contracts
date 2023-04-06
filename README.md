# EVM ERC-20 Token Bridge

## Introduction

This is a sample EVM ERC-20 Token Bridge project. It contains:

- Two smart contracts - one for the ERC20 token and the other for the bridge itself.
- Simple relayer that connects bridges from both network (i.e., listen and emits events).
- Scripts for interaction with the bridge

## Test Networks Workflow

1. Feed owner and user accounts with ethers on both networks.

2. Deploy token and bridge contracts on both test networks (e.g., sepolia and goerli)

2.1 Network A (sepolia):

```node
npx hardhat deploy-token --network sepolia
npx hardhat deploy-bridge --network sepolia
```

2.2 Network B (goerli):

```node
npx hardhat deploy-token --network goerli
npx hardhat deploy-bridge --network goerli
```

3. Run relayer

```node
npx hardhat relayer
```

4. Interact with bridge:

4.1 Script interaction - See point 5 and 6 from 'Local Networks Workflow' section.

4.2 Frontend interact - See [EVM ERC-20 Token Bridge App](https://github.com/danail-vasilev/evm-token-bridge-frontend) for details

## Local Networks Workflow (Setup, deploy and interact)

The following provides steps for deploying and interacting with a 2 way ERC-20 Token Bridge

1. Run 2 local networks:

1.1 Run hardhat node:

```node
npx hardhat node
```

1.2 Run ganache
Use the same mnemonic when running/resetting ganache, in order to have consistent accounts

2. Feed owner and user accounts with ethers on both networks:

```node
npx hardhat transfer-ether --network local
npx hardhat transfer-ether --network ganache
```

3. Deploy token and bridge contracts on both networks

3.1 Network A (hardhat):

```node
npx hardhat deploy-token --network local
npx hardhat deploy-bridge --network local
```

3.2 Network B (ganache):

```node
npx hardhat deploy-token --network ganache
npx hardhat deploy-bridge --network ganache
```

Note: Contract's address is derived from the deployer account's address and transactions' nonce.
That's why both contracts have the same addresses on both networks - because they are deployed from
the same account for the first time.

4. Run relayer

```node
npx hardhat relayer-local
```

5. Transfer token on network A (hardhat)

5.1 Transfer token

```node
npx hardhat transfer-token --network local
```

5.2 Check bridges state

```node
npx hardhat bridge-status --network local
npx hardhat bridge-status --network ganache
```

6. Claim token on network B (ganache)

6.1 Claim token

```node
npx hardhat claim-token --network ganache
```

6.2 Check bridges state

```node
npx hardhat bridge-status --network local
npx hardhat bridge-status --network ganache
```
