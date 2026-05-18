export const LEADERBOARD_ADDRESS = (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const LEADERBOARD_ABI = [
  {
    type: "function",
    name: "submitScore",
    stateMutability: "nonpayable",
    inputs: [
      { name: "score", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "bestScore",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "season",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "ScoreSubmitted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "season", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "NewHighScore",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "season", type: "uint256", indexed: true },
    ],
  },
] as const;
