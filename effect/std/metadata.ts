import { effector, EffectorItem } from "/effect/Effect.ts";
import { metadataDecoded } from "/effect/std/atoms/metadataDecoded.ts";
import { select } from "/effect/std/atoms/select.ts";
import { rpcCall } from "/effect/std/rpcCall.ts";
import { RpcClient } from "/rpc/Base.ts";
import { type HashHexString } from "/rpc/mod.ts";

export const metadata = effector(
  "metadata",
  (rpc: EffectorItem<RpcClient>, blockHash?: EffectorItem<HashHexString>) => {
    const rpcCall_ = rpcCall(rpc, "state_getMetadata", blockHash);
    const result = select(rpcCall_, "result");
    return metadataDecoded(result);
  },
);