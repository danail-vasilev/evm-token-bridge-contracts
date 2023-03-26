import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/src/signers";
import { getBridgeData } from "./bridge-util";
import { IBridgeFactory } from "../typechain-types";

const tokenAmountToBridge = 10;

export async function main() {
  const data = await getBridgeData();
  await releaseToken(data.token, data.bridge, data.user);
}

async function releaseToken(
  token: Contract,
  bridge: IBridgeFactory | Contract,
  user: SignerWithAddress
) {
  // The user claims the token from the bridge
  await bridge.connect(user).releaseToken(token.address, tokenAmountToBridge);
}
