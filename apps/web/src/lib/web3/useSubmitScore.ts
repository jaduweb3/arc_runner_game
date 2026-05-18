"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { LEADERBOARD_ABI, LEADERBOARD_ADDRESS } from "./contract";

type SignResponse = {
  score: string;
  nonce: string;
  deadline: string;
  signature: `0x${string}`;
};

export type SubmitState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "sending" }
  | { status: "mining"; hash: `0x${string}` }
  | { status: "success"; hash: `0x${string}` }
  | { status: "error"; message: string };

export function useSubmitScore() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const submit = useCallback(
    async (sessionToken: string, score: number) => {
      if (!address || !walletClient || !publicClient) {
        setState({ status: "error", message: "Wallet not connected" });
        return;
      }

      try {
        setState({ status: "signing" });
        const res = await fetch("/api/score/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: sessionToken, score, player: address }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error || `sign request failed (${res.status})`);
        }
        const signed = (await res.json()) as SignResponse;

        setState({ status: "sending" });
        const hash = await walletClient.writeContract({
          address: LEADERBOARD_ADDRESS,
          abi: LEADERBOARD_ABI,
          functionName: "submitScore",
          args: [BigInt(signed.score), BigInt(signed.nonce), BigInt(signed.deadline), signed.signature],
        });

        setState({ status: "mining", hash });
        await publicClient.waitForTransactionReceipt({ hash });
        setState({ status: "success", hash });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown error";
        setState({ status: "error", message });
      }
    },
    [address, walletClient, publicClient],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
