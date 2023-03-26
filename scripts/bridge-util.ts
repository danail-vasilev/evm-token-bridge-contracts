import { ethers, network } from "hardhat";
import "dotenv/config";
import Bridge from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json";
import WERC from "../artifacts/contracts/WERC.sol/WERC.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const GOERLI_LIBTOKEN_CONTRACT = process.env.GOERLI_LIBTOKEN_CONTRACT;
const GOERLI_BOOKLIB_CONTRACT = process.env.GOERLI_BOOKLIB_CONTRACT;

const SEPOLIA_LIBTOKEN_CONTRACT = process.env.SEPOLIA_LIBTOKEN_CONTRACT;
const SEPOLIA_BOOKLIB_CONTRACT = process.env.SEPOLIA_BOOKLIB_CONTRACT;

const HARDHAT_WERC_TOKEN_CONTRACT = process.env.HARDHAT_WERC_TOKEN_CONTRACT;
const HARDHAT_BRIDGE_CONTRACT = process.env.HARDHAT_BRIDGE_CONTRACT;
const GANACHE_WERC_TOKEN_CONTRACT = process.env.GANACHE_WERC_TOKEN_CONTRACT;
const GANACHE_BRIDGE_CONTRACT = process.env.GANACHE_BRIDGE_CONTRACT;

const GOERLI_CHAIN_ID = Number(process.env.GOERLI_CHAIN_ID);
const SEPOLIA_CHAIN_ID = Number(process.env.SEPOLIA_CHAIN_ID);
const HARDHAT_CHAIN_ID = Number(process.env.HARDHAT_CHAIN_ID);
const HARDHAT_CHAIN_ID2 = Number(process.env.HARDHAT_CHAIN_ID2);
const GANACHE_CHAIN_ID = Number(process.env.GANACHE_CHAIN_ID);

export async function getBridgeData() {
  const [owner, user] = await ethers.getSigners();
  return getBridgeDataWithSigners(owner, user, network.config.chainId);
}

export async function getBridgeDataWithSigners(
  owner: SignerWithAddress,
  user: SignerWithAddress,
  chainId: number | string | undefined
) {
  // Use provider from hardhat config
  // Both are the same
  const provider = owner.provider;
  //let provider = ethers.provider;

  // Contracts are already deployed to corresponding network. Based on the network use related contract address.
  const contractAddresses: string[] = getContractAddressesFromChainId(chainId);
  const WERCTokenAddress = contractAddresses[0];
  const bridgeAddress = contractAddresses[1];

  const WERCTokenAbi = WERC.abi;
  await doesContractExist(provider, WERCTokenAddress);
  console.log("WERC token contract address:", WERCTokenAddress);

  const BridgeAbi = Bridge.abi;
  await doesContractExist(provider, bridgeAddress);
  console.log("Bridge contract address:", bridgeAddress);

  // const wallet = new ethers.Wallet(privateKey, provider);
  // 1) Reference contract with provider:
  // const bridge = new ethers.Contract(contractAddress, contractAbi, provider);
  // 2) Reference contract with wallet:

  const WERCToken = new ethers.Contract(WERCTokenAddress, WERCTokenAbi, owner);
  const bridge = new ethers.Contract(bridgeAddress, BridgeAbi, owner);

  return { owner: owner, user: user, token: WERCToken, bridge: bridge };
}

function getContractAddressesFromChainId(chainId: number | string | undefined) {
  console.log(chainId);
  if (chainId == HARDHAT_CHAIN_ID) {
    // local network
    return [HARDHAT_WERC_TOKEN_CONTRACT, HARDHAT_BRIDGE_CONTRACT];
  } else if (chainId == GANACHE_CHAIN_ID) {
    // ganache network
    return [GANACHE_WERC_TOKEN_CONTRACT, GANACHE_BRIDGE_CONTRACT];
  } else if (chainId == GOERLI_CHAIN_ID) {
    // goerli network
    return [GOERLI_LIBTOKEN_CONTRACT, GOERLI_BOOKLIB_CONTRACT];
  } else if (chainId == SEPOLIA_CHAIN_ID) {
    return [SEPOLIA_LIBTOKEN_CONTRACT, SEPOLIA_BOOKLIB_CONTRACT];
  } else {
    console.warn("No contracts");
    return;
  }
}

async function doesContractExist(provider: any, contractAddress: string) {
  // Test the connection
  // console.log(await provider.getBlock("latest"));
  // Test whether the contract exists by checking its code
  try {
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("The contract does not exist");
    } else {
      console.log("The contract exists");
      // You can now interact with the contract using the 'contract' instance
    }
  } catch (error) {
    console.error("Failed to check contract code:", error);
  }
}
