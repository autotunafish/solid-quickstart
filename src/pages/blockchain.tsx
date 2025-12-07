import { createSignal, Show, For, Suspense } from "solid-js";
import BlockchainData from "./blockchain.data";

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(4)}%`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
}

export default function Blockchain() {
  const data = BlockchainData();
  const [showRawJson, setShowRawJson] = createSignal(false);

  return (
    <section class="bg-amber-50 text-slate-700 p-6 rounded-lg max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-amber-800">Zcash Blockchain Info</h2>
        <button
          type="button"
          class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          onClick={() => setShowRawJson(!showRawJson())}
        >
          {showRawJson() ? "Hide Raw JSON" : "Show Raw JSON"}
        </button>
      </div>

      <Suspense
        fallback={
          <div class="flex items-center justify-center py-12">
            <div class="animate-pulse text-amber-600 text-lg">
              Loading blockchain data...
            </div>
          </div>
        }
      >
        <Show when={data()?.error}>
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <strong>Error:</strong> {data()?.error?.message}
          </div>
        </Show>

        <Show when={data()?.result}>
          <Show when={showRawJson()}>
            <div class="mb-6 bg-slate-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
              <pre class="text-sm font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(data(), null, 2)}
              </pre>
            </div>
          </Show>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Network Info */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Network
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Chain:</span>
                  <span class="font-mono font-medium text-amber-900">
                    {data()?.result?.chain}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Pruned:</span>
                  <span class="font-mono">
                    {data()?.result?.pruned ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Block Height */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Block Height
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Blocks:</span>
                  <span class="font-mono font-medium text-amber-900">
                    {formatNumber(data()?.result?.blocks || 0)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Headers:</span>
                  <span class="font-mono">
                    {formatNumber(data()?.result?.headers || 0)}
                  </span>
                </div>
                <Show when={data()?.result?.estimatedheight}>
                  <div class="flex justify-between">
                    <span class="text-slate-600">Estimated Height:</span>
                    <span class="font-mono">
                      {formatNumber(data()?.result?.estimatedheight || 0)}
                    </span>
                  </div>
                </Show>
              </div>
            </div>

            {/* Verification Progress */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Sync Status
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Progress:</span>
                  <span class="font-mono font-medium text-green-600">
                    {formatPercentage(data()?.result?.verificationprogress || 0)}
                  </span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                  <div
                    class="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${(data()?.result?.verificationprogress || 0) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Mining Info */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Mining
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Difficulty:</span>
                  <span class="font-mono text-sm">
                    {formatNumber(Math.round(data()?.result?.difficulty || 0))}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Size on Disk:</span>
                  <span class="font-mono">
                    {formatBytes(data()?.result?.size_on_disk || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Best Block Hash */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Best Block Hash
              </h3>
              <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                {data()?.result?.bestblockhash}
              </div>
            </div>

            {/* Chainwork */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Chainwork
              </h3>
              <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                {data()?.result?.chainwork}
              </div>
            </div>

            {/* Value Pools */}
            <Show
              when={
                data()?.result?.valuePools &&
                data()!.result!.valuePools.length > 0
              }
            >
              <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
                <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                  Value Pools
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <For each={data()?.result?.valuePools}>
                    {(pool) => (
                      <div class="bg-amber-50 p-3 rounded-lg">
                        <div class="font-semibold text-amber-800 capitalize">
                          {pool.id}
                        </div>
                        <div class="text-sm text-slate-600">
                          {formatNumber(pool.chainValue || 0)} ZEC
                        </div>
                        <div class="text-xs text-slate-500">
                          {pool.monitored ? "Monitored" : "Not Monitored"}
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Consensus */}
            <Show when={data()?.result?.consensus}>
              <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
                <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                  Consensus
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span class="text-slate-600 text-sm">Chain Tip:</span>
                    <div class="font-mono text-sm bg-slate-50 p-2 rounded mt-1">
                      {data()?.result?.consensus?.chaintip}
                    </div>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Next Block:</span>
                    <div class="font-mono text-sm bg-slate-50 p-2 rounded mt-1">
                      {data()?.result?.consensus?.nextblock}
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            {/* Upgrades */}
            <Show
              when={
                data()?.result?.upgrades &&
                Object.keys(data()!.result!.upgrades).length > 0
              }
            >
              <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
                <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                  Network Upgrades
                </h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="text-left text-slate-600 border-b">
                        <th class="pb-2 pr-4">Name</th>
                        <th class="pb-2 pr-4">Activation Height</th>
                        <th class="pb-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={Object.entries(data()?.result?.upgrades || {})}>
                        {([key, upgrade]) => (
                          <tr class="border-b border-slate-100">
                            <td class="py-2 pr-4 font-medium">{upgrade.name}</td>
                            <td class="py-2 pr-4 font-mono">
                              {formatNumber(upgrade.activationheight)}
                            </td>
                            <td class="py-2 pr-4">
                              <span
                                class={`px-2 py-1 rounded text-xs font-medium ${
                                  upgrade.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {upgrade.status}
                              </span>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </Suspense>
    </section>
  );
}
