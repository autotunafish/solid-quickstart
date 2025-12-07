import { createAsync, query, useParams } from "@solidjs/router";

interface BlockInfo {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  merkleroot: string;
  tx: string[];
  time: number;
  nonce: string;
  solution: string;
  bits: string;
  difficulty: number;
  chainwork: string;
  anchor: string;
  valuePools: Array<{
    id: string;
    monitored: boolean;
    chainValue: number;
    chainValueZat: number;
    valueDelta: number;
    valueDeltaZat: number;
  }>;
  previousblockhash?: string;
  nextblockhash?: string;
}

interface RpcResponse {
  result: BlockInfo | null;
  error: null | { code: number; message: string };
  id: string;
}

// Helper to determine if the identifier is a block hash (64-char hex) or block height
function isBlockHash(identifier: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(identifier);
}

const getBlockInfo = query(async (identifier: string): Promise<RpcResponse> => {
  // For block height (numeric), pass as string; for hash, pass as-is
  // The getblock RPC accepts either block height or block hash as the first parameter
  const response = await fetch("/api/blockchain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "getblock",
      params: [identifier],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch block info");
  }

  return response.json();
}, "blockInfo");

export default function BlockData() {
  const params = useParams<{ identifier: string }>();
  return createAsync(() => getBlockInfo(params.identifier));
}
