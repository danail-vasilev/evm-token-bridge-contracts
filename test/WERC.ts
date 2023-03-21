import { expect } from "chai";
import { ethers } from "hardhat";
import { WERC } from "../typechain-types/index.js";

// TODO: Add unit test for permits
describe("WERC", function () {
  const initTokenAmount = 100;

  let wercTokenFactory;
  let wercToken: WERC;

  before(async () => {
    wercTokenFactory = await ethers.getContractFactory("WERC");
    wercToken = await wercTokenFactory.deploy();
    await wercToken.deployed();
  });
  // These two unit tests are just for interaction purpose;
  // Not needed as they should have already been covered by OpenZeppelin
  it("Should throw an error on minting/burning tokens by a non-owner", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const minterRole = await wercToken.MINTER_ROLE();
    expect(await wercToken.hasRole(minterRole, owner.address)).to.be.true;
    expect(await wercToken.hasRole(minterRole, addr1.address)).to.be.false;
    const initTokenAmount = 100;
    await expect(
      wercToken.connect(addr1).mint(addr1.address, initTokenAmount)
    ).to.be.revertedWith(
      "ERC20PresetMinterPauser: must have minter role to mint"
    );
    await expect(
      wercToken.connect(addr1).burn(initTokenAmount)
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  it("Should mint and burn tokens by owner", async function () {
    const [owner, addr1] = await ethers.getSigners();
    expect(await wercToken.totalSupply()).to.be.equal(0);
    expect(await wercToken.balanceOf(owner.address)).to.be.equal(0);
    expect(await wercToken.balanceOf(addr1.address)).to.be.equal(0);
    await wercToken.connect(owner).mint(owner.address, initTokenAmount);
    await wercToken.connect(owner).mint(addr1.address, initTokenAmount);
    expect(await wercToken.totalSupply()).to.be.equal(initTokenAmount * 2);
    expect(await wercToken.balanceOf(owner.address)).to.be.equal(
      initTokenAmount
    );
    expect(await wercToken.balanceOf(addr1.address)).to.be.equal(
      initTokenAmount
    );
    await wercToken.connect(addr1).burn(initTokenAmount / 2);
    expect(await wercToken.balanceOf(addr1.address)).to.be.equal(
      initTokenAmount / 2
    );
    expect(await wercToken.totalSupply()).to.be.equal(150);
  });
});
