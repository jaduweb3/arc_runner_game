import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-3xl">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">
          ← Home
        </Link>
      </div>
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="w-full max-w-3xl rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
        Wallet-gated to the contract owner. Season reset + game-speed tuning land in Phase 6.
      </div>
    </main>
  );
}
