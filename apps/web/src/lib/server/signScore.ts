import "server-only";
import { privateKeyToAccount } from "viem/accounts";
import { LEADERBOARD_ADDRESS } from "@/lib/web3/contract";
import { arcTestnet } from "@/lib/web3/chain";

const EIP712_DOMAIN = {
  name: "ArcMiniArcade",
  version: "1",
  chainId: arcTestnet.id,
  verifyingContract: LEADERBOARD_ADDRESS,
} as const;

const EIP712_TYPES = {
  Score: [
    { name: "player", type: "address" },
    { name: "score", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export async function signScoreEIP712(args: {
  player: `0x${string}`;
  score: bigint;
  nonce: bigint;
  deadline: bigint;
}): Promise<`0x${string}`> {
  const pk = process.env.SCORE_SIGNER_PRIVATE_KEY;
  if (!pk) throw new Error("SCORE_SIGNER_PRIVATE_KEY is not set");
  const account = privateKeyToAccount(pk as `0x${string}`);
  return account.signTypedData({
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    primaryType: "Score",
    message: args,
  });
}
