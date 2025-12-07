import { createSignal, Show, For, Suspense, createMemo } from "solid-js";
import { A, useParams } from "@solidjs/router";
import BlockData from "./block.data";

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

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
}

// Helper to determine if the identifier is a block hash (64-char hex) or block height
function isBlockHash(identifier: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(identifier);
}

export default function Block() {
  const params = useParams<{ identifier: string }>();
  const data = BlockData();
  const [showRawJson, setShowRawJson] = createSignal(false);

  // Determine if we searched by hash or height for display purposes
  const searchedByHash = createMemo(() => isBlockHash(params.identifier));

  return (
    <section class="bg-amber-50 text-slate-700 p-6 rounded-lg max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <A
            href="/blockchain"
            class="text-amber-600 hover:text-amber-800 transition-colors"
          >
            &larr; Back to Blockchain
          </A>
          <h2 class="text-3xl font-bold text-amber-800">
            <Show
              when={data()?.result?.height !== undefined}
              fallback={<span>Block {searchedByHash() ? truncateHash(params.identifier) : params.identifier}</span>}
            >
              Block {formatNumber(data()!.result!.height)}
            </Show>
          </h2>
        </div>
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
              Loading block data...
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
            {/* Block Navigation */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <div class="flex justify-between items-center">
                <Show when={data()?.result?.previousblockhash}>
                  <A
                    href={`/block/${(data()?.result?.height || 0) - 1}`}
                    class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    &larr; Previous Block
                  </A>
                </Show>
                <Show when={!data()?.result?.previousblockhash}>
                  <div></div>
                </Show>
                <span class="font-mono text-amber-800 font-medium">
                  Height: {formatNumber(data()?.result?.height || 0)}
                </span>
                <Show when={data()?.result?.nextblockhash}>
                  <A
                    href={`/block/${(data()?.result?.height || 0) + 1}`}
                    class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Next Block &rarr;
                  </A>
                </Show>
                <Show when={!data()?.result?.nextblockhash}>
                  <span class="text-slate-400 text-sm">Latest Block</span>
                </Show>
              </div>
            </div>

            {/* Block Summary */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Summary
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Height:</span>
                  <span class="font-mono font-medium text-amber-900">
                    {formatNumber(data()?.result?.height || 0)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Confirmations:</span>
                  <span class="font-mono">
                    {formatNumber(data()?.result?.confirmations || 0)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Size:</span>
                  <span class="font-mono">
                    {formatBytes(data()?.result?.size || 0)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Version:</span>
                  <span class="font-mono">{data()?.result?.version}</span>
                </div>
              </div>
            </div>

            {/* Timing & Mining */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Timing & Mining
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Time:</span>
                  <span class="font-mono text-sm">
                    {formatTimestamp(data()?.result?.time || 0)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Difficulty:</span>
                  <span class="font-mono text-sm">
                    {formatNumber(Math.round(data()?.result?.difficulty || 0))}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Bits:</span>
                  <span class="font-mono text-sm">{data()?.result?.bits}</span>
                </div>
              </div>
            </div>

            {/* Block Hash */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Block Hash
              </h3>
              <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                {data()?.result?.hash}
              </div>
            </div>

            {/* Merkle Root */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Merkle Root
              </h3>
              <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                {data()?.result?.merkleroot}
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
                        <Show when={pool.valueDelta !== undefined}>
                          <div
                            class={`text-xs ${pool.valueDelta >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {pool.valueDelta >= 0 ? "+" : ""}
                            {formatNumber(pool.valueDelta || 0)} ZEC
                          </div>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Transactions */}
            <Show when={data()?.result?.tx && data()!.result!.tx.length > 0}>
              <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
                <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                  Transactions ({formatNumber(data()?.result?.tx?.length || 0)})
                </h3>
                <div class="max-h-64 overflow-y-auto space-y-2">
                  <For each={data()?.result?.tx}>
                    {(txid, index) => (
                      <div class="flex items-center gap-2 text-sm">
                        <span class="text-slate-500 w-8">{index() + 1}.</span>
                        <span class="font-mono bg-slate-50 p-1 rounded flex-1 break-all text-xs">
                          {txid}
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Nonce & Solution */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
              <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                Nonce
              </h3>
              <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                {data()?.result?.nonce}
              </div>
            </div>

            {/* Anchor */}
            <Show when={data()?.result?.anchor}>
              <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-200 md:col-span-2">
                <h3 class="text-lg font-semibold text-amber-700 mb-3 border-b border-amber-200 pb-2">
                  Anchor
                </h3>
                <div class="font-mono text-sm break-all bg-slate-50 p-2 rounded">
                  {data()?.result?.anchor}
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </Suspense>
    </section>
  );
}
