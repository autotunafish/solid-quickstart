import { createAsync, query } from "@solidjs/router";

interface BlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  verificationprogress: number;
  chainwork: string;
  pruned: boolean;
  size_on_disk: number;
  commitments: number;
  valuePools: Array<{
    id: string;
    monitored: boolean;
    chainValue: number;
    chainValueZat: number;
  }>;
  softforks: Record<string, { type: string; active: boolean; height: number }>;
  upgrades: Record<
    string,
    { name: string; activationheight: number; status: string; info: string }
  >;
  consensus: { chaintip: string; nextblock: string };
  estimatedheight?: number;
}

interface RpcResponse {
  result: BlockchainInfo;
  error: null | { code: number; message: string };
  id: string;
}

const getBlockchainInfo = query(async (): Promise<RpcResponse> => {
  const response = await fetch("/api/blockchain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "getblockchaininfo",
      params: [],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blockchain info");
  }

  return response.json();
}, "blockchainInfo");

const BlockchainData = () => {
  return createAsync(() => getBlockchainInfo());
};

export default BlockchainData;
