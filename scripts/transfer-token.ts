import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/src/signers";
import { getBridgeData } from "./bridge-util";

const initUserTokenAmount = 100;
const tokenAmountToBridge = 10;

export async function main() {
  const data = await getBridgeData();
  await lockToken(data.token, data.bridge, data.owner, data.user);
}

async function lockToken(
  token: Contract,
  bridge: Contract,
  owner: SignerWithAddress,
  user: SignerWithAddress
) {
  // The owner mints tokens to the user
  await token.connect(owner).mint(user.address, initUserTokenAmount);
  // The user locks token in the bridge
  await bridge.connect(user).lockToken(token.address, tokenAmountToBridge);
}
