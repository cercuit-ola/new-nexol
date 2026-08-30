const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NexolScheduler", function () {
  async function fixture() {
    const [owner, payer, recipient, keeper] = await ethers.getSigners();
    const token = await (await ethers.getContractFactory("MockERC20")).deploy();
    const scheduler = await (await ethers.getContractFactory("NexolScheduler")).deploy(owner.address);
    await scheduler.setSupportedToken(token.target, true);
    await token.mint(payer.address, 10_000_000n);
    await token.connect(payer).approve(scheduler.target, 10_000_000n);
    return { payer, recipient, keeper, token, scheduler };
  }
  it("escrows the total and lets any keeper release due installments", async function () {
    const { payer, recipient, keeper, token, scheduler } = await fixture();
    const start = (await time.latest()) + 100;
    await scheduler.connect(payer).createSchedule(recipient.address, token.target, 4_000_000n, start, 3600, 4, ethers.id("payroll"));
    expect(await token.balanceOf(scheduler.target)).to.equal(4_000_000n);
    await expect(scheduler.connect(keeper).executePayment(1)).to.be.revertedWithCustomError(scheduler, "PaymentNotDue");
    await time.increaseTo(start);
    await scheduler.connect(keeper).executePayment(1);
    expect(await token.balanceOf(recipient.address)).to.equal(1_000_000n);
    const [needed] = await scheduler.checkUpkeep(ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1]));
    expect(needed).to.equal(false);
  });
  it("pays the division remainder in the last installment", async function () {
    const { payer, recipient, token, scheduler } = await fixture();
    const start = (await time.latest()) + 10;
    await scheduler.connect(payer).createSchedule(recipient.address, token.target, 10n, start, 10, 3, ethers.ZeroHash);
    await time.increaseTo(start); await scheduler.executePayment(1);
    await time.increaseTo(start + 10); await scheduler.executePayment(1);
    await time.increaseTo(start + 20); await scheduler.executePayment(1);
    expect(await token.balanceOf(recipient.address)).to.equal(10n);
    expect((await scheduler.schedules(1)).status).to.equal(2);
  });
  it("returns all unreleased funds when the payer cancels", async function () {
    const { payer, recipient, keeper, token, scheduler } = await fixture();
    const start = (await time.latest()) + 10;
    await scheduler.connect(payer).createSchedule(recipient.address, token.target, 4_000_000n, start, 20, 4, ethers.ZeroHash);
    await time.increaseTo(start); await scheduler.connect(keeper).executePayment(1);
    await expect(scheduler.connect(payer).cancelSchedule(1)).to.changeTokenBalances(token, [scheduler, payer], [-3_000_000n, 3_000_000n]);
  });
});
