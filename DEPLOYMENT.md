# Deploying ARC Mini Arcade to Vercel

This guide walks you through deploying the frontend to Vercel and connecting it to the already-deployed Leaderboard contract on Arc Testnet.

> **The contract is already live.** This guide only covers the frontend.
> Contract: [`0xefADb2d60aDc715dF2817aBeE525834bBd47BE8f`](https://testnet.arcscan.app/address/0xefADb2d60aDc715dF2817aBeE525834bBd47BE8f)

---

## ⚠️ Before you start

You need:

1. A **Vercel account** (free) — https://vercel.com/signup (sign in with GitHub for easiest setup)
2. A **WalletConnect Project ID** — https://cloud.reown.com (free, 30 seconds)
3. The **`SCORE_SIGNER_PRIVATE_KEY`** that corresponds to the address the contract trusts (`0x16d6B6c730Ac73dcE92208cbFFd97A5f91a6F7D3`). This is the key currently in `apps/web/.env.local` locally.

⚠️ **Never paste the score-signer private key into chat, Slack, screenshots, or commits. It signs all on-chain scores.**

---

## Step 1 — Import the GitHub repo into Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Find `jaduweb3/arc_runner_game` and click **Import**
4. On the **Configure Project** screen:
   - **Project Name:** `arc-mini-arcade` (or whatever)
   - **Framework Preset:** Next.js (should auto-detect after the next step)
   - **Root Directory:** click **Edit** → choose **`apps/web`** ← **this is critical**
   - **Build & Output Settings:** leave defaults (Next.js defaults work)

Setting **Root Directory to `apps/web`** is what makes Vercel treat the Next.js app as the project root, rather than the monorepo root. Don't skip this.

---

## Step 2 — Set environment variables

Still on the Configure Project screen, expand **Environment Variables** and add each row:

### Public variables (safe to expose to the browser)

| Key | Value |
|---|---|
| `NEXT_PUBLIC_WC_PROJECT_ID` | Your WalletConnect Project ID from cloud.reown.com |
| `NEXT_PUBLIC_ARC_RPC_URL` | `https://rpc.testnet.arc.network` |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | `5042002` |
| `NEXT_PUBLIC_ARC_EXPLORER` | `https://testnet.arcscan.app` |
| `NEXT_PUBLIC_LEADERBOARD_ADDRESS` | `0xefADb2d60aDc715dF2817aBeE525834bBd47BE8f` |

### Secret variables (server-only — never prefixed with `NEXT_PUBLIC_`)

| Key | Value |
|---|---|
| `SCORE_SIGNER_PRIVATE_KEY` | Hex string `0x…` from your local `apps/web/.env.local` |
| `SERVER_HMAC_SECRET` | Generate fresh: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

> Tip: set each variable's **Environment** to all three (Production, Preview, Development) so preview deploys also work.

---

## Step 3 — Deploy

Click **Deploy**. First build takes 2–4 minutes.

When it finishes, Vercel gives you a URL like `https://arc-mini-arcade.vercel.app`.

---

## Step 4 — Whitelist your domain in WalletConnect

1. Go back to https://cloud.reown.com → your project → **Settings**
2. Under **Allowed domains**, add your Vercel URL (e.g. `arc-mini-arcade.vercel.app`)
3. Save

Without this, mobile wallets (WalletConnect QR) won't be able to connect.

---

## Step 5 — Smoke test the deploy

Open your Vercel URL and verify:

- [ ] Home page loads, theme + skin pickers show real images
- [ ] **Connect Wallet** opens the modal, **Injected Wallet** connects MetaMask
- [ ] After connecting, RainbowKit prompts to add/switch to Arc Testnet
- [ ] `/play` loads the game, character runs, obstacles spawn
- [ ] Game over → **Submit on-chain** signs and submits successfully
- [ ] `/leaderboard` shows your score on the podium
- [ ] Open DevTools → Network tab → confirm `/api/score/start` and `/api/score/sign` return 200

If any step fails, check **Vercel → Deployments → [latest] → Function Logs** for the API route errors.

---

## Step 6 — Custom domain (optional)

In Vercel: **Settings → Domains → Add**. Add your domain, follow DNS instructions. Don't forget to also add the custom domain to the WalletConnect allowed domains list (Step 4).

---

## How re-deploys work

Every push to `main` on GitHub triggers a fresh Vercel deploy automatically. Pushes to other branches create **Preview deploys** at unique URLs — useful for reviewing changes before merging.

To trigger a manual rebuild without code changes: Vercel → Deployments → … menu on latest → **Redeploy**.

---

## Updating environment variables

If you rotate `SCORE_SIGNER_PRIVATE_KEY` or change any env var:

1. Update it in **Vercel → Settings → Environment Variables**
2. Click the … on the latest deployment → **Redeploy** (env changes don't auto-trigger a deploy)
3. If you rotated the score signer key, also call `setScoreSigner(newAddress)` on the contract (only the contract owner can do this)

---

## Production hardening already in place

The frontend ships with:

- **Security headers** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (configured in `apps/web/next.config.ts`)
- **Long-lived cache** for Kenney CC0 assets (`/assets/kenney/*` → 1 year immutable)
- **`poweredByHeader: false`** — strips the `X-Powered-By: Next.js` header
- **No source maps in production** — `productionBrowserSourceMaps: false`
- **SSR-safe wagmi config** — `ssr: true` so the wallet state hydrates correctly

---

## Things to consider for serious production traffic

These aren't blockers for testnet MVP but matter if you scale up:

- **Rate-limit `/api/score/start`** — currently anyone can spam token requests. Add Upstash Redis + a rate limiter (1 token per IP per 30s) if abuse is a concern.
- **RPC reliability** — the public Arc Testnet RPC is fine for low traffic; if you hit limits, sign up for a dedicated Arc RPC provider and put it in `NEXT_PUBLIC_ARC_RPC_URL`.
- **Leaderboard indexing** — `/api/leaderboard` reads events from the chain every 10s. At thousands of players this should move to a Supabase / Postgres indexer that streams events into a DB.
- **Monitoring** — add Sentry for error tracking (`@sentry/nextjs`).
- **Rotate the score signer key** — the testnet key was used locally during development. For prod, generate a fresh wallet, set its address as the contract's `scoreSigner` via `setScoreSigner()`, and put its private key in Vercel only.

---

## Troubleshooting

**Build fails with "Cannot find module 'phaser'"**
→ Root Directory isn't set to `apps/web`. Fix it in Project Settings.

**Wallet connects but switch-to-Arc fails**
→ Check the chain config matches in `apps/web/src/lib/web3/chain.ts` and that the RPC URL env var is correct.

**`/api/score/sign` returns 500**
→ `SCORE_SIGNER_PRIVATE_KEY` or `SERVER_HMAC_SECRET` is missing/malformed. Check Vercel env vars are set and the key has the `0x` prefix.

**`submitScore` reverts with `InvalidSignature`**
→ The `SCORE_SIGNER_PRIVATE_KEY` in Vercel doesn't match the `scoreSigner` address stored in the contract. Either change Vercel's env to use the right key, or call `setScoreSigner(newAddress)` on the contract.

**Leaderboard always loads but shows no entries**
→ The contract address env var (`NEXT_PUBLIC_LEADERBOARD_ADDRESS`) is wrong, or you redeployed the contract to a new address and Vercel still points at the old one. Update the env var and redeploy.
