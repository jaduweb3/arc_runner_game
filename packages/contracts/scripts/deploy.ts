import { ethers } from "hardhat";

async function main() {
  const ownerAddress = process.env.CONTRACT_OWNER_ADDRESS;
  const signerAddress = process.env.SCORE_SIGNER_ADDRESS;

  if (!ownerAddress) throw new Error("CONTRACT_OWNER_ADDRESS env var required");
  if (!signerAddress) throw new Error("SCORE_SIGNER_ADDRESS env var required");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  console.log("Owner will be:", ownerAddress);
  console.log("Score signer:", signerAddress);

  const Leaderboard = await ethers.getContractFactory("Leaderboard");
  const leaderboard = await Leaderboard.deploy(ownerAddress, signerAddress);
  await leaderboard.waitForDeployment();

  const address = await leaderboard.getAddress();
  console.log("Leaderboard deployed at:", address);
  console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
