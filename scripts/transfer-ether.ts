import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
/**
 * This is needed for local networks only. We use the same accounts on both local networks and we want
 * to 'feed' them with ether from test accounts provided by the local networks.
 */
export async function main() {
  const [owner, user, profit] = await ethers.getSigners();
  await sendEther(profit, owner);
  await sendEther(profit, user);

  await getBalance("owner", owner);
  await getBalance("user", user);
  await getBalance("profit", profit);
}

async function sendEther(
  fromSigner: SignerWithAddress,
  toSigner: SignerWithAddress,
  eth: string = "10"
) {
  const transaction = {
    to: toSigner.address,
    value: ethers.utils.parseEther(eth),
  };

  try {
    const tx = await fromSigner.sendTransaction(transaction);
    await tx.wait(1);
    console.log("Transaction sent:", tx.hash);
  } catch (e) {
    console.error("Transaction failed:", e);
  }
}

async function getBalance(signerType: string, signer: SignerWithAddress) {
  const balance = await signer.getBalance();
  console.log(`${signerType}: ${ethers.utils.formatEther(balance)}`);
}
