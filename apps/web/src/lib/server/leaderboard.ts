import "server-only";
import type { Log } from "viem";
import { publicClient } from "@/lib/web3/publicClient";
import { LEADERBOARD_ABI, LEADERBOARD_ADDRESS } from "@/lib/web3/contract";

export type LeaderboardEntry = {
  player: `0x${string}`;
  score: string;
  block: string;
};

const MAX_RANGE = BigInt(9_500);
const LOOKBACK_BLOCKS = BigInt(200_000);
const ZERO = BigInt(0);
const ONE = BigInt(1);

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const seasonRaw = (await publicClient.readContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "season",
  })) as bigint;

  const latest = await publicClient.getBlockNumber();
  const startBlock = latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : ZERO;

  const ranges: Array<[bigint, bigint]> = [];
  for (let from = startBlock; from <= latest; from += MAX_RANGE + ONE) {
    const to = from + MAX_RANGE > latest ? latest : from + MAX_RANGE;
    ranges.push([from, to]);
  }

  const chunks = await Promise.all(
    ranges.map(([from, to]) =>
      publicClient.getContractEvents({
        address: LEADERBOARD_ADDRESS,
        abi: LEADERBOARD_ABI,
        eventName: "NewHighScore",
        args: { season: seasonRaw },
        fromBlock: from,
        toBlock: to,
      }),
    ),
  );

  const bestByPlayer = new Map<`0x${string}`, { score: bigint; block: bigint }>();
  for (const logs of chunks) {
    for (const log of logs as Array<Log & { args: { player?: `0x${string}`; score?: bigint } }>) {
      const player = log.args.player;
      const score = log.args.score;
      const block = log.blockNumber ?? ZERO;
      if (!player || score === undefined) continue;
      const prev = bestByPlayer.get(player);
      if (!prev || score > prev.score) {
        bestByPlayer.set(player, { score, block });
      }
    }
  }

  return Array.from(bestByPlayer.entries())
    .map(([player, { score, block }]) => ({
      player,
      score: score.toString(),
      block: block.toString(),
    }))
    .sort((a, b) => (BigInt(b.score) > BigInt(a.score) ? 1 : -1))
    .slice(0, 100);
}
