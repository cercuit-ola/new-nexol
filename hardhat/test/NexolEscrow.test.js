const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NexolEscrow", function () {
  async function fixture() {
    const [owner, payer, payee, stranger] = await ethers.getSigners();
    const token = await (await ethers.getContractFactory("MockERC20")).deploy();
    const escrow = await (await ethers.getContractFactory("NexolEscrow")).deploy(owner.address);
    await escrow.setSupportedToken(token.target, true);
    await token.mint(payer.address, 10_000_000n);
    await token.connect(payer).approve(escrow.target, 10_000_000n);
    return { owner, payer, payee, stranger, token, escrow };
  }
  it("funds atomically and releases only on payer approval", async function () {
    const { payer, payee, token, escrow } = await fixture();
    await expect(escrow.connect(payer).createEscrow(payee.address, token.target, 2_000_000n, 0, ethers.id("agreement"))).to.emit(escrow, "EscrowFunded");
    expect(await token.balanceOf(escrow.target)).to.equal(2_000_000n);
    await escrow.connect(payee).submitWork(1, ethers.id("evidence"));
    await expect(escrow.connect(payer).release(1)).to.changeTokenBalances(token, [escrow, payee], [-2_000_000n, 2_000_000n]);
    expect((await escrow.escrows(1)).status).to.equal(3);
  });
  it("allows the payee to refund but rejects unrelated callers", async function () {
    const { payer, payee, stranger, token, escrow } = await fixture();
    await escrow.connect(payer).createEscrow(payee.address, token.target, 1_000_000n, 0, ethers.ZeroHash);
    await expect(escrow.connect(stranger).refund(1)).to.be.revertedWithCustomError(escrow, "Unauthorized");
    await expect(escrow.connect(payee).refund(1)).to.changeTokenBalances(token, [escrow, payer], [-1_000_000n, 1_000_000n]);
  });
  it("freezes disputed funds until the owner resolves an exact split", async function () {
    const { owner, payer, payee, token, escrow } = await fixture();
    await escrow.connect(payer).createEscrow(payee.address, token.target, 2_000_000n, 0, ethers.ZeroHash);
    await escrow.connect(payee).raiseDispute(1, ethers.id("scope"));
    await expect(escrow.connect(payer).release(1)).to.be.revertedWithCustomError(escrow, "InvalidStatus");
    await expect(escrow.connect(owner).resolveDispute(1, 500_000n, 1_500_000n)).to.changeTokenBalances(token, [payer, payee], [500_000n, 1_500_000n]);
  });
  it("rejects invalid counterparties", async function () {
    const { payer, token, escrow } = await fixture();
    await expect(escrow.connect(payer).createEscrow(payer.address, token.target, 1n, 0, ethers.ZeroHash)).to.be.revertedWithCustomError(escrow, "InvalidAddress");
  });
});
