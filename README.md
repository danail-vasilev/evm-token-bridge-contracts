# EVM ERC20 Token Bridge

Local Networks Workflow

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
npx hardhat relayer
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
