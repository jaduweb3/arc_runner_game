# 🎮 ARC Mini Arcade

> A Web3 2D endless runner on **Arc Testnet** — connect your wallet, jump over hazards, and submit your score on-chain.

[![Live on Arc Testnet](https://img.shields.io/badge/Live-Arc%20Testnet-10b981?style=flat-square)](https://testnet.arcscan.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Phaser](https://img.shields.io/badge/Phaser-3-9333ea?style=flat-square)](https://phaser.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🚀 Live demo

- **Leaderboard contract:** [`0xefADb2d60aDc715dF2817aBeE525834bBd47BE8f`](https://testnet.arcscan.app/address/0xefADb2d60aDc715dF2817aBeE525834bBd47BE8f)
- **Explorer:** https://testnet.arcscan.app
- **RPC:** `https://rpc.testnet.arc.network` · Chain ID `5042002`

---

## ✨ Features

- 🏃 **2D endless runner** — built with Phaser 3, smooth physics, speed ramp, score climb
- 🎨 **3 themes** — Arc / Crypto, Jungle, Space — swap on the fly
- 👤 **3 skins** — Default, Soldier, Adventurer — each with run animation
- 🔐 **Wallet-gated** — RainbowKit + wagmi + viem, MetaMask & WalletConnect
- ✍️ **EIP-712 anti-cheat** — server signs every score before it goes on-chain; replays + over-claims rejected
- 🏆 **On-chain leaderboard** — live podium + table fed from contract events
- 📱 **Mobile-friendly** — tap to jump, responsive layout
- 🌌 **Polished UI** — gradient hero, parallax background, animated state transitions

---

## 🧱 Tech stack

| Layer            | Choice                                                                   |
|------------------|--------------------------------------------------------------------------|
| Framework        | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4                   |
| Game engine      | Phaser 3                                                                 |
| State            | Zustand (persisted theme + skin)                                         |
| Web3 client      | wagmi v2 + viem + RainbowKit                                             |
| Smart contracts  | Solidity 0.8.28 + Hardhat + OpenZeppelin (Ownable, EIP712, ECDSA)        |
| Anti-cheat       | EIP-712 typed-data signatures, HMAC-signed session tokens                |
| Backend          | Next.js API routes (no separate Node server)                             |
| Hosting target   | Vercel (frontend) · Arc Testnet (contract)                               |
| Art              | [Kenney.nl](https://kenney.nl) — CC0 platformer pack + characters + backgrounds |

---

## 📦 Repo layout

```
arc-mini-arcade/
├── apps/web/                                 # Next.js app (frontend + API routes)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Home (hero + theme/skin pickers)
│   │   │   ├── play/page.tsx                 # Game + on-chain submit flow
│   │   │   ├── leaderboard/page.tsx          # Live podium + table
│   │   │   ├── admin/page.tsx                # Owner-only admin (planned)
│   │   │   └── api/
│   │   │       ├── score/start/route.ts      # Issue HMAC session token
│   │   │       ├── score/sign/route.ts       # Validate + EIP-712 sign score
│   │   │       └── leaderboard/route.ts      # Aggregate on-chain events
│   │   ├── components/
│   │   │   ├── GameContainer.tsx             # Phaser host
│   │   │   ├── ThemePicker.tsx               # Theme cards w/ real images
│   │   │   ├── SkinPicker.tsx                # Skin cards w/ run animation
│   │   │   └── WalletButton.tsx              # RainbowKit ConnectButton
│   │   ├── game/
│   │   │   ├── createGame.ts                 # Phaser game factory
│   │   │   └── scenes/                       # BootScene + GameScene
│   │   └── lib/
│   │       ├── game/                         # theme + skin config
│   │       ├── store/settings.ts             # Zustand persisted store
│   │       ├── web3/                         # wagmi + chain + contract ABI
│   │       └── server/                       # session HMAC + EIP-712 signer
│   └── public/assets/kenney/                 # CC0 game art
└── packages/contracts/                       # Hardhat project
    ├── contracts/Leaderboard.sol             # EIP-712 verified score submissions
    ├── scripts/deploy.ts                     # Deployment script
    └── test/Leaderboard.test.ts              # 4 anti-cheat tests
```

---

## 🛡️ Anti-cheat flow

The hardest problem in a Web3 high-score game is **stopping people from calling `submitScore(99999999)` directly**. We solve it with EIP-712 signed scores:

```
┌─────────────┐  1. POST {player}            ┌──────────────┐
│   Browser   │ ───────────────────────────▶│  API server  │
│   (Phaser)  │ ◀─── 2. HMAC session token ──│              │
└─────────────┘                              └──────────────┘
       │                                            ▲
       │ 3. Play game                               │
       │                                            │
       │ 4. POST {token, score, player}             │
       │ ──────────────────────────────────────────▶│
       │                                            │ Server checks:
       │                                            │  - HMAC token valid
       │                                            │  - score ≤ 12 × elapsed_seconds
       │                                            │  - replay nonce unused
       │ ◀── 5. EIP-712 sig + deadline + nonce ─────│
       │                                            │
       │ 6. submitScore(score, nonce, deadline, sig)
       │ ───────────────────────────────────────────────────▶
       │                                                 ┌──────────┐
       │                                                 │ Contract │
       │                                                 │ verifies │
       │                                                 │ signer   │
       │                                                 └──────────┘
```

- The score-signer private key **lives only on the server**, never shipped to the client.
- The smart contract enforces `recovered_signer == scoreSigner` on every call.
- A direct call to `submitScore(...)` without a valid signature reverts with `InvalidSignature`.
- Replay protection via per-season nonce mapping.

---

## ⚡ Quick start

### Prerequisites

- Node.js 18+
- npm 9+
- A wallet (MetaMask recommended) for testing

### 1. Install

```bash
git clone https://github.com/jaduweb3/arc_runner_game.git
cd arc_runner_game
npm install
```

### 2. Configure environment

Copy the example files and fill in your secrets (none are committed):

```bash
cp .env.example apps/web/.env.local
cp .env.example packages/contracts/.env
```

**`apps/web/.env.local`** — needs:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_WC_PROJECT_ID` | Free at https://cloud.reown.com |
| `NEXT_PUBLIC_LEADERBOARD_ADDRESS` | Filled in automatically after deploy |
| `SCORE_SIGNER_PRIVATE_KEY` | Private key of any wallet — used only for signing scores server-side |
| `SERVER_HMAC_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**`packages/contracts/.env`** — needs:

| Variable | Notes |
|---|---|
| `DEPLOYER_PRIVATE_KEY` | Testnet-only burner wallet, fund from https://faucet.circle.com |
| `CONTRACT_OWNER_ADDRESS` | Wallet that should own the deployed contract (admin powers) |
| `SCORE_SIGNER_ADDRESS` | Public address corresponding to `SCORE_SIGNER_PRIVATE_KEY` |

### 3. Run

```bash
# Terminal 1 — dev server
npm run dev

# Terminal 2 — compile + test contracts
npm run contracts:compile
npm run contracts:test
```

Open http://localhost:3000.

### 4. Deploy contracts (only needed once, or for a fresh contract)

```bash
npm run contracts:deploy:arc
```

The deployed address is printed. Paste it into `apps/web/.env.local` as `NEXT_PUBLIC_LEADERBOARD_ADDRESS`.

---

## 🔧 Smart contract overview

[`Leaderboard.sol`](packages/contracts/contracts/Leaderboard.sol) is a season-based score registry with EIP-712 verified submissions.

```solidity
function submitScore(
    uint256 score,
    uint256 nonce,
    uint256 deadline,
    bytes calldata signature
) external;
```

Reverts on:
- `InvalidSignature` — signature does not match `scoreSigner`
- `NonceUsed` — replay protection (per `(player, nonce, season)`)
- `DeadlinePassed` — signature expired

**Owner-only:**
- `setScoreSigner(address)` — rotate the anti-cheat key
- `resetSeason()` — wipe the leaderboard and start fresh

**Read-only:**
- `bestScore(address)` — query a player's best
- `season()` — current season
- `playerCount()` / `playerAt(i)` — iterate the registry

---

## 🌐 Arc Testnet config

Add this network in your wallet:

| Field | Value |
|---|---|
| **Network name** | Arc Testnet |
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Chain ID** | `5042002` |
| **Symbol** | `USDC` (yes, USDC is the native gas token) |
| **Explorer** | `https://testnet.arcscan.app` |
| **Faucet** | https://faucet.circle.com |

---

## 🗺️ Roadmap

- [x] Phase 1 — Phaser endless runner core
- [x] Phase 2 — Wallet gate (RainbowKit + Arc Testnet)
- [x] Phase 3 — EIP-712 anti-cheat + on-chain submit
- [x] Phase 4 — Live leaderboard from chain events
- [x] Phase 5 — Themes + skins (Kenney.nl CC0 art)
- [ ] Phase 6 — Sound effects, mobile polish, owner admin panel
- [ ] Future — NFT skin rewards · multiplayer · tournaments · multi-game arcade

---

## 🎨 Credits

- Art: [Kenney.nl](https://kenney.nl) — Platformer Pack Remastered, Background Elements, Platformer Characters (CC0)
- Smart contract libraries: [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- Wallet UX: [RainbowKit](https://www.rainbowkit.com)

---

## 📄 License

MIT
