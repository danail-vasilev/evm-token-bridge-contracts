import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;

const GANACHE_URL = process.env.GANACHE_URL;
const GANACHE_CHAIN_ID = Number(process.env.GANACHE_CHAIN_ID);
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;

const HARDHAT_URL = process.env.HARDHAT_URL;
const HARDHAT_CHAIN_ID = Number(process.env.HARDHAT_CHAIN_ID);
const HARDHAT_PRIVATE_KEY = process.env.HARDHAT_PRIVATE_KEY;

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const SEPOLIA_CHAIN_ID = Number(process.env.SEPOLIA_CHAIN_ID);

const GOERLI_INFURA_RPC_URL = process.env.GOERLI_INFURA_RPC_URL;
const GOERLI_CHAIN_ID = Number(process.env.GOERLI_CHAIN_ID);

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const lazyImport = async (module: any) => {
  return await import(module);
};

task("relayer-local", "Runs relayer").setAction(
  async (taskArgs: {}, hre: HardhatRuntimeEnvironment) => {
    const { main } = await lazyImport("./scripts/relayer");
    const networkA = "local";
    const networkB = "ganache";
    await main(hre, networkA, networkB);
  }
);

task("relayer", "Runs relayer").setAction(
  async (taskArgs: {}, hre: HardhatRuntimeEnvironment) => {
    const { main } = await lazyImport("./scripts/relayer");
    const networkA = "sepolia";
    const networkB = "goerli";
    await main(hre, networkA, networkB);
  }
);

task(
  "bridge-status",
  "Logs bridge state - token amount and allowance for user, owner and bridge; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/bridge-status");
  await main();
});

task(
  "transfer-ether",
  "Tranfers ether from local network account to owner and user accounts; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/transfer-ether");
  await main();
});

task(
  "deploy-token",
  "Deploys a token contract; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-token");
  await main();
});

task(
  "deploy-bridge",
  "Deploys a bridge contract; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-bridge");
  await main();
});

task(
  "transfer-token",
  "Transfer the token to bridge; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/transfer-token");
  await main();
});

task(
  "claim-token",
  "Claim the token from the bridge; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/claim-token");
  await main();
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [OWNER_PRIVATE_KEY!, USER_PRIVATE_KEY!],
      chainId: SEPOLIA_CHAIN_ID,
    },
    goerli: {
      url: GOERLI_INFURA_RPC_URL,
      accounts: [OWNER_PRIVATE_KEY!, USER_PRIVATE_KEY!],
      chainId: GOERLI_CHAIN_ID,
    },
    local: {
      url: HARDHAT_URL,
      accounts: [OWNER_PRIVATE_KEY!, USER_PRIVATE_KEY!, HARDHAT_PRIVATE_KEY!],
      chainId: HARDHAT_CHAIN_ID,
    },
    ganache: {
      url: GANACHE_URL,
      accounts: [OWNER_PRIVATE_KEY!, USER_PRIVATE_KEY!, GANACHE_PRIVATE_KEY!],
      chainId: GANACHE_CHAIN_ID,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
