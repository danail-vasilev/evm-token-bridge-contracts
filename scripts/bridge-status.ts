import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/src/signers";
import { getBridgeData } from "./bridge-util";

export async function main() {
  const data = await getBridgeData();
  await logBridgeState(data.token, data.bridge, data.owner, data.user);
}

async function logBridgeState(
  token: Contract,
  bridge: Contract,
  owner: SignerWithAddress,
  user: SignerWithAddress
) {
  const totalSupply = await token.totalSupply();
  const userBalance = await token.balanceOf(user.address);
  const ownerBalance = await token.balanceOf(owner.address);
  const bridgeBalance = await token.balanceOf(bridge.address);
  console.log(
    `\nToken Balance (${token.address}):\nTotal supply:${totalSupply}\nUser balance: ${userBalance}\n` +
      `Owner balance: ${ownerBalance}\nBridge balance: ${bridgeBalance}\n`
  );

  const userToBridgeTokenAllowance = await token.allowance(
    user.address,
    bridge.address
  );

  const userLockedTokensBridge = await bridge
    .connect(user)
    .getLockedTokensAmount(user.address, token.address);

  const userClaimableTokensBridge = await bridge
    .connect(user)
    .getClaimableTokensAmount(user.address, token.address);

  console.log(
    `User: ${user.address}\nBridge: ${bridge.address}\nToken: ${token.address}\n` +
      `User to bridge token allowance: ${userToBridgeTokenAllowance}\n` +
      `User locked tokens in bridge: ${userLockedTokensBridge}\n` +
      `User claimable tokens in bridge: ${userClaimableTokensBridge}\n`
  );
}
