import { expect } from "chai";
import { ethers } from "hardhat";
import { Leaderboard } from "../typechain-types";

describe("Leaderboard", () => {
  let leaderboard: Leaderboard;
  let owner: any;
  let signer: any;
  let player: any;
  let chainId: number;

  beforeEach(async () => {
    [owner, signer, player] = await ethers.getSigners();
    const Leaderboard = await ethers.getContractFactory("Leaderboard");
    leaderboard = await Leaderboard.deploy(owner.address, signer.address);
    await leaderboard.waitForDeployment();
    chainId = Number((await ethers.provider.getNetwork()).chainId);
  });

  async function signScore(score: number, nonce: number, deadline: number, playerAddr: string) {
    const domain = {
      name: "ArcMiniArcade",
      version: "1",
      chainId,
      verifyingContract: await leaderboard.getAddress(),
    };
    const types = {
      Score: [
        { name: "player", type: "address" },
        { name: "score", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    return signer.signTypedData(domain, types, {
      player: playerAddr,
      score,
      nonce,
      deadline,
    });
  }

  it("accepts a valid signed score and records high score", async () => {
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const sig = await signScore(100, 1, deadline, player.address);
    await expect(leaderboard.connect(player).submitScore(100, 1, deadline, sig))
      .to.emit(leaderboard, "NewHighScore")
      .withArgs(player.address, 100, 1);
    expect(await leaderboard.bestScore(player.address)).to.equal(100);
  });

  it("rejects a score signed by wrong key", async () => {
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const wrongDomain = {
      name: "ArcMiniArcade",
      version: "1",
      chainId,
      verifyingContract: await leaderboard.getAddress(),
    };
    const types = {
      Score: [
        { name: "player", type: "address" },
        { name: "score", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const badSig = await player.signTypedData(wrongDomain, types, {
      player: player.address,
      score: 9999,
      nonce: 1,
      deadline,
    });
    await expect(
      leaderboard.connect(player).submitScore(9999, 1, deadline, badSig)
    ).to.be.revertedWithCustomError(leaderboard, "InvalidSignature");
  });

  it("rejects a replayed nonce", async () => {
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const sig = await signScore(50, 7, deadline, player.address);
    await leaderboard.connect(player).submitScore(50, 7, deadline, sig);
    await expect(
      leaderboard.connect(player).submitScore(50, 7, deadline, sig)
    ).to.be.revertedWithCustomError(leaderboard, "NonceUsed");
  });

  it("rejects an expired score", async () => {
    const deadline = Math.floor(Date.now() / 1000) - 1;
    const sig = await signScore(10, 1, deadline, player.address);
    await expect(
      leaderboard.connect(player).submitScore(10, 1, deadline, sig)
    ).to.be.revertedWithCustomError(leaderboard, "DeadlinePassed");
  });
});
