import { ethers } from "hardhat";

// Define local network settings in order to interact with an already deployed contract on local node because
// default hardhat run-time server is different than running a hardhat node
export async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", signer.address);
  const Bridge_Factory = await ethers.getContractFactory("BridgeFactory");
  const bridge = await Bridge_Factory.connect(signer).deploy();
  await bridge.deployed();
  console.log(`The Bridge contract is deployed to ${bridge.address}`);
  // const owner = await bridge.owner();
  // console.log(`The Bridge contract owner is ${owner}`);
}
