import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";
import {
  HardhatRuntimeEnvironment,
  HttpNetworkUserConfig,
} from "hardhat/types";
import { getBridgeDataWithSigners } from "./bridge-util";

export async function main(
  hre: HardhatRuntimeEnvironment,
  networkNameA: string,
  networkNameB: string
) {
  const hardhatConfig: any = hre.config;
  // Retrieve the network configuration from the Hardhat config file
  const networkConfigA: HttpNetworkUserConfig = hardhatConfig.networks?.[
    networkNameA
  ] as HttpNetworkUserConfig;
  const networkConfigB: HttpNetworkUserConfig = hardhatConfig.networks?.[
    networkNameB
  ] as HttpNetworkUserConfig;
  const signersA = await getSignersFromConfig(networkConfigA);
  const signersB = await getSignersFromConfig(networkConfigB);
  const bridgeDataA = await getBridgeDataWithSigners(
    signersA[0],
    signersA[1],
    networkConfigA.chainId
  );
  const bridgeDataB = await getBridgeDataWithSigners(
    signersB[0],
    signersB[1],
    networkConfigB.chainId
  );

  attachEvents(
    bridgeDataA.bridge,
    bridgeDataA.token,
    bridgeDataA.owner,
    bridgeDataB.bridge,
    bridgeDataB.token,
    bridgeDataB.owner
  );

  // Run relayer for 1 hour
  await new Promise((resolve) => setTimeout(resolve, 60000 * 60));
}

function attachEvents(
  bridgeA: ethers.Contract,
  tokenA: ethers.Contract,
  ownerA: SignerWithAddress,
  bridgeB: ethers.Contract,
  tokenB: ethers.Contract,
  ownerB: SignerWithAddress
) {
  bridgeA.on(
    "TokensLocked",
    async (
      senderAddress: string,
      tokenAddress: string,
      tokenAmount: number
    ) => {
      console.log(
        `\nTokensLocked (BridgeA) emitted with args:\nsenderAddress=${senderAddress}\n` +
          `tokenAddress=${tokenAddress}\ntokenAmount=${tokenAmount}`
      );
      // TODO: This must be moved in/after deploying contracts' script
      const minterRole = await tokenB.connect(ownerB).MINTER_ROLE();
      await tokenB.connect(ownerB).grantRole(minterRole, bridgeB.address);

      await bridgeB
        .connect(ownerB)
        .mintToken(tokenAddress, tokenAmount, senderAddress);
    }
  );

  bridgeB.on(
    "TokensLocked",
    async (
      senderAddress: string,
      tokenAddress: string,
      tokenAmount: number
    ) => {
      console.log(
        `\nTokensLocked (BridgeB) emitted with args:\nsenderAddress=${senderAddress}\n` +
          `tokenAddress=${tokenAddress}\ntokenAmount=${tokenAmount}`
      );

      // TODO: This must be moved in/after deploying contracts' script
      const minterRole = await tokenA.connect(ownerA).MINTER_ROLE();
      await tokenA.connect(ownerA).grantRole(minterRole, bridgeA.address);
      await bridgeA
        .connect(ownerA)
        .mintToken(tokenAddress, tokenAmount, senderAddress);
    }
  );

  bridgeB.on(
    "TokensReleased",
    async (
      senderAddress: string,
      tokenAddress: string,
      tokenAmount: number
    ) => {
      console.log(
        `\nTokensReleased (BridgeB) emitted with args:\nsenderAddress=${senderAddress}\n` +
          `tokenAddress=${tokenAddress}\ntokenAmount=${tokenAmount}`
      );
      await bridgeA
        .connect(ownerA)
        .burnToken(tokenAddress, tokenAmount, senderAddress);
      // TODO: Log data
    }
  );

  bridgeA.on(
    "TokensReleased",
    async (
      senderAddress: string,
      tokenAddress: string,
      tokenAmount: number
    ) => {
      console.log(
        `\nTokensReleased (BridgeA) emitted with args:\nsenderAddress=${senderAddress}\n` +
          `tokenAddress=${tokenAddress}\ntokenAmount=${tokenAmount}`
      );
      await bridgeB
        .connect(ownerB)
        .burnToken(tokenAddress, tokenAmount, senderAddress);
      // TODO: Log data
    }
  );
}

async function getSignersFromConfig(
  networkConfig: HttpNetworkUserConfig
): Promise<SignerWithAddress[]> {
  if (!networkConfig) {
    throw new Error(`Network not found in Hardhat config file.`);
  }

  // Retrieve the accounts array from the network configuration
  const accounts: string[] = networkConfig.accounts as string[];
  if (!accounts?.length) {
    throw new Error(
      `Accounts not configured for network in Hardhat config file.`
    );
  }

  // Create and return the signers using ethers.js
  return accounts.map(
    (account) =>
      new ethers.Wallet(
        account,
        new ethers.providers.JsonRpcProvider(networkConfig.url)
      )
  );
}
