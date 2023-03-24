import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_CHAIN_ID = process.env.SEPOLIA_CHAIN_ID as unknown as number;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const LOCAL_HOST_URL = process.env.LOCAL_HOST_URL;
const LOCAL_HOST_CHAIN_ID = process.env
  .LOCAL_HOST_CHAIN_ID as unknown as number;
const LOCAL_HOST_PRIVATE_KEY = process.env.LOCAL_HOST_PRIVATE_KEY;
const LOCAL_HOST_PRIVATE_KEY2 = process.env.LOCAL_HOST_PRIVATE_KEY2;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const lazyImport = async (module: any) => {
  return await import(module);
};

/**
 * Commands:
 * npx hardhat deploy-token --network local
 * npx hardhat deploy-bridge --network local
 * npx hardhat interact --network local
 */

task(
  "interact",
  "Interact with token and bridge contracts; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/interact");
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
  "deploy-token",
  "Deploys a token contract; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-token");
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
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY!],
      chainId: 11155111,
    },
    local: {
      url: LOCAL_HOST_URL,
      accounts: [LOCAL_HOST_PRIVATE_KEY!, LOCAL_HOST_PRIVATE_KEY2!],
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
