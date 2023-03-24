import { ethers, network } from "hardhat";
import Bridge from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json";
import WERC from "../artifacts/contracts/WERC.sol/WERC.json";
import "dotenv/config";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/src/signers";

const GOERLI_LIBTOKEN_CONTRACT = process.env.GOERLI_LIBTOKEN_CONTRACT;
const GOERLI_BOOKLIB_CONTRACT = process.env.GOERLI_BOOKLIB_CONTRACT;

const SEPOLIA_LIBTOKEN_CONTRACT = process.env.SEPOLIA_LIBTOKEN_CONTRACT;
const SEPOLIA_BOOKLIB_CONTRACT = process.env.SEPOLIA_BOOKLIB_CONTRACT;

const LOCAL_HOST_WERC_TOKEN_CONTRACT =
  process.env.LOCAL_HOST_WERC_TOKEN_CONTRACT;
const LOCAL_HOST_BRIDGE_CONTRACT = process.env.LOCAL_HOST_BRIDGE_CONTRACT;

const GOERLI_CHAIN_ID = process.env.GOERLI_CHAIN_ID;
const SEPOLIA_CHAIN_ID = process.env.SEPOLIA_CHAIN_ID;
const LOCAL_HOST_CHAIN_ID = process.env.LOCAL_HOST_CHAIN_ID;
const LOCAL_HOST_CHAIN_ID2 = process.env.LOCAL_HOST_CHAIN_ID2;

const initUserTokenAmount = 100;
const tokenAmountToBridge = 10;

// Define local network settings in order to interact with an already deployed contract on local node because
// default hardhat run-time server is different than running a hardhat node
export async function main() {
  const [owner, user] = await ethers.getSigners();
  // Use provider from hardhat config
  // Both are the same
  const provider = owner.provider;
  //let provider = ethers.provider;

  // Contracts are already deployed to corresponding network. Based on the network use related contract address.
  const contractAddresses: string[] = getContractAddressesFromChainId();
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
  // const bookLibrary = new ethers.Contract(contractAddress, contractAbi, provider);
  // 2) Reference contract with wallet:

  const WERCToken = new ethers.Contract(WERCTokenAddress, WERCTokenAbi, owner);
  const bridge = new ethers.Contract(bridgeAddress, BridgeAbi, owner);

  await bridgeLock(WERCToken, bridge, owner, user);
}

function getContractAddressesFromChainId() {
  const chainId = network.config.chainId;
  console.log(chainId);
  // TODO: Check whether we can set chain id to hardhat
  if (chainId == LOCAL_HOST_CHAIN_ID || chainId == LOCAL_HOST_CHAIN_ID2) {
    // hardhat local network
    return [LOCAL_HOST_WERC_TOKEN_CONTRACT, LOCAL_HOST_BRIDGE_CONTRACT];
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

async function bridgeLock(
  wercTokenA: Contract,
  bridgeA: Contract,
  owner: SignerWithAddress,
  user: SignerWithAddress
) {
  await wercTokenA.connect(owner).mint(user.address, initUserTokenAmount);
  console.log(`wercTokenA.totalSupply: ${await wercTokenA.totalSupply()}`); // initUserTokenAmount
  console.log(
    `wercTokenA.balanceOf(user.address): ${await wercTokenA.balanceOf(
      user.address
    )}`
  ); // initUserTokenAmount
  await bridgeA
    .connect(user)
    .lockToken(wercTokenA.address, tokenAmountToBridge);

  // Token has successfully been locked, so allowance is reduced;
  console.log(
    `wercTokenA.allowance(user.address, bridgeA.address): ${await wercTokenA.allowance(
      user.address,
      bridgeA.address
    )}`
  ); // 0

  console.log(
    `wercTokenA.balanceOf(user.address): ${await wercTokenA.balanceOf(
      user.address
    )}`
  ); // 90
  console.log(
    `wercTokenA.balanceOf(bridgeA.address): ${await wercTokenA.balanceOf(
      bridgeA.address
    )}`
  ); // tokenAmountToBridge;

  console.log(
    `getLockedTokensAmount(user.address, wercTokenA.address): ${await bridgeA
      .connect(user)
      .getLockedTokensAmount(user.address, wercTokenA.address)}`
  ); // tokenAmountToBridge
}
