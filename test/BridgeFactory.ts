import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BridgeFactory, WERC } from "../typechain-types/index.js";
// Coverate for % Branch is lower because of Reentrancy guard
/**
 * TODO:
 * 1) Run slither
 */
describe("BridgeFactory", function () {
  const NOT_OWNABLE_MSG = "Ownable: caller is not the owner";
  const initUserTokenAmount = 100;
  const tokenAmountToBridge = 10;

  let bridgeFactory;
  let bridgeA: BridgeFactory;
  let bridgeB: BridgeFactory;

  let wercTokenFactory;
  let wercTokenA: WERC;
  let wercTokenB: WERC;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  before(async () => {
    wercTokenFactory = await ethers.getContractFactory("WERC");
    wercTokenA = await wercTokenFactory.deploy();
    await wercTokenA.deployed();

    wercTokenB = await wercTokenFactory.deploy();
    await wercTokenB.deployed();

    bridgeFactory = await ethers.getContractFactory("BridgeFactory");
    bridgeA = await bridgeFactory.deploy();
    await bridgeA.deployed();

    bridgeB = await bridgeFactory.deploy();
    await bridgeB.deployed();
    [owner, addr1] = await ethers.getSigners();
  });

  // The order of it() matters as it simulates the actual workflow for lock-mint release-burn pattern
  it("Should lock tokens on BridgeA", async function () {
    await wercTokenA.connect(owner).mint(addr1.address, initUserTokenAmount);
    expect(await wercTokenA.totalSupply()).to.be.equal(initUserTokenAmount);
    expect(await wercTokenA.balanceOf(addr1.address)).to.be.equal(
      initUserTokenAmount
    );
    await bridgeA
      .connect(addr1)
      .lockToken(wercTokenA.address, tokenAmountToBridge);

    // Token has successfully been locked, so allowance is reduced;
    expect(
      await wercTokenA.allowance(addr1.address, bridgeA.address)
    ).to.be.equal(0);

    expect(await wercTokenA.balanceOf(addr1.address)).to.be.equal(90);
    expect(await wercTokenA.balanceOf(bridgeA.address)).to.be.equal(
      tokenAmountToBridge
    );

    expect(
      await bridgeA
        .connect(addr1)
        .getLockedTokensAmount(addr1.address, wercTokenA.address)
    ).to.be.equal(tokenAmountToBridge);
  });

  it("Should revert non-owner mint tokens on BridgeB", async function () {
    await expect(
      bridgeB
        .connect(addr1)
        .mintToken(wercTokenB.address, tokenAmountToBridge, addr1.address)
    ).to.be.revertedWith(NOT_OWNABLE_MSG);
  });

  it("Should owner mint tokens on BridgeB", async function () {
    expect(await wercTokenB.totalSupply()).to.be.equal(0);
    expect(await wercTokenB.balanceOf(addr1.address)).to.be.equal(0);
    expect(await wercTokenB.balanceOf(bridgeB.address)).to.be.equal(0);
    const minterRole = await wercTokenB.connect(owner).MINTER_ROLE();
    /**
     * 1) What is the best practice for setting up roles for the bridge in the token?
     *    - The bridge deploys the token, so it has all the 'admin' roles by default ?
     *  Bridge being the deployer is not the usual case. However, there are such cases like
     *  gnosis multisig wallet -  it has a factory contract that creates other contract
     *    - Or the owner sets these roles during bridge deploy time ?
     * Therefore the owner and the bridge will have admin roles.
     * 2) Consier adding other roles for 2nd case.
     */

    await wercTokenB.connect(owner).grantRole(minterRole, bridgeB.address);
    await bridgeB
      .connect(owner)
      .mintToken(wercTokenB.address, tokenAmountToBridge, addr1.address);
    expect(await wercTokenB.balanceOf(addr1.address)).to.be.equal(0);
    expect(await wercTokenB.balanceOf(bridgeB.address)).to.be.equal(
      tokenAmountToBridge
    );

    expect(
      await bridgeB
        .connect(addr1)
        .getClaimableTokensAmount(bridgeB.address, wercTokenB.address)
    ).to.be.equal(0);

    expect(
      await bridgeB
        .connect(addr1)
        .getClaimableTokensAmount(addr1.address, wercTokenB.address)
    ).to.be.equal(tokenAmountToBridge);
  });

  it("Should release tokens on BridgeB", async function () {
    expect(await wercTokenB.totalSupply()).to.be.equal(tokenAmountToBridge);
    expect(await wercTokenB.balanceOf(addr1.address)).to.be.equal(0);
    expect(await wercTokenB.balanceOf(bridgeB.address)).to.be.equal(
      tokenAmountToBridge
    );

    await bridgeB
      .connect(addr1)
      .releaseToken(wercTokenB.address, tokenAmountToBridge);

    expect(await wercTokenB.balanceOf(addr1.address)).to.be.equal(
      tokenAmountToBridge
    );
    expect(await wercTokenB.balanceOf(bridgeB.address)).to.be.equal(0);

    expect(
      await bridgeB
        .connect(addr1)
        .getClaimableTokensAmount(bridgeB.address, wercTokenB.address)
    ).to.be.equal(0);

    expect(
      await bridgeB
        .connect(addr1)
        .getClaimableTokensAmount(addr1.address, wercTokenB.address)
    ).to.be.equal(0);
  });

  it("Should revert non-owner burn tokens on BridgeA", async function () {
    await expect(
      bridgeA
        .connect(addr1)
        .burnToken(wercTokenA.address, tokenAmountToBridge, addr1.address)
    ).to.be.revertedWith(NOT_OWNABLE_MSG);
  });

  it("Should owner burn tokens on BridgeA", async function () {
    expect(await wercTokenA.totalSupply()).to.be.equal(initUserTokenAmount);
    expect(await wercTokenA.balanceOf(addr1.address)).to.be.equal(
      initUserTokenAmount - tokenAmountToBridge
    );
    expect(await wercTokenA.balanceOf(bridgeA.address)).to.be.equal(
      tokenAmountToBridge
    );
    await bridgeA
      .connect(owner)
      .burnToken(wercTokenA.address, tokenAmountToBridge, addr1.address);

    expect(await wercTokenA.balanceOf(addr1.address)).to.be.equal(
      initUserTokenAmount - tokenAmountToBridge
    );
    expect(await wercTokenA.balanceOf(bridgeA.address)).to.be.equal(0);

    expect(
      await bridgeA
        .connect(addr1)
        .getLockedTokensAmount(addr1.address, wercTokenA.address)
    ).to.be.equal(0);
  });
});
