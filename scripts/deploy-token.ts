import { ethers } from "hardhat";

// Define local network settings in order to interact with an already deployed contract on local node because
// default hardhat run-time server is different than running a hardhat node
export async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", signer.address);
  const WERCToken_Factory = await ethers.getContractFactory("WERC");
  const WERCToken = await WERCToken_Factory.connect(signer).deploy();
  await WERCToken.deployed();
  const WERCTokenAddress = WERCToken.address;
  console.log(`The WERC Token contract is deployed to ${WERCTokenAddress}`);
}
