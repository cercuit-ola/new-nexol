const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenAddresses = (process.env.SUPPORTED_TOKEN_ADDRESSES || "").split(",").map((v) => v.trim()).filter(Boolean);
  if (tokenAddresses.length === 0) throw new Error("Set SUPPORTED_TOKEN_ADDRESSES to comma-separated ERC-20 addresses");
  const escrow = await (await ethers.getContractFactory("NexolEscrow")).deploy(deployer.address);
  await escrow.waitForDeployment();
  const scheduler = await (await ethers.getContractFactory("NexolScheduler")).deploy(deployer.address);
  await scheduler.waitForDeployment();
  for (const token of tokenAddresses) {
    await (await escrow.setSupportedToken(token, true)).wait();
    await (await scheduler.setSupportedToken(token, true)).wait();
  }
  console.log(JSON.stringify({ network: network.name, deployer: deployer.address, escrow: escrow.target, scheduler: scheduler.target, supportedTokens: tokenAddresses }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
